import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
} from "@mui/material";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import OrderBatchDetailDialog from "./OrderBatchDetailDialog";

const BATCH_API = "order-batches/";
const ORDERS_API = "orders/with-items/";

const LOW_STOCK_LIMIT = 10;

/* ==========================================================================
   DATE
   ========================================================================== */

const todayKey = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

/* ==========================================================================
   ERROR
   ========================================================================== */

const getError = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.detail ||
  error?.message ||
  fallback;

/* ==========================================================================
   UNIQUE
   ========================================================================== */

const uniq = (values) => [
  ...new Set(
    values.filter(
      (value) => value !== null && value !== undefined && value !== "",
    ),
  ),
];

/* ==========================================================================
   STOCK HELPERS
   ========================================================================== */

const getItemAvailableStock = (item) => {
  const value = Number(item?.available_stock_in_mtr);

  return Number.isFinite(value) ? value : 0;
};

const getItemRequiredQuantity = (item) => {
  /*
   * API example has:
   *
   * quantity: 25
   * quantity_ordered: 1
   *
   * For stock comparison the relevant
   * quantity is item.quantity.
   */

  const value = Number(item?.quantity || 0);

  return Number.isFinite(value) ? value : 0;
};

/*
|--------------------------------------------------------------------------
| LOW STOCK
|--------------------------------------------------------------------------
|
| <= 10 metres
|
*/

const isLowStockItem = (item) => {
  return getItemAvailableStock(item) <= LOW_STOCK_LIMIT;
};

/*
|--------------------------------------------------------------------------
| INSUFFICIENT STOCK
|--------------------------------------------------------------------------
|
| Required quantity is GREATER
| than available stock.
|
*/

const isInsufficientStockItem = (item) => {
  const required = getItemRequiredQuantity(item);

  const available = getItemAvailableStock(item);

  return required > available;
};

/*
|--------------------------------------------------------------------------
| GET LOW STOCK ITEMS
|--------------------------------------------------------------------------
*/

const getLowStockItems = (order) => {
  return (order?.items || []).filter(isLowStockItem);
};

/*
|--------------------------------------------------------------------------
| GET INSUFFICIENT STOCK ITEMS
|--------------------------------------------------------------------------
*/

const getInsufficientStockItems = (order) => {
  return (order?.items || []).filter(isInsufficientStockItem);
};

/*
|--------------------------------------------------------------------------
| ORDER HAS STOCK ISSUE
|--------------------------------------------------------------------------
*/

const getOrderStockState = (order) => {
  const lowStockItems = getLowStockItems(order);

  const insufficientItems = getInsufficientStockItems(order);

  if (insufficientItems.length > 0) {
    return "INSUFFICIENT";
  }

  if (lowStockItems.length > 0) {
    return "LOW";
  }

  return "OK";
};

/* ==========================================================================
   STOCK TOOLTIP
   ========================================================================== */

const StockTooltipContent = ({ order, mode = "ALL" }) => {
  let items = order?.items || [];

  if (mode === "LOW") {
    items = getLowStockItems(order);
  }

  if (mode === "INSUFFICIENT") {
    items = getInsufficientStockItems(order);
  }

  if (!items.length) {
    return <Typography variant="caption">No stock issues</Typography>;
  }

  return (
    <Box
      sx={{
        p: 0.5,
        maxWidth: 440,
      }}
    >
      {items.map((item, index) => {
        const required = getItemRequiredQuantity(item);

        const available = getItemAvailableStock(item);

        const insufficient = required > available;

        return (
          <Box
            key={item?.id || `${item?.sku}-${index}`}
            sx={{
              mb: index < items.length - 1 ? 1.25 : 0,
            }}
          >
            <Typography variant="caption" fontWeight={700} display="block">
              {item?.product_name || "-"}
            </Typography>

            <Typography variant="caption" display="block">
              SKU: {item?.sku || "-"}
            </Typography>

            <Typography variant="caption" display="block">
              Required: {required}
            </Typography>

            <Typography variant="caption" display="block">
              Available stock: {available} m
            </Typography>

            {insufficient && (
              <Typography
                variant="caption"
                fontWeight={700}
                display="block"
                sx={{
                  color: "#ffb4b4",
                  mt: 0.25,
                }}
              >
                Short by {Math.max(required - available, 0)} m
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

/* ==========================================================================
   BATCH NUMBER HELPERS
   ========================================================================== */

const extractBatchNumber = (batch) => {
  /*
   * Supports:
   *
   * batch_name: "B5"
   * batch_number: 5
   */

  if (
    batch?.batch_number !== null &&
    batch?.batch_number !== undefined &&
    !Number.isNaN(Number(batch.batch_number))
  ) {
    return Number(batch.batch_number);
  }

  const name = String(batch?.batch_name || "").trim();

  const match = name.match(/^B(\d+)$/i);

  if (!match) {
    return null;
  }

  return Number(match[1]);
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

const OrderBatchManager = ({ headers, disabled = false, onRefreshOrders }) => {
  /* --------------------------------------------------------------------------
     ORDERS
     -------------------------------------------------------------------------- */

  const [orders, setOrders] = useState([]);

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const [page, setPage] = useState(1);

  const [count, setCount] = useState(0);

  const [nextUrl, setNextUrl] = useState(null);

  const [previousUrl, setPreviousUrl] = useState(null);

  /* --------------------------------------------------------------------------
     FILTERS
     -------------------------------------------------------------------------- */

  const [search, setSearch] = useState("");

  const [courierFilter, setCourierFilter] = useState("ALL");

  const [labelFilter, setLabelFilter] = useState("NOT_PRINTED");

  /*
   * NEW
   *
   * ALL
   * LOW
   * INSUFFICIENT
   * OK
   */

  const [stockFilter, setStockFilter] = useState("ALL");

  /* --------------------------------------------------------------------------
     BATCH
     -------------------------------------------------------------------------- */

  const [batchDate, setBatchDate] = useState(todayKey());

  const [batchNumber, setBatchNumber] = useState(1);

  const [notes, setNotes] = useState("");

  const [batches, setBatches] = useState([]);

  const [detailBatchId, setDetailBatchId] = useState(null);

  /* --------------------------------------------------------------------------
     UI
     -------------------------------------------------------------------------- */

  const [busy, setBusy] = useState("");

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /* ==========================================================================
     FETCH ORDERS
     ========================================================================== */

  const fetchOrders = useCallback(
    async (pageNumber = 1) => {
      try {
        setBusy("orders");

        setError("");

        const response = await ApiServices.get(
          `${ORDERS_API}?page=${pageNumber}`,
          headers,
        );

        const data = response?.data || {};

        setOrders(data?.results || []);

        setCount(data?.count || 0);

        setNextUrl(data?.next || null);

        setPreviousUrl(data?.previous || null);

        setPage(pageNumber);

        /*
         * Clear selection because
         * loaded page changed.
         */

        setSelectedOrderIds([]);
      } catch (err) {
        console.error("Fetch orders error:", err);

        setError(getError(err, "Failed to load orders."));

        setOrders([]);
      } finally {
        setBusy("");
      }
    },
    [headers],
  );

  /* ==========================================================================
     LOAD BATCHES
     ========================================================================== */

  const loadBatches = useCallback(async () => {
    try {
      setBusy("batches");

      setError("");

      const response = await ApiServices.get(
        `${BATCH_API}?batch_date=${batchDate}`,
        headers,
      );

      const data = response?.data || [];

      setBatches(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Load batches error:", err);

      setError(getError(err, "Failed to load order batches."));

      setBatches([]);
    } finally {
      setBusy("");
    }
  }, [batchDate, headers]);

  /* ==========================================================================
     LOAD
     ========================================================================== */

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  /* ==========================================================================
     EXISTING ORDER HELPERS
     ========================================================================== */

  const isOrderCompleted = useCallback((order) => {
    return Number(order?.completion_percentage || 0) >= 100;
  }, []);

  const isOrderPrinted = useCallback((order) => {
    const items = order?.items || [];

    return (
      items.length > 0 && items.every((item) => item?.lable_printed === true)
    );
  }, []);

  /* ==========================================================================
     NEW: ALREADY BATCHED
     ========================================================================== */

  const isOrderBatched = useCallback((order) => {
    return Boolean(
      order?.batch_assigned === true || order?.batch_id || order?.batch_name,
    );
  }, []);

  /* ==========================================================================
     COURIER OPTIONS
     ========================================================================== */

  const courierOptions = useMemo(
    () =>
      uniq(
        orders.map(
          (order) => order?.courier_service_code || order?.courier_service_name,
        ),
      ),
    [orders],
  );

  /* ==========================================================================
     FILTER ORDERS
     ========================================================================== */

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const printed = isOrderPrinted(order);

      /*
       * LABEL FILTER
       */

      if (labelFilter === "PRINTED" && !printed) {
        return false;
      }

      if (labelFilter === "NOT_PRINTED" && printed) {
        return false;
      }

      /*
       * COURIER FILTER
       */

      if (courierFilter !== "ALL") {
        const courier =
          order?.courier_service_code || order?.courier_service_name || "";

        if (String(courier) !== String(courierFilter)) {
          return false;
        }
      }

      /*
       * STOCK FILTER
       */

      const stockState = getOrderStockState(order);

      if (stockFilter === "LOW" && stockState !== "LOW") {
        return false;
      }

      if (stockFilter === "INSUFFICIENT" && stockState !== "INSUFFICIENT") {
        return false;
      }

      if (stockFilter === "OK" && stockState !== "OK") {
        return false;
      }

      /*
       * SEARCH
       */

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
          ]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, search, courierFilter, labelFilter, stockFilter, isOrderPrinted]);

  /* ==========================================================================
     SELECTABLE ORDERS
     ========================================================================== */

  const selectableIds = useMemo(
    () =>
      filteredOrders
        .filter((order) => !isOrderCompleted(order) && !isOrderBatched(order))
        .map((order) => order.id),
    [filteredOrders, isOrderCompleted, isOrderBatched],
  );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedOrderIds.includes(id));

  const partialSelected =
    selectedOrderIds.length > 0 &&
    selectableIds.some((id) => selectedOrderIds.includes(id)) &&
    !allSelected;

  /* ==========================================================================
     SELECT ALL
     ========================================================================== */

  const toggleAll = (event) => {
    setSelectedOrderIds(event.target.checked ? selectableIds : []);
  };

  /* ==========================================================================
     SELECT ORDER
     ========================================================================== */

  const toggleOrder = (order) => {
    /*
     * Existing completed rule.
     */

    if (isOrderCompleted(order)) {
      return;
    }

    /*
     * NEW:
     * already batched orders
     * cannot be selected.
     */

    if (isOrderBatched(order)) {
      return;
    }

    setSelectedOrderIds((previous) =>
      previous.includes(order.id)
        ? previous.filter((id) => id !== order.id)
        : [...previous, order.id],
    );
  };

  /* ==========================================================================
     SELECTED ORDERS
     ========================================================================== */

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.includes(order.id)),
    [orders, selectedOrderIds],
  );

  /* ==========================================================================
     NEXT FIVE BATCH NUMBERS
     ========================================================================== */

  const availableBatchNumbers = useMemo(() => {
    const existingNumbers = batches
      .map(extractBatchNumber)
      .filter((number) => Number.isFinite(number));

    /*
     * Example:
     *
     * Existing:
     * B1 B2 B3 B4
     *
     * Highest = 4
     *
     * Options:
     * B5 B6 B7 B8 B9
     */

    const highest = existingNumbers.length ? Math.max(...existingNumbers) : 0;

    return Array.from(
      {
        length: 5,
      },
      (_, index) => highest + index + 1,
    );
  }, [batches]);

  /*
   * Automatically select
   * first available batch.
   */

  useEffect(() => {
    if (availableBatchNumbers.length) {
      setBatchNumber(availableBatchNumbers[0]);
    }
  }, [availableBatchNumbers]);

  /* ==========================================================================
     CREATE BATCH
     ========================================================================== */

  const createBatch = async () => {
    if (!selectedOrderIds.length) {
      setError("Select at least one order.");

      return;
    }

    /*
     * Additional front-end
     * protection.
     */

    const alreadyBatched = selectedOrders.filter(isOrderBatched);

    if (alreadyBatched.length) {
      setError(
        "One or more selected orders are already assigned to a batch. Refresh the list and try again.",
      );

      return;
    }

    try {
      setBusy("create");

      setError("");

      setMessage("");

      const couriers = uniq(
        selectedOrders.map(
          (order) => order?.courier_service_code || order?.courier_service_name,
        ),
      );

      const platforms = uniq(
        selectedOrders.map((order) => order?.order_source || "web"),
      );

      const orderTypes = uniq(
        selectedOrders.map((order) => order?.order_type || "retail"),
      );

      const payload = {
        batch_number: Number(batchNumber),

        batch_date: batchDate,

        order_ids: selectedOrderIds,

        filters_snapshot: {
          platform:
            platforms.length === 1
              ? String(platforms[0]).toLowerCase()
              : "mixed",

          courier_service_code: couriers.length === 1 ? couriers[0] : "mixed",

          order_type: orderTypes.length === 1 ? orderTypes[0] : "mixed",

          lable_printed:
            labelFilter === "PRINTED"
              ? true
              : labelFilter === "NOT_PRINTED"
                ? false
                : null,

          date_from: batchDate,

          date_to: batchDate,
        },

        notes: notes.trim(),
      };

      await ApiServices.post(BATCH_API, payload, headers);

      setMessage(
        `${selectedOrderIds.length} order(s) assigned to B${batchNumber}.`,
      );

      setSelectedOrderIds([]);

      setNotes("");

      await Promise.all([
        loadBatches(),
        fetchOrders(page),
        onRefreshOrders?.(),
      ]);
    } catch (err) {
      console.error("Create batch error:", err);

      setError(getError(err, "Failed to create batch."));
    } finally {
      setBusy("");
    }
  };

  /* ==========================================================================
     DELETE BATCH
     ========================================================================== */

  const deleteBatch = async (batch) => {
    if (
      !window.confirm(`Delete ${batch?.batch_name || `Batch ${batch?.id}`}?`)
    ) {
      return;
    }

    try {
      setBusy(`delete-${batch.id}`);

      await ApiServices.delete(`${BATCH_API}${batch.id}/`, headers);

      setMessage("Batch deleted successfully.");

      await Promise.all([
        loadBatches(),
        fetchOrders(page),
        onRefreshOrders?.(),
      ]);
    } catch (err) {
      setError(getError(err, "Failed to delete batch."));
    } finally {
      setBusy("");
    }
  };

  /* ==========================================================================
     DETAIL REFRESH
     ========================================================================== */

  const refreshAfterDetail = async () => {
    await Promise.all([loadBatches(), fetchOrders(page), onRefreshOrders?.()]);
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <Box sx={{ mb: 3 }}>
      {/* ====================================================================
          ASSIGN ORDERS
          ==================================================================== */}

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 2,
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Assign Orders to Batch
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Orders already assigned to a batch cannot be selected.
            </Typography>
          </Box>

          {(error || message) && (
            <Alert
              severity={error ? "error" : "success"}
              onClose={() => {
                setError("");
                setMessage("");
              }}
            >
              {error || message}
            </Alert>
          )}

          {/* ================================================================
              FILTERS
              ================================================================ */}

          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              label="Search Orders"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{
                minWidth: 230,
              }}
            />

            {/* COURIER */}

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Courier</InputLabel>

              <Select
                value={courierFilter}
                label="Courier"
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

            {/* LABEL */}

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Label Status</InputLabel>

              <Select
                value={labelFilter}
                label="Label Status"
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

            {/* ============================================================
                NEW STOCK FILTER
                ============================================================ */}

            <FormControl
              size="small"
              sx={{
                minWidth: 190,
              }}
            >
              <InputLabel>Stock Status</InputLabel>

              <Select
                value={stockFilter}
                label="Stock Status"
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

            <Button
              variant="outlined"
              onClick={() => fetchOrders(page)}
              disabled={busy === "orders"}
            >
              Refresh
            </Button>
          </Stack>

          {/* ================================================================
              ORDERS TABLE
              ================================================================ */}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: 500,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={partialSelected}
                      onChange={toggleAll}
                      disabled={disabled || !selectableIds.length}
                    />
                  </TableCell>

                  <TableCell>Order</TableCell>

                  <TableCell>Customer</TableCell>

                  {/* NEW */}

                  <TableCell>Batch</TableCell>

                  <TableCell>Courier</TableCell>

                  <TableCell>Type</TableCell>

                  <TableCell>Items</TableCell>

                  {/* NEW */}

                  <TableCell>Stock</TableCell>

                  <TableCell>Label</TableCell>

                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {busy === "orders" ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => {
                    const printed = isOrderPrinted(order);

                    const completed = isOrderCompleted(order);

                    const batched = isOrderBatched(order);

                    const lowStockItems = getLowStockItems(order);

                    const insufficientItems = getInsufficientStockItems(order);

                    const stockState = getOrderStockState(order);

                    /*
                     * Strong red:
                     * quantity required
                     * > available stock.
                     */

                    const rowBackground =
                      stockState === "INSUFFICIENT"
                        ? "#fff1f2"
                        : stockState === "LOW"
                          ? "#fffbeb"
                          : undefined;

                    return (
                      <TableRow
                        key={order.id}
                        hover
                        selected={selectedOrderIds.includes(order.id)}
                        sx={{
                          backgroundColor: rowBackground,

                          "&:hover": {
                            backgroundColor:
                              stockState === "INSUFFICIENT"
                                ? "#ffe4e6 !important"
                                : stockState === "LOW"
                                  ? "#fef3c7 !important"
                                  : undefined,
                          },
                        }}
                      >
                        {/* SELECT */}

                        <TableCell padding="checkbox">
                          <Tooltip
                            title={
                              batched
                                ? `Already assigned to ${order.batch_name || "a batch"}`
                                : completed
                                  ? "Completed order cannot be selected"
                                  : ""
                            }
                          >
                            <span>
                              <Checkbox
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={() => toggleOrder(order)}
                                disabled={completed || batched || disabled}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>

                        {/* ORDER */}

                        <TableCell>
                          <Typography fontWeight={700}>
                            {order.external_order_id ||
                              order.order_number ||
                              `#${order.id}`}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {order.order_number}
                          </Typography>
                        </TableCell>

                        {/* CUSTOMER */}

                        <TableCell>{order.customer_name || "-"}</TableCell>

                        {/* ==================================================
                              NEW BATCH
                              ================================================== */}

                        <TableCell>
                          {order.batch_name ? (
                            <Chip
                              size="small"
                              label={order.batch_name}
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Not Assigned
                            </Typography>
                          )}
                        </TableCell>

                        {/* COURIER */}

                        <TableCell>
                          {order.courier_service_code ||
                            order.courier_service_name ||
                            "-"}
                        </TableCell>

                        {/* TYPE */}

                        <TableCell>
                          <Chip
                            size="small"
                            label={order.order_type || "retail"}
                          />
                        </TableCell>

                        {/* ITEMS */}

                        <TableCell>
                          {order.items?.length || order.item_count || 0}
                        </TableCell>

                        {/* ==================================================
                              NEW STOCK
                              ================================================== */}

                        <TableCell>
                          {stockState === "INSUFFICIENT" ? (
                            <Tooltip
                              arrow
                              placement="top"
                              title={
                                <StockTooltipContent
                                  order={order}
                                  mode="INSUFFICIENT"
                                />
                              }
                            >
                              <Chip
                                size="small"
                                color="error"
                                label={`${insufficientItems.length} insufficient`}
                                sx={{
                                  cursor: "help",
                                  fontWeight: 700,
                                }}
                              />
                            </Tooltip>
                          ) : stockState === "LOW" ? (
                            <Tooltip
                              arrow
                              placement="top"
                              title={
                                <StockTooltipContent order={order} mode="LOW" />
                              }
                            >
                              <Chip
                                size="small"
                                color="warning"
                                label={`${lowStockItems.length} low stock`}
                                sx={{
                                  cursor: "help",
                                  fontWeight: 700,
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              size="small"
                              color="success"
                              label="Stock OK"
                            />
                          )}
                        </TableCell>

                        {/* LABEL */}

                        <TableCell>
                          <Chip
                            size="small"
                            label={printed ? "Printed" : "Pending"}
                            color={printed ? "success" : "warning"}
                          />
                        </TableCell>

                        {/* PROGRESS */}

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              completed
                                ? "Completed"
                                : `${Number(order.completion_percentage || 0)}%`
                            }
                            color={completed ? "success" : "info"}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No Orders Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ================================================================
              PAGINATION
              ================================================================ */}

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1}
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
          >
            <Button
              variant="outlined"
              disabled={!previousUrl || busy === "orders"}
              onClick={() => fetchOrders(Math.max(1, page - 1))}
            >
              Previous
            </Button>

            <Typography variant="body2">
              Page {page} | Total Orders: {count}
            </Typography>

            <Button
              variant="outlined"
              disabled={!nextUrl || busy === "orders"}
              onClick={() => fetchOrders(page + 1)}
            >
              Next
            </Button>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <Typography fontWeight={700} variant="body2">
              Selected: {selectedOrderIds.length} order(s)
            </Typography>
          </Stack>

          {/* ================================================================
              CREATE BATCH
              ================================================================ */}

          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              type="date"
              label="Batch Date"
              value={batchDate}
              onChange={(event) => setBatchDate(event.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* ============================================================
                DYNAMIC NEXT 5 BATCHES
                ============================================================ */}

            <FormControl
              size="small"
              sx={{
                minWidth: 140,
              }}
            >
              <InputLabel>Batch</InputLabel>

              <Select
                value={batchNumber}
                label="Batch"
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
              size="small"
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              sx={{
                minWidth: 260,
                flex: 1,
              }}
            />

            <Button
              variant="contained"
              disabled={
                disabled || !selectedOrderIds.length || busy === "create"
              }
              onClick={createBatch}
            >
              {busy === "create"
                ? "Creating..."
                : `Assign ${selectedOrderIds.length} Order${
                    selectedOrderIds.length === 1 ? "" : "s"
                  } to B${batchNumber}`}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ====================================================================
          EXISTING BATCHES
          ==================================================================== */}

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Existing Order Batches
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {batchDate}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={loadBatches}
              disabled={busy === "batches"}
            >
              Refresh Batches
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch</TableCell>

                  <TableCell>Orders</TableCell>

                  <TableCell>Labels</TableCell>

                  <TableCell>Notes</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {batches.length ? (
                  batches.map((batch) => {
                    const total = Number(batch.labels_total_count || 0);

                    const printed = Number(batch.labels_printed_count || 0);

                    return (
                      <TableRow key={batch.id} hover>
                        <TableCell>
                          <Typography fontWeight={700}>
                            {batch.batch_name || `#${batch.id}`}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {batch.batch_date}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {batch.orders_count ?? batch.orders?.length ?? "-"}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={`${printed}/${total}`}
                            color={
                              total > 0 && printed === total
                                ? "success"
                                : "warning"
                            }
                          />
                        </TableCell>

                        <TableCell>{batch.notes || "-"}</TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => setDetailBatchId(batch.id)}
                            >
                              View / Print
                            </Button>

                            <Button
                              size="small"
                              color="error"
                              onClick={() => deleteBatch(batch)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {busy === "batches" ? "Loading..." : "No batches found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      {/* ====================================================================
          BATCH DETAILS
          ==================================================================== */}

      <OrderBatchDetailDialog
        open={Boolean(detailBatchId)}
        batchId={detailBatchId}
        headers={headers}
        onClose={() => setDetailBatchId(null)}
        onUpdated={refreshAfterDetail}
      />
    </Box>
  );
};

export default OrderBatchManager;
