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
//   Grid,
//   Divider,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
//   Button,
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken, getDecryptedData } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import { QRCodeCanvas } from "qrcode.react"; 
// import { LinearProgress } from "@mui/material";
// /* ---------------- HELPERS ---------------- */
// const InfoRow = ({ label, value }) => (
//   <Grid item xs={12} md={6}>
//     <Typography variant="caption" color="text.secondary">
//       {label}
//     </Typography>
//     <Typography fontWeight={500}>{value || "-"}</Typography>
//   </Grid>
// );

// const Section = ({ title, children }) => (
//   <Paper sx={{ p: 2, mb: 3 }}>
//     <Typography variant="h6" mb={2}>
//       {title}
//     </Typography>
//     {children}
//   </Paper>
// );

// /* ---------------- MAIN ---------------- */
// const OrdersList = () => {
//   const accessToken = getDecryptedAccessToken();
//   const user = getDecryptedData();
// const isSuperUser = Boolean(user?.is_superuser);
// console.log("Current user:", user);
//   const headers = {
//     Authorization: accessToken
//       ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}`
//       : "",
//     "Content-Type": "application/json",
//   };

//   const [orders, setOrders] = useState([]);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Filters
//   const [search, setSearch] = useState("");
//   const [orderStatus, setOrderStatus] = useState("");
//   const [paymentStatus, setPaymentStatus] = useState("");

//   // Dialog
//   const [open, setOpen] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const [orderDetails, setOrderDetails] = useState(null);
// const [detailsLoading, setDetailsLoading] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);
// const getItemQrUrl = (orderId, itemId) => {
//   if (user?.is_superuser) {
//     return `http://wims.cloud/admin-user/order-process-item/${orderId}/${itemId}`;
//   }

//   return `http://wims.cloud/employee-user/order-process-item/${orderId}/${itemId}`;
// };

// const getItemQrUrlLocal = (orderId, itemId) => {
//   if (user?.is_superuser) {
//     return `${window.location.origin}/admin-user/order-process-item/${orderId}/${itemId}`;
//   }

//   return `${window.location.origin}/employee-user/order-process-item/${orderId}/${itemId}`;
// };



// const fetchOrderDetails = async (orderId) => {
//   try {
//     setDetailsLoading(true);

//     const res = await ApiServices.get(
//       `orders/${orderId}/`,
//       headers
//     );

//     setOrderDetails(res?.data || null);
//   } catch (error) {
//     console.error(error);
//     setOrderDetails(null);
//   } finally {
//     setDetailsLoading(false);
//   }
// };


// const fetchOrders = async () => {
//   setLoading(true);
//   setError("");

//   try {
//     // 🔹 Step 1: Try import API (but don't block flow)
//     try {
//       const importRes = await ApiServices.get(
//         "orders/import_from_remote_tiaknightfabrics/",
//         headers
//       );

//       console.log("Import API response:", importRes);

//       // Optional: check success via response message instead of status
//       if (importRes?.data?.message) {
//         console.log("Import success:", importRes.data.message);
//       }

//     } catch (importError) {
//       // ❗ Don't stop execution
//       console.warn("Import API failed, continuing...", importError);
//     }

//     // 🔹 Step 2: ALWAYS call orders API
//     const res = await ApiServices.get("orders/", headers);

//     const results = Array.isArray(res?.data?.results)
//       ? res.data.results
//       : [];

//     setOrders(results);
//     setCount(res?.data?.count ?? results.length);

//   } catch (err) {
//     console.error(err);
//     setError("Failed to load orders");
//   } finally {
//     setLoading(false);
//   }
// };

//   /* ---------------- FILTER ---------------- */
//   const filteredOrders = useMemo(() => {
//     const s = search.toLowerCase();
//     return orders.filter(
//       (o) =>
//         (!search ||
//           o?.external_order_id?.toLowerCase().includes(s) ||
//           o?.customer_name?.toLowerCase().includes(s) ||
//           o?.customer_email?.toLowerCase().includes(s)) &&
//         (!orderStatus || o?.order_status === orderStatus) &&
//         (!paymentStatus || o?.payment_status === paymentStatus)
//     );
//   }, [orders, search, orderStatus, paymentStatus]);

//   /* ---------------- ROWS ---------------- */
//  const rows = useMemo(() => {
//   return filteredOrders.map((o, i) => ({
//     id: o?.id ?? i,
//     external_order_id: o?.external_order_id || "-",
//     customer_name: o?.customer_name || "-",
//     order_status: o?.order_status,
//     order_status_display: o?.order_status_display,
//     completion_percentage: Number(o?.completion_percentage ?? 0),
//     item_count: o?.item_count ?? 0,
//     total_quantity: o?.total_quantity ?? 0,
//     order_date: o?.order_date || null,
//     total_amount: o?.total_amount ?? null,
//     raw: o,
//   }));
// }, [filteredOrders]);

//   /* ---------------- COLUMNS ---------------- */
// const columns = [
//    {
//       field: "external_order_id",
//       headerName: "Order",
//       flex: 1.2,
//       renderCell: ({ row }) => (
//         <Typography
//           fontWeight={600}
//           sx={{ color: "primary.main", cursor: "pointer" }}
//         onClick={() => {
//   setSelectedOrder(row.raw);
//   setOpen(true);
//   fetchOrderDetails(row.id);
// }}
//         >
//           {row.external_order_id}
//         </Typography>
//       ),
//     },
//   { field: "customer_name", headerName: "Customer", flex: 1.4 },
//   {
//     field: "order_status",
//     headerName: "Order Status",
//     flex: 1,
//     renderCell: ({ row }) => (
//       <Chip
//         size="small"
//         label={row.order_status_display || "-"}
//         color={
//           row.order_status === "PROCESSING"
//             ? "warning"
//             : row.order_status === "DELIVERED"
//             ? "success"
//             : "info"
//         }
//       />
//     ),
//   },
//   {
//     field: "completion_percentage",
//     headerName: "Completion",
//     flex: 1.2,
//     renderCell: ({ row }) => {
//       const value = Math.min(Math.max(row.completion_percentage || 0, 0), 100);

//       return (
//         <Box sx={{ width: "100%" }}>
//           <Typography variant="caption" fontWeight={600}>
//             {value}%
//           </Typography>
//           <LinearProgress
//             variant="determinate"
//             value={value}
//             sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
//           />
//         </Box>
//       );
//     },
//   },
//   { field: "item_count", headerName: "Items", flex: 0.6 },
//   { field: "total_quantity", headerName: "Qty", flex: 0.6 },
//   {
//     field: "order_date",
//     headerName: "Order Date",
//     flex: 1.2,
//     renderCell: ({ row }) =>
//       row.order_date ? new Date(row.order_date).toLocaleDateString() : "-",
//   },
//   {
//     field: "total_amount",
//     headerName: "Total (£)",
//     flex: 0.8,
//     renderCell: ({ row }) => {
//       const amount = Number(row.total_amount || 0);
//       return `£${amount.toFixed(2)}`;
//     },
//   },
//   ...(isSuperUser
//     ? [
//         {
//           field: "actions",
//           headerName: "Actions",
//           flex: 1.1,
//           minWidth: 150,
//           sortable: false,
//           filterable: false,
//           renderCell: ({ row }) => (
//             <Button
//               size="small"
//               variant="outlined"
//               startIcon={<OpenInNewIcon />}
//               sx={{
//                 whiteSpace: "nowrap",
//                 minWidth: 130,
//               }}
//               onClick={() =>
//                 window.open(`/admin-user/order-processing/${row.id}`, "_blank")
//               }
//             >
//               Show Details
//             </Button>
//           ),
//         },
//       ]
//     : []),
// ];

//   return (
//     <Box>
//       <Typography variant="h5" fontWeight={600} mb={2}>
//         Orders ({count})
//       </Typography>

//       {/* ---------------- FILTER BAR ---------------- */}
//       <Paper sx={{ p: 2, mb: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={6}>
//             <TextField
//               fullWidth
//               label="Search Orders"
//               placeholder="Order ID, customer name, email"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </Grid>

//           <Grid item xs={12} md={3}>
//             <TextField
//               fullWidth
//               select
//               label="Order Status"
//               helperText="Filter by order state"
//               value={orderStatus}
//               onChange={(e) => setOrderStatus(e.target.value)}
//             >
//               <MenuItem value="">All</MenuItem>
//               <MenuItem value="CONFIRMED">Confirmed</MenuItem>
//               <MenuItem value="PROCESSING">Processing</MenuItem>
//               <MenuItem value="DELIVERED">Delivered</MenuItem>
//             </TextField>
//           </Grid>

//           <Grid item xs={12} md={3}>
//             <TextField
//               fullWidth
//               select
//               label="Payment Status"
//               helperText="Filter by payment"
//               value={paymentStatus}
//               onChange={(e) => setPaymentStatus(e.target.value)}
//             >
//               <MenuItem value="">All</MenuItem>
//               <MenuItem value="PAID">Paid</MenuItem>
//               <MenuItem value="UNPAID">Unpaid</MenuItem>
//             </TextField>
//           </Grid>
//         </Grid>
//       </Paper>

//       {error && <Alert severity="error">{error}</Alert>}

//       {/* ---------------- TABLE ---------------- */}
//       <Paper sx={{ height: 640 }}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           loading={loading}
//           checkboxSelection // ✅ row + select all
//           disableRowSelectionOnClick
//           getRowHeight={() => 120} 
//           pageSizeOptions={[10, 25, 50, 100]} // ✅ rows per page selector
//           initialState={{
//             pagination: {
//               paginationModel: { page: 0, pageSize: 10 },
//             },
//           }}
//           sx={{
//             "& .MuiDataGrid-columnHeaders": {
//               backgroundColor: "#f5f7fa",
//               fontWeight: 600,
//             },
//           }}
//         />
//       </Paper>

//       {/* ---------------- DETAILS DIALOG ---------------- */}
//       <Dialog
//         open={open}
//        onClose={() => {
//     setOpen(false);
//     setOrderDetails(null);
//   }}
//         maxWidth="lg"
//         fullWidth
//       >
//         <DialogTitle fontWeight={600}>Order Details</DialogTitle>
//         <DialogContent dividers>
//           {selectedOrder && (
//             <>
//               <Section title="Order Summary">
//                 <Grid container spacing={2}>
//                   <InfoRow
//                     label="Order Number"
//                     value={selectedOrder.external_order_id}
//                   />
               
//                   <InfoRow
//                     label="Order Status"
//                     value={selectedOrder.order_status_display}
//                   />
//                   <InfoRow
//                     label="Payment Status"
//                     value={selectedOrder.payment_status_display}
//                   />
//                   <InfoRow
//                     label="Order Date"
//                     value={
//                       selectedOrder.order_date
//                         ? new Date(selectedOrder.order_date).toLocaleString()
//                         : "-"
//                     }
//                   />
//                 </Grid>
//               </Section>

//               <Section title="Customer & Address">
//                 <Grid container spacing={2}>
//                   <InfoRow
//                     label="Customer"
//                     value={selectedOrder.customer_name}
//                   />
//                   <InfoRow label="Email" value={selectedOrder.customer_email} />
//                   <InfoRow
//                     label="Shipping Address"
//                     value={selectedOrder.shipping_address}
//                   />
//                   <InfoRow
//                     label="Billing Address"
//                     value={selectedOrder.billing_address}
//                   />
//                 </Grid>
//               </Section>

//              <Section title="Order Items">
//   {detailsLoading ? (
//     <Typography>Loading items...</Typography>
//   ) : (
//     <Table size="small">
//       <TableHead>
//         <TableRow>
//           <TableCell>SKU</TableCell>
//           <TableCell>Product</TableCell>
//           <TableCell align="center">Qty</TableCell>
//           <TableCell>Unit Price</TableCell>
//           <TableCell>Total</TableCell>
//           <TableCell>Status</TableCell>
//           <TableCell>Assigned To</TableCell>
//           <TableCell>Location</TableCell>
//           <TableCell align="center">QR</TableCell>
//         </TableRow>
//       </TableHead>

//       <TableBody>
//         {(orderDetails?.items || []).map((item) => (
//           <TableRow key={item.id}>
//             <TableCell>{item.sku || "-"}</TableCell>

//             <TableCell>
//               <Box>
//                 <Typography fontWeight={600}>
//                   {item.product_name}
//                 </Typography>

//                 {item.product_type && (
//                   <Typography
//                     variant="caption"
//                     color="text.secondary"
//                   >
//                     {item.product_type}
//                   </Typography>
//                 )}
//               </Box>
//             </TableCell>

//             <TableCell align="center">
//               {item.quantity}
//             </TableCell>

//             <TableCell>
//               £{Number(item.unit_price || 0).toFixed(2)}
//             </TableCell>

//             <TableCell>
//               £{Number(item.line_total || 0).toFixed(2)}
//             </TableCell>

            // <TableCell>
            //   <Chip
            //     size="small"
            //     label={item.processing_status_display}
            //     color={
            //       item.processing_status === "COMPLETED"
            //         ? "success"
            //         : item.processing_status === "PROCESSING"
            //         ? "warning"
            //         : "default"
            //     }
            //   />
            // </TableCell>

//             <TableCell>
//               {item.assigned_to_username || "-"}
//             </TableCell>

//             <TableCell>
//               <Box>
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                 >
//                   Primary:{" "}
//                   {item?.stock_detail?.primary_location ||
//                     "NA"}
//                 </Typography>

//                 <br />

//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                 >
//                   Secondary:{" "}
//                   {item?.stock_detail?.secondary_location ||
//                     "NA"}
//                 </Typography>
//               </Box>
//             </TableCell>

//             <TableCell
//               align="center"
//               sx={{ cursor: "pointer" }}
//               onClick={() =>
//                 window.open(
//                   getItemQrUrlLocal(
//                     selectedOrder.id,
//                     item.id
//                   ),
//                   "_blank"
//                 )
//               }
//             >
//               <QRCodeCanvas
//                 value={getItemQrUrl(
//                   selectedOrder.id,
//                   item.id
//                 )}
//                 size={100}
//                 level="H"
//                 includeMargin
//               />
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   )}
// </Section>

//               <Section title="Totals">
//                 <Grid container spacing={2}>
//                   <InfoRow
//                     label="Subtotal"
//                     value={`£${selectedOrder.subtotal}`}
//                   />
//                   <InfoRow label="Tax" value={`£${selectedOrder.tax_amount}`} />
//                   <InfoRow
//                     label="Shipping"
//                     value={`£${selectedOrder.shipping_cost}`}
//                   />
//                   <InfoRow
//                     label="Grand Total"
//                     value={`£${selectedOrder.total_amount}`}
//                   />
//                 </Grid>
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
  Grid,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken, getDecryptedData } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { QRCodeCanvas } from "qrcode.react";

/* ---------------- THEME COLORS ---------------- */
const THEME_BLUE = "#60a5fa";
const THEME_BLUE_LIGHT = "#93c5fd";
const THEME_BLUE_DARK = "#3b82f6";

/* ---------------- HELPERS ---------------- */
const InfoRow = ({ label, value }) => (
  <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120, color: "#374151" }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: "#4b5563" }}>
      {value || "-"}
    </Typography>
  </Box>
);

const Section = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" fontWeight={700} sx={{ color: THEME_BLUE_DARK, mb: 1, fontSize: "1rem" }}>
      {title}
    </Typography>
    <Divider sx={{ mb: 1.5, borderColor: "#e5e7eb" }} />
    {children}
  </Box>
);

const getProgressColor = (value) => {
  if (value <= 30) return "#ef4444";    // red-500
  if (value <= 70) return "#f59e0b";    // amber-500
  return "#22c55e";                     // green-500
};

const CompletionProgress = ({ value }) => {
  const clamped = Math.min(Math.max(value || 0, 0), 100);
  const color = getProgressColor(clamped);

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
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
      <Typography variant="body2" fontWeight={600} sx={{ color, minWidth: 36, textAlign: "right" }}>
        {clamped}%
      </Typography>
    </Box>
  );
};

/* ---------------- MAIN ---------------- */
const OrdersList = () => {
  const accessToken = getDecryptedAccessToken();
  const user = getDecryptedData();
  const isSuperUser = Boolean(user?.is_superuser);
  console.log("Current user:", user);
  const headers = {
    Authorization: accessToken
      ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}`
      : "",
    "Content-Type": "application/json",
  };

  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  // Dialog
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getItemQrUrl = (orderId, itemId) => {
    if (user?.is_superuser) {
      return `http://wims.cloud/admin-user/order-process-item/${orderId}/${itemId}`;
    }
    return `http://wims.cloud/employee-user/order-process-item/${orderId}/${itemId}`;
  };

  const getItemQrUrlLocal = (orderId, itemId) => {
    if (user?.is_superuser) {
      return `${window.location.origin}/admin-user/order-process-item/${orderId}/${itemId}`;
    }
    return `${window.location.origin}/employee-user/order-process-item/${orderId}/${itemId}`;
  };

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

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      try {
        const importRes = await ApiServices.get(
          "orders/import_from_remote_tiaknightfabrics/",
          headers
        );
        console.log("Import API response:", importRes);
        if (importRes?.data?.message) {
          console.log("Import success:", importRes.data.message);
        }
      } catch (importError) {
        console.warn("Import API failed, continuing...", importError);
      }

      const res = await ApiServices.get("orders/", headers);
      const results = Array.isArray(res?.data?.results) ? res.data.results : [];
      setOrders(results);
      setCount(res?.data?.count ?? results.length);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredOrders = useMemo(() => {
    const s = search.toLowerCase();
    return orders.filter(
      (o) =>
        (!search ||
          o?.external_order_id?.toLowerCase().includes(s) ||
          o?.customer_name?.toLowerCase().includes(s) ||
          o?.customer_email?.toLowerCase().includes(s)) &&
        (!orderStatus || o?.order_status === orderStatus) &&
        (!paymentStatus || o?.payment_status === paymentStatus)
    );
  }, [orders, search, orderStatus, paymentStatus]);

  /* ---------------- ROWS ---------------- */
  const rows = useMemo(() => {
    return filteredOrders.map((o, i) => ({
      id: o?.id ?? i,
      external_order_id: o?.external_order_id || "-",
      customer_name: o?.customer_name || "-",
      order_status: o?.order_status,
      order_status_display: o?.order_status_display,
      completion_percentage: Number(o?.completion_percentage ?? 0),
      item_count: o?.item_count ?? 0,
      total_quantity: o?.total_quantity ?? 0,
      order_date: o?.order_date || null,
      total_amount: o?.total_amount ?? null,
      raw: o,
    }));
  }, [filteredOrders]);

  /* ---------------- COLUMNS ---------------- */
  const columns = [
    {
      field: "external_order_id",
      headerName: "Order",
      flex: 1.2,
      renderCell: ({ row }) => (
        <Button
          size="small"
          sx={{ textTransform: "none", color: THEME_BLUE_DARK, fontWeight: 600 }}
          onClick={() => {
            setSelectedOrder(row.raw);
            setOpen(true);
            fetchOrderDetails(row.id);
          }}
        >
          {row.external_order_id}
        </Button>
      ),
    },
    { field: "customer_name", headerName: "Customer", flex: 1.4 },
    {
      field: "order_status",
      headerName: "Order Status",
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.order_status_display || row.order_status || "-"}
          sx={{
            backgroundColor:
              row.order_status === "delivered"
                ? "#dcfce7"
                : row.order_status === "processing"
                ? "#dbeafe"
                : row.order_status === "confirmed"
                ? "#fef3c7"
                : "#f3f4f6",
            color:
              row.order_status === "delivered"
                ? "#166534"
                : row.order_status === "processing"
                ? "#1e40af"
                : row.order_status === "confirmed"
                ? "#92400e"
                : "#374151",
            fontWeight: 500,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    {
      field: "completion_percentage",
      headerName: "Completion",
      flex: 1.4,
      renderCell: ({ row }) => <CompletionProgress value={row.completion_percentage} />,
    },
    { field: "item_count", headerName: "Items", flex: 0.6 },
    { field: "total_quantity", headerName: "Qty", flex: 0.6 },
    {
      field: "order_date",
      headerName: "Order Date",
      flex: 1.2,
      renderCell: ({ row }) =>
        row.order_date ? new Date(row.order_date).toLocaleDateString() : "-",
    },
    {
      field: "total_amount",
      headerName: "Total (£)",
      flex: 0.8,
      renderCell: ({ row }) => {
        const amount = Number(row.total_amount || 0);
        return `£${amount.toFixed(2)}`;
      },
    },
    ...(isSuperUser
      ? [
          {
            field: "actions",
            headerName: "Actions",
            flex: 1.1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
              <Button
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon />}
                sx={{
                  whiteSpace: "nowrap",
                  minWidth: 130,
                  borderColor: THEME_BLUE,
                  color: THEME_BLUE_DARK,
                  textTransform: "none",
                  "&:hover": { borderColor: THEME_BLUE_DARK, backgroundColor: "#eff6ff" },
                }}
                onClick={() =>
                  window.open(`/admin-user/order-processing/${row.id}`, "_blank")
                }
              >
                Show Details
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} sx={{ color: "#1f2937", mb: 2 }}>
        Orders ({count})
      </Typography>

      {/* ---------------- FILTER BAR ---------------- */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            minWidth: 220,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#f9fafb",
            },
          }}
        />

        <TextField
          select
          size="small"
          label="Order Status"
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="processing">Processing</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Payment Status"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="unpaid">Unpaid</MenuItem>
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ---------------- TABLE ---------------- */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          hideFooterPagination={false}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              fontWeight: 600,
              color: "#374151",
              borderBottom: "1px solid #e5e7eb",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f3f4f6",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f8fafc",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f8fafc",
            },
          }}
        />
      </Paper>

      {/* ---------------- DETAILS DIALOG ---------------- */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setOrderDetails(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1, color: "#1f2937", fontWeight: 700 }}>
          Order Details
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#fafafa" }}>
          {selectedOrder && (
            <>
              <Section title="Order Info">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Order ID" value={selectedOrder.external_order_id} />
                    <InfoRow label="Customer" value={selectedOrder.customer_name} />
                    <InfoRow label="Email" value={selectedOrder.customer_email} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Order Status" value={selectedOrder.order_status_display} />
                    <InfoRow label="Payment Status" value={selectedOrder.payment_status} />
                    <InfoRow label="Order Date" value={selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : "-"} />
                  </Grid>
                </Grid>
              </Section>

              <Section title="Financials">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Subtotal" value={`£${Number(selectedOrder.subtotal || 0).toFixed(2)}`} />
                    <InfoRow label="Tax" value={`£${Number(selectedOrder.tax || 0).toFixed(2)}`} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Discount" value={`£${Number(selectedOrder.discount || 0).toFixed(2)}`} />
                    <InfoRow label="Total Amount" value={`£${Number(selectedOrder.total_amount || 0).toFixed(2)}`} />
                  </Grid>
                </Grid>
              </Section>

              <Section title="Order Items">
                {detailsLoading ? (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">Loading items...</Typography>
                  </Box>
                ) : (
                  <Table size="small" sx={{ backgroundColor: "#fff", borderRadius: 1 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }} align="right">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }} align="right">Total</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Assigned To</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }} align="center">QR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(orderDetails?.items || []).map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ color: "#4b5563" }}>{item.sku || "-"}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500} sx={{ color: "#1f2937" }}>
                                {item.product_name}
                              </Typography>
                              {item.product_type && (
                                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                                  {item.product_type}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#4b5563" }}>{item.quantity}</TableCell>
                          <TableCell align="right" sx={{ color: "#4b5563" }}>
                            £{Number(item.unit_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#4b5563" }}>
                            £{Number(item.line_total || 0).toFixed(2)}
                          </TableCell>
                                     <TableCell>
              <Chip
                size="small"
                label={item.processing_status_display}
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
                          <TableCell sx={{ color: "#4b5563" }}>
                            {item.assigned_to_username || "-"}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                Primary: {item?.stock_detail?.primary_location || "NA"}
                              </Typography>
                              <br />
                              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                Secondary: {item?.stock_detail?.secondary_location || "NA"}
                              </Typography>
                            </Box>
                          </TableCell>
                         <TableCell
              align="center"
              sx={{ cursor: "pointer" }}
              onClick={() =>
                window.open(
                  getItemQrUrlLocal(
                    selectedOrder.id,
                    item.id
                  ),
                  "_blank"
                )
              }
            >
              <QRCodeCanvas
                value={getItemQrUrl(
                  selectedOrder.id,
                  item.id
                )}
                size={100}
                level="H"
                includeMargin
              />
            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Section>

              <Section title="Shipping">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Method" value={orderDetails?.shipping_method} />
                    <InfoRow label="Cost" value={`£${Number(orderDetails?.shipping_cost || 0).toFixed(2)}`} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Tracking" value={orderDetails?.tracking_number} />
                    <InfoRow label="Carrier" value={orderDetails?.shipping_carrier} />
                  </Grid>
                </Grid>
              </Section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrdersList;
