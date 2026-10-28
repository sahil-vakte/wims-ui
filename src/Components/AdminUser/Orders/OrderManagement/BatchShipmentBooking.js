import React, { useRef, useState } from "react";
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography } from "@mui/material";
import PrinterService from "../../../PrinterService";
import qz from "qz-tray";
import ApiServices from "../../../../Services/ApiServices/ApiServices";

export const labelUrl = (order) => order?.public_label_url || order?.public_shipping_label_url;
export const isBooked = (order) => Boolean(order?.shipment_booked || labelUrl(order)) ||
  [order?.status, order?.order_status].includes("SHIPPED");
export const providerFor = (order) => {
  const service = order?.shipping_service;
  if (service?.provider === "DPD") return "DPD";
  if (String(service?.provider || "").toUpperCase().replace(/[ _-]/g, "") === "ROYALMAIL" ||
      service?.booking_url === `/api/v1/orders/${order?.id}/book-royal-mail-shipping/`) return "Royal Mail";
  return "";
};
export const bookingRequest = (order, packageFormat, notes) => {
  const provider = providerFor(order);
  if (!provider) throw new Error("WIMS has not selected a supported courier.");
  if (isBooked(order)) throw new Error("Shipment already booked.");
  if (provider === "DPD") return { url: `orders/${order.id}/book-dpd-shipping/`, payload: { return_label_pdf: false, notes } };
  const weight = Number(order.shipping_service?.weight_in_grams ?? order.total_weight_gm);
  const service = order.shipping_service?.service_code || order.courier_service_code;
  if (!Number.isFinite(weight) || weight <= 0 || !service || !packageFormat) throw new Error("Royal Mail requires positive weight, service code and package format.");
  return { url: `orders/${order.id}/book-royal-mail-shipping/`, payload: {
    weight_in_grams: weight, service_code: service, package_format_identifier: packageFormat, notes,
  } };
};
const errorText = (error) => {
  const data = error?.response?.data;
  const nested = Array.isArray(data?.dpd_response?.error) ? data.dpd_response.error.map((item) => item.message) : [];
  return [...new Set([data?.error, data?.message, data?.detail, ...nested].filter((value) => typeof value === "string" && value))].join(" — ") || error.message || "Shipment request failed.";
};

export default function BatchShipmentBooking({ orders, headers, onOrderUpdated, renderOrders }) {
  const [selected, setSelected] = useState([]);
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState({});
  const [notes, setNotes] = useState("Booked from WIMS batch");
  const lock = useRef(false);
  const [printStatus, setPrintStatus] = useState(null);
  const unbookedIds = orders.filter((order) => !isBooked(order)).map((order) => order.id);
  const bookingIds = unbookedIds.filter((id) => selected.includes(id));
  const printableOrders = orders.filter((order) => isBooked(order) && labelUrl(order));
  const selectedPrintable = printableOrders.filter((order) => selected.includes(order.id));
  const printSelected = async () => {
    if (lock.current || !selectedPrintable.length) return;
    lock.current = true;
    setBusy(true);
    setPrintStatus(null);
    let sent = 0;
    let failed = 0;
    try {
      const printer = await PrinterService.testPrinter();
      for (const order of selectedPrintable) {
        try {
          setPrintStatus({ severity: "info", message: `Sending label ${sent + failed + 1} of ${selectedPrintable.length} to ${printer}...` });
          const url = labelUrl(order);
          // The signed URL may return PDF or HTML, including for DPD.
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Unable to load label (HTTP ${response.status}).`);
          const contentType = (response.headers.get("content-type") || "").toLowerCase();
          const format = contentType.includes("application/pdf") ? "pdf" : contentType.includes("text/html") ? "html" : order.label_format;
          if (format === "pdf") {
            const result = await PrinterService.printPdf({ pdfUrl: url, printerName: printer, width: 4, height: 6, copies: 1 });
            if (!result?.success) throw new Error(result?.error || "Printer rejected label.");
          } else if (format === "html") {
            const config = qz.configs.create(printer, { copies: 1, units: "in", size: { width: 4, height: 6 }, margins: 0, orientation: "portrait", scaleContent: true });
            await qz.print(config, [{ type: "pixel", format: "html", flavor: "file", data: url }]);
          } else { throw new Error("Unsupported label format. Use Open / Print Label."); }
          sent += 1;
          record(order.id, `Label sent to ${printer}.`, "success");
          setSelected((current) => current.filter((id) => id !== order.id));
        } catch (error) {
          failed += 1;
          record(order.id, errorText(error), "error");
        }
      }
      setPrintStatus({ severity: failed ? "warning" : "success", message: `${sent} label(s) sent to ${printer}${failed ? `; ${failed} failed and remain selected.` : "."}` });
    } catch (error) { setPrintStatus({ severity: "error", message: errorText(error) }); }
    finally { lock.current = false; setBusy(false); }
  };
  const readOrder = async (id) => {
    const response = await ApiServices.get(`orders/${id}/`, headers);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Unable to load order shipping details.");
    return response.data;
  };
  const record = (id, message, severity = "info") => setResults((current) => ({ ...current, [id]: { message, severity } }));
  const prepare = async (ids) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    const entries = [];
    for (const id of ids) {
      try {
        const order = { ...orders.find((item) => item.id === id), ...await readOrder(id) };
        onOrderUpdated(order);
        if (isBooked(order)) { record(id, "Already booked. Open the existing label."); continue; }
        const entry = { order, packageFormat: "Letter", error: "" };
        try {
          bookingRequest(order, entry.packageFormat, notes);
          if (providerFor(order) === "DPD") {
            const config = await ApiServices.get("orders/dpd/config/", headers);
            if (config.error) throw config.error;
            if (config.data?.booking_enabled !== true) throw new Error(config.data?.message || "DPD booking is disabled.");
          }
        } catch (error) { entry.error = errorText(error); record(id, entry.error, "error"); }
        entries.push(entry);
      } catch (error) { record(id, errorText(error), "error"); }
    }
    setReview(entries.length ? entries : null);
    setBusy(false);
    lock.current = false;
  };
  const book = async () => {
    if (lock.current || !review) return;
    lock.current = true;
    setBusy(true);
    for (const entry of review.filter((item) => !item.error)) {
      const { id } = entry.order;
      let order = entry.order;
      try {
        // Recheck the decision and existing shipment immediately before booking.
        order = { ...order, ...await readOrder(id) };
        onOrderUpdated(order);
        if (isBooked(order)) { record(id, "Already booked. Open the existing label."); continue; }
        if (providerFor(order) !== providerFor(entry.order)) throw new Error("Courier changed. Review this order again before booking.");
        if (providerFor(order) === "DPD") {
          const config = await ApiServices.get("orders/dpd/config/", headers);
          if (config.error) throw config.error;
          if (config.data?.booking_enabled !== true) throw new Error(config.data?.message || "DPD booking is disabled.");
        }
        const request = bookingRequest(order, entry.packageFormat, notes);
        const response = await ApiServices.post(request.url, request.payload, headers);
        const data = response.data || {};
        let booked = { ...order, ...data.order, shipment_booked: true,
          order_status: data.order?.order_status || data.order?.status || "SHIPPED",
          tracking_number: data.tracking_number || order.tracking_number,
          courier_service_code: data.service_code || order.courier_service_code,
          public_label_url: data.public_label_url || labelUrl(data.order) || labelUrl(order),
          label_format: data.label_format,
        };
        onOrderUpdated(booked);
        record(id, "Shipment booked.", "success");
        if (!labelUrl(booked)) {
          try { booked = { ...booked, ...await readOrder(id), shipment_booked: true }; onOrderUpdated(booked); }
          catch (error) { record(id, "Booked, but label refresh failed. Use Refresh shipment.", "warning"); }
        }
        setSelected((current) => current.filter((value) => value !== id));
      } catch (error) {
        console.error("Batch shipment booking failed", id, error?.response?.data || error);
        if (error?.response?.status === 409) {
          const booked = { ...order, shipment_booked: true, tracking_number: error.response.data?.tracking_number || order.tracking_number };
          onOrderUpdated(booked);
          try { onOrderUpdated({ ...booked, ...await readOrder(id), shipment_booked: true }); }
          catch (reloadError) { console.error("Existing shipment refresh failed", id, reloadError); }
          record(id, "Already booked. Open the existing label or refresh shipment.", "warning");
          setSelected((current) => current.filter((value) => value !== id));
        } else { record(id, errorText(error), "error"); }
      }
    }
    setReview(null);
    setBusy(false);
    lock.current = false;
  };
  const refresh = async (id) => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try { onOrderUpdated(await readOrder(id)); record(id, "Shipment refreshed."); }
    catch (error) { record(id, errorText(error), "error"); }
    finally { lock.current = false; setBusy(false); }
  };
  const selectionCell = (order) => <Checkbox inputProps={{ "aria-label": `Select order ${order.external_order_id || order.id}` }}
    checked={selected.includes(order.id)} disabled={busy || (isBooked(order) && !labelUrl(order))}
    onChange={(event) => setSelected((current) => event.target.checked ? [...current, order.id] : current.filter((id) => id !== order.id))} />;
  const shipmentCell = (order) => <>
    {order.tracking_number && <Typography variant="body2">Tracking: {order.tracking_number}</Typography>}
    {isBooked(order) ? labelUrl(order) ? <Button component="a" href={labelUrl(order)} target="_blank" rel="noopener noreferrer">Open / Print Label</Button>
      : <Button disabled={busy} onClick={() => refresh(order.id)}>Refresh shipment</Button>
      : <Button disabled={busy} onClick={() => prepare([order.id])}>Book shipment</Button>}
    {results[order.id] && <Alert severity={results[order.id].severity}>{results[order.id].message}</Alert>}
  </>;
  return <Box sx={{ overflowX: "auto" }}>
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Typography>Book individually or select orders to book together. WIMS selects the courier; order progress does not restrict booking here.</Typography>
      <Button variant="contained" disabled={busy || !bookingIds.length} onClick={() => prepare(bookingIds)}>
        {busy ? "Processing shipments…" : `Review & book selected (${bookingIds.length})`}
      </Button>
    </Stack>
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <Button disabled={busy || !unbookedIds.length} onClick={() => setSelected(unbookedIds)}>Select all unbooked orders ({unbookedIds.length})</Button>
      <Button disabled={busy || !printableOrders.length} onClick={() => setSelected(printableOrders.map((order) => order.id))}>Select all booked labels</Button>
      <Button disabled={busy || !selected.length} onClick={() => setSelected([])}>Clear selection</Button>
      <Button variant="contained" disabled={busy || !selectedPrintable.length} onClick={printSelected}>Print selected shipment labels ({selectedPrintable.length})</Button>
    </Stack>
    {printStatus && <Alert severity={printStatus.severity} sx={{ mb: 2 }}>{printStatus.message}</Alert>}
    {renderOrders({ selectionCell, shipmentCell })}
    <Dialog open={review !== null} onClose={() => { if (!busy) setReview(null); }} fullWidth maxWidth="md">
      <DialogTitle>Review shipments</DialogTitle><DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>Confirming books each eligible shipment below. Failed bookings are not retried automatically.</Alert>
        {(review || []).map((entry, index) => <Box key={entry.order.id} sx={{ mb: 2 }}>
          <Typography fontWeight={700}>{entry.order.external_order_id || entry.order.id} — {providerFor(entry.order) || "Courier unavailable"}</Typography>
          <Typography variant="body2">{entry.order.shipping_service?.delivery_method} · {entry.order.shipping_service?.weight_in_grams ?? entry.order.total_weight_gm ?? "Unknown"} g · Service {entry.order.shipping_service?.service_code || entry.order.courier_service_code || "Unavailable"}</Typography>
          {entry.error ? <Alert severity="error">{entry.error}</Alert> : providerFor(entry.order) === "Royal Mail" &&
            <TextField select label="Package format" value={entry.packageFormat} disabled={busy} size="small" sx={{ mt: 1, minWidth: 180 }}
              onChange={(event) => setReview((current) => current.map((item, i) => i === index ? { ...item, packageFormat: event.target.value } : item))}>
              {["Letter", "Large", "Parcel"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>}
        </Box>)}
        <TextField label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} fullWidth disabled={busy} />
      </DialogContent><DialogActions>
        <Button disabled={busy} onClick={() => setReview(null)}>Cancel</Button>
        <Button variant="contained" disabled={busy || !review?.some((entry) => !entry.error)} onClick={book}>
          {busy ? "Booking…" : `Confirm & book (${review?.filter((entry) => !entry.error).length || 0})`}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>;
}
