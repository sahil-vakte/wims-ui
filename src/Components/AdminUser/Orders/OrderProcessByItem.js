
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   Alert,
//   CircularProgress,
//   Grid,
//   Paper,
//   Chip,
//   Divider,
//   Card,
//   CardContent,
//   Button,
// } from "@mui/material";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken, getDecryptedData } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// /* ---------- HELPERS ---------- */

// const InfoRow = ({ label, value }) => (
//   <Grid item xs={12} sm={6}>
//     <Typography variant="caption" color="text.secondary">
//       {label}
//     </Typography>
//     <Typography fontWeight={600}>{value || "-"}</Typography>
//   </Grid>
// );

// const Section = ({ title, children }) => (
//   <Paper
//     elevation={0}
//     sx={{
//       p: { xs: 2, md: 3 },
//       mb: 3,
//       borderRadius: 3,
//       border: "1px solid #eaeaea",
//     }}
//   >
//     <Typography variant="h6" fontWeight={700} mb={2}>
//       {title}
//     </Typography>
//     {children}
//   </Paper>
// );

// /* ---------- MAIN COMPONENT ---------- */

// const OrderProcessByItem = () => {
//   const { orderId, itemId } = useParams();
//   const accessToken = getDecryptedAccessToken();
//   const user = getDecryptedData();
// console.log("user",user)
//   const headers = {
//     Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
//     "Content-Type": "application/json",
//   };

//   const [order, setOrder] = useState(null);
//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!accessToken) {
//       setError("Session expired. Please login again.");
//       setLoading(false);
//       return;
//     }
//     fetchOrder();
//   }, []);

//   const fetchOrder = async () => {
//     try {
//       const res = await ApiServices.get(`orders/${orderId}/`, headers);
//       const orderData = res?.data;

//       const foundItem = (orderData?.items || []).find(
//         (i) => String(i.id) === String(itemId)
//       );

//       if (!foundItem) {
//         setError("Order item not found.");
//         return;
//       }

//       setOrder(orderData);
//       setItem(foundItem);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch order details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------- STATES ---------- */

//   if (loading)
//     return (
//       <Box textAlign="center" mt={6}>
//         <CircularProgress />
//       </Box>
//     );

//   if (error)
//     return (
//       <Box mt={4}>
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );

//   if (!order || !item) return null;

//   /* ---------- UI ---------- */

//   return (
//     <>
//       <Box p={{ xs: 2, md: 4 }} maxWidth="1000px" mx="auto">
//         <Typography variant="h4" fontWeight={800} mb={3}>
//           Process Order Item
//         </Typography>

//         {/* ---------- ORDER DETAILS ---------- */}
//         <Section title="Order Information">
//           <Grid container spacing={2}>
//             <InfoRow label="Order Number" value={order.order_number} />
//             <InfoRow label="External Order ID" value={order.external_order_id} />
//             <InfoRow label="Customer Name" value={order.customer_name} />
//             <InfoRow label="Email" value={order.customer_email} />
//             <InfoRow label="Phone" value={order.customer_phone} />
//             <InfoRow label="Payment Method" value={order.payment_method} />
//             <InfoRow label="Payment Status" value={order.payment_status_display} />
//             <InfoRow label="Order Status" value={order.order_status_display} />
//             <InfoRow label="Total Amount" value={`£${order.total_amount}`} />
//             <InfoRow label="Subtotal" value={`£${order.subtotal}`} />
//             <InfoRow label="Tax Amount" value={`£${order.tax_amount}`} />
//             <InfoRow label="Shipping Cost" value={`£${order.shipping_cost}`} />

//             <Grid item xs={12}>
//               <Divider sx={{ my: 1 }} />
//             </Grid>

//             <InfoRow label="Shipping Address" value={order.shipping_address} />
//             <InfoRow label="Billing Address" value={order.billing_address} />

//             <Grid item xs={12}>
//               <Divider sx={{ my: 1 }} />
//             </Grid>

//             <InfoRow label="Order Date" value={order.order_date} />
//             <InfoRow label="Payment Reference" value={order.payment_reference} />
//           </Grid>
//         </Section>

//         {/* ---------- ITEM DETAILS (ONLY SELECTED ITEM) ---------- */}
//         <Section title="Item Details">
//           <Card variant="outlined" sx={{ borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="h6" fontWeight={800}>
//                 {item.product_name}
//               </Typography>

//               <Typography variant="body2" color="text.secondary" mb={1}>
//                 SKU: {item.sku}
//               </Typography>

//               <Grid container spacing={2}>
//                 <InfoRow label="Quantity" value={item.quantity} />
//                 <InfoRow label="Unit Price" value={`£${item.unit_price}`} />
//                 <InfoRow label="Tax Rate" value={`${item.tax_rate}%`} />
//                 <InfoRow label="Line Total" value={`£${item.line_total}`} />
//                 <InfoRow label="Discount" value={`£${item.discount_amount}`} />
//               </Grid>
//             </CardContent>
//           </Card>
//         </Section>
//       </Box>

//       {/* ---------- ACTION BAR ---------- */}
//       <Paper
//         elevation={10}
//         sx={{
//           position: "sticky",
//           bottom: 0,
//           borderTop: "1px solid #ddd",
//           p: 2,
//           background: "#fff",
//         }}
//       >
//         <Box
//           maxWidth="1000px"
//           mx="auto"
//           display="flex"
//           justifyContent="flex-end"
//         >
//           <Button
//             variant="contained"
//             size="large"
//             sx={{
//               px: 4,
//               py: 1.5,
//               fontWeight: 700,
//               borderRadius: 3,
//             }}
//             onClick={() =>
//               console.log("Start processing item", orderId, itemId)
//             }
//           >
//             Start Item Processing
//           </Button>
//         </Box>
//       </Paper>
//     </>
//   );
// };

// export default OrderProcessByItem;





import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import {
  getDecryptedAccessToken,
  getDecryptedData,
} from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";


const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", color: "default" },
  { value: "IN_PROGRESS", label: "In Progress", color: "info" },
  { value: "COMPLETED", label: "Completed", color: "success" },
];

const getEmployeeName = (employee) => {
  const fullName = `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim();
  return fullName || employee?.username || employee?.email || `User ${employee?.id}`;
};

const InfoRow = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography fontWeight={700}>{value ?? "-"}</Typography>
  </Grid>
);

const Section = ({ title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 },
      mb: 2,
      borderRadius: 2,
      border: "1px solid #e8e8e8",
    }}
  >
    <Typography variant="h6" fontWeight={800} mb={2}>
      {title}
    </Typography>
    {children}
  </Paper>
);

const SwipeActionButton = ({ label, disabled, loading, color = "#16a34a", onComplete }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetSwipe = () => {
    setDragging(false);
    setProgress(0);
  };

  const updateProgress = (clientX) => {
    if (!trackRef.current || disabled || loading) return;

    const rect = trackRef.current.getBoundingClientRect();
    const nextProgress = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );

    setProgress(nextProgress);
  };

  const handlePointerDown = (event) => {
    if (disabled || loading) return;

    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateProgress(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    updateProgress(event.clientX);
  };

  const handlePointerUp = () => {
    if (!dragging) return;

    if (progress >= 70) {
      setProgress(100);
      onComplete();
      setTimeout(resetSwipe, 300);
      return;
    }

    resetSwipe();
  };

  return (
    <Box
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={resetSwipe}
      sx={{
        width: "100%",
        height: 58,
        borderRadius: 999,
        position: "relative",
        overflow: "hidden",
        cursor: disabled || loading ? "not-allowed" : "grab",
        bgcolor: disabled || loading ? "#d1d5db" : "#111827",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: `${progress}%`,
          bgcolor: color,
          transition: dragging ? "none" : "width 180ms ease",
        }}
      />

      <Typography
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 900,
          fontSize: 15,
          px: 7,
          textAlign: "center",
        }}
      >
        {loading ? "Please wait..." : label}
      </Typography>

      <Box
        sx={{
          position: "absolute",
          left: `calc(${progress}% + 5px)`,
          top: 5,
          width: 48,
          height: 48,
          transform: "translateX(-5px)",
          borderRadius: "50%",
          bgcolor: "#fff",
          color: "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          transition: dragging ? "none" : "left 180ms ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        →
      </Box>
    </Box>
  );
};

const OrderProcessByItem = () => {
  const { orderId, itemId } = useParams();

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
  const [employeesLoading, setEmployeesLoading] = useState(false);
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
  }, [accessToken, isSuperUser]);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const getErrorMessage = (err, fallback) => {
    return (
      err?.response?.data?.error ||
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      fallback
    );
  };

  const syncItemState = (updatedItem) => {
    setItem((prev) => ({
      ...prev,
      ...updatedItem,
    }));

    if (updatedItem?.processing_status) {
      setProcessingStatus(updatedItem.processing_status);
    }

    if (updatedItem?.quantity_processed !== undefined) {
      setQuantityProcessed(updatedItem.quantity_processed);
    }

    if (updatedItem?.assigned_to !== undefined) {
      setSelectedEmployeeId(updatedItem.assigned_to ?? "");
    }
  };

  const runWithCompletedConfirmation = (title, message, action) => {
    if (!isSuperUser || !isCompleted) {
      action();
      return;
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await ApiServices.get(`orders/${orderId}/`, headers);
      const orderData = res?.data;

      const foundItem = (orderData?.items || []).find(
        (orderItem) => String(orderItem.id) === String(itemId)
      );

      if (!foundItem) {
        setError("Order item not found.");
        return;
      }

      const defaultQuantity =
        foundItem.quantity_processed ?? foundItem.quantity ?? 0;

      setOrder(orderData);
      setItem(foundItem);
      setSelectedEmployeeId(foundItem.assigned_to ?? "");
      setProcessingStatus(foundItem.processing_status || "PENDING");
      setQuantityProcessed(defaultQuantity);
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
      const users = res?.data?.results || [];

      setEmployees(users.filter((employee) => employee.is_staff));
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

    syncItemState(res?.data);
    return res?.data;
  };

  const updateItemStatus = async (status, qty = quantityProcessed) => {
    const payload = {
      processing_status: status,
      quantity_processed: Number(qty || 0),
    };

    const res = await ApiServices.patch(
      `order-items/${itemId}/update-status/`,
      payload,
      headers
    );

    syncItemState(res?.data);
    return res?.data;
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
          console.error(err);
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
          console.error(err);
          showToast(getErrorMessage(err, "Failed to unassign employee."), "error");
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleStatusChange = (status) => {
    if (!isSuperUser && isCompleted) return;

    runWithCompletedConfirmation(
      "Update completed item?",
      "This item is already completed. Do you still want to change its status or processed quantity?",
      async () => {
        try {
          closeConfirmDialog();
          setActionLoading(true);
          setProcessingStatus(status);

          await updateItemStatus(status);
          showToast("Status updated successfully.");
        } catch (err) {
          console.error(err);
          showToast(getErrorMessage(err, "Failed to update status."), "error");
          setProcessingStatus(item?.processing_status || "PENDING");
        } finally {
          setActionLoading(false);
        }
      }
    );
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
          console.error(err);
          showToast(getErrorMessage(err, "Failed to update quantity."), "error");
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleStartProcessing = async () => {
    try {
      setActionLoading(true);

      if (!isSuperUser) {
        if (!user?.user_id) {
          showToast("Logged-in user id not found.", "error");
          return;
        }

        await assignEmployee(user.user_id);
      } else if (selectedEmployeeId && String(selectedEmployeeId) !== String(item?.assigned_to)) {
        await assignEmployee(Number(selectedEmployeeId));
      }

      await updateItemStatus("IN_PROGRESS", quantityProcessed);
      setProcessingStatus("IN_PROGRESS");
      showToast("Processing started.");
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err, "Failed to start processing."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setActionLoading(true);

      const qty = quantityProcessed || item?.quantity || 0;

      await updateItemStatus("COMPLETED", qty);
      setProcessingStatus("COMPLETED");
      showToast("Item marked as completed.");
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err, "Failed to complete item."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!order || !item) return null;

  const canShowEmployeeActions = isSuperUser;
  const canShowWorkActions = isSuperUser || !isCompleted;
  const showBottomSwipe = !isCompleted;
  const swipeLabel = isAssigned
    ? "Swipe to Mark as Complete"
    : "Swipe to Start Processing";

  return (
    <>
      <Box p={{ xs: 1.5, md: 4 }} maxWidth="950px" mx="auto" pb={showBottomSwipe ? 12 : 3}>
        <Stack spacing={1.5} mb={2}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Process Item
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.order_number} / {item.sku}
              </Typography>
            </Box>

            <Chip
              label={selectedStatus?.label || processingStatus}
              color={selectedStatus?.color || "default"}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography fontWeight={900} fontSize={18}>
                {item.product_name}
              </Typography>

              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                <Chip size="small" label={`Qty: ${item.quantity || 0}`} />
                <Chip
                  size="small"
                  label={`Done: ${quantityProcessed || 0}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    item.assigned_to
                      ? `Assigned: ${
                          item.assigned_to_full_name ||
                          item.assigned_to_username ||
                          item.assigned_to
                        }`
                      : "Not assigned"
                  }
                  color={item.assigned_to ? "success" : "warning"}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {canShowEmployeeActions && (
          <Section title="Assign Employee">
            <Stack spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  label="Employee"
                  value={selectedEmployeeId}
                  disabled={employeesLoading || actionLoading}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {getEmployeeName(employee)}
                      {employee.usertype?.name ? ` - ${employee.usertype.name}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAssignSelectedEmployee}
                  disabled={actionLoading || !selectedEmployeeId}
                >
                  Assign
                </Button>

                <Button
                  fullWidth
                  color="warning"
                  variant="outlined"
                  onClick={handleUnassignEmployee}
                  disabled={actionLoading || !item.assigned_to}
                >
                  Unassign
                </Button>
              </Stack>
            </Stack>
          </Section>
        )}

        {canShowWorkActions && (
          <Section title="Status">
            <Grid container spacing={1}>
              {STATUS_OPTIONS.map((status) => {
                const active = processingStatus === status.value;

                return (
                  <Grid item xs={4} key={status.value}>
                    <Button
                      fullWidth
                      variant={active ? "contained" : "outlined"}
                      color={status.color === "default" ? "inherit" : status.color}
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(status.value)}
                      sx={{
                        minHeight: 54,
                        borderRadius: 2,
                        fontWeight: 800,
                        fontSize: { xs: 12, sm: 14 },
                        px: 1,
                      }}
                    >
                      {status.label}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Quantity Processed"
                value={quantityProcessed}
                inputProps={{
                  min: 0,
                  max: item.quantity,
                }}
                disabled={actionLoading}
                onChange={(e) => setQuantityProcessed(e.target.value)}
              />

              <Button
                variant="contained"
                disabled={actionLoading}
                onClick={handleQuantityUpdate}
                sx={{ minWidth: { xs: "100%", sm: 160 }, fontWeight: 800 }}
              >
                Update Qty
              </Button>
            </Stack>
          </Section>
        )}

        {isCompleted && !isSuperUser && (
          <Alert severity="success" sx={{ mb: 2 }}>
            This item has been completed. No further action is required.
          </Alert>
        )}

        <Section title="Order Information">
          <Grid container spacing={2}>
            <InfoRow label="Order Number" value={order.order_number} />
            <InfoRow label="Order Status" value={order.order_status_display} />
            <InfoRow label="Payment Status" value={order.payment_status_display} />
            <InfoRow label="Payment Method" value={order.payment_method} />
            <InfoRow label="Order Date" value={order.order_date} />

            {isSuperUser && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>

                <InfoRow label="Customer Name" value={order.customer_name} />
                <InfoRow label="Email" value={order.customer_email} />
                <InfoRow label="Phone" value={order.customer_phone} />
                <InfoRow label="External Order ID" value={order.external_order_id} />

                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>

                <InfoRow label="Total Amount" value={`GBP ${order.total_amount}`} />
                <InfoRow label="Subtotal" value={`GBP ${order.subtotal}`} />
                <InfoRow label="Tax Amount" value={`GBP ${order.tax_amount}`} />
                <InfoRow label="Shipping Cost" value={`GBP ${order.shipping_cost}`} />
              </>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <InfoRow label="Shipping Address" value={order.shipping_address} />

            {isSuperUser && (
              <InfoRow label="Billing Address" value={order.billing_address} />
            )}
          </Grid>
        </Section>

        <Section title="Item Details">
          <Grid container spacing={2}>
            <InfoRow label="Product" value={item.product_name} />
            <InfoRow label="SKU" value={item.sku} />
            <InfoRow label="Quantity" value={item.quantity} />
            <InfoRow label="Processed" value={quantityProcessed ?? 0} />

            {isSuperUser && (
              <>
                <InfoRow label="Unit Price" value={`GBP ${item.unit_price}`} />
                <InfoRow label="Line Total" value={`GBP ${item.line_total}`} />
                <InfoRow label="Tax Rate" value={`${item.tax_rate}%`} />
                <InfoRow label="Discount" value={`GBP ${item.discount_amount}`} />
              </>
            )}
          </Grid>
        </Section>
      </Box>

      {showBottomSwipe && (
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            p: 1.5,
            bgcolor: "#fff",
            borderTop: "1px solid #ddd",
            zIndex: 20,
          }}
        >
          <Box maxWidth="950px" mx="auto">
            <SwipeActionButton
              loading={actionLoading}
              disabled={actionLoading}
              label={swipeLabel}
              color={isAssigned ? "#16a34a" : "#2563eb"}
              onComplete={isAssigned ? handleMarkComplete : handleStartProcessing}
            />
          </Box>
        </Paper>
      )}

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => confirmDialog.onConfirm?.()}
          >
            Yes, Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderProcessByItem;