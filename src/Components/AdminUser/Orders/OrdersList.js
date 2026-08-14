// import React, { useEffect, useMemo, useState } from "react";

// import {
//   Box,
//   Typography,
//   TextField,
//   MenuItem,
//   Chip,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Divider,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
//   Button,
//   LinearProgress,
//   CircularProgress,
//   Checkbox,
//   Stack,
// } from "@mui/material";

// import { DataGrid } from "@mui/x-data-grid";

// import ApiServices from "../../../Services/ApiServices/ApiServices";

// import {
//   getDecryptedAccessToken,
//   getDecryptedData,
// } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import LocalShippingIcon from "@mui/icons-material/LocalShipping";
// import PrintIcon from "@mui/icons-material/Print";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// import { QRCodeCanvas } from "qrcode.react";

// /*
// |--------------------------------------------------------------------------
// | IMPORTANT
// |--------------------------------------------------------------------------
// | Update this import path if PrinterService.js is stored elsewhere.
// |--------------------------------------------------------------------------
// */
// import PrinterService from "../../PrinterService";

// const THEME_BLUE = "#60a5fa";
// const THEME_BLUE_DARK = "#3b82f6";

// /*
// |--------------------------------------------------------------------------
// | PAGINATION CONFIGURATION
// |--------------------------------------------------------------------------
// |
// | Backend API:
// |   50 orders maximum per request
// |
// | Frontend:
// |   100 orders per DataGrid page
// |
// | Grid page 1 -> API pages 1 + 2
// | Grid page 2 -> API pages 3 + 4
// | Grid page 3 -> API pages 5 + 6
// |
// |--------------------------------------------------------------------------
// */

// const API_PAGE_SIZE = 50;
// const GRID_PAGE_SIZE = 100;

// /*
// |--------------------------------------------------------------------------
// | INFO ROW
// |--------------------------------------------------------------------------
// */

// const InfoRow = ({ label, value }) => (
//   <Box
//     sx={{
//       display: "flex",
//       gap: 1,
//       mb: 0.5,
//     }}
//   >
//     <Typography
//       variant="body2"
//       fontWeight={600}
//       sx={{
//         minWidth: 120,
//         color: "#374151",
//       }}
//     >
//       {label}
//     </Typography>

//     <Typography
//       variant="body2"
//       sx={{
//         color: "#4b5563",
//       }}
//     >
//       {value || "-"}
//     </Typography>
//   </Box>
// );

// /*
// |--------------------------------------------------------------------------
// | SECTION
// |--------------------------------------------------------------------------
// */

// const Section = ({ title, children }) => (
//   <Box sx={{ mb: 3 }}>
//     <Typography
//       variant="subtitle1"
//       fontWeight={700}
//       sx={{
//         color: THEME_BLUE_DARK,
//         mb: 1,
//         fontSize: "1rem",
//       }}
//     >
//       {title}
//     </Typography>

//     <Divider
//       sx={{
//         mb: 1.5,
//         borderColor: "#e5e7eb",
//       }}
//     />

//     {children}
//   </Box>
// );

// /*
// |--------------------------------------------------------------------------
// | COMPLETION
// |--------------------------------------------------------------------------
// */

// const getProgressColor = (value) => {
//   if (value <= 30) return "#ef4444";
//   if (value <= 70) return "#f59e0b";

//   return "#22c55e";
// };

// const CompletionProgress = ({ value }) => {
//   const clamped = Math.min(Math.max(value || 0, 0), 100);

//   const color = getProgressColor(clamped);

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         gap: 1,
//       }}
//     >
//       <Box sx={{ flexGrow: 1 }}>
//         <LinearProgress
//           variant="determinate"
//           value={clamped}
//           sx={{
//             height: 8,
//             borderRadius: 4,
//             backgroundColor: "#e5e7eb",

//             "& .MuiLinearProgress-bar": {
//               backgroundColor: color,
//               borderRadius: 4,
//             },
//           }}
//         />
//       </Box>

//       <Typography
//         variant="body2"
//         fontWeight={600}
//         sx={{
//           color,
//           minWidth: 36,
//           textAlign: "right",
//         }}
//       >
//         {clamped}%
//       </Typography>
//     </Box>
//   );
// };

// /*
// |--------------------------------------------------------------------------
// | COURIER
// |--------------------------------------------------------------------------
// */

// const getCourierShortName = (courierName) => {
//   const name = String(courierName || "").trim();

//   const courierMap = {
//     "Standard Delivery": "STD",

//     "Super Saver Postage": "STD",

//     "International Delivery": "INT",

//     "European Delivery (5-7 days)": "INT",

//     "Next Day Delivery (next working day if ordered before 1pm)": "NEXT DAY",

//     "Next Day By 12pm (next working day if ordered before 1pm)": "NEXT DAY 12",

//     "Saturday Delivery (on orders placed before 1pm)": "SATURDAY",

//     "Collect in Store": "Collect in Store",
//   };

//   return courierMap[name] || "NA";
// };

// /*
// |--------------------------------------------------------------------------
// | DATE HELPERS
// |--------------------------------------------------------------------------
// */

// const formatDateTimeLocal = (date) => {
//   const pad = (n) => String(n).padStart(2, "0");

//   return `${date.getFullYear()}-${pad(
//     date.getMonth() + 1,
//   )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
// };

// const getDefaultStartDateTime = () => {
//   const d = new Date();

//   d.setHours(13, 0, 0, 0);

//   return formatDateTimeLocal(d);
// };

// const getDefaultEndDateTime = () => {
//   const d = new Date();

//   d.setDate(d.getDate() + 1);

//   d.setHours(13, 0, 0, 0);

//   return formatDateTimeLocal(d);
// };

// /*
// |--------------------------------------------------------------------------
// | QR URL
// |--------------------------------------------------------------------------
// */

// const TIAKNIGHT_BASE_URL = "https://www.tiaknightfabrics.co.uk";

// const buildChildProductUrl = (childProductUrl) => {
//   if (!childProductUrl) {
//     return TIAKNIGHT_BASE_URL;
//   }

//   if (childProductUrl.startsWith("http")) {
//     return childProductUrl;
//   }

//   return `${TIAKNIGHT_BASE_URL}${
//     childProductUrl.startsWith("/") ? "" : "/"
//   }${childProductUrl}`;
// };

// const buildQrUrl = (orderId, itemId, childProductUrl) => {
//   const productUrl = buildChildProductUrl(childProductUrl);

//   const url = new URL(productUrl);

//   url.searchParams.set("wims_order_id", orderId);

//   url.searchParams.set("wims_item_id", itemId);

//   return url.toString();
// };

// /*
// |--------------------------------------------------------------------------
// | PRINT ELIGIBILITY
// |--------------------------------------------------------------------------
// |
// | Only an order matching BOTH conditions may be selected:
// |
// | 1. order_status === SHIPPED
// | 2. public_shipping_label_url exists
// |
// |--------------------------------------------------------------------------
// */

// const canPrintOrder = (order) => {
//   const status = String(order?.order_status || "").toUpperCase();

//   return status === "SHIPPED" && Boolean(order?.public_shipping_label_url);
// };

// /*
// |--------------------------------------------------------------------------
// | MAIN COMPONENT
// |--------------------------------------------------------------------------
// */

// const OrdersList = () => {
//   const accessToken = getDecryptedAccessToken();

//   const user = getDecryptedData();

//   const isSuperUser = Boolean(user?.is_superuser);

//   const headers = {
//     Authorization: accessToken
//       ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}`
//       : "",

//     "Content-Type": "application/json",
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | ORDER STATE
//   |--------------------------------------------------------------------------
//   */

//   const [orders, setOrders] = useState([]);

//   const [count, setCount] = useState(0);

//   const [loading, setLoading] = useState(false);

//   const [error, setError] = useState("");

//   /*
//   |--------------------------------------------------------------------------
//   | FILTER STATE
//   |--------------------------------------------------------------------------
//   */

//   const [search, setSearch] = useState("");

//   const [orderStatus, setOrderStatus] = useState("");

//   const [paymentStatus, setPaymentStatus] = useState("");

//   const [minDateTime, setMinDateTime] = useState(getDefaultStartDateTime());

//   const [maxDateTime, setMaxDateTime] = useState(getDefaultEndDateTime());

//   /*
//   |--------------------------------------------------------------------------
//   | DETAILS DIALOG
//   |--------------------------------------------------------------------------
//   */

//   const [open, setOpen] = useState(false);

//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const [orderDetails, setOrderDetails] = useState(null);

//   const [detailsLoading, setDetailsLoading] = useState(false);

//   /*
//   |--------------------------------------------------------------------------
//   | SHIPPING DIALOG
//   |--------------------------------------------------------------------------
//   */

//   const [shippingDialogOpen, setShippingDialogOpen] = useState(false);

//   const [shippingOrder, setShippingOrder] = useState(null);

//   const [packageFormat, setPackageFormat] = useState("Letter");

//   const [shippingNotes, setShippingNotes] = useState(
//     "Booked through Royal Mail Click & Drop API",
//   );

//   const [bookingLoading, setBookingLoading] = useState(false);

//   const [bookingError, setBookingError] = useState("");

//   const [bookingSuccess, setBookingSuccess] = useState("");

//   /*
//   |--------------------------------------------------------------------------
//   | PRINT STATE
//   |--------------------------------------------------------------------------
//   */

//   const [selectedPrintOrders, setSelectedPrintOrders] = useState([]);

//   const [printing, setPrinting] = useState(false);

//   const [printMessage, setPrintMessage] = useState("");

//   const [printError, setPrintError] = useState("");

//   const [printerName, setPrinterName] = useState("");

//   /*
//   |--------------------------------------------------------------------------
//   | PAGINATION
//   |--------------------------------------------------------------------------
//   |
//   | DataGrid page is 0 based.
//   |
//   | page 0 => API page 1 + API page 2
//   | page 1 => API page 3 + API page 4
//   |
//   |--------------------------------------------------------------------------
//   */

//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: GRID_PAGE_SIZE,
//   });

//   /*
//   |--------------------------------------------------------------------------
//   | QR
//   |--------------------------------------------------------------------------
//   */

//   const getItemQrUrl = (orderId, itemId, childProductUrl) => {
//     return buildQrUrl(orderId, itemId, childProductUrl);
//   };

//   const getItemQrUrlLocal = (orderId, itemId) => {
//     if (user?.is_superuser) {
//       return `${window.location.origin}/admin-user/order-process-item/${orderId}/${itemId}`;
//     }

//     return `${window.location.origin}/employee-user/order-process-item/${orderId}/${itemId}`;
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | BUILD API QUERY
//   |--------------------------------------------------------------------------
//   */

//   const buildOrdersQuery = (apiPage) => {
//     const queryParams = new URLSearchParams();

//     /*
//     | Backend maximum 50
//     */
//     queryParams.append("page", apiPage);

//     queryParams.append("page_size", API_PAGE_SIZE);

//     if (search.trim()) {
//       queryParams.append("search", search.trim());
//     }

//     if (orderStatus) {
//       queryParams.append("order_status", orderStatus);
//     }

//     if (paymentStatus) {
//       queryParams.append("payment_status", paymentStatus);
//     }

//     if (minDateTime) {
//       queryParams.append(
//         "order_date_after",
//         new Date(minDateTime).toISOString(),
//       );
//     }

//     if (maxDateTime) {
//       queryParams.append(
//         "order_date_before",
//         new Date(maxDateTime).toISOString(),
//       );
//     }

//     return queryParams;
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | FETCH 100 ORDERS
//   |--------------------------------------------------------------------------
//   |
//   | IMPORTANT:
//   |
//   | Each frontend page makes a maximum of two API requests.
//   |
//   | Front page 0:
//   |   API page 1 -> 50
//   |   API page 2 -> 50
//   |
//   | Front page 1:
//   |   API page 3 -> 50
//   |   API page 4 -> 50
//   |
//   |--------------------------------------------------------------------------
//   */

//   const fetchOrders = async (gridPage = 0) => {
//     setLoading(true);
//     setError("");

//     /*
//     | Clear row selections when
//     | moving/reloading pages.
//     */
//     setSelectedPrintOrders([]);

//     try {
//       /*
//       |--------------------------------------------------------------------------
//       | IMPORT REMOTE ORDERS
//       |--------------------------------------------------------------------------
//       |
//       | Keep your existing behavior:
//       | import when loading first page.
//       |
//       */

//       if (gridPage === 0) {
//         try {
//           await ApiServices.get(
//             "orders/import_from_remote_tiaknightfabrics/",
//             headers,
//           );
//         } catch (importError) {
//           console.warn("Import API failed, continuing...", importError);
//         }
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | CALCULATE BACKEND PAGES
//       |--------------------------------------------------------------------------
//       */

//       const firstApiPage = gridPage * 2 + 1;

//       const secondApiPage = firstApiPage + 1;

//       /*
//       |--------------------------------------------------------------------------
//       | FIRST 50
//       |--------------------------------------------------------------------------
//       */

//       const firstQuery = buildOrdersQuery(firstApiPage);

//       const firstResponse = await ApiServices.get(
//         `orders/?${firstQuery.toString()}`,
//         headers,
//       );

//       const firstResults = Array.isArray(firstResponse?.data?.results)
//         ? firstResponse.data.results
//         : [];

//       let combinedResults = [...firstResults];

//       /*
//       |--------------------------------------------------------------------------
//       | SECOND 50
//       |--------------------------------------------------------------------------
//       |
//       | Only request the second page if backend says another page exists.
//       |
//       */

//       if (firstResponse?.data?.next) {
//         const secondQuery = buildOrdersQuery(secondApiPage);

//         try {
//           const secondResponse = await ApiServices.get(
//             `orders/?${secondQuery.toString()}`,
//             headers,
//           );

//           const secondResults = Array.isArray(secondResponse?.data?.results)
//             ? secondResponse.data.results
//             : [];

//           combinedResults = [...firstResults, ...secondResults];
//         } catch (secondPageError) {
//           /*
//           | First 50 should still
//           | remain usable if second
//           | request fails.
//           */
//           console.error(
//             "Unable to load second batch of orders:",
//             secondPageError,
//           );
//         }
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | REMOVE DUPLICATES IF API EVER RETURNS OVERLAPPING DATA
//       |--------------------------------------------------------------------------
//       */

//       const uniqueResults = Array.from(
//         new Map(combinedResults.map((order) => [order.id, order])).values(),
//       );

//       setOrders(uniqueResults);

//       setCount(firstResponse?.data?.count ?? uniqueResults.length);
//     } catch (err) {
//       console.error(err);

//       setError("Failed to load orders");

//       setOrders([]);

//       setCount(0);

//       setSelectedPrintOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | PAGINATION EFFECT
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     fetchOrders(paginationModel.page);
//   }, [paginationModel.page]);

//   /*
//   |--------------------------------------------------------------------------
//   | FILTER EFFECT
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       /*
//         | Always return to first
//         | 100 orders after filters.
//         */

//       if (paginationModel.page !== 0) {
//         setPaginationModel((prev) => ({
//           ...prev,
//           page: 0,
//         }));
//       } else {
//         fetchOrders(0);
//       }
//     }, 400);

//     return () => clearTimeout(delay);
//   }, [search, orderStatus, paymentStatus, minDateTime, maxDateTime]);

//   /*
//   |--------------------------------------------------------------------------
//   | DETAILS
//   |--------------------------------------------------------------------------
//   */

//   const fetchOrderDetails = async (orderId) => {
//     try {
//       setDetailsLoading(true);

//       const res = await ApiServices.get(`orders/${orderId}/`, headers);

//       setOrderDetails(res?.data || null);
//     } catch (error) {
//       console.error(error);

//       setOrderDetails(null);
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | REFRESH
//   |--------------------------------------------------------------------------
//   */

//   const handleRefresh = () => {
//     fetchOrders(paginationModel.page);
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | SHIPPING
//   |--------------------------------------------------------------------------
//   */

//   const openShippingDialog = (order) => {
//     setShippingOrder(order);

//     setPackageFormat("Letter");

//     setShippingNotes("Booked through Royal Mail Click & Drop API");

//     setBookingError("");

//     setBookingSuccess("");

//     setShippingDialogOpen(true);
//   };

//   const closeShippingDialog = () => {
//     if (bookingLoading) {
//       return;
//     }

//     setShippingDialogOpen(false);

//     setShippingOrder(null);
//   };

//   const handleBookRoyalMailShipping = async () => {
//     if (!shippingOrder) {
//       return;
//     }

//     const weight = Number(shippingOrder.total_weight_gm || 0);

//     if (!weight || weight <= 0) {
//       setBookingError("Weight is required and must be greater than 0.");

//       return;
//     }

//     if (!packageFormat) {
//       setBookingError("Please select package format.");

//       return;
//     }

//     if (!shippingOrder.courier_service_code) {
//       setBookingError("Courier service code is missing.");

//       return;
//     }

//     const payload = {
//       weight_in_grams: weight,

//       package_format_identifier: packageFormat,

//       service_code: shippingOrder.courier_service_code,

//       notes: shippingNotes || "",
//     };

//     try {
//       setBookingLoading(true);

//       setBookingError("");

//       setBookingSuccess("");

//       await ApiServices.post(
//         `orders/${shippingOrder.id}/book-royal-mail-shipping/`,
//         payload,
//         headers,
//       );

//       setBookingSuccess("Royal Mail shipping booked successfully.");

//       await fetchOrders(paginationModel.page);

//       setTimeout(() => {
//         closeShippingDialog();
//       }, 700);
//     } catch (err) {
//       console.error(err);

//       setBookingError(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to book Royal Mail shipping.",
//       );
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | ELIGIBLE PRINT ORDERS
//   |--------------------------------------------------------------------------
//   |
//   | Only current displayed 100.
//   |
//   |--------------------------------------------------------------------------
//   */

//   const printableOrders = useMemo(() => {
//     return orders.filter(canPrintOrder);
//   }, [orders]);

//   const printableOrderIds = useMemo(() => {
//     return printableOrders.map((order) => order.id);
//   }, [printableOrders]);

//   /*
//   |--------------------------------------------------------------------------
//   | SELECT ONE
//   |--------------------------------------------------------------------------
//   */

//   const handlePrintOrderSelect = (orderId, checked) => {
//     const order = orders.find((item) => item.id === orderId);

//     /*
//     | Security/logic check:
//     | never allow invalid row
//     | selection.
//     */
//     if (!order || !canPrintOrder(order)) {
//       return;
//     }

//     setSelectedPrintOrders((prev) => {
//       if (checked) {
//         if (prev.includes(orderId)) {
//           return prev;
//         }

//         return [...prev, orderId];
//       }

//       return prev.filter((id) => id !== orderId);
//     });
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | SELECT ALL
//   |--------------------------------------------------------------------------
//   |
//   | This selects ONLY:
//   |
//   | SHIPPED
//   | +
//   | public_shipping_label_url
//   |
//   |--------------------------------------------------------------------------
//   */

//   const handleSelectAllPrintable = (checked) => {
//     if (checked) {
//       setSelectedPrintOrders(printableOrderIds);
//     } else {
//       setSelectedPrintOrders([]);
//     }
//   };

//   const allPrintableSelected =
//     printableOrderIds.length > 0 &&
//     printableOrderIds.every((id) => selectedPrintOrders.includes(id));

//   const somePrintableSelected =
//     selectedPrintOrders.length > 0 && !allPrintableSelected;

//   /*
//   |--------------------------------------------------------------------------
//   | BULK PRINT
//   |--------------------------------------------------------------------------
//   |
//   | Important:
//   |
//   | 1. Connect to QZ
//   | 2. Detect TSC once
//   | 3. Print each selected label
//   | 4. Await each print before sending next
//   |
//   |--------------------------------------------------------------------------
//   */

//   const handlePrintSelected = async () => {
//     if (printing) {
//       return;
//     }

//     setPrintMessage("");
//     setPrintError("");

//     const ordersToPrint = orders.filter(
//       (order) => selectedPrintOrders.includes(order.id) && canPrintOrder(order),
//     );

//     if (ordersToPrint.length === 0) {
//       setPrintError(
//         "Please select at least one shipped order with a shipping label.",
//       );

//       return;
//     }

//     setPrinting(true);

//     try {
//       /*
//         |--------------------------------------------------------------------------
//         | DETECT PRINTER ONCE
//         |--------------------------------------------------------------------------
//         */

//       const printer = await PrinterService.testPrinter();

//       setPrinterName(printer);

//       let successfulPrints = 0;

//       const failedPrints = [];

//       /*
//         |--------------------------------------------------------------------------
//         | PRINT ONE-BY-ONE
//         |--------------------------------------------------------------------------
//         */

//       for (let index = 0; index < ordersToPrint.length; index++) {
//         const order = ordersToPrint[index];

//         const labelUrl = order.public_shipping_label_url;

//         try {
//           /*
//             | Same 4 x 6 settings
//             | from your tested
//             | implementation.
//             */

//           const result = await PrinterService.printPdf({
//             pdfUrl: labelUrl,

//             printerName: printer,

//             width: 4,

//             height: 6,

//             copies: 1,
//           });

//           if (!result?.success) {
//             throw new Error(result?.error || "Unable to print label");
//           }

//           successfulPrints += 1;

//           /*
//             | Show progress while
//             | multiple labels are
//             | being sent.
//             */
//           setPrintMessage(
//             `Sending label ${index + 1} of ${
//               ordersToPrint.length
//             } to ${printer}...`,
//           );
//         } catch (printItemError) {
//           console.error(`Failed to print order ${order.id}`, printItemError);

//           failedPrints.push(
//             order.external_order_id || order.order_number || order.id,
//           );
//         }
//       }

//       /*
//         |--------------------------------------------------------------------------
//         | RESULT
//         |--------------------------------------------------------------------------
//         */

//       if (failedPrints.length > 0) {
//         setPrintError(
//           `${failedPrints.length} label(s) failed to print: ${failedPrints.join(
//             ", ",
//           )}`,
//         );
//       }

//       if (successfulPrints > 0) {
//         setPrintMessage(
//           `${successfulPrints} shipping label${
//             successfulPrints !== 1 ? "s" : ""
//           } sent successfully to ${printer}.`,
//         );
//       }

//       /*
//         | Remove successful
//         | selection after sending.
//         */
//       if (failedPrints.length === 0) {
//         setSelectedPrintOrders([]);
//       }
//     } catch (error) {
//       console.error("Bulk printing failed:", error);

//       setPrintMessage("");

//       setPrintError(
//         error?.message ||
//           "Unable to connect to the printer or print shipping labels.",
//       );
//     } finally {
//       setPrinting(false);
//     }
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | ROWS
//   |--------------------------------------------------------------------------
//   */

//   const rows = useMemo(() => {
//     return orders.map((o, i) => ({
//       id: o?.id ?? i,

//       external_order_id: o?.external_order_id || "-",

//       order_number: o?.order_number || "-",

//       customer_name: o?.customer_name || "-",

//       customer_email: o?.customer_email || "-",

//       order_status: o?.order_status,

//       order_status_display: o?.order_status_display,

//       payment_status: o?.payment_status,

//       payment_status_display: o?.payment_status_display,

//       courier_service_name: o?.courier_service_name || "",

//       courier_service_code: o?.courier_service_code || "",

//       courier_short_name: getCourierShortName(o?.courier_service_name),

//       completion_percentage: Number(o?.completion_percentage ?? 0),

//       total_weight_gm: Number(o?.total_weight_gm || 0),

//       item_count: o?.item_count ?? 0,

//       total_quantity: o?.total_quantity ?? 0,

//       order_date: o?.order_date || null,

//       total_amount: o?.total_amount ?? null,

//       /*
//           |--------------------------------------------------------------------------
//           | SHIPPING LABEL
//           |--------------------------------------------------------------------------
//           */

//       public_shipping_label_url: o?.public_shipping_label_url || null,

//       raw: o,
//     }));
//   }, [orders]);

//   /*
//   |--------------------------------------------------------------------------
//   | COLUMNS
//   |--------------------------------------------------------------------------
//   */

//   const columns = [
//     /*
//     |--------------------------------------------------------------------------
//     | PRINT CHECKBOX
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "print_select",

//       headerName: "",

//       width: 60,

//       sortable: false,

//       filterable: false,

//       disableColumnMenu: true,

//       renderHeader: () => (
//         <Checkbox
//           size="small"
//           checked={allPrintableSelected}
//           indeterminate={somePrintableSelected}
//           disabled={printableOrderIds.length === 0 || printing}
//           onChange={(e) => handleSelectAllPrintable(e.target.checked)}
//           title="Select all printable shipped orders"
//         />
//       ),

//       renderCell: ({ row }) => {
//         const printable = canPrintOrder(row.raw);

//         /*
//         | Show disabled checkbox
//         | for orders that cannot
//         | be printed.
//         */

//         return (
//           <Checkbox
//             size="small"
//             checked={printable && selectedPrintOrders.includes(row.id)}
//             disabled={!printable || printing}
//             onChange={(e) => {
//               e.stopPropagation();

//               handlePrintOrderSelect(row.id, e.target.checked);
//             }}
//             onClick={(e) => e.stopPropagation()}
//           />
//         );
//       },
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | ORDER
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "external_order_id",

//       headerName: "Order",

//       flex: 1.2,

//       minWidth: 130,

//       renderCell: ({ row }) => (
//         <Button
//           size="small"
//           sx={{
//             textTransform: "none",

//             color: THEME_BLUE_DARK,

//             fontWeight: 600,
//           }}
//           onClick={() => {
//             setSelectedOrder(row.raw);

//             setOpen(true);

//             fetchOrderDetails(row.id);
//           }}
//         >
//           {row.external_order_id}
//         </Button>
//       ),
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | CUSTOMER
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "customer_name",

//       headerName: "Customer",

//       flex: 1.4,

//       minWidth: 170,
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | STATUS
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "order_status",

//       headerName: "Order Status",

//       flex: 1,

//       minWidth: 80,

//       renderCell: ({ row }) => (
//         <Chip
//           size="small"
//           label={row.order_status_display || row.order_status || "-"}
//           sx={{
//             backgroundColor:
//               row.order_status === "SHIPPED" || row.order_status === "DELIVERED"
//                 ? "#dcfce7"
//                 : row.order_status === "PROCESSING"
//                   ? "#dbeafe"
//                   : row.order_status === "NEW" ||
//                       row.order_status === "CONFIRMED"
//                     ? "#fef3c7"
//                     : "#f3f4f6",

//             color:
//               row.order_status === "SHIPPED" || row.order_status === "DELIVERED"
//                 ? "#166534"
//                 : row.order_status === "PROCESSING"
//                   ? "#1e40af"
//                   : row.order_status === "NEW" ||
//                       row.order_status === "CONFIRMED"
//                     ? "#92400e"
//                     : "#374151",

//             fontWeight: 500,

//             fontSize: "0.75rem",
//           }}
//         />
//       ),
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | COMPLETION
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "completion_percentage",

//       headerName: "Completion",

//       flex: 1.4,

//       minWidth: 160,

//       renderCell: ({ row }) => (
//         <CompletionProgress value={row.completion_percentage} />
//       ),
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | WEIGHT
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "total_weight_gm",

//       headerName: "Weight(g)",

//       flex: 0.8,

//       minWidth: 100,

//       renderCell: ({ row }) => row.total_weight_gm || "NA",
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | ITEMS
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "item_count",

//       headerName: "Items",

//       flex: 0.6,

//       minWidth: 80,
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | QTY
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "total_quantity",

//       headerName: "Qty",

//       flex: 0.6,

//       minWidth: 80,
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | DATE
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "order_date",

//       headerName: "Order Date",

//       flex: 1.2,

//       minWidth: 150,

//       renderCell: ({ row }) =>
//         row.order_date ? new Date(row.order_date).toLocaleString() : "-",
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | COURIER
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "courier_short_name",

//       headerName: "Courier",

//       flex: 0.9,

//       minWidth: 130,

//       renderCell: ({ row }) => (
//         <Chip
//           size="small"
//           label={row.courier_short_name || "NA"}
//           sx={{
//             backgroundColor: "#eef2ff",

//             color: "#3730a3",

//             fontWeight: 600,

//             fontSize: "0.75rem",
//           }}
//         />
//       ),
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | TOTAL
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "total_amount",

//       headerName: "Total (£)",

//       flex: 0.8,

//       minWidth: 100,

//       renderCell: ({ row }) => `£${Number(row.total_amount || 0).toFixed(2)}`,
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | COMPLETE ORDER / ORDER PLACED
//     |--------------------------------------------------------------------------
//     */

//     {
//       field: "complete_order",

//       headerName: "Complete Order",

//       flex: 1.3,

//       minWidth: 170,

//       sortable: false,

//       filterable: false,

//       renderCell: ({ row }) => {
//         /*
//         |--------------------------------------------------------------------------
//         | SHIPPED + LABEL
//         |--------------------------------------------------------------------------
//         |
//         | Replace Complete Order with
//         | disabled green "Order Placed".
//         |
//         */

//         const printable = canPrintOrder(row.raw);

//         if (printable) {
//           return (
//             <Button
//               variant="contained"
//               size="small"
//               disabled
//               startIcon={<CheckCircleIcon />}
//               sx={{
//                 textTransform: "none",

//                 fontWeight: 600,

//                 /*
//                 | MUI disabled button
//                 | requires explicit
//                 | disabled styling.
//                 */

//                 "&.Mui-disabled": {
//                   backgroundColor: "#16a34a",

//                   color: "#ffffff",

//                   opacity: 1,
//                 },
//               }}
//             >
//               Order Placed
//             </Button>
//           );
//         }

//         /*
//         |--------------------------------------------------------------------------
//         | EXISTING COMPLETE ORDER FUNCTIONALITY
//         |--------------------------------------------------------------------------
//         */

//         const isCompleted = Number(row.completion_percentage) === 100;

//         return (
//           <Button
//             variant="contained"
//             size="small"
//             disabled={!isCompleted}
//             startIcon={<LocalShippingIcon />}
//             sx={{
//               textTransform: "none",

//               backgroundColor: isCompleted ? "#16a34a" : "#9ca3af",

//               "&:hover": {
//                 backgroundColor: isCompleted ? "#15803d" : "#9ca3af",
//               },
//             }}
//             onClick={() => openShippingDialog(row.raw)}
//           >
//             Complete Order
//           </Button>
//         );
//       },
//     },

//     /*
//     |--------------------------------------------------------------------------
//     | SUPERUSER ACTION
//     |--------------------------------------------------------------------------
//     */

//     ...(isSuperUser
//       ? [
//           {
//             field: "actions",

//             headerName: "Actions",

//             flex: 1.1,

//             minWidth: 100,

//             sortable: false,

//             filterable: false,

//             renderCell: ({ row }) => (
//               <Button
//                 variant="outlined"
//                 size="small"
//                 endIcon={<OpenInNewIcon />}
//                 sx={{
//                   whiteSpace: "nowrap",

//                   minWidth: 80,

//                   borderColor: THEME_BLUE,

//                   color: THEME_BLUE_DARK,

//                   textTransform: "none",

//                   "&:hover": {
//                     borderColor: THEME_BLUE_DARK,

//                     backgroundColor: "#eff6ff",
//                   },
//                 }}
//                 onClick={() =>
//                   window.open(
//                     `/admin-user/order-processing/${row.id}`,
//                     "_blank",
//                   )
//                 }
//               >
//                 Details
//               </Button>
//             ),
//           },
//         ]
//       : []),
//   ];

//   /*
//   |--------------------------------------------------------------------------
//   | RENDER
//   |--------------------------------------------------------------------------
//   */

//   return (
//     <Box
//       sx={{
//         p: 3,

//         backgroundColor: "#ffffff",

//         minHeight: "100vh",
//       }}
//     >
//       {/* --------------------------------------------------------------- */}
//       {/* HEADER                                                        */}
//       {/* --------------------------------------------------------------- */}

//       <Box
//         sx={{
//           display: "flex",

//           justifyContent: "space-between",

//           gap: 2,

//           mb: 2,

//           flexWrap: "wrap",

//           alignItems: "center",
//         }}
//       >
//         <Box>
//           <Typography
//             variant="h4"
//             fontWeight={700}
//             sx={{
//               color: "#1f2937",
//             }}
//           >
//             Orders ({count})
//           </Typography>

//           <Typography
//             variant="body2"
//             color="text.secondary"
//             sx={{
//               mt: 0.5,
//             }}
//           >
//             Showing up to 100 orders per page
//           </Typography>
//         </Box>

//         <Stack direction="row" spacing={1.5} flexWrap="wrap">
//           {/* ---------------------------------------------------------- */}
//           {/* BULK PRINT                                                */}
//           {/* ---------------------------------------------------------- */}

//           <Button
//             variant="contained"
//             startIcon={
//               printing ? (
//                 <CircularProgress size={18} color="inherit" />
//               ) : (
//                 <PrintIcon />
//               )
//             }
//             disabled={selectedPrintOrders.length === 0 || printing || loading}
//             onClick={handlePrintSelected}
//             sx={{
//               textTransform: "none",

//               backgroundColor: "#16a34a",

//               "&:hover": {
//                 backgroundColor: "#15803d",
//               },

//               "&.Mui-disabled": {
//                 backgroundColor: "#d1d5db",
//               },
//             }}
//           >
//             {printing
//               ? "Printing..."
//               : `Print Selected (${selectedPrintOrders.length})`}
//           </Button>

//           {/* ---------------------------------------------------------- */}
//           {/* REFRESH                                                   */}
//           {/* ---------------------------------------------------------- */}

//           <Button
//             variant="contained"
//             startIcon={<RefreshIcon />}
//             onClick={handleRefresh}
//             disabled={loading || printing}
//             sx={{
//               textTransform: "none",

//               backgroundColor: THEME_BLUE_DARK,

//               "&:hover": {
//                 backgroundColor: "#2563eb",
//               },
//             }}
//           >
//             Refresh
//           </Button>
//         </Stack>
//       </Box>

//       {/* --------------------------------------------------------------- */}
//       {/* PRINT STATUS                                                   */}
//       {/* --------------------------------------------------------------- */}

//       {printerName && (
//         <Alert severity="success" sx={{ mb: 2 }}>
//           TSC Printer: <strong>{printerName}</strong>
//         </Alert>
//       )}

//       {printMessage && (
//         <Alert severity={printing ? "info" : "success"} sx={{ mb: 2 }}>
//           {printing && (
//             <CircularProgress
//               size={16}
//               sx={{
//                 mr: 1,
//                 verticalAlign: "middle",
//               }}
//             />
//           )}

//           {printMessage}
//         </Alert>
//       )}

//       {printError && (
//         <Alert
//           severity="error"
//           sx={{ mb: 2 }}
//           onClose={() => setPrintError("")}
//         >
//           {printError}
//         </Alert>
//       )}

//       {/* --------------------------------------------------------------- */}
//       {/* PRINT SELECTION INFORMATION                                    */}
//       {/* --------------------------------------------------------------- */}

//       {printableOrders.length > 0 && (
//         <Alert severity="info" sx={{ mb: 2 }}>
//           {printableOrders.length} order
//           {printableOrders.length !== 1 ? "s" : ""} on this page can be printed.
//           Only shipped orders having a public shipping label are selectable.
//         </Alert>
//       )}

//       {/* --------------------------------------------------------------- */}
//       {/* FILTERS                                                        */}
//       {/* --------------------------------------------------------------- */}

//       <Box
//         sx={{
//           display: "flex",

//           gap: 2,

//           mb: 2,

//           flexWrap: "wrap",

//           alignItems: "center",
//         }}
//       >
//         <TextField
//           size="small"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           sx={{
//             minWidth: 220,
//           }}
//         />

//         <TextField
//           select
//           size="small"
//           label="Order Status"
//           value={orderStatus}
//           onChange={(e) => setOrderStatus(e.target.value)}
//           sx={{
//             minWidth: 140,
//           }}
//         >
//           <MenuItem value="">All</MenuItem>

//           <MenuItem value="NEW">New</MenuItem>

//           <MenuItem value="CONFIRMED">Confirmed</MenuItem>

//           <MenuItem value="PROCESSING">Processing</MenuItem>

//           <MenuItem value="SHIPPED">Shipped</MenuItem>

//           <MenuItem value="DELIVERED">Delivered</MenuItem>
//         </TextField>

//         <TextField
//           select
//           size="small"
//           label="Payment Status"
//           value={paymentStatus}
//           onChange={(e) => setPaymentStatus(e.target.value)}
//           sx={{
//             minWidth: 140,
//           }}
//         >
//           <MenuItem value="">All</MenuItem>

//           <MenuItem value="PAID">Paid</MenuItem>

//           <MenuItem value="UNPAID">Unpaid</MenuItem>

//           <MenuItem value="PENDING">Pending</MenuItem>
//         </TextField>

//         <TextField
//           size="small"
//           type="datetime-local"
//           label="Min Date & Time"
//           value={minDateTime}
//           onChange={(e) => setMinDateTime(e.target.value)}
//           InputLabelProps={{
//             shrink: true,
//           }}
//           sx={{
//             minWidth: 220,
//           }}
//         />

//         <TextField
//           size="small"
//           type="datetime-local"
//           label="Max Date & Time"
//           value={maxDateTime}
//           onChange={(e) => setMaxDateTime(e.target.value)}
//           InputLabelProps={{
//             shrink: true,
//           }}
//           sx={{
//             minWidth: 220,
//           }}
//         />
//       </Box>

//       {/* --------------------------------------------------------------- */}
//       {/* GENERAL ERROR                                                  */}
//       {/* --------------------------------------------------------------- */}

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {/* --------------------------------------------------------------- */}
//       {/* ORDERS GRID                                                    */}
//       {/* --------------------------------------------------------------- */}

//       <Paper
//         elevation={1}
//         sx={{
//           borderRadius: 2,

//           overflow: "hidden",

//           border: "1px solid #e5e7eb",
//         }}
//       >
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           loading={loading}
//           disableRowSelectionOnClick
//           autoHeight
//           pagination
//           paginationMode="server"
//           rowCount={count}
//           paginationModel={paginationModel}
//           onPaginationModelChange={(newModel) => {
//             /*
//             | Always keep 100 rows
//             | per UI page.
//             */

//             setPaginationModel({
//               page: newModel.page,

//               pageSize: GRID_PAGE_SIZE,
//             });
//           }}
//           pageSizeOptions={[GRID_PAGE_SIZE]}
//           sx={{
//             border: "none",

//             "& .MuiDataGrid-columnHeaders": {
//               backgroundColor: "#f8fafc",

//               fontWeight: 600,

//               color: "#374151",

//               borderBottom: "1px solid #e5e7eb",
//             },

//             "& .MuiDataGrid-cell": {
//               borderBottom: "1px solid #f3f4f6",
//             },

//             "& .MuiDataGrid-row:hover": {
//               backgroundColor: "#f8fafc",
//             },

//             "& .MuiDataGrid-footerContainer": {
//               borderTop: "1px solid #e5e7eb",

//               backgroundColor: "#f8fafc",
//             },
//           }}
//         />
//       </Paper>

//       {/* =============================================================== */}
//       {/* ROYAL MAIL SHIPPING DIALOG                                     */}
//       {/* =============================================================== */}

//       <Dialog
//         open={shippingDialogOpen}
//         onClose={closeShippingDialog}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle fontWeight={700}>Confirm Royal Mail Shipping</DialogTitle>

//         <DialogContent dividers>
//           {shippingOrder && (
//             <Box
//               sx={{
//                 display: "grid",

//                 gap: 2,
//               }}
//             >
//               <Alert severity="info">
//                 Please verify package details before booking Royal Mail
//                 shipping.
//               </Alert>

//               {bookingError && <Alert severity="error">{bookingError}</Alert>}

//               {bookingSuccess && (
//                 <Alert severity="success">{bookingSuccess}</Alert>
//               )}

//               <InfoRow label="Order" value={shippingOrder.external_order_id} />

//               <InfoRow
//                 label="Weight"
//                 value={`${shippingOrder.total_weight_gm || 0} grams`}
//               />

//               <InfoRow
//                 label="Service Code"
//                 value={shippingOrder.courier_service_code || "NA"}
//               />

//               <InfoRow
//                 label="Courier"
//                 value={shippingOrder.courier_service_name || "NA"}
//               />

//               <TextField
//                 select
//                 fullWidth
//                 size="small"
//                 label="Package Format"
//                 value={packageFormat}
//                 onChange={(e) => setPackageFormat(e.target.value)}
//               >
//                 <MenuItem value="Large">Large</MenuItem>

//                 <MenuItem value="Letter">Letter</MenuItem>

//                 <MenuItem value="Parcel">Parcel</MenuItem>
//               </TextField>

//               <TextField
//                 fullWidth
//                 multiline
//                 rows={3}
//                 label="Notes"
//                 value={shippingNotes}
//                 onChange={(e) => setShippingNotes(e.target.value)}
//                 placeholder="Optional notes"
//               />
//             </Box>
//           )}
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={closeShippingDialog} disabled={bookingLoading}>
//             Cancel
//           </Button>

//           <Button
//             variant="contained"
//             onClick={handleBookRoyalMailShipping}
//             disabled={bookingLoading}
//             sx={{
//               textTransform: "none",

//               backgroundColor: THEME_BLUE_DARK,

//               "&:hover": {
//                 backgroundColor: "#2563eb",
//               },
//             }}
//           >
//             {bookingLoading ? (
//               <CircularProgress size={22} color="inherit" />
//             ) : (
//               "Confirm & Book"
//             )}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* =============================================================== */}
//       {/* ORDER DETAILS DIALOG                                           */}
//       {/* =============================================================== */}

//       <Dialog
//         open={open}
//         onClose={() => {
//           setOpen(false);

//           setOrderDetails(null);
//         }}
//         maxWidth="lg"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             pb: 1,

//             color: "#1f2937",

//             fontWeight: 700,
//           }}
//         >
//           Order Details
//         </DialogTitle>

//         <DialogContent
//           dividers
//           sx={{
//             backgroundColor: "#fafafa",
//           }}
//         >
//           {selectedOrder && (
//             <>
//               {/* ------------------------------------------------------- */}
//               {/* ORDER INFO                                             */}
//               {/* ------------------------------------------------------- */}

//               <Section title="Order Info">
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <InfoRow
//                       label="Order ID"
//                       value={selectedOrder.external_order_id}
//                     />

//                     <InfoRow
//                       label="Order Number"
//                       value={selectedOrder.order_number}
//                     />

//                     <InfoRow
//                       label="Customer"
//                       value={selectedOrder.customer_name}
//                     />

//                     <InfoRow
//                       label="Email"
//                       value={selectedOrder.customer_email}
//                     />
//                   </Grid>

//                   <Grid item xs={12} md={6}>
//                     <InfoRow
//                       label="Order Status"
//                       value={
//                         selectedOrder.order_status_display ||
//                         selectedOrder.order_status
//                       }
//                     />

//                     <InfoRow
//                       label="Payment Status"
//                       value={
//                         selectedOrder.payment_status_display ||
//                         selectedOrder.payment_status
//                       }
//                     />

//                     <InfoRow
//                       label="Order Date"
//                       value={
//                         selectedOrder.order_date
//                           ? new Date(selectedOrder.order_date).toLocaleString()
//                           : "-"
//                       }
//                     />

//                     <InfoRow
//                       label="Total Weight"
//                       value={`${selectedOrder.total_weight_gm || 0} grams`}
//                     />
//                   </Grid>
//                 </Grid>
//               </Section>

//               {/* ------------------------------------------------------- */}
//               {/* FINANCIALS                                             */}
//               {/* ------------------------------------------------------- */}

//               <Section title="Financials">
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <InfoRow
//                       label="Subtotal"
//                       value={`£${Number(selectedOrder.subtotal || 0).toFixed(
//                         2,
//                       )}`}
//                     />

//                     <InfoRow
//                       label="Tax"
//                       value={`£${Number(selectedOrder.tax || 0).toFixed(2)}`}
//                     />
//                   </Grid>

//                   <Grid item xs={12} md={6}>
//                     <InfoRow
//                       label="Discount"
//                       value={`£${Number(selectedOrder.discount || 0).toFixed(
//                         2,
//                       )}`}
//                     />

//                     <InfoRow
//                       label="Total Amount"
//                       value={`£${Number(
//                         selectedOrder.total_amount || 0,
//                       ).toFixed(2)}`}
//                     />
//                   </Grid>
//                 </Grid>
//               </Section>

//               {/* ------------------------------------------------------- */}
//               {/* ITEMS                                                  */}
//               {/* ------------------------------------------------------- */}

//               <Section title="Order Items">
//                 {detailsLoading ? (
//                   <Box
//                     sx={{
//                       py: 4,

//                       textAlign: "center",
//                     }}
//                   >
//                     <Typography color="text.secondary">
//                       Loading items...
//                     </Typography>
//                   </Box>
//                 ) : (
//                   <Table
//                     size="small"
//                     sx={{
//                       backgroundColor: "#fff",
//                     }}
//                   >
//                     <TableHead>
//                       <TableRow
//                         sx={{
//                           backgroundColor: "#f8fafc",
//                         }}
//                       >
//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                         >
//                           SKU
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                         >
//                           Product
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                           align="right"
//                         >
//                           Qty
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                           align="right"
//                         >
//                           Weight(g)
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                           align="right"
//                         >
//                           Unit Price
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                           align="right"
//                         >
//                           Total
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                         >
//                           Status
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                         >
//                           Assigned To
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                         >
//                           Location
//                         </TableCell>

//                         <TableCell
//                           sx={{
//                             fontWeight: 600,
//                           }}
//                           align="center"
//                         >
//                           QR
//                         </TableCell>
//                       </TableRow>
//                     </TableHead>

//                     <TableBody>
//                       {(orderDetails?.items || []).map((item) => (
//                         <TableRow key={item.id} hover>
//                           <TableCell>{item.sku || "-"}</TableCell>

//                           <TableCell>
//                             <Typography
//                               variant="body2"
//                               fontWeight={500}
//                               sx={{
//                                 color: "#1f2937",
//                               }}
//                             >
//                               {item.product_name || "-"}
//                             </Typography>

//                             {item.product_type && (
//                               <Typography
//                                 variant="caption"
//                                 sx={{
//                                   color: "#9ca3af",
//                                 }}
//                               >
//                                 {item.product_type}
//                               </Typography>
//                             )}
//                           </TableCell>

//                           <TableCell align="right">{item.quantity}</TableCell>

//                           <TableCell align="right">
//                             {item.total_weight_gm || "NA"}
//                           </TableCell>

//                           <TableCell align="right">
//                             £{Number(item.unit_price || 0).toFixed(2)}
//                           </TableCell>

//                           <TableCell align="right">
//                             £{Number(item.line_total || 0).toFixed(2)}
//                           </TableCell>

//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={
//                                 item.processing_status_display ||
//                                 item.processing_status ||
//                                 "-"
//                               }
//                               color={
//                                 item.processing_status === "COMPLETED"
//                                   ? "success"
//                                   : item.processing_status === "IN_PROGRESS"
//                                     ? "primary"
//                                     : item.processing_status === "PENDING"
//                                       ? "warning"
//                                       : "default"
//                               }
//                             />
//                           </TableCell>

//                           <TableCell>
//                             {item.assigned_to_username || "-"}
//                           </TableCell>

//                           <TableCell>
//                             <Typography
//                               variant="caption"
//                               sx={{
//                                 color: "#6b7280",
//                               }}
//                             >
//                               Primary:{" "}
//                               {item?.stock_detail?.primary_location || "NA"}
//                             </Typography>

//                             <br />

//                             <Typography
//                               variant="caption"
//                               sx={{
//                                 color: "#6b7280",
//                               }}
//                             >
//                               Secondary:{" "}
//                               {item?.stock_detail?.secondary_location || "NA"}
//                             </Typography>
//                           </TableCell>

//                           <TableCell
//                             align="center"
//                             sx={{
//                               cursor: "pointer",
//                             }}
//                             onClick={() =>
//                               window.open(
//                                 getItemQrUrlLocal(selectedOrder.id, item.id),
//                                 "_blank",
//                               )
//                             }
//                           >
//                             <QRCodeCanvas
//                               value={getItemQrUrl(
//                                 selectedOrder.id,
//                                 item.id,
//                                 item.child_product_url,
//                               )}
//                               size={100}
//                               level="H"
//                               includeMargin
//                             />
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 )}
//               </Section>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </Box>
//   );
// };

// export default OrdersList;

















import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  LinearProgress,
  CircularProgress,
  Checkbox,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import ApiServices from "../../../Services/ApiServices/ApiServices";

import {
  getDecryptedAccessToken,
  getDecryptedData,
} from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { QRCodeCanvas } from "qrcode.react";

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
| Update this import path if PrinterService.js is stored elsewhere.
|--------------------------------------------------------------------------
*/
import PrinterService from "../../PrinterService";

const THEME_BLUE = "#60a5fa";
const THEME_BLUE_DARK = "#3b82f6";

const API_PAGE_SIZE = 50;
const GRID_PAGE_SIZE = 100;

/*
|--------------------------------------------------------------------------
| WIDTH CLAMP
|--------------------------------------------------------------------------
|
| This is the fix for the page level horizontal scrollbar.
|
| The DataGrid lives inside the admin layout, which is a flex/grid
| container. A flex/grid child defaults to min-width:auto, so the
| grid's intrinsic (content) width makes the whole page wider than
| the viewport.
|
| width:0 + minWidth:100% forces the element to adopt the parent's
| width instead of its content width, so the grid scrolls INSIDE
| itself and the page never overflows.
|
|--------------------------------------------------------------------------
*/
const WIDTH_CLAMP = {
  width: 0,
  minWidth: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

/*
|--------------------------------------------------------------------------
| INFO ROW
|--------------------------------------------------------------------------
*/

const InfoRow = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "flex-start", sm: "baseline" },
      gap: { xs: 0.25, sm: 1 },
      mb: 0.75,
      minWidth: 0,
    }}
  >
    <Typography
      variant="body2"
      fontWeight={600}
      sx={{ minWidth: { sm: 120 }, flexShrink: 0, color: "#374151" }}
    >
      {label}
    </Typography>

    <Typography
      variant="body2"
      sx={{ color: "#4b5563", minWidth: 0, wordBreak: "break-word" }}
    >
      {value || "-"}
    </Typography>
  </Box>
);

/*
|--------------------------------------------------------------------------
| SECTION
|--------------------------------------------------------------------------
*/

const Section = ({ title, children }) => (
  <Box sx={{ mb: 3, minWidth: 0 }}>
    <Typography
      variant="subtitle1"
      fontWeight={700}
      sx={{ color: THEME_BLUE_DARK, mb: 1, fontSize: "1rem" }}
    >
      {title}
    </Typography>

    <Divider sx={{ mb: 1.5, borderColor: "#e5e7eb" }} />

    {children}
  </Box>
);

/*
|--------------------------------------------------------------------------
| TWO COLUMN BLOCK  (replaces MUI <Grid>, works on every MUI version)
|--------------------------------------------------------------------------
*/

const TwoColumn = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      gap: 2,
      minWidth: 0,
    }}
  >
    {children}
  </Box>
);

/*
|--------------------------------------------------------------------------
| COMPLETION
|--------------------------------------------------------------------------
*/

const getProgressColor = (value) => {
  if (value <= 30) return "#ef4444";
  if (value <= 70) return "#f59e0b";

  return "#22c55e";
};

const CompletionProgress = ({ value }) => {
  const clamped = Math.min(Math.max(value || 0, 0), 100);

  const color = getProgressColor(clamped);

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <LinearProgress
          variant="determinate"
          value={clamped}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e5e7eb",

            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
              borderRadius: 4,
            },
          }}
        />
      </Box>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color, minWidth: 36, flexShrink: 0, textAlign: "right" }}
      >
        {clamped}%
      </Typography>
    </Box>
  );
};

/*
|--------------------------------------------------------------------------
| COURIER
|--------------------------------------------------------------------------
*/

const getCourierShortName = (courierName) => {
  const name = String(courierName || "").trim();

  const courierMap = {
    "Standard Delivery": "STD",
    "Super Saver Postage": "STD",
    "International Delivery": "INT",
    "European Delivery (5-7 days)": "INT",
    "Next Day Delivery (next working day if ordered before 1pm)": "NEXT DAY",
    "Next Day By 12pm (next working day if ordered before 1pm)": "NEXT DAY 12",
    "Saturday Delivery (on orders placed before 1pm)": "SATURDAY",
    "Collect in Store": "Collect in Store",
  };

  return courierMap[name] || "NA";
};

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

const formatDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getDefaultStartDateTime = () => {
  const d = new Date();
  d.setHours(13, 0, 0, 0);
  return formatDateTimeLocal(d);
};

const getDefaultEndDateTime = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(13, 0, 0, 0);
  return formatDateTimeLocal(d);
};

/*
|--------------------------------------------------------------------------
| QR URL
|--------------------------------------------------------------------------
*/

const TIAKNIGHT_BASE_URL = "https://www.tiaknightfabrics.co.uk";

const buildChildProductUrl = (childProductUrl) => {
  if (!childProductUrl) {
    return TIAKNIGHT_BASE_URL;
  }

  if (childProductUrl.startsWith("http")) {
    return childProductUrl;
  }

  return `${TIAKNIGHT_BASE_URL}${
    childProductUrl.startsWith("/") ? "" : "/"
  }${childProductUrl}`;
};

const buildQrUrl = (orderId, itemId, childProductUrl) => {
  const productUrl = buildChildProductUrl(childProductUrl);

  const url = new URL(productUrl);

  url.searchParams.set("wims_order_id", orderId);
  url.searchParams.set("wims_item_id", itemId);

  return url.toString();
};

/*
|--------------------------------------------------------------------------
| PRINT ELIGIBILITY
|--------------------------------------------------------------------------
| 1. order_status === SHIPPED
| 2. public_shipping_label_url exists
|--------------------------------------------------------------------------
*/

const canPrintOrder = (order) => {
  const status = String(order?.order_status || "").toUpperCase();

  return status === "SHIPPED" && Boolean(order?.public_shipping_label_url);
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const OrdersList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const accessToken = getDecryptedAccessToken();

  const user = getDecryptedData();

  const isSuperUser = Boolean(user?.is_superuser);

  const headers = {
    Authorization: accessToken
      ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}`
      : "",

    "Content-Type": "application/json",
  };

  /*
  |--------------------------------------------------------------------------
  | ORDER STATE
  |--------------------------------------------------------------------------
  */

  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [minDateTime, setMinDateTime] = useState(getDefaultStartDateTime());
  const [maxDateTime, setMaxDateTime] = useState(getDefaultEndDateTime());

  /*
  |--------------------------------------------------------------------------
  | DETAILS DIALOG
  |--------------------------------------------------------------------------
  */

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | SHIPPING DIALOG
  |--------------------------------------------------------------------------
  */

  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [packageFormat, setPackageFormat] = useState("Letter");
  const [shippingNotes, setShippingNotes] = useState(
    "Booked through Royal Mail Click & Drop API",
  );
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | PRINT STATE
  |--------------------------------------------------------------------------
  */

  const [selectedPrintOrders, setSelectedPrintOrders] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState("");
  const [printError, setPrintError] = useState("");
  const [printerName, setPrinterName] = useState("");

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  | page 0 => API page 1 + 2 ; page 1 => API page 3 + 4
  |--------------------------------------------------------------------------
  */

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: GRID_PAGE_SIZE,
  });

  /*
  |--------------------------------------------------------------------------
  | QR
  |--------------------------------------------------------------------------
  */

  const getItemQrUrl = (orderId, itemId, childProductUrl) => {
    return buildQrUrl(orderId, itemId, childProductUrl);
  };

  const getItemQrUrlLocal = (orderId, itemId) => {
    if (user?.is_superuser) {
      return `${window.location.origin}/admin-user/order-process-item/${orderId}/${itemId}`;
    }

    return `${window.location.origin}/employee-user/order-process-item/${orderId}/${itemId}`;
  };

  /*
  |--------------------------------------------------------------------------
  | BUILD API QUERY
  |--------------------------------------------------------------------------
  */

  const buildOrdersQuery = (apiPage) => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", apiPage);
    queryParams.append("page_size", API_PAGE_SIZE);

    if (search.trim()) {
      queryParams.append("search", search.trim());
    }

    if (orderStatus) {
      queryParams.append("order_status", orderStatus);
    }

    if (paymentStatus) {
      queryParams.append("payment_status", paymentStatus);
    }

    if (minDateTime) {
      queryParams.append(
        "order_date_after",
        new Date(minDateTime).toISOString(),
      );
    }

    if (maxDateTime) {
      queryParams.append(
        "order_date_before",
        new Date(maxDateTime).toISOString(),
      );
    }

    return queryParams;
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH 100 ORDERS
  |--------------------------------------------------------------------------
  */

  const fetchOrders = async (gridPage = 0) => {
    setLoading(true);
    setError("");

    setSelectedPrintOrders([]);

    try {
      if (gridPage === 0) {
        try {
          await ApiServices.get(
            "orders/import_from_remote_tiaknightfabrics/",
            headers,
          );
        } catch (importError) {
          console.warn("Import API failed, continuing...", importError);
        }
      }

      const firstApiPage = gridPage * 2 + 1;
      const secondApiPage = firstApiPage + 1;

      const firstQuery = buildOrdersQuery(firstApiPage);

      const firstResponse = await ApiServices.get(
        `orders/?${firstQuery.toString()}`,
        headers,
      );

      const firstResults = Array.isArray(firstResponse?.data?.results)
        ? firstResponse.data.results
        : [];

      let combinedResults = [...firstResults];

      if (firstResponse?.data?.next) {
        const secondQuery = buildOrdersQuery(secondApiPage);

        try {
          const secondResponse = await ApiServices.get(
            `orders/?${secondQuery.toString()}`,
            headers,
          );

          const secondResults = Array.isArray(secondResponse?.data?.results)
            ? secondResponse.data.results
            : [];

          combinedResults = [...firstResults, ...secondResults];
        } catch (secondPageError) {
          console.error(
            "Unable to load second batch of orders:",
            secondPageError,
          );
        }
      }

      const uniqueResults = Array.from(
        new Map(combinedResults.map((order) => [order.id, order])).values(),
      );

      setOrders(uniqueResults);

      setCount(firstResponse?.data?.count ?? uniqueResults.length);
    } catch (err) {
      console.error(err);

      setError("Failed to load orders");
      setOrders([]);
      setCount(0);
      setSelectedPrintOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PAGINATION EFFECT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchOrders(paginationModel.page);
  }, [paginationModel.page]);

  /*
  |--------------------------------------------------------------------------
  | FILTER EFFECT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const delay = setTimeout(() => {
      if (paginationModel.page !== 0) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      } else {
        fetchOrders(0);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search, orderStatus, paymentStatus, minDateTime, maxDateTime]);

  /*
  |--------------------------------------------------------------------------
  | DETAILS
  |--------------------------------------------------------------------------
  */

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);

      const res = await ApiServices.get(`orders/${orderId}/`, headers);

      setOrderDetails(res?.data || null);
    } catch (error) {
      console.error(error);

      setOrderDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = () => {
    fetchOrders(paginationModel.page);
  };

  /*
  |--------------------------------------------------------------------------
  | SHIPPING
  |--------------------------------------------------------------------------
  */

  const openShippingDialog = (order) => {
    setShippingOrder(order);
    setPackageFormat("Letter");
    setShippingNotes("Booked through Royal Mail Click & Drop API");
    setBookingError("");
    setBookingSuccess("");
    setShippingDialogOpen(true);
  };

  const closeShippingDialog = () => {
    if (bookingLoading) {
      return;
    }

    setShippingDialogOpen(false);
    setShippingOrder(null);
  };

  const handleBookRoyalMailShipping = async () => {
    if (!shippingOrder) {
      return;
    }

    const weight = Number(shippingOrder.total_weight_gm || 0);

    if (!weight || weight <= 0) {
      setBookingError("Weight is required and must be greater than 0.");
      return;
    }

    if (!packageFormat) {
      setBookingError("Please select package format.");
      return;
    }

    if (!shippingOrder.courier_service_code) {
      setBookingError("Courier service code is missing.");
      return;
    }

    const payload = {
      weight_in_grams: weight,
      package_format_identifier: packageFormat,
      service_code: shippingOrder.courier_service_code,
      notes: shippingNotes || "",
    };

    try {
      setBookingLoading(true);
      setBookingError("");
      setBookingSuccess("");

      await ApiServices.post(
        `orders/${shippingOrder.id}/book-royal-mail-shipping/`,
        payload,
        headers,
      );

      setBookingSuccess("Royal Mail shipping booked successfully.");

      await fetchOrders(paginationModel.page);

      setTimeout(() => {
        closeShippingDialog();
      }, 700);
    } catch (err) {
      console.error(err);

      setBookingError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to book Royal Mail shipping.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ELIGIBLE PRINT ORDERS
  |--------------------------------------------------------------------------
  */

  const printableOrders = useMemo(() => {
    return orders.filter(canPrintOrder);
  }, [orders]);

  const printableOrderIds = useMemo(() => {
    return printableOrders.map((order) => order.id);
  }, [printableOrders]);

  /*
  |--------------------------------------------------------------------------
  | SELECT ONE
  |--------------------------------------------------------------------------
  */

  const handlePrintOrderSelect = (orderId, checked) => {
    const order = orders.find((item) => item.id === orderId);

    if (!order || !canPrintOrder(order)) {
      return;
    }

    setSelectedPrintOrders((prev) => {
      if (checked) {
        if (prev.includes(orderId)) {
          return prev;
        }

        return [...prev, orderId];
      }

      return prev.filter((id) => id !== orderId);
    });
  };

  /*
  |--------------------------------------------------------------------------
  | SELECT ALL (SHIPPED + label only)
  |--------------------------------------------------------------------------
  */

  const handleSelectAllPrintable = (checked) => {
    if (checked) {
      setSelectedPrintOrders(printableOrderIds);
    } else {
      setSelectedPrintOrders([]);
    }
  };

  const allPrintableSelected =
    printableOrderIds.length > 0 &&
    printableOrderIds.every((id) => selectedPrintOrders.includes(id));

  const somePrintableSelected =
    selectedPrintOrders.length > 0 && !allPrintableSelected;

  /*
  |--------------------------------------------------------------------------
  | BULK PRINT
  |--------------------------------------------------------------------------
  */

  const handlePrintSelected = async () => {
    if (printing) {
      return;
    }

    setPrintMessage("");
    setPrintError("");

    const ordersToPrint = orders.filter(
      (order) => selectedPrintOrders.includes(order.id) && canPrintOrder(order),
    );

    if (ordersToPrint.length === 0) {
      setPrintError(
        "Please select at least one shipped order with a shipping label.",
      );

      return;
    }

    setPrinting(true);

    try {
      const printer = await PrinterService.testPrinter();

      setPrinterName(printer);

      let successfulPrints = 0;

      const failedPrints = [];

      for (let index = 0; index < ordersToPrint.length; index++) {
        const order = ordersToPrint[index];

        const labelUrl = order.public_shipping_label_url;

        try {
          const result = await PrinterService.printPdf({
            pdfUrl: labelUrl,
            printerName: printer,
            width: 4,
            height: 6,
            copies: 1,
          });

          if (!result?.success) {
            throw new Error(result?.error || "Unable to print label");
          }

          successfulPrints += 1;

          setPrintMessage(
            `Sending label ${index + 1} of ${
              ordersToPrint.length
            } to ${printer}...`,
          );
        } catch (printItemError) {
          console.error(`Failed to print order ${order.id}`, printItemError);

          failedPrints.push(
            order.external_order_id || order.order_number || order.id,
          );
        }
      }

      if (failedPrints.length > 0) {
        setPrintError(
          `${failedPrints.length} label(s) failed to print: ${failedPrints.join(
            ", ",
          )}`,
        );
      }

      if (successfulPrints > 0) {
        setPrintMessage(
          `${successfulPrints} shipping label${
            successfulPrints !== 1 ? "s" : ""
          } sent successfully to ${printer}.`,
        );
      }

      if (failedPrints.length === 0) {
        setSelectedPrintOrders([]);
      }
    } catch (error) {
      console.error("Bulk printing failed:", error);

      setPrintMessage("");

      setPrintError(
        error?.message ||
          "Unable to connect to the printer or print shipping labels.",
      );
    } finally {
      setPrinting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ROWS
  |--------------------------------------------------------------------------
  */

  const rows = useMemo(() => {
    return orders.map((o, i) => ({
      id: o?.id ?? i,
      external_order_id: o?.external_order_id || "-",
      order_number: o?.order_number || "-",
      customer_name: o?.customer_name || "-",
      customer_email: o?.customer_email || "-",
      order_status: o?.order_status,
      order_status_display: o?.order_status_display,
      payment_status: o?.payment_status,
      payment_status_display: o?.payment_status_display,
      courier_service_name: o?.courier_service_name || "",
      courier_service_code: o?.courier_service_code || "",
      courier_short_name: getCourierShortName(o?.courier_service_name),
      completion_percentage: Number(o?.completion_percentage ?? 0),
      total_weight_gm: Number(o?.total_weight_gm || 0),
      item_count: o?.item_count ?? 0,
      total_quantity: o?.total_quantity ?? 0,
      order_date: o?.order_date || null,
      total_amount: o?.total_amount ?? null,
      public_shipping_label_url: o?.public_shipping_label_url || null,
      raw: o,
    }));
  }, [orders]);

  /*
  |--------------------------------------------------------------------------
  | COLUMNS
  |--------------------------------------------------------------------------
  */

  const columns = [
    /* PRINT CHECKBOX */
    {
      field: "print_select",
      headerName: "",
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",

      renderHeader: () => (
        <Checkbox
          size="small"
          checked={allPrintableSelected}
          indeterminate={somePrintableSelected}
          disabled={printableOrderIds.length === 0 || printing}
          onChange={(e) => handleSelectAllPrintable(e.target.checked)}
          title="Select all printable shipped orders"
        />
      ),

      renderCell: ({ row }) => {
        const printable = canPrintOrder(row.raw);

        return (
          <Checkbox
            size="small"
            checked={printable && selectedPrintOrders.includes(row.id)}
            disabled={!printable || printing}
            onChange={(e) => {
              e.stopPropagation();
              handlePrintOrderSelect(row.id, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
    },

    /* ORDER */
    {
      field: "external_order_id",
      headerName: "Order",
      flex: 1.2,
      minWidth: 130,

      renderCell: ({ row }) => (
        <Button
          size="small"
          sx={{
            textTransform: "none",
            color: THEME_BLUE_DARK,
            fontWeight: 600,
            px: 0.5,
            minWidth: 0,
            maxWidth: "100%",
            justifyContent: "flex-start",
          }}
          onClick={() => {
            setSelectedOrder(row.raw);
            setOpen(true);
            fetchOrderDetails(row.id);
          }}
        >
          <Box
            component="span"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.external_order_id}
          </Box>
        </Button>
      ),
    },

    /* CUSTOMER */
    {
      field: "customer_name",
      headerName: "Customer",
      flex: 1.4,
      minWidth: 170,

      renderCell: ({ row }) => (
        <Tooltip title={row.customer_email || ""} placement="top-start">
          <Box sx={{ minWidth: 0, overflow: "hidden" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.customer_name}
            </Typography>
          </Box>
        </Tooltip>
      ),
    },

    /* ORDER STATUS */
    {
      field: "order_status",
      headerName: "Order Status",
      flex: 1,
      minWidth: 120,

      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.order_status_display || row.order_status || "-"}
          sx={{
            maxWidth: "100%",
            backgroundColor:
              row.order_status === "SHIPPED" || row.order_status === "DELIVERED"
                ? "#dcfce7"
                : row.order_status === "PROCESSING"
                  ? "#dbeafe"
                  : row.order_status === "NEW" ||
                      row.order_status === "CONFIRMED"
                    ? "#fef3c7"
                    : "#f3f4f6",

            color:
              row.order_status === "SHIPPED" || row.order_status === "DELIVERED"
                ? "#166534"
                : row.order_status === "PROCESSING"
                  ? "#1e40af"
                  : row.order_status === "NEW" ||
                      row.order_status === "CONFIRMED"
                    ? "#92400e"
                    : "#374151",

            fontWeight: 500,
            fontSize: "0.75rem",
          }}
        />
      ),
    },

    /* COMPLETION */
    {
      field: "completion_percentage",
      headerName: "Completion",
      flex: 1.4,
      minWidth: 160,

      renderCell: ({ row }) => (
        <CompletionProgress value={row.completion_percentage} />
      ),
    },

    /* WEIGHT */
    {
      field: "total_weight_gm",
      headerName: "Weight(g)",
      flex: 0.8,
      minWidth: 100,
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) => row.total_weight_gm || "NA",
    },

    /* ITEMS */
    {
      field: "item_count",
      headerName: "Items",
      flex: 0.6,
      minWidth: 80,
      align: "right",
      headerAlign: "right",
    },

    /* QTY */
    {
      field: "total_quantity",
      headerName: "Qty",
      flex: 0.6,
      minWidth: 80,
      align: "right",
      headerAlign: "right",
    },

    /* DATE */
    {
      field: "order_date",
      headerName: "Order Date",
      flex: 1.2,
      minWidth: 160,

      renderCell: ({ row }) =>
        row.order_date ? new Date(row.order_date).toLocaleString() : "-",
    },

    /* COURIER */
    {
      field: "courier_short_name",
      headerName: "Courier",
      flex: 0.9,
      minWidth: 130,

      renderCell: ({ row }) => (
        <Tooltip title={row.courier_service_name || ""} placement="top-start">
          <Chip
            size="small"
            label={row.courier_short_name || "NA"}
            sx={{
              maxWidth: "100%",
              backgroundColor: "#eef2ff",
              color: "#3730a3",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Tooltip>
      ),
    },

    /* TOTAL */
    {
      field: "total_amount",
      headerName: "Total (£)",
      flex: 0.8,
      minWidth: 100,
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) => `£${Number(row.total_amount || 0).toFixed(2)}`,
    },

    /* COMPLETE ORDER / ORDER PLACED */
    {
      field: "complete_order",
      headerName: "Complete Order",
      flex: 1.3,
      minWidth: 180,
      sortable: false,
      filterable: false,

      renderCell: ({ row }) => {
        const printable = canPrintOrder(row.raw);

        if (printable) {
          return (
            <Button
              variant="contained"
              size="small"
              disabled
              disableElevation
              startIcon={<CheckCircleIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
                borderRadius: 1.5,

                "&.Mui-disabled": {
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  opacity: 1,
                },
              }}
            >
              Order Placed
            </Button>
          );
        }

        const isCompleted = Number(row.completion_percentage) === 100;

        return (
          <Button
            variant="contained"
            size="small"
            disableElevation
            disabled={!isCompleted}
            startIcon={<LocalShippingIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              borderRadius: 1.5,
              backgroundColor: isCompleted ? "#16a34a" : "#9ca3af",

              "&:hover": {
                backgroundColor: isCompleted ? "#15803d" : "#9ca3af",
              },
            }}
            onClick={() => openShippingDialog(row.raw)}
          >
            Complete Order
          </Button>
        );
      },
    },

    /* SUPERUSER ACTION */
    ...(isSuperUser
      ? [
          {
            field: "actions",
            headerName: "Actions",
            flex: 1.1,
            minWidth: 120,
            sortable: false,
            filterable: false,

            renderCell: ({ row }) => (
              <Button
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon />}
                sx={{
                  whiteSpace: "nowrap",
                  minWidth: 80,
                  borderRadius: 1.5,
                  borderColor: THEME_BLUE,
                  color: THEME_BLUE_DARK,
                  textTransform: "none",

                  "&:hover": {
                    borderColor: THEME_BLUE_DARK,
                    backgroundColor: "#eff6ff",
                  },
                }}
                onClick={() =>
                  window.open(
                    `/admin-user/order-processing/${row.id}`,
                    "_blank",
                  )
                }
              >
                Details
              </Button>
            ),
          },
        ]
      : []),
  ];

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Box
      sx={{
        ...WIDTH_CLAMP,
        p: { xs: 1.5, sm: 2, md: 3 },
        overflowX: "hidden",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {/* --------------------------------------------------------------- */}
      {/* HEADER                                                          */}
      {/* --------------------------------------------------------------- */}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          mb: 2,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: "#1f2937",
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.125rem" },
              lineHeight: 1.2,
            }}
          >
            Orders ({count})
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Showing up to 100 orders per page
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ width: { xs: "100%", md: "auto" }, flexShrink: 0 }}
        >
          {/* BULK PRINT */}
          <Button
            variant="contained"
            disableElevation
            fullWidth={isMobile}
            startIcon={
              printing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <PrintIcon />
              )
            }
            disabled={selectedPrintOrders.length === 0 || printing || loading}
            onClick={handlePrintSelected}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              whiteSpace: "nowrap",
              backgroundColor: "#16a34a",

              "&:hover": { backgroundColor: "#15803d" },

              "&.Mui-disabled": { backgroundColor: "#d1d5db" },
            }}
          >
            {printing
              ? "Printing..."
              : `Print Selected (${selectedPrintOrders.length})`}
          </Button>

          {/* REFRESH */}
          <Button
            variant="contained"
            disableElevation
            fullWidth={isMobile}
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || printing}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              whiteSpace: "nowrap",
              backgroundColor: THEME_BLUE_DARK,

              "&:hover": { backgroundColor: "#2563eb" },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* --------------------------------------------------------------- */}
      {/* PRINT STATUS                                                    */}
      {/* --------------------------------------------------------------- */}

      {printerName && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          TSC Printer: <strong>{printerName}</strong>
        </Alert>
      )}

      {printMessage && (
        <Alert
          severity={printing ? "info" : "success"}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {printing && (
            <CircularProgress
              size={16}
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
          )}

          {printMessage}
        </Alert>
      )}

      {printError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setPrintError("")}
        >
          {printError}
        </Alert>
      )}

      {/* --------------------------------------------------------------- */}
      {/* PRINT SELECTION INFORMATION                                     */}
      {/* --------------------------------------------------------------- */}

      {printableOrders.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {printableOrders.length} order
          {printableOrders.length !== 1 ? "s" : ""} on this page can be printed.
          Only shipped orders having a public shipping label are selectable.
        </Alert>
      )}

      {/* --------------------------------------------------------------- */}
      {/* FILTERS                                                         */}
      {/* --------------------------------------------------------------- */}
      {/* Plain CSS grid, so it does not depend on the MUI Grid version.  */}

      <Paper
        elevation={0}
        sx={{
          ...WIDTH_CLAMP,
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(5, minmax(0, 1fr))",
            },
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ backgroundColor: "#fff", minWidth: 0 }}
          />

          <TextField
            select
            fullWidth
            size="small"
            label="Order Status"
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            sx={{ backgroundColor: "#fff", minWidth: 0 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="NEW">New</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="PROCESSING">Processing</MenuItem>
            <MenuItem value="SHIPPED">Shipped</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            sx={{ backgroundColor: "#fff", minWidth: 0 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="UNPAID">Unpaid</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
          </TextField>

          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Min Date & Time"
            value={minDateTime}
            onChange={(e) => setMinDateTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ backgroundColor: "#fff", minWidth: 0 }}
          />

          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Max Date & Time"
            value={maxDateTime}
            onChange={(e) => setMaxDateTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ backgroundColor: "#fff", minWidth: 0 }}
          />
        </Box>
      </Paper>

      {/* --------------------------------------------------------------- */}
      {/* GENERAL ERROR                                                   */}
      {/* --------------------------------------------------------------- */}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* --------------------------------------------------------------- */}
      {/* ORDERS GRID                                                     */}
      {/* --------------------------------------------------------------- */}

      <Paper
        elevation={0}
        sx={{
          ...WIDTH_CLAMP,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ ...WIDTH_CLAMP, overflowX: "hidden" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            pagination
            paginationMode="server"
            rowCount={count}
            rowHeight={56}
            columnHeaderHeight={52}
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => {
              setPaginationModel({
                page: newModel.page,
                pageSize: GRID_PAGE_SIZE,
              });
            }}
            pageSizeOptions={[GRID_PAGE_SIZE]}
            sx={{
              border: "none",
              ...WIDTH_CLAMP,
              fontSize: { xs: "0.8rem", sm: "0.875rem" },

              "& .MuiDataGrid-main": { minWidth: 0 },

              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f8fafc",
                color: "#374151",
                borderBottom: "1px solid #e5e7eb",
              },

              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                letterSpacing: "0.01em",
              },

              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f3f4f6",
                minWidth: 0,
              },

              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                { outline: "none" },

              "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" },

              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#f8fafc",
              },

              /* scrollbar stays INSIDE the grid */
              "& .MuiDataGrid-virtualScroller": { overflowX: "auto" },

              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                height: 8,
              },

              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                backgroundColor: "#cbd5e1",
                borderRadius: 8,
              },
            }}
          />
        </Box>
      </Paper>

      {/* =============================================================== */}
      {/* ROYAL MAIL SHIPPING DIALOG                                      */}
      {/* =============================================================== */}

      <Dialog
        open={shippingDialogOpen}
        onClose={closeShippingDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
      >
        <DialogTitle fontWeight={700}>Confirm Royal Mail Shipping</DialogTitle>

        <DialogContent dividers>
          {shippingOrder && (
            <Box sx={{ display: "grid", gap: 2, minWidth: 0 }}>
              <Alert severity="info">
                Please verify package details before booking Royal Mail
                shipping.
              </Alert>

              {bookingError && <Alert severity="error">{bookingError}</Alert>}

              {bookingSuccess && (
                <Alert severity="success">{bookingSuccess}</Alert>
              )}

              <InfoRow label="Order" value={shippingOrder.external_order_id} />

              <InfoRow
                label="Weight"
                value={`${shippingOrder.total_weight_gm || 0} grams`}
              />

              <InfoRow
                label="Service Code"
                value={shippingOrder.courier_service_code || "NA"}
              />

              <InfoRow
                label="Courier"
                value={shippingOrder.courier_service_name || "NA"}
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Package Format"
                value={packageFormat}
                onChange={(e) => setPackageFormat(e.target.value)}
              >
                <MenuItem value="Large">Large</MenuItem>
                <MenuItem value="Letter">Letter</MenuItem>
                <MenuItem value="Parcel">Parcel</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeShippingDialog}
            disabled={bookingLoading}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disableElevation
            onClick={handleBookRoyalMailShipping}
            disabled={bookingLoading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              minWidth: 150,
              backgroundColor: THEME_BLUE_DARK,

              "&:hover": { backgroundColor: "#2563eb" },
            }}
          >
            {bookingLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Confirm & Book"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============================================================== */}
      {/* ORDER DETAILS DIALOG                                            */}
      {/* =============================================================== */}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setOrderDetails(null);
        }}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1, color: "#1f2937", fontWeight: 700 }}>
          Order Details
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ backgroundColor: "#fafafa", overflowX: "hidden" }}
        >
          {selectedOrder && (
            <>
              {/* ORDER INFO */}
              <Section title="Order Info">
                <TwoColumn>
                  <Box sx={{ minWidth: 0 }}>
                    <InfoRow
                      label="Order ID"
                      value={selectedOrder.external_order_id}
                    />

                    <InfoRow
                      label="Order Number"
                      value={selectedOrder.order_number}
                    />

                    <InfoRow
                      label="Customer"
                      value={selectedOrder.customer_name}
                    />

                    <InfoRow
                      label="Email"
                      value={selectedOrder.customer_email}
                    />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <InfoRow
                      label="Order Status"
                      value={
                        selectedOrder.order_status_display ||
                        selectedOrder.order_status
                      }
                    />

                    <InfoRow
                      label="Payment Status"
                      value={
                        selectedOrder.payment_status_display ||
                        selectedOrder.payment_status
                      }
                    />

                    <InfoRow
                      label="Order Date"
                      value={
                        selectedOrder.order_date
                          ? new Date(selectedOrder.order_date).toLocaleString()
                          : "-"
                      }
                    />

                    <InfoRow
                      label="Total Weight"
                      value={`${selectedOrder.total_weight_gm || 0} grams`}
                    />
                  </Box>
                </TwoColumn>
              </Section>

              {/* FINANCIALS */}
              <Section title="Financials">
                <TwoColumn>
                  <Box sx={{ minWidth: 0 }}>
                    <InfoRow
                      label="Subtotal"
                      value={`£${Number(selectedOrder.subtotal || 0).toFixed(
                        2,
                      )}`}
                    />

                    <InfoRow
                      label="Tax"
                      value={`£${Number(selectedOrder.tax || 0).toFixed(2)}`}
                    />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <InfoRow
                      label="Discount"
                      value={`£${Number(selectedOrder.discount || 0).toFixed(
                        2,
                      )}`}
                    />

                    <InfoRow
                      label="Total Amount"
                      value={`£${Number(
                        selectedOrder.total_amount || 0,
                      ).toFixed(2)}`}
                    />
                  </Box>
                </TwoColumn>
              </Section>

              {/* ITEMS */}
              <Section title="Order Items">
                {detailsLoading ? (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <CircularProgress size={22} sx={{ mb: 1 }} />

                    <Typography color="text.secondary">
                      Loading items...
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      ...WIDTH_CLAMP,
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      overflowX: "auto",
                    }}
                  >
                    <Table
                      size="small"
                      sx={{ minWidth: 900, backgroundColor: "#fff" }}
                    >
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>
                            Product
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }} align="right">
                            Qty
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }} align="right">
                            Weight(g)
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }} align="right">
                            Unit Price
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }} align="right">
                            Total
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>
                            Assigned To
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>
                            Location
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            QR
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {(orderDetails?.items || []).map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {item.sku || "-"}
                            </TableCell>

                            <TableCell sx={{ minWidth: 200 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#1f2937" }}
                              >
                                {item.product_name || "-"}
                              </Typography>

                              {item.product_type && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#9ca3af" }}
                                >
                                  {item.product_type}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="right">{item.quantity}</TableCell>

                            <TableCell align="right">
                              {item.total_weight_gm || "NA"}
                            </TableCell>

                            <TableCell align="right">
                              £{Number(item.unit_price || 0).toFixed(2)}
                            </TableCell>

                            <TableCell align="right">
                              £{Number(item.line_total || 0).toFixed(2)}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  item.processing_status_display ||
                                  item.processing_status ||
                                  "-"
                                }
                                color={
                                  item.processing_status === "COMPLETED"
                                    ? "success"
                                    : item.processing_status === "IN_PROGRESS"
                                      ? "primary"
                                      : item.processing_status === "PENDING"
                                        ? "warning"
                                        : "default"
                                }
                              />
                            </TableCell>

                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {item.assigned_to_username || "-"}
                            </TableCell>

                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                Primary:{" "}
                                {item?.stock_detail?.primary_location || "NA"}
                              </Typography>

                              <br />

                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                Secondary:{" "}
                                {item?.stock_detail?.secondary_location || "NA"}
                              </Typography>
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{ cursor: "pointer" }}
                              onClick={() =>
                                window.open(
                                  getItemQrUrlLocal(selectedOrder.id, item.id),
                                  "_blank",
                                )
                              }
                            >
                              <QRCodeCanvas
                                value={getItemQrUrl(
                                  selectedOrder.id,
                                  item.id,
                                  item.child_product_url,
                                )}
                                size={isMobile ? 72 : 100}
                                level="H"
                                includeMargin
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrdersList;
