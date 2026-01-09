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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { QRCodeCanvas } from "qrcode.react"; 
/* ---------------- HELPERS ---------------- */
const InfoRow = ({ label, value }) => (
  <Grid item xs={12} md={6}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography fontWeight={500}>{value || "-"}</Typography>
  </Grid>
);

const Section = ({ title, children }) => (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Typography variant="h6" mb={2}>
      {title}
    </Typography>
    {children}
  </Paper>
);

/* ---------------- MAIN ---------------- */
const OrdersList = () => {
  const accessToken = getDecryptedAccessToken();

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

  useEffect(() => {
    fetchOrders();
  }, []);
const getItemQrUrl = (orderId, itemId) =>
  `http://192.168.1.5:3001/employee-user/order-process-item/${orderId}/${itemId}`;

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ApiServices.get("orders/", headers);
      const results = Array.isArray(res?.data?.results) ? res.data.results : [];
      setOrders(results);
      setCount(res?.data?.count ?? results.length);
    } catch (err) {
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

      payment_status: o?.payment_status,
      payment_status_display: o?.payment_status_display,

      item_count: o?.item_count ?? 0,
      total_quantity: o?.total_quantity ?? 0,

      // ✅ MUST EXIST IN ROWS
      order_date: o?.order_date || null,
      total_amount: o?.total_amount || null,

      payment_method: o?.payment_method || "-",

      raw: o, // keep raw for dialog
    }));
  }, [filteredOrders]);

  /* ---------------- COLUMNS ---------------- */
  const columns = [
    {
      field: "external_order_id",
      headerName: "Order",
      flex: 1.2,
      renderCell: ({ row }) => (
        <Typography
          fontWeight={600}
          sx={{ color: "primary.main", cursor: "pointer" }}
          onClick={() => {
            setSelectedOrder(row.raw);
            setOpen(true);
          }}
        >
          {row.external_order_id}
        </Typography>
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
          label={row.order_status_display}
          color={
            row.order_status === "PROCESSING"
              ? "warning"
              : row.order_status === "DELIVERED"
              ? "success"
              : "info"
          }
        />
      ),
    },

    {
      field: "payment_status",
      headerName: "Payment",
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.payment_status_display}
          color={row.payment_status === "PAID" ? "success" : "error"}
        />
      ),
    },

    { field: "item_count", headerName: "Items", flex: 0.6 },
    { field: "total_quantity", headerName: "Qty", flex: 0.6 },

    {
      field: "order_date",
      headerName: "Order Date",
      flex: 1.2,
      valueFormatter: (params) => {
        const value = params?.value;
        if (!value) return "-";
        return new Date(value).toLocaleDateString();
      },
    },

    {
      field: "total_amount",
      headerName: "Total (£)",
      flex: 0.8,
      valueFormatter: (params) => {
        const value = params?.value;
        if (!value) return "£0.00";
        return `£${Number(value).toFixed(2)}`;
      },
    },

    { field: "payment_method", headerName: "Payment Method", flex: 1.2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open(`/admin-user/order-processing/${row.id}`, "_blank")}
        >
          Show Details
        </Button>
      ),
    },
    {
      field: "qr",
      headerName: "QR",
      flex: 0.7,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        // const qrUrl = `${window.location.origin}/admin-user/order-processing/${row.id}`;
        const qrUrl = `http://192.168.1.5:3001/employee-user/order-processing/${row.id}`;

        return (
          <QRCodeCanvas
            value={qrUrl}
            bgColor="#ffffff"
            fgColor="#000000"
            size={90}            // ⭐ table-optimized size
            level="H"  
            includeMargin
          />
        );
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Orders ({count})
      </Typography>

      {/* ---------------- FILTER BAR ---------------- */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Orders"
              placeholder="Order ID, customer name, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Order Status"
              helperText="Filter by order state"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Payment Status"
              helperText="Filter by payment"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="UNPAID">Unpaid</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {/* ---------------- TABLE ---------------- */}
      <Paper sx={{ height: 640 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection // ✅ row + select all
          disableRowSelectionOnClick
          getRowHeight={() => 120} 
          pageSizeOptions={[10, 25, 50, 100]} // ✅ rows per page selector
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f7fa",
              fontWeight: 600,
            },
          }}
        />
      </Paper>

      {/* ---------------- DETAILS DIALOG ---------------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle fontWeight={600}>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Section title="Order Summary">
                <Grid container spacing={2}>
                  <InfoRow
                    label="Order Number"
                    value={selectedOrder.order_number}
                  />
                  <InfoRow
                    label="External ID"
                    value={selectedOrder.external_order_id}
                  />
                  <InfoRow
                    label="Order Status"
                    value={selectedOrder.order_status_display}
                  />
                  <InfoRow
                    label="Payment Status"
                    value={selectedOrder.payment_status_display}
                  />
                  <InfoRow
                    label="Order Date"
                    value={
                      selectedOrder.order_date
                        ? new Date(selectedOrder.order_date).toLocaleString()
                        : "-"
                    }
                  />
                </Grid>
              </Section>

              <Section title="Customer & Address">
                <Grid container spacing={2}>
                  <InfoRow
                    label="Customer"
                    value={selectedOrder.customer_name}
                  />
                  <InfoRow label="Email" value={selectedOrder.customer_email} />
                  <InfoRow
                    label="Shipping Address"
                    value={selectedOrder.shipping_address}
                  />
                  <InfoRow
                    label="Billing Address"
                    value={selectedOrder.billing_address}
                  />
                </Grid>
              </Section>

              <Section title="Order Items">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell align="center">QR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedOrder.items || []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell>£{item.unit_price}</TableCell>
                        <TableCell>£{item.line_total}</TableCell>
                        <TableCell align="center">
            <QRCodeCanvas
              value={getItemQrUrl(selectedOrder.id, item.id)}
              size={80}
              level="H"
              includeMargin
            />
          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Section>

              <Section title="Totals">
                <Grid container spacing={2}>
                  <InfoRow
                    label="Subtotal"
                    value={`£${selectedOrder.subtotal}`}
                  />
                  <InfoRow label="Tax" value={`£${selectedOrder.tax_amount}`} />
                  <InfoRow
                    label="Shipping"
                    value={`£${selectedOrder.shipping_cost}`}
                  />
                  <InfoRow
                    label="Grand Total"
                    value={`£${selectedOrder.total_amount}`}
                  />
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
