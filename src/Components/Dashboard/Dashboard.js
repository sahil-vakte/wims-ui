import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import ApiServices from "../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../Services/LoginUserDetails.js/LoginUserSavedDetails";

/* ============================================================
 * Design tokens — light, professional dashboard
 * ============================================================ */
const T = {
  bg: "#f6f8fb",
  card: "#ffffff",
  text: "#0f172a",
  textSoft: "#334155",
  muted: "#64748b",
  border: "#e6eaf0",
  borderSoft: "#eef1f6",
  shadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)",
  shadowHover: "0 2px 4px rgba(15,23,42,0.06), 0 12px 28px rgba(15,23,42,0.08)",
  // brand
  indigo: "#4f46e5",
  indigoSoft: "#eef0ff",
  blue: "#2563eb",
  blueSoft: "#e7f0ff",
  green: "#16a34a",
  greenSoft: "#e8f7ee",
  amber: "#d97706",
  amberSoft: "#fff4e0",
  red: "#dc2626",
  redSoft: "#fdecec",
  violet: "#7c3aed",
  violetSoft: "#f1ebff",
  slate: "#475569",
  slateSoft: "#eef2f7",
};

const safeNum = (v) => Number(v || 0);
const pct = (part, total) => {
  const t = safeNum(total);
  if (!t) return 0;
  return Math.min(100, Math.round((safeNum(part) / t) * 100));
};

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const getToday = () => formatDate(new Date());
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
};

/* ============================================================
 * Reusable card shell
 * ============================================================ */
const Card = ({ sx = {}, children, ...rest }) => (
  <Paper
    elevation={0}
    sx={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: "14px",
      boxShadow: T.shadow,
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Paper>
);

/* ============================================================
 * KPI card — uniform height, aligned content
 * ============================================================ */
const KpiCard = ({ title, value, hint, icon, color, soft }) => (
  <Card
    sx={{
      p: 2.5,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "box-shadow .2s ease, transform .2s ease",
      "&:hover": { boxShadow: T.shadowHover },
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: T.muted,
            fontSize: 12.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: T.text,
            fontWeight: 800,
            fontSize: 30,
            lineHeight: 1.1,
            mt: 0.75,
            letterSpacing: -0.5,
          }}
        >
          {safeNum(value).toLocaleString()}
        </Typography>
      </Box>

      <Avatar
        variant="rounded"
        sx={{
          width: 42,
          height: 42,
          background: soft,
          color,
          borderRadius: "12px",
        }}
      >
        {icon}
      </Avatar>
    </Stack>

    {hint && (
      <Typography sx={{ color: T.muted, fontSize: 12.5, mt: 1.5 }}>
        {hint}
      </Typography>
    )}
  </Card>
);

/* ============================================================
 * Status row — icon + label on the left, count + share on the right
 * ============================================================ */
const StatusRow = ({ icon, label, value, total, color, soft, showBar = true }) => {
  const p = pct(value, total);
  return (
    <Box sx={{ py: 1.25 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar
          variant="rounded"
          sx={{
            width: 32,
            height: 32,
            background: soft,
            color,
            borderRadius: "9px",
          }}
        >
          {icon}
        </Avatar>

        <Typography sx={{ color: T.textSoft, fontWeight: 600, fontSize: 14, flex: 1 }}>
          {label}
        </Typography>

        <Typography sx={{ color: T.text, fontWeight: 700, fontSize: 14 }}>
          {safeNum(value).toLocaleString()}
        </Typography>

        <Chip
          size="small"
          label={`${p}%`}
          sx={{
            height: 22,
            fontSize: 11,
            fontWeight: 700,
            color,
            background: soft,
            border: `1px solid ${color}22`,
            minWidth: 48,
          }}
        />
      </Stack>

      {showBar && (
        <LinearProgress
          variant="determinate"
          value={p}
          sx={{
            mt: 1,
            ml: "44px",
            height: 6,
            borderRadius: 999,
            background: T.borderSoft,
            "& .MuiLinearProgress-bar": {
              background: color,
              borderRadius: 999,
            },
          }}
        />
      )}
    </Box>
  );
};

/* ============================================================
 * MUI input styling (light)
 * ============================================================ */
const inputSx = {
  "& .MuiOutlinedInput-root": {
    background: "#fff",
    borderRadius: "10px",
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: T.indigo, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: T.indigo },
};

/* ============================================================
 * Dashboard
 * ============================================================ */
const Dashboard = () => {
  const accessToken = getDecryptedAccessToken();

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  );

  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("custom");
  const [dateFrom, setDateFrom] = useState(getYesterday());
  const [dateTo, setDateTo] = useState(getToday());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (period === "today" || period === "yesterday" || period === "all") {
        params.set("period", period);
      }
      if (period === "custom") {
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);
      }

      const query = params.toString();
      const endpoint = query ? `dashboard/stats/?${query}` : "dashboard/stats/";

      const response = await ApiServices.get(endpoint, headers);
      const data = response?.data || response;
      setStats(data || {});
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to fetch dashboard stats."
      );
    } finally {
      setLoading(false);
    }
  }, [headers, period, dateFrom, dateTo]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const orders = stats?.orders || {};
  const stock = stats?.stock || {};
  const filters = stats?.filters || {};
  const orderTotal = safeNum(orders.total);
  const stockTotal = safeNum(stock.total_items);

  return (
    <Box sx={{ minHeight: "100vh", background: T.bg, p: { xs: 2, md: 3 } }}>
      {/* ===== Header ===== */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              color: T.text,
              fontSize: { xs: 22, md: 26 },
              letterSpacing: -0.4,
            }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ color: T.muted, mt: 0.25, fontSize: 14 }}>
            Order pipeline and inventory health at a glance.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} alignItems="center">
          <Tooltip title="Active filter">
            <Chip
              icon={<FilterAltIcon sx={{ fontSize: 16, color: `${T.indigo} !important` }} />}
              label={`${filters?.period || period} · ${
                filters?.date_from || dateFrom || "—"
              } → ${filters?.date_to || dateTo || "—"}`}
              sx={{
                height: 34,
                background: T.indigoSoft,
                color: T.indigo,
                fontWeight: 600,
                border: `1px solid ${T.indigo}1f`,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          </Tooltip>

          <Button
            variant="contained"
            disableElevation
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
            }
            onClick={fetchDashboardStats}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              background: T.indigo,
              px: 2.25,
              py: 1,
              "&:hover": { background: "#4338ca" },
            }}
          >
            {loading ? "Refreshing" : "Refresh"}
          </Button>
        </Stack>
      </Stack>

      {/* ===== Filter bar ===== */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth sx={inputSx}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => {
                  const v = e.target.value;
                  setPeriod(v);
                  if (v === "today") {
                    setDateFrom(getToday());
                    setDateTo(getToday());
                  }
                  if (v === "yesterday") {
                    setDateFrom(getYesterday());
                    setDateTo(getYesterday());
                  }
                  if (v === "custom") {
                    setDateFrom(getYesterday());
                    setDateTo(getToday());
                  }
                }}
              >
                <MenuItem value="custom">Custom range</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="all">All time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={3}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label="Date from"
              value={dateFrom}
              disabled={period !== "custom"}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          </Grid>

          <Grid item xs={6} sm={3} md={3}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label="Date to"
              value={dateTo}
              disabled={period !== "custom"}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchDashboardStats}
              disabled={loading}
              sx={{
                height: 40,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                color: T.indigo,
                borderColor: `${T.indigo}55`,
                background: "#fff",
                "&:hover": {
                  borderColor: T.indigo,
                  background: T.indigoSoft,
                },
              }}
            >
              Apply filter
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: "12px",
            border: `1px solid ${T.red}33`,
            background: T.redSoft,
            color: T.red,
          }}
        >
          {error}
        </Alert>
      )}

      {loading && !stats ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
          <CircularProgress sx={{ color: T.indigo }} />
        </Stack>
      ) : (
        <>
          {/* ===== KPI row ===== */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="Total Orders"
                value={orders.total}
                hint="All orders in selected range"
                icon={<ShoppingCartIcon />}
                color={T.indigo}
                soft={T.indigoSoft}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="New Orders"
                value={orders.new}
                hint="Awaiting processing"
                icon={<PendingActionsIcon />}
                color={T.blue}
                soft={T.blueSoft}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="Completed"
                value={orders.completed}
                hint="Ready or fulfilled"
                icon={<CheckCircleIcon />}
                color={T.green}
                soft={T.greenSoft}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="Low Stock"
                value={stock.low_stock}
                hint="Items needing restock"
                icon={<WarningAmberIcon />}
                color={T.amber}
                soft={T.amberSoft}
              />
            </Grid>
          </Grid>

          {/* ===== Detail row ===== */}
          <Grid container spacing={2} alignItems="stretch">
            {/* Order pipeline */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, height: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      background: T.indigoSoft,
                      color: T.indigo,
                      borderRadius: "10px",
                    }}
                  >
                    <TrendingUpIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: T.text, fontSize: 15.5 }}>
                      Order pipeline
                    </Typography>
                    <Typography sx={{ color: T.muted, fontSize: 12.5 }}>
                      Distribution across statuses
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${orderTotal.toLocaleString()} total`}
                    sx={{
                      height: 24,
                      fontWeight: 700,
                      fontSize: 11.5,
                      color: T.textSoft,
                      background: T.slateSoft,
                    }}
                  />
                </Stack>

                <Divider sx={{ borderColor: T.borderSoft, mb: 0.5 }} />

                <StatusRow
                  icon={<PendingActionsIcon fontSize="small" />}
                  label="New"
                  value={orders.new}
                  total={orderTotal}
                  color={T.blue}
                  soft={T.blueSoft}
                />
                <StatusRow
                  icon={<LocalOfferIcon fontSize="small" />}
                  label="Label Printed"
                  value={orders.label_printed}
                  total={orderTotal}
                  color={T.violet}
                  soft={T.violetSoft}
                />
                <StatusRow
                  icon={<PlayCircleOutlineIcon fontSize="small" />}
                  label="In Progress"
                  value={orders.in_progress}
                  total={orderTotal}
                  color={T.amber}
                  soft={T.amberSoft}
                />
                <StatusRow
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="Completed"
                  value={orders.completed}
                  total={orderTotal}
                  color={T.green}
                  soft={T.greenSoft}
                />
                <StatusRow
                  icon={<LocalShippingIcon fontSize="small" />}
                  label="Shipped"
                  value={orders.shipped}
                  total={orderTotal}
                  color={T.indigo}
                  soft={T.indigoSoft}
                />
                <StatusRow
                  icon={<CancelIcon fontSize="small" />}
                  label="Cancelled"
                  value={orders.cancelled}
                  total={orderTotal}
                  color={T.red}
                  soft={T.redSoft}
                />
              </Card>
            </Grid>

            {/* Stock health */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, height: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      background: T.greenSoft,
                      color: T.green,
                      borderRadius: "10px",
                    }}
                  >
                    <Inventory2Icon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: T.text, fontSize: 15.5 }}>
                      Stock health
                    </Typography>
                    <Typography sx={{ color: T.muted, fontSize: 12.5 }}>
                      Inventory status overview
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${stockTotal.toLocaleString()} items`}
                    sx={{
                      height: 24,
                      fontWeight: 700,
                      fontSize: 11.5,
                      color: T.textSoft,
                      background: T.slateSoft,
                    }}
                  />
                </Stack>

                <Divider sx={{ borderColor: T.borderSoft, mb: 0.5 }} />

                <StatusRow
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="Active Items"
                  value={stock.active_items}
                  total={stockTotal}
                  color={T.green}
                  soft={T.greenSoft}
                />
                <StatusRow
                  icon={<Inventory2Icon fontSize="small" />}
                  label="In Stock"
                  value={stock.in_stock}
                  total={stockTotal}
                  color={T.blue}
                  soft={T.blueSoft}
                />
                <StatusRow
                  icon={<WarningAmberIcon fontSize="small" />}
                  label="Low Stock"
                  value={stock.low_stock}
                  total={stockTotal}
                  color={T.amber}
                  soft={T.amberSoft}
                />
                <StatusRow
                  icon={<CancelIcon fontSize="small" />}
                  label="Out of Stock"
                  value={stock.out_of_stock}
                  total={stockTotal}
                  color={T.red}
                  soft={T.redSoft}
                />
                <StatusRow
                  icon={<RemoveCircleOutlineIcon fontSize="small" />}
                  label="Inactive"
                  value={stock.inactive}
                  total={stockTotal}
                  color={T.slate}
                  soft={T.slateSoft}
                />
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
