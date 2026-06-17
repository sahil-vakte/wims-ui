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
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
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

import ApiServices from "../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const T = {
  bg: "#f6f8fb",
  card: "#ffffff",
  text: "#0f172a",
  textSoft: "#334155",
  muted: "#64748b",
  border: "#e6eaf0",
  borderSoft: "#eef1f6",
  shadow: "0 4px 18px rgba(15,23,42,0.06)",

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

const Card = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: "16px",
      boxShadow: T.shadow,
      width: "100%",
      minWidth: 0,
      position: "relative",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const KpiCard = ({ title, value, hint, icon, color, soft }) => (
  <Card
    sx={{
      p: 2.5,
      height: 170,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography
          sx={{
            color: T.muted,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".5px",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: T.text,
            fontWeight: 900,
            fontSize: 32,
            lineHeight: 1,
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
          borderRadius: "13px",
          background: soft,
          color,
        }}
      >
        {icon}
      </Avatar>
    </Stack>

    <Typography sx={{ color: T.muted, fontSize: 13 }}>{hint}</Typography>
  </Card>
);

const StatusRow = ({ icon, label, value, total, color, soft }) => {
  const p = pct(value, total);

  return (
    <Box sx={{ py: 1.25 }}>
      <Stack direction="row" alignItems="center" spacing={1.4}>
        <Avatar
          variant="rounded"
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: soft,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Avatar>

        <Typography
          sx={{
            flex: 1,
            color: T.textSoft,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>

        <Typography sx={{ color: T.text, fontSize: 14, fontWeight: 800 }}>
          {safeNum(value).toLocaleString()}
        </Typography>

        <Chip
          size="small"
          label={`${p}%`}
          sx={{
            minWidth: 48,
            height: 23,
            fontSize: 11,
            fontWeight: 800,
            color,
            background: soft,
            border: `1px solid ${color}22`,
          }}
        />
      </Stack>

      <LinearProgress
        variant="determinate"
        value={p}
        sx={{
          mt: 1,
          ml: "48px",
          height: 6,
          borderRadius: 99,
          background: T.borderSoft,
          "& .MuiLinearProgress-bar": {
            background: color,
            borderRadius: 99,
          },
        }}
      />
    </Box>
  );
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    height: 44,
    background: "#fff",
    borderRadius: "12px",
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": {
      borderColor: T.indigo,
      borderWidth: 1.5,
    },
  },
};

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
      setStats(response?.data || response || {});
    } catch (err) {
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

  const orderTotal = safeNum(orders.total);
  const stockTotal = safeNum(stock.total_items);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: T.bg,
        p: { xs: 2, md: 3 },
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Card sx={{ p: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "180px 170px 170px 140px",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
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

            <TextField
              size="small"
              type="date"
              label="Date from"
              value={dateFrom}
              disabled={period !== "custom"}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />

            <TextField
              size="small"
              type="date"
              label="Date to"
              value={dateTo}
              disabled={period !== "custom"}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />

            <Button
              variant="outlined"
              disabled={loading}
              onClick={fetchDashboardStats}
              sx={{
                height: 44,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 800,
                color: T.indigo,
                borderColor: `${T.indigo}55`,
              }}
            >
              Apply filter
            </Button>
          </Box>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        {loading && !stats ? (
          <Stack alignItems="center" sx={{ py: 10 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2.5,
                alignItems: "stretch",
              }}
            >
              <KpiCard
                title="Total Orders"
                value={orders.total}
                hint="All orders in selected range"
                icon={<ShoppingCartIcon />}
                color={T.indigo}
                soft={T.indigoSoft}
              />

              <KpiCard
                title="New Orders"
                value={orders.new}
                hint="Awaiting processing"
                icon={<PendingActionsIcon />}
                color={T.blue}
                soft={T.blueSoft}
              />

              <KpiCard
                title="Completed"
                value={orders.completed}
                hint="Ready or fulfilled"
                icon={<CheckCircleIcon />}
                color={T.green}
                soft={T.greenSoft}
              />

              <KpiCard
                title="Low Stock"
                value={stock.low_stock}
                hint="Items needing restock"
                icon={<WarningAmberIcon />}
                color={T.amber}
                soft={T.amberSoft}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 1fr) minmax(0, 1fr)",
                },
                gap: 2.5,
                alignItems: "start",
              }}
            >
              <Card sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: T.indigoSoft, color: T.indigo }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={800}>Order pipeline</Typography>
                    <Typography fontSize={13} color={T.muted}>
                      Distribution across statuses
                    </Typography>
                  </Box>
                  <Chip label={`${orderTotal.toLocaleString()} total`} size="small" />
                </Stack>

                <Divider sx={{ mb: 1 }} />

                <StatusRow icon={<PendingActionsIcon />} label="New" value={orders.new} total={orderTotal} color={T.blue} soft={T.blueSoft} />
                <StatusRow icon={<LocalOfferIcon />} label="Label Printed" value={orders.label_printed} total={orderTotal} color={T.violet} soft={T.violetSoft} />
                <StatusRow icon={<PlayCircleOutlineIcon />} label="In Progress" value={orders.in_progress} total={orderTotal} color={T.amber} soft={T.amberSoft} />
                <StatusRow icon={<CheckCircleIcon />} label="Completed" value={orders.completed} total={orderTotal} color={T.green} soft={T.greenSoft} />
                <StatusRow icon={<LocalShippingIcon />} label="Shipped" value={orders.shipped} total={orderTotal} color={T.indigo} soft={T.indigoSoft} />
                <StatusRow icon={<CancelIcon />} label="Cancelled" value={orders.cancelled} total={orderTotal} color={T.red} soft={T.redSoft} />
              </Card>

              <Card sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: T.greenSoft, color: T.green }}>
                    <Inventory2Icon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={800}>Stock health</Typography>
                    <Typography fontSize={13} color={T.muted}>
                      Inventory status overview
                    </Typography>
                  </Box>
                  <Chip label={`${stockTotal.toLocaleString()} items`} size="small" />
                </Stack>

                <Divider sx={{ mb: 1 }} />

                <StatusRow icon={<CheckCircleIcon />} label="Active Items" value={stock.active_items} total={stockTotal} color={T.green} soft={T.greenSoft} />
                <StatusRow icon={<Inventory2Icon />} label="In Stock" value={stock.in_stock} total={stockTotal} color={T.blue} soft={T.blueSoft} />
                <StatusRow icon={<WarningAmberIcon />} label="Low Stock" value={stock.low_stock} total={stockTotal} color={T.amber} soft={T.amberSoft} />
                <StatusRow icon={<CancelIcon />} label="Out of Stock" value={stock.out_of_stock} total={stockTotal} color={T.red} soft={T.redSoft} />
                <StatusRow icon={<RemoveCircleOutlineIcon />} label="Inactive" value={stock.inactive} total={stockTotal} color={T.slate} soft={T.slateSoft} />
              </Card>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;