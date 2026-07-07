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
  Typography,
} from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import tialogo from "../../../Assets/TK_Logo_png.png"
import Qrimage from "../../../Assets/reviewQR.jpeg"
import Bannerimage from "../../../Assets/Packing_Banner.jpg.jpeg"

const OrderLabel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [labelFilter, setLabelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accessToken = getDecryptedAccessToken();
const LOGO_PATH = tialogo; 
  const [page, setPage] = useState(1);
const [nextUrl, setNextUrl] = useState(null);
const [previousUrl, setPreviousUrl] = useState(null);
const [count, setCount] = useState(0);
const REVIEW_QR_URL = "https://www.tiaknightfabrics.co.uk/pages/reviews";

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  );

  // const fetchAllOrders = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     let allOrders = [];
  //     let nextUrl = "orders/with-items/";

  //     while (nextUrl) {
  //       const response = await ApiServices.get(nextUrl, headers);
  //       const data = response?.data;

  //       if (!data) break;

  //       allOrders = [...allOrders, ...(data.results || [])];

  //       if (data.next) {
  //         try {
  //           const url = new URL(data.next);
  //           nextUrl = `${url.pathname.replace("/api/v1/", "")}${url.search}`;
  //         } catch {
  //           nextUrl = null;
  //         }
  //       } else {
  //         nextUrl = null;
  //       }
  //     }

  //     allOrders.sort(
  //       (a, b) =>
  //         new Date(b.created_at || b.order_date) -
  //         new Date(a.created_at || a.order_date)
  //     );

  //     setOrders(allOrders);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch orders");
  //     setOrders([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [headers]);

const fetchOrdersPage = useCallback(
  async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await ApiServices.get(
        `orders/with-items/?page=${pageNumber}`,
        headers
      );

      const data = response?.data;

      setOrders(data?.results || []);
      setCount(data?.count || 0);
      setNextUrl(data?.next || null);
      setPreviousUrl(data?.previous || null);
      setPage(pageNumber);
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  },
  [headers]
);
useEffect(() => {
  fetchOrdersPage(1);
}, [fetchOrdersPage]);
  // useEffect(() => {
  //   fetchAllOrders();
  // }, [fetchAllOrders]);

  const TIAKNIGHT_BASE_URL = "https://www.tiaknightfabrics.co.uk";

const buildChildProductUrl = (childProductUrl) => {
  if (!childProductUrl) return TIAKNIGHT_BASE_URL;

  if (childProductUrl.startsWith("http")) return childProductUrl;

  return `${TIAKNIGHT_BASE_URL}${childProductUrl.startsWith("/") ? "" : "/"}${childProductUrl}`;
};

const buildQrUrl = (item) => {
  const productUrl = buildChildProductUrl(item.child_product_url);
  const url = new URL(productUrl);

  url.searchParams.set("wims_order_id", item.order_id);
  url.searchParams.set("wims_item_id", item.id);

  return url.toString();
};

  const allItems = useMemo(() => {
    return orders.flatMap((order) =>
      (order.items || []).map((item) => ({
        ...item,
        order_id: order.id,
        external_order_id: order.external_order_id,
        order_number: order.order_number,
        order_date: order.order_date,
        order_source: order.order_source,
        order_status: order.order_status,
        order_status_display: order.order_status_display,
        payment_status: order.payment_status,
        payment_status_display: order.payment_status_display,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        item_count: order.items?.length || 0,
         courier_service_code: order.courier_service_code || "",
      courier_service_name: order.courier_service_name || "",
      }))
    );
  }, [orders]);

  const isItemPrinted = (item) => item.lable_printed === true;

  const isItemCompleted = (item) =>
    item.processing_status === "COMPLETED" ||
    item.processing_status_display === "Completed";

  const statusOptions = useMemo(() => {
    const map = new Map();

    allItems.forEach((item) => {
      if (item.processing_status) {
        map.set(
          item.processing_status,
          item.processing_status_display || item.processing_status
        );
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (labelFilter === "PRINTED" && !isItemPrinted(item)) return false;
      if (labelFilter === "NOT_PRINTED" && isItemPrinted(item)) return false;

      if (statusFilter !== "ALL" && item.processing_status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [allItems, labelFilter, statusFilter]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const selectableItems = filteredItems
        .filter((item) => !isItemPrinted(item))
        .filter((item) => !isItemCompleted(item))
        .map((item) => item.id);

      setSelectedItems(selectableItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };



  const downloadSelectedItems = async () => {
  try {
    setError("");

    const selected = allItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    if (!selected.length) {
      setError("Please select at least one item.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Order Labels");

    worksheet.columns = [
      { header: "Type", key: "type", width: 10 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Product Name", key: "product", width: 60 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "External Order ID", key: "externalOrderId", width: 20 },
      { header: "Source", key: "source", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Date", key: "date", width: 25 },
      { header: "QR URL", key: "qr", width: 70 },
      { header: "Label Printed", key: "labelPrinted", width: 18 },
      { header: "Courier", key: "courier_service_code", width: 18 },
    ];

    worksheet.getRow(1).font = { bold: true };

    selected.forEach((item) => {
      worksheet.addRow({
        type: item.item_count > 1 ? "M" : "S",
        sku: item.sku,
        product: item.product_name,
        qty: item.quantity,
        externalOrderId: item.external_order_id,
        source: "WEB",
        courier_service_code: item.courier_service_code || "N/A",
        status: item.processing_status_display || item.processing_status,
        date: item.order_date
          ? new Date(item.order_date).toLocaleString()
          : "",
          qr: buildQrUrl(item),
        // qr: `https://wims.cloud/employee-user/order-process-item/${item.order_id}/${item.id}`,
        labelPrinted: item.lable_printed ? "Printed" : "Pending",
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Order_Item_Labels_${Date.now()}.xlsx`
    );
await downloadSelectedOrdersPdf(selected);
    await ApiServices.patch(
      "orders/items/lable-printed",
      {
        lable_printed: true,
        order_item_ids: selected.map((item) => item.id),
      },
      headers
    );

    setSelectedItems([]);
    await fetchOrdersPage(page);
  } catch (err) {
    console.error("Download / Label Printed Error:", err);
    setError(
      err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Excel downloaded, but failed to update label printed status."
    );
  }
};

  const selectableItemIds = filteredItems
    .filter((item) => !isItemPrinted(item))
    .filter((item) => !isItemCompleted(item))
    .map((item) => item.id);

  const allSelected =
    selectableItemIds.length > 0 &&
    selectableItemIds.every((id) => selectedItems.includes(id));

  const partiallySelected =
    selectedItems.length > 0 &&
    selectableItemIds.some((id) => selectedItems.includes(id)) &&
    !allSelected;


    const getImageBase64 = async (path) => {
  const res = await fetch(path);
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

const formatOrderDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const drawBox = (doc, x, y, w, h) => {
  doc.setDrawColor(230);
  doc.rect(x, y, w, h);
};

const getDeliveryLines = (order) =>
  [
    order.customer_name,
    order.shipping_address_1,
    order.shipping_address_2,
    order.shipping_city,
    order.shipping_county,
    order.shipping_country || "UK - Mainland",
    order.shipping_postcode,
    order.customer_phone,
  ].filter(Boolean);

const downloadSelectedOrdersPdf = async (selected) => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const logoBase64 = await getImageBase64(LOGO_PATH);
  const reviewQrBase64 = await getImageBase64(Qrimage);
  const bannerBase64 = await getImageBase64(Bannerimage);

  const COLORS = {
    pink: [214, 65, 150],
    dark: [0, 0, 0],
    text: [25, 25, 25],
    lightText: [80, 80, 80],
    white: [255, 255, 255],
  };

  // Font sizes (pt).
  // Requested: headings/titles 9, info 10, promo paragraph 8.
  const FS = {
    title: 9,
    info: 10,
    promoTitle: 9,
    promoBody: 9.5,
    scan: 8,
  };

  const grouped = selected.reduce((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  const drawRoundedBox = (x, y, w, h, fill = null, lineWidth = 0.32) => {
    doc.setDrawColor(...COLORS.pink);
    doc.setLineWidth(lineWidth);

    if (fill) {
      doc.setFillColor(...fill);
      doc.roundedRect(x, y, w, h, 1.3, 1.3, "FD");
    } else {
      doc.roundedRect(x, y, w, h, 1.3, 1.3, "S");
    }
  };

  const addFooterAndBanner = (startY) => {
    let y = startY + 5;

    if (y + 48 > pageH - 8) {
      doc.addPage();
      y = 12;
    }

    const policyText =
      "If you are not happy with your fabric, please email info@tiaknight.co.uk within 14 days of receiving your order. " +
      "Claims cannot be made on fabric that has been cut or processed. No refunds on samples, seconds fabrics and clearance/sale items.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);

    const policyLines = doc.splitTextToSize(policyText, pageW - 20);
    doc.text(policyLines, 10, y);

    y += policyLines.length * 5 + 4;

    const bannerX = 10;
    const bannerW = pageW - 20;
    const bannerH = 80;

    drawRoundedBox(bannerX, y, bannerW, bannerH, null, 0.3);

    doc.addImage(
      bannerBase64,
      "JPEG",
      bannerX + 1,
      y + 1,
      bannerW - 2,
      bannerH - 2
    );
  };

  Object.values(grouped).forEach((items, index) => {
    if (index > 0) doc.addPage();

    const first = items[0];
    const order = orders.find((o) => o.id === first.order_id) || first;
    const orderRef = first.external_order_id || first.order_number || "";

    // Header bar
    drawRoundedBox(8, 8, pageW - 16, 18, COLORS.white, 0.42);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("PACKING LIST", 12, 20);

    doc.addImage(logoBase64, "PNG", 73, 10, 58, 14);

  doc.setFont("helvetica", "bold");
doc.setFontSize(9);
doc.text("CONTACT US", pageW - 55, 13.5);

doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.text("+44 (0116) 254 2366", pageW - 55, 17.5);
doc.text("info@tiaknight.co.uk", pageW - 55, 21.5);

    // Top cards
    const topY = 32;
    const gap = 3;
    const leftX = 8;
    const rightX = 138;
    const leftW = 127;
    const rightW = pageW - rightX - 8;

    const cardW = (leftW - gap * 2) / 3;
    const cardH = 22; // fits 9pt title + 10pt info

    const drawTopCard = (label, value, x) => {
      drawRoundedBox(x, topY, cardW, cardH, COLORS.white, 0.32);

      // Title (9pt bold)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(FS.title);
      doc.setTextColor(...COLORS.dark);
      doc.text(label, x + 3, topY + 7);

      // Info (10pt normal)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.text);
      const valLines = doc.splitTextToSize(value || "-", cardW - 6);
      doc.text(valLines, x + 3, topY + 12);
    };

    drawTopCard("ORDER REFERENCE", orderRef, leftX);
    drawTopCard(
      "ORDER DATE",
      formatOrderDate(first.order_date || order.created_at),
      leftX + cardW + gap
    );
    drawTopCard(
      "DELIVERY METHOD",
      first.courier_service_name ||
        first.courier_service_code ||
        order.courier_service_name ||
        "Standard Delivery",
      leftX + cardW * 2 + gap * 2
    );

    // Address card
    const addressY = topY + cardH + gap;
    const addressH = 40;

    drawRoundedBox(leftX, addressY, leftW, addressH, COLORS.white, 0.32);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FS.title);
    doc.setTextColor(...COLORS.dark);
    doc.text("DELIVERY ADDRESS", leftX + 3, addressY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FS.info);
    doc.setTextColor(...COLORS.text);
    doc.text(getDeliveryLines(order), leftX + 3, addressY + 15);

    // Promo card (right)
    const promoH = cardH + gap + addressH;
    drawRoundedBox(rightX, topY, rightW, promoH, COLORS.white, 0.32);

    // Promo title (9pt bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FS.promoTitle);
    doc.setTextColor(...COLORS.dark);
    doc.text("FANCY A £50 GIFT VOUCHER?", rightX + rightW / 2, topY + 7, {
      align: "center",
    });

    // Promo body (8pt normal)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(FS.promoBody);
    doc.setTextColor(...COLORS.text);

    const promoBodyLines = doc.splitTextToSize(
      "Tell us something that you love about our fabrics or post a picture of your creation and you could be in for the chance to win. For a valid entry, post your review/picture to Google Reviews or scan the QR code.",
      rightW - 8
    );
    const promoBodyY = topY + 12;
    doc.text(promoBodyLines, rightX + 4, promoBodyY);

    // QR — centered horizontally, safely below body text
    const bodyBottomY = promoBodyY + promoBodyLines.length * 3.2;
    const qrSize = 22;
    const scanGap = 4;
    const bottomPad = 3;
    const qrBlockH = qrSize + scanGap;

    const qrY = Math.max(
      bodyBottomY + 2,
      topY + promoH - qrBlockH - bottomPad
    );
    const qrX = rightX + (rightW - qrSize) / 2;

    doc.addImage(reviewQrBase64, "JPEG", qrX, qrY, qrSize, qrSize);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FS.scan);
    doc.setTextColor(...COLORS.dark);
    doc.text("SCAN ME", rightX + rightW / 2, qrY + qrSize + scanGap, {
      align: "center",
    });

    // Items table — start below the tallest column
    const tableStartY = Math.max(addressY + addressH, topY + promoH) + 5;

    autoTable(doc, {
      startY: tableStartY,
      margin: {
        left: 8,
        right: 8,
        bottom: 10,
      },
      head: [["#", "Reference", "Product Information", "Qty"]],
      body: items.map((item, i) => [
        i + 1,
        item.sku || "",
        item.product_name || "",
        item.quantity || "",
      ]),
      theme: "grid",
      pageBreak: "auto",
      rowPageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 1.8,
        lineColor: COLORS.pink,
        lineWidth: 0.15,
        valign: "middle",
        textColor: [0, 0, 0],
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        lineColor: COLORS.pink,
        lineWidth: 0.25,
      },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 30, fontStyle: "normal" },
        2: { cellWidth: 132 },
        3: { cellWidth: 18, halign: "center", fontStyle: "normal" },
      },
    });

    addFooterAndBanner(doc.lastAutoTable.finalY);
  });

  doc.save(`Packing_List_${Date.now()}.pdf`);
};


return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Order Item Labels Download
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Total Orders: {orders.length} | Total Items: {allItems.length} |
        Showing Items: {filteredItems.length} | Selected Items:{" "}
        {selectedItems.length}
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Button
          variant="contained"
          onClick={downloadSelectedItems}
          disabled={selectedItems.length === 0}
        >
          Download Selected Items
        </Button>

        <Button variant="outlined" onClick={() => fetchOrdersPage(page)}>
          Refresh
        </Button>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Label Status</InputLabel>
          <Select
            value={labelFilter}
            label="Label Status"
            onChange={(e) => {
              setLabelFilter(e.target.value);
              setSelectedItems([]);
            }}
          >
            <MenuItem value="ALL">All Items</MenuItem>
            <MenuItem value="PRINTED">Label Printed</MenuItem>
            <MenuItem value="NOT_PRINTED">Label Not Printed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Item Status</InputLabel>
          <Select
            value={statusFilter}
            label="Item Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSelectedItems([]);
            }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
  variant="outlined"
  disabled={!previousUrl || loading}
  onClick={() => fetchOrdersPage(page - 1)}
>
  Previous
</Button>

<Typography variant="body2" sx={{ alignSelf: "center" }}>
  Page {page} | Total Orders: {count}
</Typography>

<Button
  variant="outlined"
  disabled={!nextUrl || loading}
  onClick={() => fetchOrdersPage(page + 1)}
>
  Next
</Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={partiallySelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>

                <TableCell>
                  <strong>Order ID</strong>
                </TableCell>



                <TableCell width={90}>
                  <strong>Type</strong>
                </TableCell>

                <TableCell>
                  <strong>Product</strong>
                </TableCell>

                <TableCell>
                  <strong>Label Printing</strong>
                </TableCell>

                <TableCell>
                  <strong>Item Status</strong>
                </TableCell>

               
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const printed = isItemPrinted(item);
                  const completed = isItemCompleted(item);

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />

                        {printed && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Printed
                          </Typography>
                        )}

                        {completed && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="success.main"
                          >
                            Completed
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={700}>
                          {item.external_order_id}
                        </Typography>
                        
                      </TableCell>

                      

                      <TableCell>
                        <Chip
                          label={item.item_count > 1 ? "M" : "S"}
                          size="small"
                          color={item.item_count > 1 ? "secondary" : "default"}
                        />
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Typography fontWeight={700} fontSize={13}>
                            {item.sku}
                          </Typography>

                          <Typography variant="body2">
                            {item.product_name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={printed ? "Printed" : "Pending"}
                          size="small"
                          color={printed ? "success" : "warning"}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            item.processing_status_display ||
                            item.processing_status
                          }
                          color={completed ? "success" : "info"}
                          size="small"
                        />
                      </TableCell>

                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No Items Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default OrderLabel;