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
  CircularProgress,
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
import { QRCodeCanvas } from "qrcode.react";

const THEME_BLUE = "#60a5fa";
const THEME_BLUE_DARK = "#3b82f6";

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

const getProgressColor = (value) => {
  if (value <= 30) return "#ef4444";
  if (value <= 70) return "#f59e0b";
  return "#22c55e";
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

const formatDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
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

const TIAKNIGHT_BASE_URL = "https://www.tiaknightfabrics.co.uk";

const buildChildProductUrl = (childProductUrl) => {
  if (!childProductUrl) return TIAKNIGHT_BASE_URL;

  if (childProductUrl.startsWith("http")) return childProductUrl;

  return `${TIAKNIGHT_BASE_URL}${childProductUrl.startsWith("/") ? "" : "/"}${childProductUrl}`;
};

const buildQrUrl = (orderId, itemId, childProductUrl) => {
  const productUrl = buildChildProductUrl(childProductUrl);
  const url = new URL(productUrl);

  url.searchParams.set("wims_order_id", orderId);
  url.searchParams.set("wims_item_id", itemId);

  return url.toString();
};

const OrdersList = () => {
  const accessToken = getDecryptedAccessToken();
  const user = getDecryptedData();
  const isSuperUser = Boolean(user?.is_superuser);

  const headers = {
    Authorization: accessToken ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}` : "",
    "Content-Type": "application/json",
  };

  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [minDateTime, setMinDateTime] = useState(getDefaultStartDateTime());
  const [maxDateTime, setMaxDateTime] = useState(getDefaultEndDateTime());

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [packageFormat, setPackageFormat] = useState("Letter");
  const [shippingNotes, setShippingNotes] = useState("Booked through Royal Mail Click & Drop API");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  useEffect(() => {
    fetchOrders(paginationModel.page + 1, paginationModel.pageSize);
  }, [paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchOrders(1, paginationModel.pageSize);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, orderStatus, paymentStatus, minDateTime, maxDateTime]);

  // const getItemQrUrl = (orderId, itemId) => {
  //   return `http://wims.cloud/employee-user/order-process-item/${orderId}/${itemId}`;
  // };

  const getItemQrUrl = (orderId, itemId, childProductUrl) => {
  return buildQrUrl(orderId, itemId, childProductUrl);
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

  const fetchOrders = async (page = 1, pageSize = 50) => {
    setLoading(true);
    setError("");

    try {
      if (page === 1) {
        try {
          await ApiServices.get("orders/import_from_remote_tiaknightfabrics/", headers);
        } catch (importError) {
          console.warn("Import API failed, continuing...", importError);
        }
      }

      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("page_size", pageSize);

      if (search.trim()) queryParams.append("search", search.trim());
      if (orderStatus) queryParams.append("order_status", orderStatus);
      if (paymentStatus) queryParams.append("payment_status", paymentStatus);

      if (minDateTime) queryParams.append("order_date_after", new Date(minDateTime).toISOString());
      if (maxDateTime) queryParams.append("order_date_before", new Date(maxDateTime).toISOString());

      const res = await ApiServices.get(`orders/?${queryParams.toString()}`, headers);

      const results = Array.isArray(res?.data?.results) ? res.data.results : [];

      setOrders(results);
      setCount(res?.data?.count ?? results.length);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      setOrders([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(paginationModel.page + 1, paginationModel.pageSize);
  };

  const openShippingDialog = (order) => {
    setShippingOrder(order);
    setPackageFormat("Letter");
    setShippingNotes("Booked through Royal Mail Click & Drop API");
    setBookingError("");
    setBookingSuccess("");
    setShippingDialogOpen(true);
  };

  const closeShippingDialog = () => {
    if (bookingLoading) return;
    setShippingDialogOpen(false);
    setShippingOrder(null);
  };

  const handleBookRoyalMailShipping = async () => {
    if (!shippingOrder) return;

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
        headers
      );

      setBookingSuccess("Royal Mail shipping booked successfully.");
      await fetchOrders(paginationModel.page + 1, paginationModel.pageSize);

      setTimeout(() => {
        closeShippingDialog();
      }, 700);
    } catch (err) {
      console.error(err);
      setBookingError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to book Royal Mail shipping."
      );
    } finally {
      setBookingLoading(false);
    }
  };

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
      raw: o,
    }));
  }, [orders]);

  const columns = [
    {
      field: "external_order_id",
      headerName: "Order",
      flex: 1.2,
      minWidth: 130,
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
    {
      field: "customer_name",
      headerName: "Customer",
      flex: 1.4,
      minWidth: 170,
    },
    {
      field: "order_status",
      headerName: "Order Status",
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.order_status_display || row.order_status || "-"}
          sx={{
            backgroundColor:
              row.order_status === "SHIPPED" || row.order_status === "DELIVERED"
                ? "#dcfce7"
                : row.order_status === "PROCESSING"
                ? "#dbeafe"
                : row.order_status === "NEW" || row.order_status === "CONFIRMED"
                ? "#fef3c7"
                : "#f3f4f6",
            color:
              row.order_status === "SHIPPED" || row.order_status === "DELIVERED"
                ? "#166534"
                : row.order_status === "PROCESSING"
                ? "#1e40af"
                : row.order_status === "NEW" || row.order_status === "CONFIRMED"
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
      minWidth: 160,
      renderCell: ({ row }) => <CompletionProgress value={row.completion_percentage} />,
    },
    {
      field: "total_weight_gm",
      headerName: "Weight(g)",
      flex: 0.8,
      minWidth: 100,
      renderCell: ({ row }) => row.total_weight_gm || "NA",
    },
    {
      field: "item_count",
      headerName: "Items",
      flex: 0.6,
      minWidth: 80,
    },
    {
      field: "total_quantity",
      headerName: "Qty",
      flex: 0.6,
      minWidth: 80,
    },
    {
      field: "order_date",
      headerName: "Order Date",
      flex: 1.2,
      minWidth: 150,
      renderCell: ({ row }) =>
        row.order_date ? new Date(row.order_date).toLocaleString() : "-",
    },
    {
      field: "courier_short_name",
      headerName: "Courier",
      flex: 0.9,
      minWidth: 130,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.courier_short_name || "NA"}
          sx={{
            backgroundColor: "#eef2ff",
            color: "#3730a3",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    {
      field: "total_amount",
      headerName: "Total (£)",
      flex: 0.8,
      minWidth: 100,
      renderCell: ({ row }) => `£${Number(row.total_amount || 0).toFixed(2)}`,
    },
    {
      field: "complete_order",
      headerName: "Complete Order",
      flex: 1.3,
      minWidth: 170,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const isCompleted = Number(row.completion_percentage) === 100;

        return (
          <Button
            variant="contained"
            size="small"
            disabled={!isCompleted}
            startIcon={<LocalShippingIcon />}
            sx={{
              textTransform: "none",
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
                  "&:hover": {
                    borderColor: THEME_BLUE_DARK,
                    backgroundColor: "#eff6ff",
                  },
                }}
                onClick={() => window.open(`/admin-user/order-processing/${row.id}`, "_blank")}
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
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: "#1f2937" }}>
          Orders ({count})
        </Typography>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{
            textTransform: "none",
            backgroundColor: THEME_BLUE_DARK,
            "&:hover": { backgroundColor: "#2563eb" },
          }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />

        <TextField
          select
          size="small"
          label="Order Status"
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          sx={{ minWidth: 140 }}
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
          size="small"
          label="Payment Status"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PAID">Paid</MenuItem>
          <MenuItem value="UNPAID">Unpaid</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
        </TextField>

        <TextField
          size="small"
          type="datetime-local"
          label="Min Date & Time"
          value={minDateTime}
          onChange={(e) => setMinDateTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 220 }}
        />

        <TextField
          size="small"
          type="datetime-local"
          label="Max Date & Time"
          value={maxDateTime}
          onChange={(e) => setMaxDateTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 220 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          pagination
          paginationMode="server"
          rowCount={count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
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

      <Dialog open={shippingDialogOpen} onClose={closeShippingDialog} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Confirm Royal Mail Shipping</DialogTitle>

        <DialogContent dividers>
          {shippingOrder && (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Alert severity="info">
                Please verify package details before booking Royal Mail shipping.
              </Alert>

              {bookingError && <Alert severity="error">{bookingError}</Alert>}
              {bookingSuccess && <Alert severity="success">{bookingSuccess}</Alert>}

              <InfoRow label="Order" value={shippingOrder.external_order_id} />
              <InfoRow label="Weight" value={`${shippingOrder.total_weight_gm || 0} grams`} />
              <InfoRow label="Service Code" value={shippingOrder.courier_service_code || "NA"} />
              <InfoRow label="Courier" value={shippingOrder.courier_service_name || "NA"} />

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

        <DialogActions>
          <Button onClick={closeShippingDialog} disabled={bookingLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBookRoyalMailShipping}
            disabled={bookingLoading}
            sx={{
              textTransform: "none",
              backgroundColor: THEME_BLUE_DARK,
              "&:hover": { backgroundColor: "#2563eb" },
            }}
          >
            {bookingLoading ? <CircularProgress size={22} color="inherit" /> : "Confirm & Book"}
          </Button>
        </DialogActions>
      </Dialog>

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
                    <InfoRow label="Order Number" value={selectedOrder.order_number} />
                    <InfoRow label="Customer" value={selectedOrder.customer_name} />
                    <InfoRow label="Email" value={selectedOrder.customer_email} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <InfoRow label="Order Status" value={selectedOrder.order_status_display || selectedOrder.order_status} />
                    <InfoRow label="Payment Status" value={selectedOrder.payment_status_display || selectedOrder.payment_status} />
                    <InfoRow label="Order Date" value={selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString() : "-"} />
                    <InfoRow label="Total Weight" value={`${selectedOrder.total_weight_gm || 0} grams`} />
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
                  <Table size="small" sx={{ backgroundColor: "#fff" }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Weight(g)</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">QR</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {(orderDetails?.items || []).map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.sku || "-"}</TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={500} sx={{ color: "#1f2937" }}>
                              {item.product_name || "-"}
                            </Typography>
                            {item.product_type && (
                              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                                {item.product_type}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.total_weight_gm || "NA"}</TableCell>
                          <TableCell align="right">£{Number(item.unit_price || 0).toFixed(2)}</TableCell>
                          <TableCell align="right">£{Number(item.line_total || 0).toFixed(2)}</TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={item.processing_status_display || item.processing_status || "-"}
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

                          <TableCell>{item.assigned_to_username || "-"}</TableCell>

                          <TableCell>
                            <Typography variant="caption" sx={{ color: "#6b7280" }}>
                              Primary: {item?.stock_detail?.primary_location || "NA"}
                            </Typography>
                            <br />
                            <Typography variant="caption" sx={{ color: "#6b7280" }}>
                              Secondary: {item?.stock_detail?.secondary_location || "NA"}
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{ cursor: "pointer" }}
                            onClick={() => window.open(getItemQrUrlLocal(selectedOrder.id, item.id), "_blank")}
                          >
                              {/* <QRCodeCanvas
                                value={getItemQrUrl(selectedOrder.id, item.id)}
                                size={100}
                                level="H"
                                includeMargin
                              /> */}

                              <QRCodeCanvas
  value={getItemQrUrl(
    selectedOrder.id,
    item.id,
    item.child_product_url
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrdersList;