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
  Card,
  CardContent,
  Button,
} from "@mui/material";
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

/* ---------- MAIN COMPONENT ---------- */

const OrderProcessByItem = () => {
  const { orderId, itemId } = useParams();
  const accessToken = getDecryptedAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
    "Content-Type": "application/json",
  };

  const [order, setOrder] = useState(null);
  const [item, setItem] = useState(null);
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
      const res = await ApiServices.get(`orders/${orderId}/`, headers);
      const orderData = res?.data;

      const foundItem = (orderData?.items || []).find(
        (i) => String(i.id) === String(itemId)
      );

      if (!foundItem) {
        setError("Order item not found.");
        return;
      }

      setOrder(orderData);
      setItem(foundItem);
    } catch {
      setError("Failed to fetch order item details.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- STATES ---------- */

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

  /* ---------- UI ---------- */

  return (
    <>
      <Box p={{ xs: 2, md: 4 }} maxWidth="900px" mx="auto">
        <Typography variant="h4" fontWeight={800} mb={3}>
          Process Order Item
        </Typography>

        {/* ORDER CONTEXT */}
        <Section title="Order Information">
          <Grid container spacing={2}>
            <InfoRow label="Order Number" value={order.order_number} />
            <InfoRow label="External Order ID" value={order.external_order_id} />
            <InfoRow label="Customer" value={order.customer_name} />
            <Grid item xs={12}>
              <Chip
                label={order.order_status_display}
                color="info"
                size="small"
              />
            </Grid>
          </Grid>
        </Section>

        {/* ITEM DETAILS */}
        <Section title="Item Details">
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                {item.product_name}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                SKU: {item.sku}
              </Typography>

              <Grid container spacing={2}>
                <InfoRow label="Quantity" value={item.quantity} />
                <InfoRow label="Unit Price" value={`£${item.unit_price}`} />
                <InfoRow label="Tax Rate" value={`${item.tax_rate}%`} />
                <InfoRow label="Line Total" value={`£${item.line_total}`} />
              </Grid>
            </CardContent>
          </Card>
        </Section>
      </Box>

      {/* ACTION BAR */}
      <Paper
        elevation={10}
        sx={{
          position: "sticky",
          bottom: 0,
          borderTop: "1px solid #ddd",
          p: 2,
        }}
      >
        <Box
          maxWidth="900px"
          mx="auto"
          display="flex"
          justifyContent="flex-end"
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 3,
            }}
            onClick={() =>
              console.log("Start processing item", orderId, itemId)
            }
          >
            Start Item Processing
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default OrderProcessByItem;
