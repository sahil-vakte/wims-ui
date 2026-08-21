import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import ApiServices from "../../../../Services/ApiServices/ApiServices";

const BATCH_API = "order-batches/";
const ORDERS_API = "orders/with-items/";

const LOW_STOCK_LIMIT = 10;
const PAGE_SIZE_UI = 100;

/* ==========================================================================
   HELPERS
   ========================================================================== */

const todayKey = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const getError = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  // DRF field errors: { field: ["msg"] }
  if (data && typeof data === "object") {
    const direct = data.detail || data.message || data.error;
    if (typeof direct === "string" && direct) return direct;

    const firstKey = Object.keys(data)[0];
    const firstValue = firstKey ? data[firstKey] : null;

    if (Array.isArray(firstValue) && firstValue.length) {
      return `${firstKey}: ${firstValue[0]}`;
    }
    if (typeof firstValue === "string" && firstValue) {
      return `${firstKey}: ${firstValue}`;
    }
  }

  if (error?.code === "ERR_NETWORK") {
    return "Network error. Please check your connection and try again.";
  }

  return error?.detail || error?.message || fallback;
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const uniq = (values) => [
  ...new Set(
    values.filter((v) => v !== null && v !== undefined && v !== ""),
  ),
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getSummaryCategory = (item) => {
  const summary = String(item?.summary || "").trim().toLowerCase();
  const personalization = item?.personalization;
  const hasPersonalization =
    personalization !== null &&
    personalization !== undefined &&
    String(personalization).trim() !== "";

  if (hasPersonalization) return "P";
  if (summary === "sample request" || item?.is_sample === true) return "S";
  return "R";
};

const getSummaryCounts = (order) =>
  (order?.items || []).reduce(
    (counts, item) => {
      const category = getSummaryCategory(item);
      counts[category] += 1;
      return counts;
    },
    { R: 0, S: 0, P: 0 },
  );

/* ==========================================================================
   STOCK
   ========================================================================== */

const getItemAvailableStock = (item) =>
  toNumber(
    item?.available_stock_in_mtr ?? item?.stock_detail?.available_stock_in_mtr,
    0,
  );

const getItemRequiredQuantity = (item) => toNumber(item?.quantity, 0);

const isInsufficientStockItem = (item) =>
  getItemRequiredQuantity(item) > getItemAvailableStock(item);

const isLowStockItem = (item) =>
  !isInsufficientStockItem(item) &&
  getItemAvailableStock(item) <= LOW_STOCK_LIMIT;

const getLowStockItems = (order) => (order?.items || []).filter(isLowStockItem);

const getInsufficientStockItems = (order) =>
  (order?.items || []).filter(isInsufficientStockItem);

const getOrderStockState = (order) => {
  if (getInsufficientStockItems(order).length) return "INSUFFICIENT";
  if (getLowStockItems(order).length) return "LOW";
  return "OK";
};

/* ==========================================================================
   STOCK TOOLTIP
   ========================================================================== */

const StockTooltipContent = ({ order, mode = "ALL" }) => {
  let items = order?.items || [];

  if (mode === "LOW") items = getLowStockItems(order);
  if (mode === "INSUFFICIENT") items = getInsufficientStockItems(order);

  if (!items.length) {
    return <Typography variant="caption">No stock issues</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 320, py: 0.5 }}>
      <Stack spacing={1} divider={<Divider flexItem sx={{ opacity: 0.3 }} />}>
        {items.slice(0, 8).map((item, index) => {
          const required = getItemRequiredQuantity(item);
          const available = getItemAvailableStock(item);
          const insufficient = required > available;

          return (
            <Box key={item?.id ?? `${item?.sku ?? "item"}-${index}`}>
              <Typography variant="caption" sx={{ fontWeight: 700 }} display="block">
                {item?.product_name || "-"}
              </Typography>

              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                <Chip size="small" variant="outlined" label={`SKU ${item?.sku || "-"}`} />
                <Chip size="small" variant="outlined" label={`Req ${required} m`} />
                <Chip
                  size="small"
                  color={insufficient ? "error" : "warning"}
                  label={`Avail ${available} m`}
                />
                {insufficient && (
                  <Chip
                    size="small"
                    color="error"
                    label={`Short ${Math.max(required - available, 0)} m`}
                  />
                )}
              </Stack>
            </Box>
          );
        })}

        {items.length > 8 && (
          <Typography variant="caption">+{items.length - 8} more item(s)</Typography>
        )}
      </Stack>
    </Box>
  );
};

/* ==========================================================================
   BATCH NUMBER
   ========================================================================== */

const extractBatchNumber = (batch) => {
  const raw = batch?.batch_number;

  if (raw !== null && raw !== undefined && Number.isFinite(Number(raw))) {
    return Number(raw);
  }

  const match = String(batch?.batch_name || "").trim().match(/^B(\d+)$/i);
  return match ? Number(match[1]) : null;
};

/* ==========================================================================
   SMALL PRESENTATION PIECES
   ========================================================================== */

const StockChip = ({ order }) => {
  const state = getOrderStockState(order);

  if (state === "INSUFFICIENT") {
    return (
      <Tooltip arrow title={<StockTooltipContent order={order} mode="INSUFFICIENT" />}>
        <Chip
          size="small"
          color="error"
          icon={<ErrorOutlineIcon />}
          label={`Short ${getInsufficientStockItems(order).length}`}
        />
      </Tooltip>
    );
  }

  if (state === "LOW") {
    return (
      <Tooltip arrow title={<StockTooltipContent order={order} mode="LOW" />}>
        <Chip
          size="small"
          color="warning"
          icon={<WarningAmberIcon />}
          label={`Low ${getLowStockItems(order).length}`}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip arrow title={<StockTooltipContent order={order} />}>
      <Chip size="small" color="success" variant="outlined" icon={<CheckCircleOutlineIcon />} label="OK" />
    </Tooltip>
  );
};

const ProgressCell = ({ value }) => {
  const percent = Math.max(0, Math.min(100, toNumber(value, 0)));

  return (
    <Stack spacing={0.5} sx={{ minWidth: 96 }}>
      <Chip
        size="small"
        variant={percent >= 100 ? "filled" : "outlined"}
        color={percent >= 100 ? "success" : percent > 0 ? "info" : "default"}
        label={`${percent}%`}
      />
      <LinearProgress
        variant="determinate"
        value={percent}
        color={percent >= 100 ? "success" : "info"}
        sx={{ height: 5, borderRadius: 5 }}
      />
    </Stack>
  );
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

const OrderBatchManager = ({
  headers,
  disabled = false,
  onRefreshOrders,
  showOrders = true,
  showBatches = true,
  onOpenBatch,
  existingBatchesDate,
  onExistingBatchesDateChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  /* ORDERS */
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  /* FILTERS */
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("ALL");
  const [labelFilter, setLabelFilter] = useState("NOT_PRINTED");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [summaryFilter, setSummaryFilter] = useState("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState("ALL");

  /* BATCH */
  const [batchDate, setBatchDate] = useState(todayKey());
  const [batchNumber, setBatchNumber] = useState(1);
  const [notes, setNotes] = useState("");
  const [batches, setBatches] = useState([]);

  const batchesLookupDate =
    showBatches && !showOrders ? existingBatchesDate || todayKey() : batchDate;

  /* UI */
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createBatchDialogOpen, setCreateBatchDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ========================= FETCH ORDERS ========================= */

  const fetchOrders = useCallback(
    async (displayPage = 1) => {
      const safePage = Math.max(1, toNumber(displayPage, 1));

      setBusy("orders");
      setError("");

      try {
        // One UI page = two API pages (API returns 50 per page).
        const firstApiPage = (safePage - 1) * 2 + 1;

        const firstResponse = await ApiServices.get(
          `${ORDERS_API}?page=${firstApiPage}`,
          headers,
        );

        const firstData = firstResponse?.data || {};
        const firstResults = asArray(firstData);

        let secondData = {};
        let secondResults = [];

        if (firstData?.next) {
          try {
            const secondResponse = await ApiServices.get(
              `${ORDERS_API}?page=${firstApiPage + 1}`,
              headers,
            );
            secondData = secondResponse?.data || {};
            secondResults = asArray(secondData);
          } catch (secondPageError) {
            // Keep first page visible; surface a soft warning.
            console.error("Fetch second orders page error:", secondPageError);
            setError(
              getError(
                secondPageError,
                "Some orders could not be loaded. Showing partial results.",
              ),
            );
          }
        }

        const merged = [...firstResults, ...secondResults].filter(Boolean);

        setOrders(merged);
        setCount(toNumber(firstData?.count ?? secondData?.count, merged.length));
        setHasNextPage(
          Boolean(secondResults.length ? secondData?.next : firstData?.next),
        );
        setPage(safePage);
        setSelectedOrderIds([]);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError(getError(err, "Failed to load orders."));
        setOrders([]);
        setCount(0);
        setHasNextPage(false);
      } finally {
        setBusy("");
      }
    },
    [headers],
  );

  /* ========================= LOAD BATCHES ========================= */

  const loadBatches = useCallback(async () => {
    setBusy("batches");
    setError("");

    try {
      const response = await ApiServices.get(
        `${BATCH_API}?batch_date=${batchesLookupDate}`,
        headers,
      );

      setBatches(asArray(response?.data));
    } catch (err) {
      console.error("Load batches error:", err);
      setError(getError(err, "Failed to load order batches."));
      setBatches([]);
    } finally {
      setBusy("");
    }
  }, [batchesLookupDate, headers]);

  useEffect(() => {
    if (showOrders) fetchOrders(1);
  }, [fetchOrders, showOrders]);

  useEffect(() => {
    if (showOrders || showBatches) loadBatches();
  }, [loadBatches, showOrders, showBatches]);

  /* ========================= ORDER FLAGS ========================= */

  const isOrderCompleted = useCallback(
    (order) => toNumber(order?.completion_percentage, 0) >= 100,
    [],
  );

  const isOrderPrinted = useCallback((order) => {
    const items = order?.items || [];
    return items.length > 0 && items.every((item) => item?.lable_printed === true);
  }, []);

  const isOrderBatched = useCallback(
    (order) =>
      Boolean(order?.batch_assigned === true || order?.batch_id || order?.batch_name),
    [],
  );

  /* ========================= FILTERS ========================= */

  const courierOptions = useMemo(
    () =>
      uniq(
        orders.map(
          (order) => order?.courier_service_code || order?.courier_service_name,
        ),
      ),
    [orders],
  );

  const orderTypeOptions = useMemo(
    () => uniq(orders.map((order) => order?.order_type || "retail")),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const printed = isOrderPrinted(order);

      if (labelFilter === "PRINTED" && !printed) return false;
      if (labelFilter === "NOT_PRINTED" && printed) return false;

      if (courierFilter !== "ALL") {
        const courier =
          order?.courier_service_code || order?.courier_service_name || "";
        if (String(courier) !== String(courierFilter)) return false;
      }

      if (stockFilter !== "ALL" && getOrderStockState(order) !== stockFilter) {
        return false;
      }

      if (
        orderTypeFilter !== "ALL" &&
        (order?.order_type || "retail") !== orderTypeFilter
      ) {
        return false;
      }

      if (
        summaryFilter !== "ALL" &&
        !(order?.items || []).some(
          (item) => getSummaryCategory(item) === summaryFilter,
        )
      ) {
        return false;
      }

      if (query) {
        const searchable = [
          order?.external_order_id,
          order?.order_number,
          order?.customer_name,
          order?.customer_email,
          order?.batch_name,
          ...(order?.items || []).flatMap((item) => [
            item?.sku,
            item?.product_name,
            item?.summary,
            getSummaryCategory(item),
          ]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [
    orders,
    search,
    courierFilter,
    labelFilter,
    stockFilter,
    summaryFilter,
    orderTypeFilter,
    isOrderPrinted,
  ]);

  /* ========================= SELECTION ========================= */

  const selectableIds = useMemo(
    () =>
      filteredOrders
        .filter((order) => !isOrderCompleted(order) && !isOrderBatched(order))
        .map((order) => order.id),
    [filteredOrders, isOrderCompleted, isOrderBatched],
  );

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedOrderIds.includes(id));

  const partialSelected =
    selectedOrderIds.length > 0 &&
    selectableIds.some((id) => selectedOrderIds.includes(id)) &&
    !allSelected;

  const toggleAll = (event) =>
    setSelectedOrderIds(event.target.checked ? selectableIds : []);

  const toggleOrder = (order) => {
    if (isOrderCompleted(order) || isOrderBatched(order)) return;

    setSelectedOrderIds((previous) =>
      previous.includes(order.id)
        ? previous.filter((id) => id !== order.id)
        : [...previous, order.id],
    );
  };

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.includes(order.id)),
    [orders, selectedOrderIds],
  );

  const selectionStockState = useMemo(() => {
    if (selectedOrders.some((o) => getOrderStockState(o) === "INSUFFICIENT")) {
      return "INSUFFICIENT";
    }
    if (selectedOrders.some((o) => getOrderStockState(o) === "LOW")) return "LOW";
    return "OK";
  }, [selectedOrders]);

  /* ========================= BATCH NUMBERS ========================= */

  const availableBatchNumbers = useMemo(() => {
    const existing = batches.map(extractBatchNumber).filter((n) => Number.isFinite(n));
    const highest = existing.length ? Math.max(...existing) : 0;

    return Array.from({ length: 5 }, (_, index) => highest + index + 1);
  }, [batches]);

  useEffect(() => {
    if (availableBatchNumbers.length) setBatchNumber(availableBatchNumbers[0]);
  }, [availableBatchNumbers]);

  /* ========================= CREATE BATCH ========================= */

  const createBatch = async () => {
    if (!selectedOrderIds.length) {
      setError("Select at least one order.");
      return;
    }

    if (!batchDate) {
      setError("Please choose a batch date.");
      return;
    }

    if (!Number.isFinite(Number(batchNumber)) || Number(batchNumber) <= 0) {
      setError("Please choose a valid batch number.");
      return;
    }

    if (selectedOrders.some(isOrderBatched)) {
      setError(
        "One or more selected orders are already assigned to a batch. Refresh the list and try again.",
      );
      return;
    }

    setBusy("create");
    setError("");
    setMessage("");

    try {
      const couriers = uniq(
        selectedOrders.map(
          (order) => order?.courier_service_code || order?.courier_service_name,
        ),
      );
      const platforms = uniq(selectedOrders.map((order) => order?.order_source || "web"));
      const orderTypes = uniq(selectedOrders.map((order) => order?.order_type || "retail"));

      const payload = {
        batch_number: Number(batchNumber),
        batch_date: batchDate,
        order_ids: selectedOrderIds,
        filters_snapshot: {
          platform:
            platforms.length === 1 ? String(platforms[0]).toLowerCase() : "mixed",
          courier_service_code: couriers.length === 1 ? couriers[0] : "mixed",
          order_type: orderTypes.length === 1 ? orderTypes[0] : "mixed",
          lable_printed:
            labelFilter === "PRINTED" ? true : labelFilter === "NOT_PRINTED" ? false : null,
          date_from: batchDate,
          date_to: batchDate,
        },
        notes: notes.trim(),
      };

      await ApiServices.post(BATCH_API, payload, headers);

      setMessage(`${selectedOrderIds.length} order(s) assigned to B${batchNumber}.`);
      setSelectedOrderIds([]);
      setNotes("");
      setCreateBatchDialogOpen(false);

      const results = await Promise.allSettled([
        loadBatches(),
        ...(showOrders ? [fetchOrders(page)] : []),
        onRefreshOrders?.(),
      ]);

      if (results.some((r) => r.status === "rejected")) {
        console.error("Post-create refresh partially failed:", results);
      }
    } catch (err) {
      console.error("Create batch error:", err);
      setError(getError(err, "Failed to create batch."));
    } finally {
      setBusy("");
    }
  };

  /* ========================= DELETE BATCH ========================= */

  const confirmDeleteBatch = async () => {
    const batch = deleteTarget;
    if (!batch?.id) return;

    setBusy(`delete-${batch.id}`);
    setError("");

    try {
      await ApiServices.delete(`${BATCH_API}${batch.id}/`, headers);

      setMessage(`${batch.batch_name || `Batch #${batch.id}`} deleted successfully.`);
      setDeleteTarget(null);

      await Promise.allSettled([
        loadBatches(),
        ...(showOrders ? [fetchOrders(page)] : []),
        onRefreshOrders?.(),
      ]);
    } catch (err) {
      console.error("Delete batch error:", err);
      setError(getError(err, "Failed to delete batch."));
    } finally {
      setBusy("");
    }
  };

  /* ========================= RENDER ========================= */

  const ordersLoading = busy === "orders";
  const batchesLoading = busy === "batches";

  return (
    <Stack spacing={{ xs: 2, md: 3 }} sx={{ width: "100%" }}>
      {/* ---------------- FEEDBACK ---------------- */}

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setMessage("")}>
          {message}
        </Alert>
      </Snackbar>

      {/* ================= ASSIGN ORDERS ================= */}

      {showOrders && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          {ordersLoading && <LinearProgress />}

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Assign Orders to Batch
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Orders already assigned to a batch cannot be selected.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" variant="outlined" label={`Total ${count}`} />
                <Chip size="small" variant="outlined" label={`Visible ${filteredOrders.length}`} />
                <Chip
                  size="small"
                  color={selectedOrderIds.length ? "primary" : "default"}
                  label={`Selected ${selectedOrderIds.length}`}
                />
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* ---------------- FILTERS ---------------- */}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                size="small"
                label="Search orders, SKU, customer"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ flex: { sm: "1 1 240px" }, minWidth: { sm: 220 } }}
              />

              <FormControl size="small" sx={{ flex: { sm: "0 1 180px" }, minWidth: 160 }}>
                <InputLabel id="courier-filter">Courier</InputLabel>
                <Select
                  labelId="courier-filter"
                  label="Courier"
                  value={courierFilter}
                  onChange={(event) => {
                    setCourierFilter(event.target.value);
                    setSelectedOrderIds([]);
                  }}
                >
                  <MenuItem value="ALL">All Couriers</MenuItem>
                  {courierOptions.map((courier) => (
                    <MenuItem key={courier} value={courier}>
                      {courier}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: { sm: "0 1 190px" }, minWidth: 170 }}>
                <InputLabel id="label-filter">Label Status</InputLabel>
                <Select
                  labelId="label-filter"
                  label="Label Status"
                  value={labelFilter}
                  onChange={(event) => {
                    setLabelFilter(event.target.value);
                    setSelectedOrderIds([]);
                  }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="NOT_PRINTED">Not Fully Printed</MenuItem>
                  <MenuItem value="PRINTED">Fully Printed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: { sm: "0 1 190px" }, minWidth: 170 }}>
                <InputLabel id="stock-filter">Stock Status</InputLabel>
                <Select
                  labelId="stock-filter"
                  label="Stock Status"
                  value={stockFilter}
                  onChange={(event) => {
                    setStockFilter(event.target.value);
                    setSelectedOrderIds([]);
                  }}
                >
                  <MenuItem value="ALL">All Stock</MenuItem>
                  <MenuItem value="OK">Stock OK</MenuItem>
                  <MenuItem value="LOW">Low Stock ≤ 10m</MenuItem>
                  <MenuItem value="INSUFFICIENT">Insufficient Stock</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: { sm: "0 1 170px" }, minWidth: 150 }}>
                <InputLabel id="summary-filter">Summary</InputLabel>
                <Select
                  labelId="summary-filter"
                  label="Summary"
                  value={summaryFilter}
                  onChange={(event) => {
                    setSummaryFilter(event.target.value);
                    setSelectedOrderIds([]);
                  }}
                >
                  <MenuItem value="ALL">All Summaries</MenuItem>
                  <MenuItem value="S">Sample</MenuItem>
                  <MenuItem value="P">Personalization</MenuItem>
                  <MenuItem value="R">Regular</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: { sm: "0 1 170px" }, minWidth: 150 }}>
                <InputLabel id="type-filter">Type</InputLabel>
                <Select
                  labelId="type-filter"
                  label="Type"
                  value={orderTypeFilter}
                  onChange={(event) => {
                    setOrderTypeFilter(event.target.value);
                    setSelectedOrderIds([]);
                  }}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  {orderTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1} sx={{ ml: { md: "auto" } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchOrders(page)}
                  disabled={ordersLoading}
                  fullWidth={isMobile}
                >
                  Refresh
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setCreateBatchDialogOpen(true)}
                  disabled={
                    disabled || !selectedOrderIds.length || ordersLoading || busy === "create"
                  }
                  fullWidth={isMobile}
                >
                  Create Batch
                </Button>
              </Stack>
            </Stack>

            {selectionStockState !== "OK" && selectedOrderIds.length > 0 && (
              <Alert
                severity={selectionStockState === "INSUFFICIENT" ? "error" : "warning"}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Some selected orders have{" "}
                {selectionStockState === "INSUFFICIENT" ? "insufficient" : "low"} stock.
              </Alert>
            )}
          </Box>

          {/* ---------------- TABLE ---------------- */}

          <TableContainer sx={{ maxHeight: { xs: 460, md: 640 } }}>
            <Table
              stickyHeader
              size="small"
              sx={{ minWidth: 900, tableLayout: "fixed", width: "100%" }}
            >
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={partialSelected}
                      onChange={toggleAll}
                      disabled={disabled || !selectableIds.length}
                      inputProps={{ "aria-label": "Select all selectable orders" }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}>
                    Courier
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: "none", lg: "table-cell" } }}>
                    Type
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, display: { xs: "none", sm: "table-cell" } }}>
                    Items
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Summary
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Stock</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}>
                    Label
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Progress</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Loading orders...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => {
                    const printed = isOrderPrinted(order);
                    const completed = isOrderCompleted(order);
                    const batched = isOrderBatched(order);
                    const stockState = getOrderStockState(order);
                    const selected = selectedOrderIds.includes(order.id);

                    return (
                      <TableRow
                        key={order.id}
                        hover
                        selected={selected}
                        sx={{
                          backgroundColor: "transparent",
                          opacity: completed || batched ? 0.78 : 1,
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Tooltip
                            arrow
                            title={
                              batched
                                ? "Already assigned to a batch"
                                : completed
                                  ? "Order already completed"
                                  : "Select order"
                            }
                          >
                            <span>
                              <Checkbox
                                size="small"
                                checked={selected}
                                onChange={() => toggleOrder(order)}
                                disabled={completed || batched || disabled}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {order.external_order_id || order.order_number || `#${order.id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {order.order_number || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 190 }}>
                          <Typography variant="body2" noWrap>
                            {order.customer_name || "-"}
                          </Typography>
                          {order.customer_email && (
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                              {order.customer_email}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {order.batch_name ? (
                            <Chip size="small" color="primary" label={order.batch_name} />
                          ) : (
                            <Chip size="small" variant="outlined" label="Not Assigned" />
                          )}
                        </TableCell>

                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              order.courier_service_code || order.courier_service_name || "-"
                            }
                          />
                        </TableCell>

                        <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            color="secondary"
                            label={order.order_type || "retail"}
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={order.items?.length || order.item_count || 0}
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ minWidth: 150, maxWidth: 210 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ maxWidth: 210, mx: "auto" }}
                          >
                            {Object.entries(getSummaryCounts(order))
                              .filter(([, count]) => count > 0)
                              .map(([category, count]) => (
                                <Chip
                                  key={category}
                                  size="small"
                                  variant="outlined"
                                  label={`${category}${count}`}
                                />
                              ))}
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          <StockChip order={order} />
                        </TableCell>

                        <TableCell align="center" sx={{ display: { xs: "none", md: "table-cell" } }}>
                          <Chip
                            size="small"
                            color={printed ? "success" : "default"}
                            variant={printed ? "filled" : "outlined"}
                            label={printed ? "Printed" : "Pending"}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <ProgressCell value={order.completion_percentage} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No orders found for the selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ---------------- PAGINATION ---------------- */}

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
              <Chip size="small" label={`Page ${page}`} />
              <Chip size="small" variant="outlined" label={`Up to ${PAGE_SIZE_UI} per page`} />
              <Chip size="small" variant="outlined" label={`Total ${count}`} />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                disabled={page <= 1 || ordersLoading}
                onClick={() => fetchOrders(Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!hasNextPage || ordersLoading}
                onClick={() => fetchOrders(page + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* ================= EXISTING BATCHES ================= */}

      {showBatches && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          {batchesLoading && <LinearProgress />}

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ p: { xs: 2, md: 3 } }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Existing Order Batches
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filter and view batches by date
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                size="small"
                type="date"
                label="Batch Date"
                value={existingBatchesDate || todayKey()}
                onChange={(event) => onExistingBatchesDateChange?.(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { sm: 180 } }}
              />

              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadBatches}
                disabled={batchesLoading}
              >
                Refresh Batches
              </Button>
            </Stack>
          </Stack>

          <TableContainer sx={{ maxHeight: { xs: 420, md: 560 } }}>
            <Table stickyHeader size="small" sx={{ minWidth: 680 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Orders</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Labels</TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}>
                    Notes
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {batchesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={26} />
                    </TableCell>
                  </TableRow>
                ) : batches.length ? (
                  batches.map((batch) => {
                    const total = toNumber(batch.labels_total_count, 0);
                    const printed = toNumber(batch.labels_printed_count, 0);
                    const complete = total > 0 && printed >= total;

                    return (
                      <TableRow key={batch.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              color="primary"
                              label={batch.batch_name || `#${batch.id}`}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {batch.batch_date || "-"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            variant="outlined"
                            label={batch.orders_count ?? batch.orders?.length ?? "-"}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            color={complete ? "success" : "warning"}
                            label={`${printed}/${total}`}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            display: { xs: "none", md: "table-cell" },
                            maxWidth: 260,
                          }}
                        >
                          <Tooltip arrow title={batch.notes || ""}>
                            <Typography variant="body2" noWrap>
                              {batch.notes || "-"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PrintOutlinedIcon />}
                              onClick={() => onOpenBatch?.(batch)}
                              disabled={disabled}
                            >
                              {isCompact ? "Print" : "View / Print"}
                            </Button>

                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => setDeleteTarget(batch)}
                              disabled={disabled || busy === `delete-${batch.id}`}
                            >
                              {busy === `delete-${batch.id}` ? "Deleting..." : "Delete"}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        No batches found for this date.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ================= CREATE BATCH DIALOG ================= */}

      <Dialog
        open={createBatchDialogOpen}
        onClose={() => busy !== "create" && setCreateBatchDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create Batch
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <Chip size="small" color="primary" label={`${selectedOrderIds.length} selected`} />
            <Chip size="small" variant="outlined" label={`B${batchNumber}`} />
            <Chip
              size="small"
              color={
                selectionStockState === "INSUFFICIENT"
                  ? "error"
                  : selectionStockState === "LOW"
                    ? "warning"
                    : "success"
              }
              label={`Stock ${selectionStockState}`}
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {selectionStockState === "INSUFFICIENT" && (
              <Alert severity="warning">
                Some selected orders do not have enough stock. You can still create the batch.
              </Alert>
            )}

            <TextField
              type="date"
              label="Batch Date"
              value={batchDate}
              onChange={(event) => setBatchDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={busy === "create"}
              fullWidth
            />

            <FormControl fullWidth disabled={busy === "create"}>
              <InputLabel id="batch-number">Batch</InputLabel>
              <Select
                labelId="batch-number"
                label="Batch"
                value={batchNumber}
                onChange={(event) => setBatchNumber(Number(event.target.value))}
              >
                {availableBatchNumbers.map((number) => (
                  <MenuItem key={number} value={number}>
                    B{number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={busy === "create"}
              placeholder="Optional notes for this batch"
              multiline
              minRows={2}
              fullWidth
              inputProps={{ maxLength: 500 }}
              helperText={`${notes.length}/500`}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button
            onClick={() => setCreateBatchDialogOpen(false)}
            disabled={busy === "create"}
            fullWidth={isMobile}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={createBatch}
            disabled={busy === "create" || !selectedOrderIds.length}
            startIcon={busy === "create" ? <CircularProgress size={16} color="inherit" /> : null}
            fullWidth={isMobile}
          >
            {busy === "create"
              ? "Creating..."
              : `Create B${batchNumber} with ${selectedOrderIds.length} Order${
                  selectedOrderIds.length === 1 ? "" : "s"
                }`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRM ================= */}

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !busy.startsWith("delete") && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete batch?</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Chip
              color="error"
              label={deleteTarget?.batch_name || `Batch #${deleteTarget?.id ?? ""}`}
              sx={{ alignSelf: "flex-start" }}
            />
            <Typography variant="body2" color="text.secondary">
              This will unassign its orders. This action cannot be undone.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={busy.startsWith("delete")}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteBatch}
            disabled={busy.startsWith("delete")}
          >
            {busy.startsWith("delete") ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrderBatchManager;
