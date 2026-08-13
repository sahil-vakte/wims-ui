import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import OrderBatchDetailDialog from "./OrderBatchDetailDialog";

const BATCH_API = "order-batches/";
const ORDERS_API = "orders/with-items/";

const todayKey = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const getError = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.detail ||
  error?.message ||
  fallback;

const uniq = (values) => [
  ...new Set(
    values.filter(
      (value) => value !== null && value !== undefined && value !== "",
    ),
  ),
];

const OrderBatchManager = ({ headers, disabled = false, onRefreshOrders }) => {
  const [orders, setOrders] = useState([]);

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const [page, setPage] = useState(1);

  const [count, setCount] = useState(0);

  const [nextUrl, setNextUrl] = useState(null);

  const [previousUrl, setPreviousUrl] = useState(null);

  const [search, setSearch] = useState("");

  const [courierFilter, setCourierFilter] = useState("ALL");

  const [labelFilter, setLabelFilter] = useState("NOT_PRINTED");

  const [batchDate, setBatchDate] = useState(todayKey());

  const [batchNumber, setBatchNumber] = useState(1);

  const [notes, setNotes] = useState("");

  const [batches, setBatches] = useState([]);

  const [detailBatchId, setDetailBatchId] = useState(null);

  const [busy, setBusy] = useState("");

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const fetchOrders = useCallback(
    async (pageNumber = 1) => {
      try {
        setBusy("orders");
        setError("");

        const response = await ApiServices.get(
          `${ORDERS_API}?page=${pageNumber}`,
          headers,
        );

        const data = response?.data || {};

        setOrders(data?.results || []);

        setCount(data?.count || 0);

        setNextUrl(data?.next || null);

        setPreviousUrl(data?.previous || null);

        setPage(pageNumber);

        setSelectedOrderIds([]);
      } catch (err) {
        console.error("Fetch orders error:", err);

        setError(getError(err, "Failed to load orders."));

        setOrders([]);
      } finally {
        setBusy("");
      }
    },
    [headers],
  );

  const loadBatches = useCallback(async () => {
    try {
      setBusy("batches");
      setError("");

      const response = await ApiServices.get(
        `${BATCH_API}?batch_date=${batchDate}`,
        headers,
      );

      const data = response?.data || [];

      setBatches(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Load batches error:", err);

      setError(getError(err, "Failed to load order batches."));

      setBatches([]);
    } finally {
      setBusy("");
    }
  }, [batchDate, headers]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const isOrderCompleted = useCallback((order) => {
    return Number(order?.completion_percentage || 0) >= 100;
  }, []);

  const isOrderPrinted = useCallback((order) => {
    const items = order?.items || [];

    return (
      items.length > 0 && items.every((item) => item?.lable_printed === true)
    );
  }, []);

  const courierOptions = useMemo(
    () =>
      uniq(
        orders.map(
          (order) => order?.courier_service_code || order?.courier_service_name,
        ),
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const printed = isOrderPrinted(order);

      if (labelFilter === "PRINTED" && !printed) {
        return false;
      }

      if (labelFilter === "NOT_PRINTED" && printed) {
        return false;
      }

      if (courierFilter !== "ALL") {
        const courier =
          order?.courier_service_code || order?.courier_service_name || "";

        if (String(courier) !== String(courierFilter)) {
          return false;
        }
      }

      if (query) {
        const searchable = [
          order?.external_order_id,
          order?.order_number,
          order?.customer_name,
          order?.customer_email,
          ...(order?.items || []).flatMap((item) => [
            item?.sku,
            item?.product_name,
          ]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, search, courierFilter, labelFilter, isOrderPrinted]);

  const selectableIds = useMemo(
    () =>
      filteredOrders
        .filter((order) => !isOrderCompleted(order))
        .map((order) => order.id),
    [filteredOrders, isOrderCompleted],
  );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedOrderIds.includes(id));

  const partialSelected =
    selectedOrderIds.length > 0 &&
    selectableIds.some((id) => selectedOrderIds.includes(id)) &&
    !allSelected;

  const toggleAll = (event) => {
    setSelectedOrderIds(event.target.checked ? selectableIds : []);
  };

  const toggleOrder = (order) => {
    if (isOrderCompleted(order)) {
      return;
    }

    setSelectedOrderIds((previous) =>
      previous.includes(order.id)
        ? previous.filter((id) => id !== order.id)
        : [...previous, order.id],
    );
  };

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.includes(order.id)),
    [orders, selectedOrderIds],
  );

  const createBatch = async () => {
    if (!selectedOrderIds.length) {
      setError("Select at least one order.");
      return;
    }

    try {
      setBusy("create");
      setError("");
      setMessage("");

      const couriers = uniq(
        selectedOrders.map(
          (order) => order?.courier_service_code || order?.courier_service_name,
        ),
      );

      const platforms = uniq(
        selectedOrders.map((order) => order?.order_source || "web"),
      );

      const orderTypes = uniq(
        selectedOrders.map((order) => order?.order_type || "retail"),
      );

      const payload = {
        batch_number: Number(batchNumber),

        batch_date: batchDate,

        order_ids: selectedOrderIds,

        filters_snapshot: {
          platform:
            platforms.length === 1
              ? String(platforms[0]).toLowerCase()
              : "mixed",

          courier_service_code: couriers.length === 1 ? couriers[0] : "mixed",

          order_type: orderTypes.length === 1 ? orderTypes[0] : "mixed",

          lable_printed:
            labelFilter === "PRINTED"
              ? true
              : labelFilter === "NOT_PRINTED"
                ? false
                : null,

          date_from: batchDate,

          date_to: batchDate,
        },

        notes: notes.trim(),
      };

      await ApiServices.post(BATCH_API, payload, headers);

      setMessage(
        `${selectedOrderIds.length} order(s) assigned to B${batchNumber}.`,
      );

      setSelectedOrderIds([]);
      setNotes("");

      await Promise.all([
        loadBatches(),
        fetchOrders(page),
        onRefreshOrders?.(),
      ]);
    } catch (err) {
      console.error("Create batch error:", err);

      setError(getError(err, "Failed to create batch."));
    } finally {
      setBusy("");
    }
  };

  const deleteBatch = async (batch) => {
    if (
      !window.confirm(`Delete ${batch?.batch_name || `Batch ${batch?.id}`}?`)
    ) {
      return;
    }

    try {
      setBusy(`delete-${batch.id}`);

      await ApiServices.delete(`${BATCH_API}${batch.id}/`, headers);

      setMessage("Batch deleted successfully.");

      await loadBatches();
    } catch (err) {
      setError(getError(err, "Failed to delete batch."));
    } finally {
      setBusy("");
    }
  };

  const refreshAfterDetail = async () => {
    await Promise.all([loadBatches(), fetchOrders(page), onRefreshOrders?.()]);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Assign Orders to Batch
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Select complete orders and assign them to B1-B5.
            </Typography>
          </Box>

          {(error || message) && (
            <Alert
              severity={error ? "error" : "success"}
              onClose={() => {
                setError("");
                setMessage("");
              }}
            >
              {error || message}
            </Alert>
          )}

          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              label="Search Orders"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{
                minWidth: 230,
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Courier</InputLabel>

              <Select
                value={courierFilter}
                label="Courier"
                onChange={(event) => {
                  setCourierFilter(event.target.value);

                  setSelectedOrderIds([]);
                }}
              >
                <MenuItem value="ALL">All Couriers</MenuItem>

                {courierOptions.map((courier) => (
                  <MenuItem key={courier} value={courier}>
                    {courier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Label Status</InputLabel>

              <Select
                value={labelFilter}
                label="Label Status"
                onChange={(event) => {
                  setLabelFilter(event.target.value);

                  setSelectedOrderIds([]);
                }}
              >
                <MenuItem value="ALL">All</MenuItem>

                <MenuItem value="NOT_PRINTED">Not Fully Printed</MenuItem>

                <MenuItem value="PRINTED">Fully Printed</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => fetchOrders(page)}
              disabled={busy === "orders"}
            >
              Refresh
            </Button>
          </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: 450,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={partialSelected}
                      onChange={toggleAll}
                      disabled={disabled || !selectableIds.length}
                    />
                  </TableCell>

                  <TableCell>Order</TableCell>

                  <TableCell>Customer</TableCell>

                  <TableCell>Courier</TableCell>

                  <TableCell>Type</TableCell>

                  <TableCell>Items</TableCell>

                  <TableCell>Label</TableCell>

                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {busy === "orders" ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => {
                    const printed = isOrderPrinted(order);

                    const completed = isOrderCompleted(order);

                    return (
                      <TableRow
                        key={order.id}
                        hover
                        selected={selectedOrderIds.includes(order.id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => toggleOrder(order)}
                            disabled={completed || disabled}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography fontWeight={700}>
                            {order.external_order_id ||
                              order.order_number ||
                              `#${order.id}`}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {order.order_number}
                          </Typography>
                        </TableCell>

                        <TableCell>{order.customer_name || "-"}</TableCell>

                        <TableCell>
                          {order.courier_service_code ||
                            order.courier_service_name ||
                            "-"}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={order.order_type || "retail"}
                          />
                        </TableCell>

                        <TableCell>
                          {order.items?.length || order.item_count || 0}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={printed ? "Printed" : "Pending"}
                            color={printed ? "success" : "warning"}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              completed
                                ? "Completed"
                                : `${Number(order.completion_percentage || 0)}%`
                            }
                            color={completed ? "success" : "info"}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Orders Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1}
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
          >
            <Button
              variant="outlined"
              disabled={!previousUrl || busy === "orders"}
              onClick={() => fetchOrders(Math.max(1, page - 1))}
            >
              Previous
            </Button>

            <Typography variant="body2">
              Page {page} | Total Orders: {count}
            </Typography>

            <Button
              variant="outlined"
              disabled={!nextUrl || busy === "orders"}
              onClick={() => fetchOrders(page + 1)}
            >
              Next
            </Button>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <Typography fontWeight={700} variant="body2">
              Selected: {selectedOrderIds.length} order(s)
            </Typography>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              type="date"
              label="Batch Date"
              value={batchDate}
              onChange={(event) => setBatchDate(event.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 130,
              }}
            >
              <InputLabel>Batch</InputLabel>

              <Select
                value={batchNumber}
                label="Batch"
                onChange={(event) => setBatchNumber(event.target.value)}
              >
                {" "}
                {[1, 2, 3, 4, 5].map((number) => (
                  <MenuItem key={number} value={number}>
                    {" "}
                    B{number}{" "}
                  </MenuItem>
                ))}{" "}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              sx={{
                minWidth: 260,
                flex: 1,
              }}
            />

            <Button
              variant="contained"
              disabled={
                disabled || !selectedOrderIds.length || busy === "create"
              }
              onClick={createBatch}
            >
              {busy === "create"
                ? "Creating..."
                : `Assign ${selectedOrderIds.length} Order${
                    selectedOrderIds.length === 1 ? "" : "s"
                  } to B${batchNumber}`}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Existing Order Batches
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {batchDate}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={loadBatches}
              disabled={busy === "batches"}
            >
              Refresh Batches
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch</TableCell>

                  <TableCell>Orders</TableCell>

                  <TableCell>Labels</TableCell>

                  <TableCell>Notes</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {batches.length ? (
                  batches.map((batch) => {
                    const total = Number(batch.labels_total_count || 0);

                    const printed = Number(batch.labels_printed_count || 0);

                    return (
                      <TableRow key={batch.id} hover>
                        <TableCell>
                          <Typography fontWeight={700}>
                            {batch.batch_name || `#${batch.id}`}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {batch.batch_date}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {batch.orders_count ?? batch.orders?.length ?? "-"}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={`${printed}/${total}`}
                            color={
                              total > 0 && printed === total
                                ? "success"
                                : "warning"
                            }
                          />
                        </TableCell>

                        <TableCell>{batch.notes || "-"}</TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => setDetailBatchId(batch.id)}
                            >
                              View / Print
                            </Button>

                            <Button
                              size="small"
                              color="error"
                              onClick={() => deleteBatch(batch)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {busy === "batches" ? "Loading..." : "No batches found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      <OrderBatchDetailDialog
        open={Boolean(detailBatchId)}
        batchId={detailBatchId}
        headers={headers}
        onClose={() => setDetailBatchId(null)}
        onUpdated={refreshAfterDetail}
      />
    </Box>
  );
};

export default OrderBatchManager;
