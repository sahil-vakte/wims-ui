// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Box,
//   Button,
//   Checkbox,
//   Chip,
//   CircularProgress,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import tialogo from "../../../Assets/TK_Logo_png.png"
// import Qrimage from "../../../Assets/reviewQR.jpeg"
// import Bannerimage from "../../../Assets/Packing_Banner.jpg.jpeg"

// const OrderLabel = () => {
//   const [orders, setOrders] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [labelFilter, setLabelFilter] = useState("ALL");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const accessToken = getDecryptedAccessToken();
// const LOGO_PATH = tialogo; 
//   const [page, setPage] = useState(1);
// const [nextUrl, setNextUrl] = useState(null);
// const [previousUrl, setPreviousUrl] = useState(null);
// const [count, setCount] = useState(0);
// const REVIEW_QR_URL = "https://www.tiaknightfabrics.co.uk/pages/reviews";

//   const headers = useMemo(
//     () => ({
//       Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
//       "Content-Type": "application/json",
//     }),
//     [accessToken]
//   );

//   // const fetchAllOrders = useCallback(async () => {
//   //   try {
//   //     setLoading(true);
//   //     setError("");

//   //     let allOrders = [];
//   //     let nextUrl = "orders/with-items/";

//   //     while (nextUrl) {
//   //       const response = await ApiServices.get(nextUrl, headers);
//   //       const data = response?.data;

//   //       if (!data) break;

//   //       allOrders = [...allOrders, ...(data.results || [])];

//   //       if (data.next) {
//   //         try {
//   //           const url = new URL(data.next);
//   //           nextUrl = `${url.pathname.replace("/api/v1/", "")}${url.search}`;
//   //         } catch {
//   //           nextUrl = null;
//   //         }
//   //       } else {
//   //         nextUrl = null;
//   //       }
//   //     }

//   //     allOrders.sort(
//   //       (a, b) =>
//   //         new Date(b.created_at || b.order_date) -
//   //         new Date(a.created_at || a.order_date)
//   //     );

//   //     setOrders(allOrders);
//   //   } catch (err) {
//   //     console.error(err);
//   //     setError("Failed to fetch orders");
//   //     setOrders([]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [headers]);

// const fetchOrdersPage = useCallback(
//   async (pageNumber = 1) => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await ApiServices.get(
//         `orders/with-items/?page=${pageNumber}`,
//         headers
//       );

//       const data = response?.data;

//       setOrders(data?.results || []);
//       setCount(data?.count || 0);
//       setNextUrl(data?.next || null);
//       setPreviousUrl(data?.previous || null);
//       setPage(pageNumber);
//       setSelectedItems([]);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch orders");
//       setOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   },
//   [headers]
// );
// useEffect(() => {
//   fetchOrdersPage(1);
// }, [fetchOrdersPage]);
//   // useEffect(() => {
//   //   fetchAllOrders();
//   // }, [fetchAllOrders]);

//   const TIAKNIGHT_BASE_URL = "https://www.tiaknightfabrics.co.uk";

// const buildChildProductUrl = (childProductUrl) => {
//   if (!childProductUrl) return TIAKNIGHT_BASE_URL;

//   if (childProductUrl.startsWith("http")) return childProductUrl;

//   return `${TIAKNIGHT_BASE_URL}${childProductUrl.startsWith("/") ? "" : "/"}${childProductUrl}`;
// };

// const buildQrUrl = (item) => {
//   const productUrl = buildChildProductUrl(item.child_product_url);
//   const url = new URL(productUrl);

//   url.searchParams.set("wims_order_id", item.order_id);
//   url.searchParams.set("wims_item_id", item.id);

//   return url.toString();
// };

//   const allItems = useMemo(() => {
//     return orders.flatMap((order) =>
//       (order.items || []).map((item) => ({
//         ...item,
//         order_id: order.id,
//         external_order_id: order.external_order_id,
//         order_number: order.order_number,
//         order_date: order.order_date,
//         order_source: order.order_source,
//         order_status: order.order_status,
//         order_status_display: order.order_status_display,
//         payment_status: order.payment_status,
//         payment_status_display: order.payment_status_display,
//         customer_name: order.customer_name,
//         customer_email: order.customer_email,
//         item_count: order.items?.length || 0,
//          courier_service_code: order.courier_service_code || "",
//       courier_service_name: order.courier_service_name || "",
//       }))
//     );
//   }, [orders]);

//   const isItemPrinted = (item) => item.lable_printed === true;

//   const isItemCompleted = (item) =>
//     item.processing_status === "COMPLETED" ||
//     item.processing_status_display === "Completed";

//   const statusOptions = useMemo(() => {
//     const map = new Map();

//     allItems.forEach((item) => {
//       if (item.processing_status) {
//         map.set(
//           item.processing_status,
//           item.processing_status_display || item.processing_status
//         );
//       }
//     });

//     return Array.from(map.entries()).map(([value, label]) => ({
//       value,
//       label,
//     }));
//   }, [allItems]);

//   const filteredItems = useMemo(() => {
//     return allItems.filter((item) => {
//       if (labelFilter === "PRINTED" && !isItemPrinted(item)) return false;
//       if (labelFilter === "NOT_PRINTED" && isItemPrinted(item)) return false;

//       if (statusFilter !== "ALL" && item.processing_status !== statusFilter) {
//         return false;
//       }

//       return true;
//     });
//   }, [allItems, labelFilter, statusFilter]);

//   const handleSelectAll = (event) => {
//     if (event.target.checked) {
//       const selectableItems = filteredItems
//         .filter((item) => !isItemPrinted(item))
//         .filter((item) => !isItemCompleted(item))
//         .map((item) => item.id);

//       setSelectedItems(selectableItems);
//     } else {
//       setSelectedItems([]);
//     }
//   };

//   const handleSelectItem = (itemId) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };



//   const downloadSelectedItems = async () => {
//   try {
//     setError("");

//     const selected = allItems.filter((item) =>
//       selectedItems.includes(item.id)
//     );

//     if (!selected.length) {
//       setError("Please select at least one item.");
//       return;
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Order Labels");

//     worksheet.columns = [
//       { header: "Type", key: "type", width: 10 },
//       { header: "SKU", key: "sku", width: 20 },
//       { header: "Product Name", key: "product", width: 60 },
//       { header: "Qty", key: "qty", width: 10 },
//       { header: "External Order ID", key: "externalOrderId", width: 20 },
//       { header: "Source", key: "source", width: 15 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Date", key: "date", width: 25 },
//       { header: "QR URL", key: "qr", width: 70 },
//       { header: "Label Printed", key: "labelPrinted", width: 18 },
//       { header: "Courier", key: "courier_service_code", width: 18 },
//     ];

//     worksheet.getRow(1).font = { bold: true };

//     selected.forEach((item) => {
//       worksheet.addRow({
//         type: item.item_count > 1 ? "M" : "S",
//         sku: item.sku,
//         product: item.product_name,
//         qty: item.quantity,
//         externalOrderId: item.external_order_id,
//         source: "WEB",
//         courier_service_code: item.courier_service_code || "N/A",
//         status: item.processing_status_display || item.processing_status,
//         date: item.order_date
//           ? new Date(item.order_date).toLocaleString()
//           : "",
//           qr: buildQrUrl(item),
//         // qr: `https://wims.cloud/employee-user/order-process-item/${item.order_id}/${item.id}`,
//         labelPrinted: item.lable_printed ? "Printed" : "Pending",
//       });
//     });

//     worksheet.eachRow((row) => {
//       row.eachCell((cell) => {
//         cell.alignment = {
//           vertical: "middle",
//           horizontal: "center",
//           wrapText: true,
//         };

//         cell.border = {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: "thin" },
//           bottom: { style: "thin" },
//         };
//       });
//     });

//     const buffer = await workbook.xlsx.writeBuffer();

//     saveAs(
//       new Blob([buffer], {
//         type:
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       }),
//       `Order_Item_Labels_${Date.now()}.xlsx`
//     );
// await downloadSelectedOrdersPdf(selected);
//     await ApiServices.patch(
//       "orders/items/lable-printed",
//       {
//         lable_printed: true,
//         order_item_ids: selected.map((item) => item.id),
//       },
//       headers
//     );

//     setSelectedItems([]);
//     await fetchOrdersPage(page);
//   } catch (err) {
//     console.error("Download / Label Printed Error:", err);
//     setError(
//       err?.response?.data?.detail ||
//         err?.response?.data?.message ||
//         "Excel downloaded, but failed to update label printed status."
//     );
//   }
// };

//   const selectableItemIds = filteredItems
//     .filter((item) => !isItemPrinted(item))
//     .filter((item) => !isItemCompleted(item))
//     .map((item) => item.id);

//   const allSelected =
//     selectableItemIds.length > 0 &&
//     selectableItemIds.every((id) => selectedItems.includes(id));

//   const partiallySelected =
//     selectedItems.length > 0 &&
//     selectableItemIds.some((id) => selectedItems.includes(id)) &&
//     !allSelected;


//     const getImageBase64 = async (path) => {
//   const res = await fetch(path);
//   const blob = await res.blob();
//   return await new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result);
//     reader.readAsDataURL(blob);
//   });
// };

// const formatOrderDate = (date) =>
//   date
//     ? new Date(date).toLocaleString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//         hour: "numeric",
//         minute: "2-digit",
//       })
//     : "";

// const drawBox = (doc, x, y, w, h) => {
//   doc.setDrawColor(230);
//   doc.rect(x, y, w, h);
// };

// const getDeliveryLines = (order) =>
//   [
//     order.customer_name,
//     order.shipping_address_1,
//     order.shipping_address_2,
//     order.shipping_city,
//     order.shipping_county,
//     order.shipping_country || "UK - Mainland",
//     order.shipping_postcode,
//     order.customer_phone,
//   ].filter(Boolean);

// const downloadSelectedOrdersPdf = async (selected) => {
//   const doc = new jsPDF("p", "mm", "a4");

//   const pageW = doc.internal.pageSize.getWidth();
//   const pageH = doc.internal.pageSize.getHeight();

//   const logoBase64 = await getImageBase64(LOGO_PATH);
//   const reviewQrBase64 = await getImageBase64(Qrimage);
//   const bannerBase64 = await getImageBase64(Bannerimage);

//   const COLORS = {
//     pink: [214, 65, 150],
//     dark: [0, 0, 0],
//     text: [25, 25, 25],
//     lightText: [80, 80, 80],
//     white: [255, 255, 255],
//   };

//   // Font sizes (pt).
//   // Requested: headings/titles 9, info 10, promo paragraph 8.
//   const FS = {
//     title: 9,
//     info: 10,
//     promoTitle: 9,
//     promoBody: 9.5,
//     scan: 8,
//   };

//   const grouped = selected.reduce((acc, item) => {
//     if (!acc[item.order_id]) acc[item.order_id] = [];
//     acc[item.order_id].push(item);
//     return acc;
//   }, {});

//   const drawRoundedBox = (x, y, w, h, fill = null, lineWidth = 0.32) => {
//     doc.setDrawColor(...COLORS.pink);
//     doc.setLineWidth(lineWidth);

//     if (fill) {
//       doc.setFillColor(...fill);
//       doc.roundedRect(x, y, w, h, 1.3, 1.3, "FD");
//     } else {
//       doc.roundedRect(x, y, w, h, 1.3, 1.3, "S");
//     }
//   };

//   const addFooterAndBanner = (startY) => {
//     let y = startY + 5;

//     if (y + 48 > pageH - 8) {
//       doc.addPage();
//       y = 12;
//     }

//     const policyText =
//       "If you are not happy with your fabric, please email info@tiaknight.co.uk within 14 days of receiving your order. " +
//       "Claims cannot be made on fabric that has been cut or processed. No refunds on samples, seconds fabrics and clearance/sale items.";

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(8);
//     doc.setTextColor(...COLORS.text);

//     const policyLines = doc.splitTextToSize(policyText, pageW - 20);
//     doc.text(policyLines, 10, y);

//     y += policyLines.length * 5 + 4;

//     const bannerX = 10;
//     const bannerW = pageW - 20;
//     const bannerH = 80;

//     drawRoundedBox(bannerX, y, bannerW, bannerH, null, 0.3);

//     doc.addImage(
//       bannerBase64,
//       "JPEG",
//       bannerX + 1,
//       y + 1,
//       bannerW - 2,
//       bannerH - 2
//     );
//   };

//   Object.values(grouped).forEach((items, index) => {
//     if (index > 0) doc.addPage();

//     const first = items[0];
//     const order = orders.find((o) => o.id === first.order_id) || first;
//     const orderRef = first.external_order_id || first.order_number || "";

//     // Header bar
//     drawRoundedBox(8, 8, pageW - 16, 18, COLORS.white, 0.42);

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(11);
//     doc.setTextColor(...COLORS.dark);
//     doc.text("PACKING LIST", 12, 20);

//     doc.addImage(logoBase64, "PNG", 73, 10, 58, 14);

//   doc.setFont("helvetica", "bold");
// doc.setFontSize(9);
// doc.text("CONTACT US", pageW - 55, 13.5);

// doc.setFont("helvetica", "normal");
// doc.setFontSize(8);
// doc.text("+44 (0116) 254 2366", pageW - 55, 17.5);
// doc.text("info@tiaknight.co.uk", pageW - 55, 21.5);

//     // Top cards
//     const topY = 32;
//     const gap = 3;
//     const leftX = 8;
//     const rightX = 138;
//     const leftW = 127;
//     const rightW = pageW - rightX - 8;

//     const cardW = (leftW - gap * 2) / 3;
//     const cardH = 22; // fits 9pt title + 10pt info

//     const drawTopCard = (label, value, x) => {
//       drawRoundedBox(x, topY, cardW, cardH, COLORS.white, 0.32);

//       // Title (9pt bold)
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(FS.title);
//       doc.setTextColor(...COLORS.dark);
//       doc.text(label, x + 3, topY + 7);

//       // Info (10pt normal)
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(8.5);
//       doc.setTextColor(...COLORS.text);
//       const valLines = doc.splitTextToSize(value || "-", cardW - 6);
//       doc.text(valLines, x + 3, topY + 12);
//     };

//     drawTopCard("ORDER REFERENCE", orderRef, leftX);
//     drawTopCard(
//       "ORDER DATE",
//       formatOrderDate(first.order_date || order.created_at),
//       leftX + cardW + gap
//     );
//     drawTopCard(
//       "DELIVERY METHOD",
//       first.courier_service_name ||
//         first.courier_service_code ||
//         order.courier_service_name ||
//         "Standard Delivery",
//       leftX + cardW * 2 + gap * 2
//     );

//     // Address card
//     const addressY = topY + cardH + gap;
//     const addressH = 40;

//     drawRoundedBox(leftX, addressY, leftW, addressH, COLORS.white, 0.32);

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(FS.title);
//     doc.setTextColor(...COLORS.dark);
//     doc.text("DELIVERY ADDRESS", leftX + 3, addressY + 7);

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(FS.info);
//     doc.setTextColor(...COLORS.text);
//     doc.text(getDeliveryLines(order), leftX + 3, addressY + 15);

//     // Promo card (right)
//     const promoH = cardH + gap + addressH;
//     drawRoundedBox(rightX, topY, rightW, promoH, COLORS.white, 0.32);

//     // Promo title (9pt bold)
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(FS.promoTitle);
//     doc.setTextColor(...COLORS.dark);
//     doc.text("FANCY A £50 GIFT VOUCHER?", rightX + rightW / 2, topY + 7, {
//       align: "center",
//     });

//     // Promo body (8pt normal)
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(FS.promoBody);
//     doc.setTextColor(...COLORS.text);

//     const promoBodyLines = doc.splitTextToSize(
//       "Tell us something that you love about our fabrics or post a picture of your creation and you could be in for the chance to win. For a valid entry, post your review/picture to Google Reviews or scan the QR code.",
//       rightW - 8
//     );
//     const promoBodyY = topY + 12;
//     doc.text(promoBodyLines, rightX + 4, promoBodyY);

//     // QR — centered horizontally, safely below body text
//     const bodyBottomY = promoBodyY + promoBodyLines.length * 3.2;
//     const qrSize = 22;
//     const scanGap = 4;
//     const bottomPad = 3;
//     const qrBlockH = qrSize + scanGap;

//     const qrY = Math.max(
//       bodyBottomY + 2,
//       topY + promoH - qrBlockH - bottomPad
//     );
//     const qrX = rightX + (rightW - qrSize) / 2;

//     doc.addImage(reviewQrBase64, "JPEG", qrX, qrY, qrSize, qrSize);

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(FS.scan);
//     doc.setTextColor(...COLORS.dark);
//     doc.text("SCAN ME", rightX + rightW / 2, qrY + qrSize + scanGap, {
//       align: "center",
//     });

//     // Items table — start below the tallest column
//     const tableStartY = Math.max(addressY + addressH, topY + promoH) + 5;

//     autoTable(doc, {
//       startY: tableStartY,
//       margin: {
//         left: 8,
//         right: 8,
//         bottom: 10,
//       },
//       head: [["#", "Reference", "Product Information", "Qty"]],
//       body: items.map((item, i) => [
//         i + 1,
//         item.sku || "",
//         item.product_name || "",
//         item.quantity || "",
//       ]),
//       theme: "grid",
//       pageBreak: "auto",
//       rowPageBreak: "avoid",
//       styles: {
//         font: "helvetica",
//         fontSize: 8,
//         cellPadding: 1.8,
//         lineColor: COLORS.pink,
//         lineWidth: 0.15,
//         valign: "middle",
//         textColor: [0, 0, 0],
//         overflow: "linebreak",
//       },
//       headStyles: {
//         fillColor: [255, 255, 255],
//         textColor: [0, 0, 0],
//         fontStyle: "bold",
//         halign: "center",
//         lineColor: COLORS.pink,
//         lineWidth: 0.25,
//       },
//       bodyStyles: { fillColor: [255, 255, 255] },
//       alternateRowStyles: { fillColor: [255, 255, 255] },
//       columnStyles: {
//         0: { cellWidth: 12, halign: "center" },
//         1: { cellWidth: 30, fontStyle: "normal" },
//         2: { cellWidth: 132 },
//         3: { cellWidth: 18, halign: "center", fontStyle: "normal" },
//       },
//     });

//     addFooterAndBanner(doc.lastAutoTable.finalY);
//   });

//   doc.save(`Packing_List_${Date.now()}.pdf`);
// };


// return (
//     <Box p={3}>
//       <Typography variant="h5" gutterBottom fontWeight={700}>
//         Order Item Labels Download
//       </Typography>

//       <Typography variant="body2" sx={{ mb: 2 }}>
//         Total Orders: {orders.length} | Total Items: {allItems.length} |
//         Showing Items: {filteredItems.length} | Selected Items:{" "}
//         {selectedItems.length}
//       </Typography>

//       <Stack
//         direction={{ xs: "column", sm: "row" }}
//         spacing={2}
//         alignItems={{ xs: "stretch", sm: "center" }}
//         sx={{ mb: 2 }}
//       >
//         <Button
//           variant="contained"
//           onClick={downloadSelectedItems}
//           disabled={selectedItems.length === 0}
//         >
//           Download Selected Items
//         </Button>

//         <Button variant="outlined" onClick={() => fetchOrdersPage(page)}>
//           Refresh
//         </Button>

//         <FormControl size="small" sx={{ minWidth: 220 }}>
//           <InputLabel>Label Status</InputLabel>
//           <Select
//             value={labelFilter}
//             label="Label Status"
//             onChange={(e) => {
//               setLabelFilter(e.target.value);
//               setSelectedItems([]);
//             }}
//           >
//             <MenuItem value="ALL">All Items</MenuItem>
//             <MenuItem value="PRINTED">Label Printed</MenuItem>
//             <MenuItem value="NOT_PRINTED">Label Not Printed</MenuItem>
//           </Select>
//         </FormControl>

//         <FormControl size="small" sx={{ minWidth: 220 }}>
//           <InputLabel>Item Status</InputLabel>
//           <Select
//             value={statusFilter}
//             label="Item Status"
//             onChange={(e) => {
//               setStatusFilter(e.target.value);
//               setSelectedItems([]);
//             }}
//           >
//             <MenuItem value="ALL">All Status</MenuItem>
//             {statusOptions.map((status) => (
//               <MenuItem key={status.value} value={status.value}>
//                 {status.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <Button
//   variant="outlined"
//   disabled={!previousUrl || loading}
//   onClick={() => fetchOrdersPage(page - 1)}
// >
//   Previous
// </Button>

// <Typography variant="body2" sx={{ alignSelf: "center" }}>
//   Page {page} | Total Orders: {count}
// </Typography>

// <Button
//   variant="outlined"
//   disabled={!nextUrl || loading}
//   onClick={() => fetchOrdersPage(page + 1)}
// >
//   Next
// </Button>
//       </Stack>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {loading ? (
//         <Box
//           display="flex"
//           justifyContent="center"
//           alignItems="center"
//           minHeight={300}
//         >
//           <CircularProgress />
//         </Box>
//       ) : (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell width={60}>
//                   <Checkbox
//                     checked={allSelected}
//                     indeterminate={partiallySelected}
//                     onChange={handleSelectAll}
//                   />
//                 </TableCell>

//                 <TableCell>
//                   <strong>Order ID</strong>
//                 </TableCell>



//                 <TableCell width={90}>
//                   <strong>Type</strong>
//                 </TableCell>

//                 <TableCell>
//                   <strong>Product</strong>
//                 </TableCell>

//                 <TableCell>
//                   <strong>Label Printing</strong>
//                 </TableCell>

//                 <TableCell>
//                   <strong>Item Status</strong>
//                 </TableCell>

               
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {filteredItems.length > 0 ? (
//                 filteredItems.map((item) => {
//                   const printed = isItemPrinted(item);
//                   const completed = isItemCompleted(item);

//                   return (
//                     <TableRow key={item.id} hover>
//                       <TableCell>
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onChange={() => handleSelectItem(item.id)}
//                         />

//                         {printed && (
//                           <Typography
//                             variant="caption"
//                             display="block"
//                             color="text.secondary"
//                           >
//                             Printed
//                           </Typography>
//                         )}

//                         {completed && (
//                           <Typography
//                             variant="caption"
//                             display="block"
//                             color="success.main"
//                           >
//                             Completed
//                           </Typography>
//                         )}
//                       </TableCell>

//                       <TableCell>
//                         <Typography fontWeight={700}>
//                           {item.external_order_id}
//                         </Typography>
                        
//                       </TableCell>

                      

//                       <TableCell>
//                         <Chip
//                           label={item.item_count > 1 ? "M" : "S"}
//                           size="small"
//                           color={item.item_count > 1 ? "secondary" : "default"}
//                         />
//                       </TableCell>

//                       <TableCell>
//                         <Box
//                           sx={{
//                             p: 1,
//                             borderRadius: 1.5,
//                             bgcolor: "#f8fafc",
//                             border: "1px solid #e2e8f0",
//                           }}
//                         >
//                           <Typography fontWeight={700} fontSize={13}>
//                             {item.sku}
//                           </Typography>

//                           <Typography variant="body2">
//                             {item.product_name}
//                           </Typography>

//                           <Typography variant="caption" color="text.secondary">
//                             Qty: {item.quantity}
//                           </Typography>
//                         </Box>
//                       </TableCell>

//                       <TableCell>
//                         <Chip
//                           label={printed ? "Printed" : "Pending"}
//                           size="small"
//                           color={printed ? "success" : "warning"}
//                         />
//                       </TableCell>

//                       <TableCell>
//                         <Chip
//                           label={
//                             item.processing_status_display ||
//                             item.processing_status
//                           }
//                           color={completed ? "success" : "info"}
//                           size="small"
//                         />
//                       </TableCell>

//                     </TableRow>
//                   );
//                 })
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center">
//                     No Items Found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}
//     </Box>
//   );
// };

// export default OrderLabel;


import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import ApiServices from "../../../Services/ApiServices/ApiServices";

import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

import tialogo from "../../../Assets/TK_Logo_png.png";
import Qrimage from "../../../Assets/reviewQR.jpeg";
import Bannerimage from "../../../Assets/Packing_Banner.jpg.jpeg";

const TIAKNIGHT_BASE_URL =
  "https://www.tiaknightfabrics.co.uk";

const DYMO_LABEL_TEMPLATE =
  `${process.env.PUBLIC_URL}/labels/tiaknight-product-label.dymo`;

const wait = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

const OrderLabel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [labelFilter, setLabelFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] =
    useState(null);
  const [count, setCount] = useState(0);

  /*
   * DYMO printer states
   */
  const [dymoPrinters, setDymoPrinters] =
    useState([]);

  const [
    selectedDymoPrinter,
    setSelectedDymoPrinter,
  ] = useState("");

  const [dymoConnecting, setDymoConnecting] =
    useState(false);

  const [printingLabels, setPrintingLabels] =
    useState(false);

  const [printMessage, setPrintMessage] =
    useState("");

  const accessToken =
    getDecryptedAccessToken();

  const LOGO_PATH = tialogo;

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken?.replace(
        /(^"|"$)/g,
        ""
      )}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  );

  /*
   * Fetch one page only.
   */
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
        console.error(
          "Fetch orders error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to fetch orders."
        );

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

  /*
   * Product URL helpers
   */
  const buildChildProductUrl = useCallback(
    (childProductUrl) => {
      if (!childProductUrl) {
        return TIAKNIGHT_BASE_URL;
      }

      if (
        String(childProductUrl).startsWith(
          "http"
        )
      ) {
        return childProductUrl;
      }

      return `${TIAKNIGHT_BASE_URL}${
        String(childProductUrl).startsWith("/")
          ? ""
          : "/"
      }${childProductUrl}`;
    },
    []
  );

  // const buildQrUrl = useCallback(
  //   (item) => {
  //     try {
  //       const productUrl =
  //         buildChildProductUrl(
  //           item?.child_product_url
  //         );

  //       const url = new URL(productUrl);

  //       if (item?.order_id) {
  //         url.searchParams.set(
  //           "wims_order_id",
  //           item.order_id
  //         );
  //       }

  //       if (item?.id) {
  //         url.searchParams.set(
  //           "wims_item_id",
  //           item.id
  //         );
  //       }

  //       return url.toString();
  //     } catch (err) {
  //       console.error(
  //         "QR URL generation error:",
  //         err
  //       );

  //       return TIAKNIGHT_BASE_URL;
  //     }
  //   },
  //   [buildChildProductUrl]
  // );


  const buildQrUrl = useCallback((item) => {
  if (!item?.order_id || !item?.id) {
    console.warn("Missing order_id or item id", item);
    return "https://wims.cloud/employee-user/order-process-item";
  }

  return `https://wims.cloud/employee-user/order-process-item/${item.order_id}/${item.id}`;
}, []);
  /*
   * Flatten orders into order items.
   */
  const allItems = useMemo(() => {
    return orders.flatMap((order) =>
      (order.items || []).map((item) => ({
        ...item,

        order_id: order.id,
        external_order_id:
          order.external_order_id,
        order_number: order.order_number,
        order_date:
          order.order_date ||
          order.created_at,
        order_source:
          order.order_source || "WEB",

        order_status: order.order_status,
        order_status_display:
          order.order_status_display,

        payment_status:
          order.payment_status,
        payment_status_display:
          order.payment_status_display,

        customer_name:
          order.customer_name,
        customer_email:
          order.customer_email,
        customer_phone:
          order.customer_phone,

        shipping_address_1:
          order.shipping_address_1,
        shipping_address_2:
          order.shipping_address_2,
        shipping_city:
          order.shipping_city,
        shipping_county:
          order.shipping_county,
        shipping_country:
          order.shipping_country,
        shipping_postcode:
          order.shipping_postcode,

        item_count:
          order.items?.length || 0,

        courier_service_code:
          order.courier_service_code || "",

        courier_service_name:
          order.courier_service_name || "",
      }))
    );
  }, [orders]);

  const isItemPrinted = useCallback(
    (item) => item?.lable_printed === true,
    []
  );

  const isItemCompleted = useCallback(
    (item) =>
      item?.processing_status ===
        "COMPLETED" ||
      item?.processing_status_display ===
        "Completed",
    []
  );

  const statusOptions = useMemo(() => {
    const statusMap = new Map();

    allItems.forEach((item) => {
      if (item.processing_status) {
        statusMap.set(
          item.processing_status,
          item.processing_status_display ||
            item.processing_status
        );
      }
    });

    return Array.from(
      statusMap.entries()
    ).map(([value, label]) => ({
      value,
      label,
    }));
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (
        labelFilter === "PRINTED" &&
        !isItemPrinted(item)
      ) {
        return false;
      }

      if (
        labelFilter === "NOT_PRINTED" &&
        isItemPrinted(item)
      ) {
        return false;
      }

      if (
        statusFilter !== "ALL" &&
        item.processing_status !==
          statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    allItems,
    labelFilter,
    statusFilter,
    isItemPrinted,
  ]);

  /*
   * Select items
   */
  const selectableItemIds = useMemo(
    () =>
      filteredItems
        .filter(
          (item) =>
            !isItemPrinted(item) &&
            !isItemCompleted(item)
        )
        .map((item) => item.id),
    [
      filteredItems,
      isItemPrinted,
      isItemCompleted,
    ]
  );

  const allSelected =
    selectableItemIds.length > 0 &&
    selectableItemIds.every((id) =>
      selectedItems.includes(id)
    );

  const partiallySelected =
    selectedItems.length > 0 &&
    selectableItemIds.some((id) =>
      selectedItems.includes(id)
    ) &&
    !allSelected;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(selectableItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item) => {
    if (
      isItemPrinted(item) ||
      isItemCompleted(item) ||
      printingLabels
    ) {
      return;
    }

    setSelectedItems((previous) =>
      previous.includes(item.id)
        ? previous.filter(
            (id) => id !== item.id
          )
        : [...previous, item.id]
    );
  };

  /*
   * DYMO framework
   */
  const getDymoFramework =
    useCallback(() => {
      const framework =
        window?.dymo?.label?.framework;

      if (!framework) {
        throw new Error(
          "DYMO JavaScript Framework is not loaded. Check public/index.html."
        );
      }

      return framework;
    }, []);

  const initializeDymoPrinter =
    useCallback(async () => {
      try {
        setDymoConnecting(true);
        setError("");
        setPrintMessage(
          "Connecting to DYMO Web Service..."
        );

        const framework =
          getDymoFramework();

        await new Promise(
          (resolve, reject) => {
            let completed = false;

            const timeoutId =
              window.setTimeout(() => {
                if (!completed) {
                  reject(
                    new Error(
                      "DYMO connection timed out. Start DYMO Connect for Desktop and its Web Service."
                    )
                  );
                }
              }, 15000);

            framework.init(() => {
              completed = true;
              window.clearTimeout(timeoutId);
              resolve();
            });
          }
        );

        const environment =
          framework.checkEnvironment();

        console.log(
          "DYMO environment:",
          environment
        );

        if (
          environment?.isBrowserSupported ===
          false
        ) {
          throw new Error(
            environment?.errorDetails ||
              "This browser is not supported by DYMO."
          );
        }

        if (
          environment?.isFrameworkInstalled ===
          false
        ) {
          throw new Error(
            "DYMO Connect Web Service was not detected. Install and start DYMO Connect for Desktop."
          );
        }

        if (
          Object.prototype.hasOwnProperty.call(
            environment || {},
            "isWebServicePresent"
          ) &&
          environment.isWebServicePresent ===
            false
        ) {
          throw new Error(
            "DYMO Web Service is installed but not running."
          );
        }

        const printerCollection =
          framework.getPrinters();

        const installedPrinters =
          Array.from(
            printerCollection || []
          );

        console.log(
          "Installed DYMO printers:",
          installedPrinters
        );

        const labelWriterPrinters =
          installedPrinters.filter(
            (printer) => {
              const printerName = String(
                printer?.name || ""
              ).toLowerCase();

              const modelName = String(
                printer?.modelName || ""
              ).toLowerCase();

              return (
                printer?.printerType ===
                  "LabelWriterPrinter" ||
                printerName.includes(
                  "labelwriter"
                ) ||
                modelName.includes(
                  "labelwriter"
                )
              );
            }
          );

        if (
          labelWriterPrinters.length === 0
        ) {
          throw new Error(
            "No DYMO LabelWriter printer was detected. Check the USB connection and printer driver."
          );
        }

        setDymoPrinters(
          labelWriterPrinters
        );

        setSelectedDymoPrinter(
          (currentPrinter) => {
            const printerStillExists =
              labelWriterPrinters.some(
                (printer) =>
                  printer.name ===
                  currentPrinter
              );

            return printerStillExists
              ? currentPrinter
              : labelWriterPrinters[0].name;
          }
        );

        setPrintMessage(
          `Connected to ${labelWriterPrinters[0].name}.`
        );
      } catch (err) {
        console.error(
          "DYMO initialization error:",
          err
        );

        setDymoPrinters([]);
        setSelectedDymoPrinter("");
        setPrintMessage("");

        setError(
          err?.message ||
            "Unable to connect to the DYMO printer."
        );
      } finally {
        setDymoConnecting(false);
      }
    }, [getDymoFramework]);

  useEffect(() => {
    initializeDymoPrinter();
  }, [initializeDymoPrinter]);

  /*
   * Load the existing DYMO template.
   *
   * The uploaded template contains these objects:
   * DATE-TIME, TK Logo, QR Code, TEXT, TEXT2, TEXT3,
   * TEXT4, TEXT5, TEXT37, TEXT6 and TEXT7.
   */

  const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const replaceQrValueInDymoXml = (labelXml, qrUrl) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(
    labelXml,
    "application/xml"
  );

  const parserError =
    xmlDocument.querySelector("parsererror");

  if (parserError) {
    throw new Error(
      `Unable to parse DYMO XML: ${parserError.textContent}`
    );
  }

  const qrObjects = Array.from(
    xmlDocument.getElementsByTagName("QRCodeObject")
  );

  const qrObject = qrObjects.find((object) => {
    const nameNode = object.getElementsByTagName("Name")[0];

    return nameNode?.textContent?.trim() === "QR Code";
  });

  if (!qrObject) {
    throw new Error(
      'QR object named "QR Code" was not found in the DYMO template.'
    );
  }

  const dataString =
    qrObject.getElementsByTagName("DataString")[0];

  const textDataHolder =
    qrObject.getElementsByTagName("TextDataHolder")[0];

  const holderValue =
    textDataHolder?.getElementsByTagName("Value")[0];

  if (!dataString) {
    throw new Error(
      "DataString was not found inside the DYMO QR object."
    );
  }

  // textContent safely handles XML escaping.
  dataString.textContent = qrUrl;

  if (holderValue) {
    holderValue.textContent = qrUrl;
  }

  return new XMLSerializer().serializeToString(
    xmlDocument
  );
};
  const loadDymoLabel = useCallback(async (qrUrl) => {
    const framework = getDymoFramework();

    const response = await fetch(DYMO_LABEL_TEMPLATE, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load DYMO template. HTTP ${response.status}. Expected public/labels/tiaknight-product-label.dymo`
      );
    }

    const originalLabelXml = await response.text();

const labelXml = replaceQrValueInDymoXml(
  originalLabelXml,
  qrUrl
);

    if (!labelXml.trim()) {
      throw new Error("The DYMO template file is empty.");
    }

    const lowerXml = labelXml.toLowerCase();

    if (
      lowerXml.includes("<!doctype html") ||
      lowerXml.includes("<html")
    ) {
      throw new Error(
        "React returned index.html instead of the DYMO template. Place tiaknight-product-label.dymo inside public/labels."
      );
    }

    let label;

    try {
      label = framework.openLabelXml(labelXml);
    } catch (err) {
      console.error("DYMO template parsing error:", err);

      throw new Error(
        "DYMO could not open the product label template."
      );
    }

    const objectNames = Array.from(
      label.getObjectNames?.() || []
    );

    console.log("DYMO template objects:", objectNames);

    const requiredObjects = [
      "QR Code",
      "TEXT",
      "TEXT2",
      "TEXT3",
      "TEXT4",
      "TEXT5",
      "TEXT37",
      "TEXT6",
      "TEXT7",
    ];

    const missingObjects = requiredObjects.filter(
      (objectName) => !objectNames.includes(objectName)
    );

    if (missingObjects.length > 0) {
      throw new Error(
        `The DYMO template is missing required objects: ${missingObjects.join(
          ", "
        )}. Available objects: ${objectNames.join(", ") || "none"}`
      );
    }

    return {
      label,
      objectNames,
    };
  }, [getDymoFramework]);

  /*
   * Safely update a named object from the DYMO template.
   */
  const setDymoObjectValue = useCallback(
    (label, objectNames, objectName, value) => {
      if (!objectNames.includes(objectName)) {
        console.warn(
          `DYMO object "${objectName}" was not found. Available objects:`,
          objectNames
        );
        return;
      }

      label.setObjectText(
        objectName,
        String(value ?? "")
      );
    },
    []
  );

  /*
   * Populate the template objects using the order item.
   *
   * Template mapping:
   * QR Code  -> product/process URL
   * TEXT     -> product name
   * TEXT2    -> quantity
   * TEXT3    -> source
   * TEXT4    -> SKU
   * TEXT5    -> courier
   * TEXT37   -> external order ID
   * TEXT6    -> M/S type
   * TEXT7    -> SCAN ME
   * DATE-TIME-> printed/order date and time
   */
  const populateDymoLabel = useCallback(
    (label, objectNames, item) => {
      const typeValue =
        Number(item?.item_count || 0) > 1 ? "M" : "S";

      const sourceValue =
        item?.order_source || "WEB";

      const courierValue =
        item?.courier_service_code ||
        item?.courier_service_name ||
        "STD";

      const externalOrderId =
        item?.external_order_id ||
        item?.order_number ||
        "";

      const dateSource =
        item?.order_date ||
        item?.created_at ||
        Date.now();

      const parsedDate = new Date(dateSource);

      const dateValue = Number.isNaN(parsedDate.getTime())
        ? ""
        : parsedDate.toLocaleString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

      setDymoObjectValue(
        label,
        objectNames,
        "QR Code",
        buildQrUrl(item)
      );

      // The uploaded template maps TEXT to Product Name.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT",
        item?.product_name || ""
      );

      // The uploaded template maps TEXT2 to Qty.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT2",
        item?.quantity ?? 0
      );

      // The uploaded template maps TEXT3 to Source.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT3",
        sourceValue
      );

      // The uploaded template maps TEXT4 to SKU.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT4",
        item?.sku || ""
      );

      // The uploaded template maps TEXT5 to Courier.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT5",
        courierValue
      );

      // The uploaded template maps TEXT37 to External Order ID.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT37",
        externalOrderId
      );

      // The uploaded template maps TEXT6 to Type.
      setDymoObjectValue(
        label,
        objectNames,
        "TEXT6",
        typeValue
      );

      setDymoObjectValue(
        label,
        objectNames,
        "TEXT7",
        "SCAN ME"
      );

      /*
       * DATE-TIME is present in the uploaded template. Some DYMO
       * versions keep DateTimeObject dynamic; setObjectText works
       * in supported versions and is harmlessly skipped only when
       * the object is absent.
       */
      setDymoObjectValue(
        label,
        objectNames,
        "DATE-TIME",
        dateValue
      );

      return {
        externalOrderId,
      };
    },
    [buildQrUrl, setDymoObjectValue]
  );

  /*
   * Print selected DYMO labels.
   */
  const printSelectedDymoLabels = async () => {
    try {
      setError("");
      setPrintMessage("");

      if (!selectedDymoPrinter) {
        setError("Select a DYMO printer before printing.");
        return;
      }

      const selected = allItems.filter((item) =>
        selectedItems.includes(item.id)
      );

      if (selected.length === 0) {
        setError("Please select at least one item.");
        return;
      }

      const invalidItems = selected.filter(
        (item) =>
          isItemPrinted(item) ||
          isItemCompleted(item)
      );

      if (invalidItems.length > 0) {
        setError(
          "One or more selected items are already printed or completed."
        );
        return;
      }

      setPrintingLabels(true);

      const framework = getDymoFramework();
      const successfullySubmittedItemIds = [];

      for (
        let index = 0;
        index < selected.length;
        index += 1
      ) {
        const item = selected[index];

        setPrintMessage(
          `Preparing label ${index + 1} of ${selected.length}: ${
            item.sku ||
            item.external_order_id ||
            item.id
          }`
        );

   const qrUrl = buildQrUrl(item);

console.log("Printing QR:", qrUrl);

const { label, objectNames } =
  await loadDymoLabel(qrUrl);

const { externalOrderId } =
  populateDymoLabel(
    label,
    objectNames,
    item
  );

          console.log(
    "Printing QR:",
    buildQrUrl(item)
);

        const printParamsXml =
          framework.createLabelWriterPrintParamsXml({
            copies: 1,
            jobTitle: `${
              externalOrderId || "WIMS"
            } - ${item.sku || "Item Label"}`,
            printQuality: "BarcodeAndGraphics",
          });

        const labelXml = label.getLabelXml();

// const framework = getDymoFramework();

framework.printLabel(
    selectedDymoPrinter,
    printParamsXml,
    labelXml
);

        successfullySubmittedItemIds.push(item.id);

        // Avoid flooding the local DYMO Web Service.
        await wait(700);
      }

      /*
       * Mark only the successfully submitted labels as printed.
       * Note: DYMO's browser framework confirms job submission,
       * not the printer's physical paper output.
       */
      if (successfullySubmittedItemIds.length > 0) {
        await ApiServices.patch(
          "orders/items/lable-printed",
          {
            lable_printed: true,
            order_item_ids:
              successfullySubmittedItemIds,
          },
          headers
        );
      }

      setPrintMessage(
        `${successfullySubmittedItemIds.length} label${
          successfullySubmittedItemIds.length === 1
            ? ""
            : "s"
        } sent to ${selectedDymoPrinter}.`
      );

      setSelectedItems([]);

      await fetchOrdersPage(page);
    } catch (err) {
      console.error(
        "DYMO label printing error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to print selected labels."
      );
    } finally {
      setPrintingLabels(false);
    }
  };

  /*
   * Excel download
   */
  const downloadSelectedItems =
    async () => {
      try {
        setError("");

        const selected =
          allItems.filter((item) =>
            selectedItems.includes(
              item.id
            )
          );

        if (!selected.length) {
          setError(
            "Please select at least one item."
          );
          return;
        }

        const workbook =
          new ExcelJS.Workbook();

        const worksheet =
          workbook.addWorksheet(
            "Order Labels"
          );

        worksheet.columns = [
          {
            header: "Type",
            key: "type",
            width: 10,
          },
          {
            header: "SKU",
            key: "sku",
            width: 20,
          },
          {
            header: "Product Name",
            key: "product",
            width: 60,
          },
          {
            header: "Qty",
            key: "qty",
            width: 10,
          },
          {
            header:
              "External Order ID",
            key: "externalOrderId",
            width: 20,
          },
          {
            header: "Source",
            key: "source",
            width: 15,
          },
          {
            header: "Status",
            key: "status",
            width: 15,
          },
          {
            header: "Date",
            key: "date",
            width: 25,
          },
          {
            header: "QR URL",
            key: "qr",
            width: 70,
          },
          {
            header:
              "Label Printed",
            key: "labelPrinted",
            width: 18,
          },
          {
            header: "Courier",
            key: "courier",
            width: 18,
          },
        ];

        worksheet.getRow(1).font = {
          bold: true,
        };

        selected.forEach((item) => {
          worksheet.addRow({
            type:
              item.item_count > 1
                ? "M"
                : "S",

            sku: item.sku || "",

            product:
              item.product_name || "",

            qty: item.quantity || "",

            externalOrderId:
              item.external_order_id ||
              "",

            source:
              item.order_source ||
              "WEB",

            courier:
              item.courier_service_code ||
              item.courier_service_name ||
              "N/A",

            status:
              item.processing_status_display ||
              item.processing_status ||
              "",

            date: item.order_date
              ? new Date(
                  item.order_date
                ).toLocaleString()
              : "",

            qr: buildQrUrl(item),

            labelPrinted:
              item.lable_printed
                ? "Printed"
                : "Pending",
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
              top: {
                style: "thin",
              },
              left: {
                style: "thin",
              },
              right: {
                style: "thin",
              },
              bottom: {
                style: "thin",
              },
            };
          });
        });

        const buffer =
          await workbook.xlsx.writeBuffer();

        saveAs(
          new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `Order_Item_Labels_${Date.now()}.xlsx`
        );

        await downloadSelectedOrdersPdf(
          selected
        );
      } catch (err) {
        console.error(
          "Download labels error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data
              ?.message ||
            "Failed to download the selected items."
        );
      }
    };

  /*
   * PDF helpers
   */
  const getImageBase64 = async (
    path
  ) => {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(
        `Failed to load image: ${path}`
      );
    }

    const blob =
      await response.blob();

    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onloadend = () =>
          resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(blob);
      }
    );
  };

  const formatOrderDate = (date) =>
    date
      ? new Date(date).toLocaleString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "";

  const getDeliveryLines = (
    order
  ) =>
    [
      order.customer_name,
      order.shipping_address_1,
      order.shipping_address_2,
      order.shipping_city,
      order.shipping_county,
      order.shipping_country ||
        "UK - Mainland",
      order.shipping_postcode,
      order.customer_phone,
    ].filter(Boolean);

  const downloadSelectedOrdersPdf =
    async (selected) => {
      const doc = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      const pageW =
        doc.internal.pageSize.getWidth();

      const pageH =
        doc.internal.pageSize.getHeight();

      const logoBase64 =
        await getImageBase64(
          LOGO_PATH
        );

      const reviewQrBase64 =
        await getImageBase64(
          Qrimage
        );

      const bannerBase64 =
        await getImageBase64(
          Bannerimage
        );

      const COLORS = {
        pink: [214, 65, 150],
        dark: [0, 0, 0],
        text: [25, 25, 25],
        white: [255, 255, 255],
      };

      const FS = {
        title: 9,
        info: 10,
        promoTitle: 9,
        promoBody: 9.5,
        scan: 8,
      };

      const grouped =
        selected.reduce(
          (accumulator, item) => {
            if (
              !accumulator[item.order_id]
            ) {
              accumulator[
                item.order_id
              ] = [];
            }

            accumulator[
              item.order_id
            ].push(item);

            return accumulator;
          },
          {}
        );

      const drawRoundedBox = (
        x,
        y,
        width,
        height,
        fill = null,
        lineWidth = 0.32
      ) => {
        doc.setDrawColor(
          ...COLORS.pink
        );

        doc.setLineWidth(lineWidth);

        if (fill) {
          doc.setFillColor(...fill);

          doc.roundedRect(
            x,
            y,
            width,
            height,
            1.3,
            1.3,
            "FD"
          );
        } else {
          doc.roundedRect(
            x,
            y,
            width,
            height,
            1.3,
            1.3,
            "S"
          );
        }
      };

      const addFooterAndBanner = (
        startY
      ) => {
        let y = startY + 5;

        if (y + 90 > pageH - 8) {
          doc.addPage();
          y = 12;
        }

        const policyText =
          "If you are not happy with your fabric, please email info@tiaknight.co.uk within 14 days of receiving your order. " +
          "Claims cannot be made on fabric that has been cut or processed. No refunds on samples, seconds fabrics and clearance/sale items.";

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);
        doc.setTextColor(
          ...COLORS.text
        );

        const policyLines =
          doc.splitTextToSize(
            policyText,
            pageW - 20
          );

        doc.text(
          policyLines,
          10,
          y
        );

        y +=
          policyLines.length * 4 +
          4;

        const bannerX = 10;
        const bannerW = pageW - 20;
        const bannerH = 80;

        drawRoundedBox(
          bannerX,
          y,
          bannerW,
          bannerH,
          null,
          0.3
        );

        doc.addImage(
          bannerBase64,
          "JPEG",
          bannerX + 1,
          y + 1,
          bannerW - 2,
          bannerH - 2
        );
      };

      Object.values(
        grouped
      ).forEach((items, index) => {
        if (index > 0) {
          doc.addPage();
        }

        const first = items[0];

        const order =
          orders.find(
            (currentOrder) =>
              currentOrder.id ===
              first.order_id
          ) || first;

        const orderRef =
          first.external_order_id ||
          first.order_number ||
          "";

        drawRoundedBox(
          8,
          8,
          pageW - 16,
          18,
          COLORS.white,
          0.42
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(11);
        doc.setTextColor(
          ...COLORS.dark
        );

        doc.text(
          "PACKING LIST",
          12,
          20
        );

        doc.addImage(
          logoBase64,
          "PNG",
          73,
          10,
          58,
          14
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(9);

        doc.text(
          "CONTACT US",
          pageW - 55,
          13.5
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.text(
          "+44 (0116) 254 2366",
          pageW - 55,
          17.5
        );

        doc.text(
          "info@tiaknight.co.uk",
          pageW - 55,
          21.5
        );

        const topY = 32;
        const gap = 3;
        const leftX = 8;
        const rightX = 138;
        const leftW = 127;

        const rightW =
          pageW - rightX - 8;

        const cardW =
          (leftW - gap * 2) / 3;

        const cardH = 22;

        const drawTopCard = (
          label,
          value,
          x
        ) => {
          drawRoundedBox(
            x,
            topY,
            cardW,
            cardH,
            COLORS.white,
            0.32
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(FS.title);
          doc.setTextColor(
            ...COLORS.dark
          );

          doc.text(
            label,
            x + 3,
            topY + 7
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(8.5);
          doc.setTextColor(
            ...COLORS.text
          );

          const valueLines =
            doc.splitTextToSize(
              value || "-",
              cardW - 6
            );

          doc.text(
            valueLines,
            x + 3,
            topY + 12
          );
        };

        drawTopCard(
          "ORDER REFERENCE",
          orderRef,
          leftX
        );

        drawTopCard(
          "ORDER DATE",
          formatOrderDate(
            first.order_date ||
              order.created_at
          ),
          leftX + cardW + gap
        );

        drawTopCard(
          "DELIVERY METHOD",
          first.courier_service_name ||
            first.courier_service_code ||
            order.courier_service_name ||
            "Standard Delivery",
          leftX +
            cardW * 2 +
            gap * 2
        );

        const addressY =
          topY + cardH + gap;

        const addressH = 40;

        drawRoundedBox(
          leftX,
          addressY,
          leftW,
          addressH,
          COLORS.white,
          0.32
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(FS.title);
        doc.setTextColor(
          ...COLORS.dark
        );

        doc.text(
          "DELIVERY ADDRESS",
          leftX + 3,
          addressY + 7
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(FS.info);
        doc.setTextColor(
          ...COLORS.text
        );

        doc.text(
          getDeliveryLines(order),
          leftX + 3,
          addressY + 15
        );

        const promoH =
          cardH + gap + addressH;

        drawRoundedBox(
          rightX,
          topY,
          rightW,
          promoH,
          COLORS.white,
          0.32
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(
          FS.promoTitle
        );

        doc.setTextColor(
          ...COLORS.dark
        );

        doc.text(
          "FANCY A £50 GIFT VOUCHER?",
          rightX + rightW / 2,
          topY + 7,
          {
            align: "center",
          }
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(
          FS.promoBody
        );

        const promoBodyLines =
          doc.splitTextToSize(
            "Tell us something that you love about our fabrics or post a picture of your creation and you could be in for the chance to win. For a valid entry, post your review/picture to Google Reviews or scan the QR code.",
            rightW - 8
          );

        const promoBodyY =
          topY + 12;

        doc.text(
          promoBodyLines,
          rightX + 4,
          promoBodyY
        );

        const bodyBottomY =
          promoBodyY +
          promoBodyLines.length *
            3.2;

        const qrSize = 22;
        const scanGap = 4;
        const bottomPad = 3;

        const qrBlockH =
          qrSize + scanGap;

        const qrY = Math.max(
          bodyBottomY + 2,
          topY +
            promoH -
            qrBlockH -
            bottomPad
        );

        const qrX =
          rightX +
          (rightW - qrSize) / 2;

        doc.addImage(
          reviewQrBase64,
          "JPEG",
          qrX,
          qrY,
          qrSize,
          qrSize
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(FS.scan);

        doc.text(
          "SCAN ME",
          rightX + rightW / 2,
          qrY + qrSize + scanGap,
          {
            align: "center",
          }
        );

        const tableStartY =
          Math.max(
            addressY + addressH,
            topY + promoH
          ) + 5;

        autoTable(doc, {
          startY: tableStartY,

          margin: {
            left: 8,
            right: 8,
            bottom: 10,
          },

          head: [
            [
              "#",
              "Reference",
              "Product Information",
              "Qty",
            ],
          ],

          body: items.map(
            (item, itemIndex) => [
              itemIndex + 1,
              item.sku || "",
              item.product_name || "",
              item.quantity || "",
            ]
          ),

          theme: "grid",
          pageBreak: "auto",
          rowPageBreak: "avoid",

          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 1.8,
            lineColor:
              COLORS.pink,
            lineWidth: 0.15,
            valign: "middle",
            textColor: [0, 0, 0],
            overflow: "linebreak",
          },

          headStyles: {
            fillColor: [
              255,
              255,
              255,
            ],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
            lineColor:
              COLORS.pink,
            lineWidth: 0.25,
          },

          bodyStyles: {
            fillColor: [
              255,
              255,
              255,
            ],
          },

          alternateRowStyles: {
            fillColor: [
              255,
              255,
              255,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 12,
              halign: "center",
            },
            1: {
              cellWidth: 30,
            },
            2: {
              cellWidth: 132,
            },
            3: {
              cellWidth: 18,
              halign: "center",
            },
          },
        });

        addFooterAndBanner(
          doc.lastAutoTable.finalY
        );
      });

      doc.save(
        `Packing_List_${Date.now()}.pdf`
      );
    };

  return (
    <Box p={3}>
      <Typography
        variant="h5"
        gutterBottom
        fontWeight={700}
      >
        Order Item Labels
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 2 }}
      >
        Total Orders on Page:{" "}
        {orders.length}
        {" | "}
        Total Items on Page:{" "}
        {allItems.length}
        {" | "}
        Showing Items:{" "}
        {filteredItems.length}
        {" | "}
        Selected Items:{" "}
        {selectedItems.length}
      </Typography>

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
        useFlexGap
        flexWrap="wrap"
        sx={{ mb: 2 }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 270 }}
        >
          <InputLabel>
            DYMO Printer
          </InputLabel>

          <Select
            value={
              selectedDymoPrinter
            }
            label="DYMO Printer"
            disabled={
              dymoConnecting ||
              printingLabels
            }
            onChange={(event) =>
              setSelectedDymoPrinter(
                event.target.value
              )
            }
          >
            {dymoPrinters.length ===
              0 && (
              <MenuItem value="">
                No printer detected
              </MenuItem>
            )}

            {dymoPrinters.map(
              (printer) => (
                <MenuItem
                  key={printer.name}
                  value={printer.name}
                >
                  {printer.name}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="success"
          disabled={
            selectedItems.length ===
              0 ||
            !selectedDymoPrinter ||
            printingLabels ||
            dymoConnecting
          }
          onClick={
            printSelectedDymoLabels
          }
          startIcon={
            printingLabels ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : null
          }
        >
          {printingLabels
            ? "Printing Labels..."
            : `Print Selected Labels (${selectedItems.length})`}
        </Button>

        <Button
          variant="outlined"
          disabled={
            dymoConnecting ||
            printingLabels
          }
          onClick={
            initializeDymoPrinter
          }
        >
          {dymoConnecting
            ? "Connecting..."
            : "Reconnect DYMO"}
        </Button>

        <Button
          variant="contained"
          onClick={
            downloadSelectedItems
          }
          disabled={
            selectedItems.length ===
              0 || printingLabels
          }
        >
          Download Selected Items
        </Button>

        <Button
          variant="outlined"
          disabled={
            loading ||
            printingLabels
          }
          onClick={() =>
            fetchOrdersPage(page)
          }
        >
          Refresh
        </Button>

        <FormControl
          size="small"
          sx={{ minWidth: 200 }}
        >
          <InputLabel>
            Label Status
          </InputLabel>

          <Select
            value={labelFilter}
            label="Label Status"
            onChange={(event) => {
              setLabelFilter(
                event.target.value
              );

              setSelectedItems([]);
            }}
          >
            <MenuItem value="ALL">
              All Items
            </MenuItem>

            <MenuItem value="PRINTED">
              Label Printed
            </MenuItem>

            <MenuItem value="NOT_PRINTED">
              Label Not Printed
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 200 }}
        >
          <InputLabel>
            Item Status
          </InputLabel>

          <Select
            value={statusFilter}
            label="Item Status"
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );

              setSelectedItems([]);
            }}
          >
            <MenuItem value="ALL">
              All Status
            </MenuItem>

            {statusOptions.map(
              (status) => (
                <MenuItem
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          disabled={
            !previousUrl ||
            loading ||
            printingLabels
          }
          onClick={() =>
            fetchOrdersPage(
              Math.max(1, page - 1)
            )
          }
        >
          Previous
        </Button>

        <Typography
          variant="body2"
          sx={{
            alignSelf: "center",
            whiteSpace: "nowrap",
          }}
        >
          Page {page} | Total Orders:{" "}
          {count}
        </Typography>

        <Button
          variant="outlined"
          disabled={
            !nextUrl ||
            loading ||
            printingLabels
          }
          onClick={() =>
            fetchOrdersPage(page + 1)
          }
        >
          Next
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {printMessage && (
        <Alert
          severity={
            printMessage.startsWith(
              "Connected"
            ) ||
            printMessage.includes(
              "sent to"
            )
              ? "success"
              : "info"
          }
          sx={{ mb: 2 }}
          onClose={() =>
            setPrintMessage("")
          }
        >
          {printMessage}
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
        <TableContainer
          component={Paper}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={
                      partiallySelected
                    }
                    disabled={
                      printingLabels ||
                      selectableItemIds.length ===
                        0
                    }
                    onChange={
                      handleSelectAll
                    }
                  />
                </TableCell>

                <TableCell>
                  <strong>
                    Order ID
                  </strong>
                </TableCell>

                <TableCell width={90}>
                  <strong>Type</strong>
                </TableCell>

                <TableCell>
                  <strong>Product</strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Label Printing
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Item Status
                  </strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredItems.length >
              0 ? (
                filteredItems.map(
                  (item) => {
                    const printed =
                      isItemPrinted(
                        item
                      );

                    const completed =
                      isItemCompleted(
                        item
                      );

                    const disabled =
                      printed ||
                      completed ||
                      printingLabels;

                    return (
                      <TableRow
                        key={item.id}
                        hover
                        selected={selectedItems.includes(
                          item.id
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(
                              item.id
                            )}
                            disabled={
                              disabled
                            }
                            onChange={() =>
                              handleSelectItem(
                                item
                              )
                            }
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
                          <Typography
                            fontWeight={700}
                          >
                            {item.external_order_id ||
                              item.order_number ||
                              "-"}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Courier:{" "}
                            {item.courier_service_code ||
                              item.courier_service_name ||
                              "N/A"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              item.item_count >
                              1
                                ? "M"
                                : "S"
                            }
                            size="small"
                            color={
                              item.item_count >
                              1
                                ? "secondary"
                                : "default"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor:
                                "#f8fafc",
                              border:
                                "1px solid #e2e8f0",
                            }}
                          >
                            <Typography
                              fontWeight={
                                700
                              }
                              fontSize={13}
                            >
                              {item.sku ||
                                "-"}
                            </Typography>

                            <Typography variant="body2">
                              {item.product_name ||
                                "-"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Qty:{" "}
                              {item.quantity ??
                                0}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              printed
                                ? "Printed"
                                : "Pending"
                            }
                            size="small"
                            color={
                              printed
                                ? "success"
                                : "warning"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              item.processing_status_display ||
                              item.processing_status ||
                              "Unknown"
                            }
                            color={
                              completed
                                ? "success"
                                : "info"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                  >
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