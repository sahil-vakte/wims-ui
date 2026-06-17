import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import {
  getDecryptedAccessToken,
  getDecryptedData,
} from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const BG_GRADIENT = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
const SURFACE = "rgba(255,255,255,0.04)";
const SURFACE_STRONG = "rgba(255,255,255,0.07)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(226,232,240,0.65)";

const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
  },
];

const safeValue = (value) => {
  if (value === null || value === undefined || value === "") return "NA";
  return value;
};

const getEmployeeName = (employee) => {
  const name = `${employee?.first_name || ""} ${
    employee?.last_name || ""
  }`.trim();

  return name || employee?.username || employee?.email || `User ${employee?.id}`;
};

const getStatusOption = (status) =>
  STATUS_OPTIONS.find((option) => option.value === status);

const GlassCard = ({ children, sx, ...rest }) => (
  <Box
    sx={{
      bgcolor: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: 3,
      backdropFilter: "blur(10px)",
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

const InfoTile = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
    <Avatar
      variant="rounded"
      sx={{
        bgcolor: SURFACE_STRONG,
        color: "#93c5fd",
        width: 38,
        height: 38,
        borderRadius: 2,
      }}
    >
      {icon}
    </Avatar>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontSize: 11,
          color: TEXT_MUTED,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          color: "#f1f5f9",
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {safeValue(value)}
      </Typography>
    </Box>
  </Stack>
);

const SectionTitle = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 700,
      color: TEXT_MUTED,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      mb: 1.25,
      px: 0.5,
    }}
  >
    {children}
  </Typography>
);

const OtherOrderItems = ({ items, currentItemId }) => {
  const otherItems = useMemo(
    () =>
      (items || []).filter(
        (orderItem) => String(orderItem?.id) !== String(currentItemId)
      ),
    [items, currentItemId]
  );

  if (!otherItems.length) return null;

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <SectionTitle>Other Items In This Order</SectionTitle>

      <GlassCard sx={{ overflow: "hidden" }}>
        <Stack divider={<Divider sx={{ borderColor: BORDER }} />}>
          {otherItems.map((orderItem) => {
            const status = getStatusOption(orderItem?.processing_status);

            return (
              <Stack
                key={orderItem?.id}
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ px: 2, py: 1.5 }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    bgcolor: SURFACE_STRONG,
                    color: "#93c5fd",
                  }}
                >
                  <Inventory2OutlinedIcon fontSize="small" />
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#f8fafc",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {safeValue(orderItem?.sku)}
                  </Typography>

                  <Typography
                    sx={{
                      color: TEXT_MUTED,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mt: 0.25,
                    }}
                  >
                    {safeValue(orderItem?.quantity)}
                  </Typography>
                </Box>

                <Chip
                  label={status?.label || orderItem?.processing_status || "NA"}
                  size="small"
                  sx={{
                    bgcolor: status?.bg || "rgba(255,255,255,0.08)",
                    color: status?.color || "#e2e8f0",
                    fontWeight: 700,
                    border: `1px solid ${
                      status?.color || "rgba(255,255,255,0.2)"
                    }33`,
                  }}
                />
              </Stack>
            );
          })}
        </Stack>
      </GlassCard>
    </Box>
  );
};

const SwipeActionButton = ({
  label,
  disabled,
  loading,
  color = "#22c55e",
  onComplete,
}) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const reset = () => {
    setDragging(false);
    setProgress(0);
  };

  const update = (clientX) => {
    if (!trackRef.current || disabled || loading) return;

    const rect = trackRef.current.getBoundingClientRect();
    const knob = 56;
    const max = rect.width - knob;
    const next = Math.min(
      100,
      Math.max(0, ((clientX - rect.left - knob / 2) / max) * 100)
    );

    setProgress(next);
  };

  const onDown = (event) => {
    if (disabled || loading) return;

    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    update(event.clientX);
  };

  const onMove = (event) => {
    if (dragging) update(event.clientX);
  };

  const onUp = () => {
    if (!dragging) return;

    if (progress >= 70) {
      setProgress(100);
      onComplete?.();
      setTimeout(reset, 300);
      return;
    }

    reset();
  };

  return (
    <Box
      ref={trackRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={reset}
      sx={{
        position: "relative",
        height: 60,
        borderRadius: 999,
        bgcolor: "rgba(255,255,255,0.06)",
        border: `1px solid ${BORDER}`,
        overflow: "hidden",
        touchAction: "none",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          transition: dragging ? "none" : "width 0.25s ease",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 0.5,
          zIndex: 1,
        }}
      >
        {loading ? "Please wait..." : label}
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 4,
          left: `calc(${progress}% - ${
            progress > 0 ? 56 : 4
          }px + ${progress > 0 ? 0 : 4}px)`,
          width: 52,
          height: 52,
          borderRadius: "50%",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          transition: dragging ? "none" : "left 0.25s ease",
          zIndex: 2,
        }}
      >
        {loading ? (
          <CircularProgress size={20} sx={{ color }} />
        ) : (
          <ChevronRightRoundedIcon />
        )}
      </Box>
    </Box>
  );
};

const OrderProcessByItem = () => {
  const { orderId, itemId } = useParams();
  const navigate = useNavigate();

  const accessToken = getDecryptedAccessToken();
  const user = getDecryptedData();
  const isSuperUser = Boolean(user?.is_superuser);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  );

  const [order, setOrder] = useState(null);
  const [item, setItem] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [processingStatus, setProcessingStatus] = useState("PENDING");
  const [quantityProcessed, setQuantityProcessed] = useState(0);

  const [loading, setLoading] = useState(true);
  const [, setEmployeesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isCompleted = processingStatus === "COMPLETED";
  const isAssigned = Boolean(item?.assigned_to);

  const selectedStatus = STATUS_OPTIONS.find(
    (status) => status.value === processingStatus
  );

  const maxQuantity = Number(item?.quantity ?? item?.quantity_ordered ?? 0);

  const stockDetail = item?.stock_detail || {};
  const productDetail = stockDetail?.product || {};

  const productImage =
    item?.parent_product_images ||
    stockDetail?.parent_product_images ||
    productDetail?.parent_product_images ||
    "";

  const primaryLocation = safeValue(stockDetail?.primary_location);
  const secondaryLocation = safeValue(stockDetail?.secondary_location);

  const colorName =
    stockDetail?.color?.display_name ||
    stockDetail?.color?.color_name ||
    item?.color_code ||
    "NA";

  useEffect(() => {
    if (!accessToken) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    fetchOrder();

    if (isSuperUser) {
      fetchEmployees();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isSuperUser]);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.error ||
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    fallback;

  const syncItemState = (updated) => {
    if (!updated) return;

    setItem((prev) => ({
      ...(prev || {}),
      ...updated,
    }));

    setOrder((prev) => {
      if (!prev?.items) return prev;

      return {
        ...prev,
        items: prev.items.map((orderItem) =>
          String(orderItem?.id) === String(itemId)
            ? { ...orderItem, ...updated }
            : orderItem
        ),
      };
    });

    if (updated?.processing_status) {
      setProcessingStatus(updated.processing_status);
    }

    if (updated?.quantity_processed !== undefined) {
      setQuantityProcessed(Number(updated.quantity_processed || 0));
    }

    if (updated?.assigned_to !== undefined) {
      setSelectedEmployeeId(updated.assigned_to ?? "");
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const runWithCompletedConfirmation = (title, message, action) => {
    if (!isSuperUser || !isCompleted) {
      return action();
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: action,
    });
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await ApiServices.get(`orders/${orderId}/`, headers);
      const orderData = res?.data || res || {};

      const found = (orderData?.items || []).find(
        (orderItem) => String(orderItem?.id) === String(itemId)
      );

      if (!found) {
        setError("Order item not found.");
        return;
      }

      setOrder(orderData);
      setItem(found);
      setSelectedEmployeeId(found?.assigned_to ?? "");
      setProcessingStatus(found?.processing_status || "PENDING");
      setQuantityProcessed(0);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to fetch order details."));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);

      const res = await ApiServices.get("users/", headers);
      const users = res?.data?.results || res?.results || [];

      setEmployees(users.filter((employee) => employee?.is_staff));
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err, "Failed to fetch employees."), "error");
    } finally {
      setEmployeesLoading(false);
    }
  };

  const assignEmployee = async (assignedTo) => {
    const res = await ApiServices.patch(
      `order-items/${itemId}/assign/`,
      { assigned_to: assignedTo },
      headers
    );

    const data = res?.data || res;
    syncItemState(data);

    return data;
  };

  const updateItemStatus = async (status, qty = quantityProcessed) => {
    const res = await ApiServices.patch(
      `order-items/${itemId}/update-status/`,
      {
        processing_status: status,
        quantity_processed: Number(qty || 0),
      },
      headers
    );

    const data = res?.data || res;
    syncItemState(data);

    return data;
  };

  const handleAssignSelectedEmployee = () => {
    if (!selectedEmployeeId) {
      showToast("Please select employee.", "error");
      return;
    }

    runWithCompletedConfirmation(
      "Update completed item?",
      "This item is already completed. Do you still want to change the assigned employee?",
      async () => {
        try {
          closeConfirmDialog();
          setActionLoading(true);

          const res = await assignEmployee(Number(selectedEmployeeId));
          showToast(res?.message || "Employee assigned successfully.");
        } catch (err) {
          showToast(getErrorMessage(err, "Failed to assign employee."), "error");
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleUnassignEmployee = () => {
    runWithCompletedConfirmation(
      "Update completed item?",
      "This item is already completed. Do you still want to unassign this employee?",
      async () => {
        try {
          closeConfirmDialog();
          setActionLoading(true);

          const res = await assignEmployee(null);
          showToast(res?.message || "Employee unassigned successfully.");
        } catch (err) {
          showToast(
            getErrorMessage(err, "Failed to unassign employee."),
            "error"
          );
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const clampQuantity = (value) => {
    let numberValue = Number(value);

    if (Number.isNaN(numberValue) || numberValue < 0) {
      numberValue = 0;
    }

    if (numberValue > maxQuantity) {
      numberValue = maxQuantity;
    }

    return numberValue;
  };

  const handleQuantityChange = (event) => {
    const raw = event.target.value;

    if (raw === "") {
      setQuantityProcessed("");
      return;
    }

    if (!/^\d*$/.test(raw)) return;

    setQuantityProcessed(clampQuantity(raw));
  };

  const adjustQuantity = (delta) => {
    setQuantityProcessed((prev) => {
      const current = Number(prev) || 0;
      return clampQuantity(current + delta);
    });
  };

  const handleQuantityUpdate = () => {
    if (!isSuperUser && isCompleted) return;

    runWithCompletedConfirmation(
      "Update completed item?",
      "This item is already completed. Do you still want to change the processed quantity?",
      async () => {
        try {
          closeConfirmDialog();
          setActionLoading(true);

          await updateItemStatus(processingStatus, quantityProcessed);
          showToast("Processed quantity updated successfully.");
        } catch (err) {
          showToast(getErrorMessage(err, "Failed to update quantity."), "error");
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const decrementStock = async (sku, qty) => {
  if (!sku) {
    throw new Error("SKU not found for stock decrement.");
  }

  const quantity = Number(qty || 0);

  if (quantity <= 0) {
    throw new Error("Processed quantity must be greater than 0.");
  }

  const res = await ApiServices.post(
    `stock/${encodeURIComponent(sku)}/decrement/`,
    {
      quantity,
      reason: `Packed for order ${
        order?.external_order_id || order?.id || orderId
      }`,
    },
    headers
  );

  return res?.data || res;
};

const handleSwipeMarkComplete = async () => {
  try {
    setActionLoading(true);

    const qty = Number(quantityProcessed || 0);

    if (qty <= 0) {
      showToast("Please enter processed quantity before completing.", "error");
      return;
    }

    if (!item?.sku) {
      showToast("SKU not found. Cannot decrement stock.", "error");
      return;
    }

    if (!isSuperUser) {
      if (!user?.user_id) {
        showToast("Logged-in user id not found.", "error");
        return;
      }

      if (!item?.assigned_to) {
        await assignEmployee(user.user_id);
      }
    }

    if (
      isSuperUser &&
      selectedEmployeeId &&
      String(selectedEmployeeId) !== String(item?.assigned_to)
    ) {
      await assignEmployee(Number(selectedEmployeeId));
    }

    if (processingStatus !== "IN_PROGRESS") {
      await updateItemStatus("IN_PROGRESS", qty);
    }

    await decrementStock(item.sku, qty);

    await updateItemStatus("COMPLETED", qty);

    setProcessingStatus("COMPLETED");
    setQuantityProcessed(qty);

    showToast("Item completed and stock decremented successfully.");

    if (!isSuperUser) {
      setTimeout(() => {
        navigate("/employee-user/home");
      }, 1200);
    }
  } catch (err) {
    console.error(err);
    showToast(
      err?.message ||
        getErrorMessage(err, "Failed to complete item or decrement stock."),
      "error"
    );
  } finally {
    setActionLoading(false);
  }
};

  // const handleSwipeMarkComplete = async () => {
  //   try {
  //     setActionLoading(true);

  //     const qty = Number(quantityProcessed || 0);

  //     if (!isSuperUser) {
  //       if (!user?.user_id) {
  //         showToast("Logged-in user id not found.", "error");
  //         return;
  //       }

  //       if (!item?.assigned_to) {
  //         await assignEmployee(user.user_id);
  //       }
  //     }

  //     if (
  //       isSuperUser &&
  //       selectedEmployeeId &&
  //       String(selectedEmployeeId) !== String(item?.assigned_to)
  //     ) {
  //       await assignEmployee(Number(selectedEmployeeId));
  //     }

  //     if (processingStatus !== "IN_PROGRESS") {
  //       await updateItemStatus("IN_PROGRESS", qty);
  //     }

  //     await updateItemStatus("COMPLETED", qty);

  //     setProcessingStatus("COMPLETED");
  //     setQuantityProcessed(qty);

  //     showToast("Item marked as completed.");

  //     if (!isSuperUser) {
  //       setTimeout(() => {
  //         navigate("/employee-user/home");
  //       }, 1200);
  //     }
  //   } catch (err) {
  //     showToast(getErrorMessage(err, "Failed to complete item."), "error");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: BG_GRADIENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#60a5fa" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", background: BG_GRADIENT, p: 2 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!order || !item) return null;

  const showBottomSwipe = !isCompleted;

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: BG_GRADIENT,
          pb: showBottomSwipe ? 14 : 4,
          color: "#e2e8f0",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7))",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${BORDER}`,
            px: 2,
            py: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  color: TEXT_MUTED,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Process Item
              </Typography>

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#f8fafc",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {safeValue(order?.external_order_id)}
                <Box component="span" sx={{ color: TEXT_MUTED, mx: 0.75 }}>
                  /
                </Box>
                {safeValue(item?.sku)}
              </Typography>
            </Box>

            <Chip
              label={selectedStatus?.label || processingStatus || "NA"}
              size="small"
              sx={{
                bgcolor: selectedStatus?.bg || "rgba(255,255,255,0.08)",
                color: selectedStatus?.color || "#e2e8f0",
                fontWeight: 700,
                border: `1px solid ${
                  selectedStatus?.color || "rgba(255,255,255,0.2)"
                }33`,
                height: 28,
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ p: 2, maxWidth: 560, mx: "auto" }}>
          <GlassCard sx={{ p: 2, mb: 2 }}>
            {productImage ? (
              <Box
                component="img"
                src={productImage}
                alt={item?.product_name || item?.sku || "Product"}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                sx={{
                  width: "100%",
                  height: 240,
                  objectFit: "contain",
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BORDER}`,
                  mb: 2,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 180,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BORDER}`,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: TEXT_MUTED,
                  fontWeight: 700,
                }}
              >
                No Image
              </Box>
            )}

            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                color: "#f8fafc",
                mb: 1.5,
              }}
            >
              {safeValue(item?.product_name)}
            </Typography>

            <Divider sx={{ borderColor: BORDER, mb: 1 }} />

            <Stack divider={<Divider sx={{ borderColor: BORDER }} />}>
              <InfoTile
                icon={<Inventory2OutlinedIcon fontSize="small" />}
                label="SKU"
                value={item?.sku}
              />

              <InfoTile
                icon={<Inventory2OutlinedIcon fontSize="small" />}
                label="Color"
                value={colorName}
              />

              <InfoTile
                icon={<NumbersOutlinedIcon fontSize="small" />}
                label="Quantity"
                value={item?.quantity}
              />

              <InfoTile
                icon={<NumbersOutlinedIcon fontSize="small" />}
                label="Available Stock In MTR"
                value={stockDetail?.available_stock_in_mtr}
              />

              <InfoTile
                icon={<LocationOnOutlinedIcon fontSize="small" />}
                label="Primary Location"
                value={primaryLocation}
              />

              <InfoTile
                icon={<LocationOnOutlinedIcon fontSize="small" />}
                label="Secondary Location"
                value={secondaryLocation}
              />

              <InfoTile
                icon={<LocalShippingOutlinedIcon fontSize="small" />}
                label="Order"
                value={order?.external_order_id}
              />
            </Stack>
          </GlassCard>

          {isSuperUser && (
            <Box sx={{ mb: 2 }}>
              <SectionTitle>Assignment</SectionTitle>

              <GlassCard sx={{ p: 2 }}>
                <FormControl fullWidth size="small" sx={selectSx}>
                  <InputLabel>Employee</InputLabel>

                  <Select
                    label="Employee"
                    value={selectedEmployeeId}
                    onChange={(event) =>
                      setSelectedEmployeeId(event.target.value)
                    }
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {getEmployeeName(employee)}
                        {employee?.usertype?.name
                          ? ` — ${employee.usertype.name}`
                          : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }}>
                  <Button
                    fullWidth
                    onClick={handleAssignSelectedEmployee}
                    disabled={actionLoading}
                    startIcon={<AssignmentIndOutlinedIcon />}
                    sx={primaryBtn}
                  >
                    Assign
                  </Button>

                  <Button
                    fullWidth
                    onClick={handleUnassignEmployee}
                    disabled={actionLoading || !isAssigned}
                    startIcon={<PersonRemoveOutlinedIcon />}
                    sx={ghostBtn}
                  >
                    Unassign
                  </Button>
                </Stack>
              </GlassCard>
            </Box>
          )}

          {!isCompleted && (
            <Box sx={{ mb: 2 }}>
              <SectionTitle>Processed Quantity</SectionTitle>

              <GlassCard sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <IconButton
                    size="small"
                    disabled={
                      actionLoading || Number(quantityProcessed || 0) <= 0
                    }
                    onClick={() => adjustQuantity(-1)}
                    sx={quantityBtnSx}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>

                  <TextField
                    fullWidth
                    size="small"
                    label="Processed Qty"
                    value={quantityProcessed}
                    onChange={handleQuantityChange}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      style: {
                        textAlign: "center",
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      },
                    }}
                    sx={{
                      ...inputSx,
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          WebkitAppearance: "none",
                          margin: 0,
                        },
                    }}
                  />

                  <IconButton
                    size="small"
                    disabled={
                      actionLoading ||
                      Number(quantityProcessed || 0) >= maxQuantity
                    }
                    onClick={() => adjustQuantity(1)}
                    sx={quantityBtnSx}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>

                  <Button
                    onClick={handleQuantityUpdate}
                    disabled={actionLoading}
                    sx={{ ...primaryBtn, minWidth: 100 }}
                  >
                    Update
                  </Button>
                </Stack>

                <Typography sx={{ mt: 1.25, fontSize: 12, color: TEXT_MUTED }}>
                  Max quantity: {maxQuantity}
                </Typography>
              </GlassCard>
            </Box>
          )}

          {isCompleted && (
            <GlassCard
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderColor: "rgba(34,197,94,0.35)",
                bgcolor: "rgba(34,197,94,0.08)",
                mb: 2,
              }}
            >
              <CheckCircleRoundedIcon sx={{ color: "#22c55e" }} />

              <Box>
                <Typography sx={{ fontWeight: 700, color: "#bbf7d0" }}>
                  Item completed
                </Typography>

                <Typography sx={{ fontSize: 12, color: TEXT_MUTED }}>
                  Processed quantity: {safeValue(quantityProcessed)}
                </Typography>
              </Box>
            </GlassCard>
          )}

          <OtherOrderItems items={order?.items} currentItemId={itemId} />
        </Box>
      </Box>

      {showBottomSwipe && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            pb: "calc(env(safe-area-inset-bottom) + 16px)",
            background:
              "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.95) 40%)",
            zIndex: 20,
          }}
        >
          <Box sx={{ maxWidth: 560, mx: "auto" }}>
            <SwipeActionButton
              label="Swipe to Mark as Complete"
              loading={actionLoading}
              color="#22c55e"
              onComplete={handleSwipeMarkComplete}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "#e2e8f0",
            borderRadius: 3,
            border: `1px solid ${BORDER}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmDialog.title}
        </DialogTitle>

        <DialogContent sx={{ color: TEXT_MUTED }}>
          {confirmDialog.message}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeConfirmDialog} sx={ghostBtn}>
            Cancel
          </Button>

          <Button onClick={() => confirmDialog.onConfirm?.()} sx={primaryBtn}>
            Yes, Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: showBottomSwipe ? 11 : 0 }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const primaryBtn = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  minHeight: 44,
  color: "#fff",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
  "&:hover": {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  },
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.5)",
    background: "rgba(59,130,246,0.3)",
  },
};

const ghostBtn = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  minHeight: 44,
  color: "#e2e8f0",
  bgcolor: SURFACE_STRONG,
  border: `1px solid ${BORDER}`,
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.1)",
  },
};

const quantityBtnSx = {
  width: 40,
  height: 40,
  borderRadius: 2,
  color: "#e2e8f0",
  bgcolor: SURFACE_STRONG,
  border: `1px solid ${BORDER}`,
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.1)",
  },
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.25)",
  },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#f1f5f9",
    bgcolor: SURFACE,
    "& fieldset": {
      borderColor: BORDER,
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3b82f6",
    },
  },
  "& .MuiInputLabel-root": {
    color: TEXT_MUTED,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#60a5fa",
  },
};

const selectSx = {
  ...inputSx,
  "& .MuiSelect-icon": {
    color: TEXT_MUTED,
  },
};

export default OrderProcessByItem;