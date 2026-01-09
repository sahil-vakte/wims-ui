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
  Button,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

/* ---------- HELPERS ---------- */

const InfoRow = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography fontWeight={600}>{value || "-"}</Typography>
  </Grid>
);

const Section = ({ title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 },
      mb: 3,
      borderRadius: 3,
      border: "1px solid #eaeaea",
    }}
  >
    <Typography variant="h6" fontWeight={700} mb={2}>
      {title}
    </Typography>
    {children}
  </Paper>
);

/* ---------- MAIN ---------- */

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
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <>
      {/* MAIN CONTENT */}
      <Box p={{ xs: 2, md: 4 }} pb={12} maxWidth="1200px" mx="auto">
        <Typography variant="h4" fontWeight={800} mb={3}>
          Order Processing
        </Typography>

        {/* ORDER SUMMARY */}
        <Section title="Order Summary">
          <Grid container spacing={2}>
            <InfoRow label="Order Number" value={order.order_number} />
            <InfoRow label="External Order ID" value={order.external_order_id} />

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Order Status
              </Typography>
              <Chip
                sx={{ mt: 0.5 }}
                label={order.order_status_display}
                color={
                  order.order_status === "CONFIRMED"
                    ? "info"
                    : order.order_status === "DELIVERED"
                    ? "success"
                    : "warning"
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Payment Status
              </Typography>
              <Chip
                sx={{ mt: 0.5 }}
                label={order.payment_status_display}
                color={order.is_paid ? "success" : "error"}
              />
            </Grid>

            <InfoRow
              label="Order Date"
              value={
                order.order_date
                  ? new Date(order.order_date).toLocaleString()
                  : "-"
              }
            />
            <InfoRow label="Payment Method" value={order.payment_method} />
            <InfoRow label="Assigned To" value={order.assigned_to_username} />
          </Grid>
        </Section>

        {/* CUSTOMER */}
        <Section title="Customer & Address">
          <Grid container spacing={2}>
            <InfoRow label="Customer Name" value={order.customer_name} />
            <InfoRow label="Email" value={order.customer_email} />
            <InfoRow label="Phone" value={order.customer_phone} />
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <InfoRow label="Shipping Address" value={order.shipping_address} />
            <InfoRow label="Billing Address" value={order.billing_address} />
          </Grid>
        </Section>

        {/* ORDER ITEMS */}
        <Section title="Order Items">
          {isMobile ? (
            <Grid container spacing={2}>
              {(order.items || []).map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography fontWeight={700}>
                        {item.product_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {item.sku}
                      </Typography>

                      <Grid container spacing={1} mt={1}>
                        <Grid item xs={6}>Qty: {item.quantity}</Grid>
                        <Grid item xs={6}>
                          £{item.unit_price} each
                        </Grid>
                        <Grid item xs={12} fontWeight={700}>
                          Total: £{item.line_total}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell>Unit Price (£)</TableCell>
                  <TableCell>Tax %</TableCell>
                  <TableCell>Total (£)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.items || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell>{item.unit_price}</TableCell>
                    <TableCell>{item.tax_rate}%</TableCell>
                    <TableCell>{item.line_total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Section>

        {/* TOTAL */}
        <Section title="Financial Summary">
          <Grid container spacing={2}>
            <InfoRow label="Subtotal" value={`£${order.subtotal}`} />
            <InfoRow label="Tax" value={`£${order.tax_amount}`} />
            <InfoRow label="Shipping" value={`£${order.shipping_cost}`} />
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" fontWeight={800}>
                Grand Total
              </Typography>
              <Typography variant="h5" color="primary" fontWeight={900}>
                £{order.total_amount}
              </Typography>
            </Grid>
          </Grid>
        </Section>
      </Box>

      {/* ACTION BAR */}
      <Paper
        elevation={10}
        sx={{
        //   position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
        //   p: 2,
          borderTop: "1px solid #ddd",
        }}
      >
        <Box maxWidth="1200px" mx="auto" textAlign="right">
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 3,
            }}
            onClick={() => console.log("Start Processing", order.id)}
          >
            Start Order Processing
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default OrderProcessing;
