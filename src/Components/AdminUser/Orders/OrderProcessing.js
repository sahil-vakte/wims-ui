import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

/* ---------------- THEME COLORS ---------------- */
const THEME_BLUE = "#60a5fa";
const THEME_BLUE_LIGHT = "#93c5fd";
const THEME_BLUE_DARK = "#3b82f6";

/* ---------------- STATUS COLORS (dark text -> visible on white) ---------------- */
const getStatusStyle = (status) => {
  switch (status) {
    case "delivered":
    case "completed":
    case "paid":
      return { bg: "#dcfce7", color: "#166534" };
    case "processing":
    case "in_progress":
      return { bg: "#dbeafe", color: "#1e40af" };
    case "confirmed":
    case "pending":
      return { bg: "#fef3c7", color: "#92400e" };
    case "unpaid":
    case "cancelled":
      return { bg: "#fee2e2", color: "#991b1b" };
    default:
      return { bg: "#f3f4f6", color: "#374151" };
  }
};

const StatusChip = ({ status, label }) => {
  const s = getStatusStyle(status);
  return (
    <Chip
      size="small"
      label={label || status || "-"}
      sx={{
        backgroundColor: s.bg,
        color: s.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "capitalize",
      }}
    />
  );
};

/* ---------------- HELPERS ---------------- */
const InfoRow = ({ label, value }) => (
  <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
    <Typography
      variant="body2"
      fontWeight={600}
      sx={{ minWidth: 130, color: "#374151" }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: "#4b5563", wordBreak: "break-word" }}>
      {value || "-"}
    </Typography>
  </Box>
);

const Section = ({ title, action, children }) => (
  <Paper
    elevation={1}
    sx={{
      p: { xs: 2, sm: 3 },
      mb: 3,
      borderRadius: 3,
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ color: THEME_BLUE_DARK, fontSize: "1rem" }}
      >
        {title}
      </Typography>
      {action}
    </Box>
    <Divider sx={{ mb: 2, borderColor: "#e5e7eb" }} />
    {children}
  </Paper>
);

/* ---------------- MAIN ---------------- */
const OrderProcessing = () => {
  const { id } = useParams();
  const accessToken = getDecryptedAccessToken();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const headers = {
    Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
    "Content-Type": "application/json",
  };

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }
    fetchOrder();
    // eslint-disable-next-line
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await ApiServices.get(`orders/${id}/`, headers);
      setOrder(res?.data);
    } catch {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: THEME_BLUE }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 3, backgroundColor: "#ffffff", minHeight: "100vh" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!order)
    return (
      <Box sx={{ p: 3, backgroundColor: "#ffffff", minHeight: "100vh" }}>
        <Alert severity="info">No order found.</Alert>
      </Box>
    );

  const money = (v) => `£${Number(v || 0).toFixed(2)}`;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" fontWeight={700} sx={{ color: "#1f2937", mb: 3 }}>
        Order Processing
      </Typography>

      {/* ---------------- ORDER SUMMARY ---------------- */}
      <Section title="Order Summary">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Order ID" value={order.external_order_id || order.id} />
            <InfoRow
              label="Order Date"
              value={
                order.order_date
                  ? new Date(order.order_date).toLocaleString()
                  : "-"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ minWidth: 130, color: "#374151" }}
              >
                Order Status
              </Typography>
              <StatusChip
                status={order.order_status}
                label={order.order_status_display || order.order_status}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ minWidth: 130, color: "#374151" }}
              >
                Payment Status
              </Typography>
              <StatusChip
                status={order.payment_status}
                label={order.payment_status_display || order.payment_status}
              />
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* ---------------- CUSTOMER ---------------- */}
      <Section title="Customer">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Name" value={order.customer_name} />
            <InfoRow label="Email" value={order.customer_email} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Phone" value={order.customer_phone} />
            <InfoRow label="Address" value={order.shipping_address} />
          </Grid>
        </Grid>
      </Section>

      {/* ---------------- ORDER ITEMS ---------------- */}
      <Section title="Order Items">
        {isMobile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(order.items || []).map((item) => (
              <Card
                key={item.id || item.sku}
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: "#e5e7eb" }}
              >
                <CardContent>
                  <Typography fontWeight={700} sx={{ color: "#1f2937" }}>
                    {item.product_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280" }}>
                    SKU: {item.sku}
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: "#e5e7eb" }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      Qty: {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      {money(item.unit_price)} each
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: THEME_BLUE_DARK, mt: 0.5 }}
                  >
                    Total: {money(item.line_total)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Unit Price (£)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Tax %</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Total (£)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.items || []).map((item) => (
                  <TableRow key={item.id || item.sku} hover>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.unit_price}</TableCell>
                    <TableCell align="right">{item.tax_rate}%</TableCell>
                    <TableCell align="right">{item.line_total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Section>

      {/* ---------------- TOTALS ---------------- */}
      <Section title="Payment Summary">
        <Box sx={{ maxWidth: 360, ml: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>Subtotal</Typography>
            <Typography variant="body2" sx={{ color: "#374151" }}>
              {money(order.subtotal ?? order.sub_total)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>Tax</Typography>
            <Typography variant="body2" sx={{ color: "#374151" }}>
              {money(order.tax_amount)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>Shipping</Typography>
            <Typography variant="body2" sx={{ color: "#374151" }}>
              {money(order.shipping_amount)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5, borderColor: "#e5e7eb" }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "#eff6ff",
              border: `1px solid ${THEME_BLUE_LIGHT}`,
            }}
          >
            <Typography fontWeight={700} sx={{ color: THEME_BLUE_DARK }}>
              Grand Total
            </Typography>
            <Typography fontWeight={800} sx={{ color: THEME_BLUE_DARK, fontSize: "1.15rem" }}>
              {money(order.total_amount)}
            </Typography>
          </Box>
        </Box>
      </Section>
    </Box>
  );
};

export default OrderProcessing;
