// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   Alert,
//   Avatar,
//   Box,
//   Button,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   FormControl,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Select,
//   Snackbar,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
// import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";

// const BG_DARK = "#0b1220";
// const CARD_BG = "#111827";
// const TEXT_PRIMARY = "#f3f4f6";
// const TEXT_MUTED = "#9ca3af";
// const BORDER_COLOR = "#374151";
// const INPUT_BG = "#1f2937";
// const ACCENT = "#3b82f6";

// const PAGE_BG = "#0b1120";

// const inputSx = {
//   "& .MuiOutlinedInput-root": {
//     backgroundColor: INPUT_BG,
//     borderRadius: 1.5,
//     color: TEXT_PRIMARY,
//     "& fieldset": { borderColor: BORDER_COLOR },
//     "&:hover fieldset": { borderColor: BORDER_COLOR },
//     "&.Mui-focused fieldset": { borderColor: ACCENT },
//   },
//   "& .MuiInputLabel-root": { color: TEXT_MUTED },
//   "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
// };

// const selectSx = {
//   ...inputSx,
//   "& .MuiSelect-icon": { color: TEXT_MUTED },
// };

// const OrderProcessByItem = () => {
//   const { orderId } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

//   const [assignDialogOpen, setAssignDialogOpen] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("");

//   const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
//   const [itemToRemove, setItemToRemove] = useState(null);

//   const [processQuantities, setProcessQuantities] = useState({});

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         setLoading(true);
//         // Replace with your actual API call
//         const data = await ApiServices.getOrderById(orderId);
//         setOrder(data);
//         const initialQty = {};
//         (data.items || []).forEach((item) => {
//           initialQty[item.id] = item.quantity || 0;
//         });
//         setProcessQuantities(initialQty);
//       } catch (err) {
//         setError("Failed to load order");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrder();
//   }, [orderId]);

//   const handleQuantityChange = (itemId, value, maxQty) => {
//     let num = parseInt(value, 10);
//     if (isNaN(num) || num < 0) num = 0;
//     if (num > maxQty) num = maxQty;
//     setProcessQuantities((prev) => ({ ...prev, [itemId]: num }));
//   };

//   const adjustQuantity = (itemId, delta, maxQty) => {
//     setProcessQuantities((prev) => {
//       let next = (prev[itemId] || 0) + delta;
//       if (next < 0) next = 0;
//       if (next > maxQty) next = maxQty;
//       return { ...prev, [itemId]: next };
//     });
//   };

//   const handleAssignClick = (item) => {
//     setItemToRemove(null);
//     setAssignDialogOpen(true);
//   };

//   const handleRemoveClick = (item) => {
//     setItemToRemove(item);
//     setRemoveDialogOpen(true);
//   };

//   const confirmAssign = () => {
//     setAssignDialogOpen(false);
//     setSnackbar({ open: true, message: "Item assigned successfully", severity: "success" });
//   };

//   const confirmRemove = () => {
//     setRemoveDialogOpen(false);
//     setSnackbar({ open: true, message: "Assignment removed", severity: "success" });
//   };

//   const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

//   if (loading) {
//     return (
//       <Box sx={{ minHeight: "100vh", bgcolor: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <CircularProgress sx={{ color: ACCENT }} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ minHeight: "100vh", bgcolor: PAGE_BG, p: 3 }}>
//         <Alert severity="error" sx={{ bgcolor: "#1f2937", color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}` }}>
//           {error}
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: PAGE_BG, color: TEXT_PRIMARY, p: { xs: 2, md: 4 } }}>
//       <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
//         Order Details
//       </Typography>

//       <Box sx={{ display: "grid", gap: 2 }}>
//         {(order?.items || []).map((item) => {
//           const maxQty = item.quantity || 0;
//           const currentQty = processQuantities[item.id] || 0;

//           return (
//             <Box
//               key={item.id}
//               sx={{
//                 bgcolor: CARD_BG,
//                 border: `1px solid ${BORDER_COLOR}`,
//                 borderRadius: 2,
//                 p: { xs: 2, md: 3 },
//               }}
//             >
//               <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
//                 <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
//                   <Avatar
//                     src={item.image}
//                     alt={item.name}
//                     variant="rounded"
//                     sx={{ width: 56, height: 56, bgcolor: INPUT_BG }}
//                   />
//                   <Box>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                       {item.name}
//                     </Typography>
//                     <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
//                       SKU: {item.sku}
//                     </Typography>
//                   </Box>
//                 </Stack>

//                 <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: { xs: 2, md: 0 } }}>
//                   <Box>
//                     <Typography variant="caption" sx={{ color: TEXT_MUTED, display: "block" }}>
//                       Total Qty
//                     </Typography>
//                     <Typography variant="body1" sx={{ fontWeight: 600, textAlign: "center" }}>
//                       {item.quantity}
//                     </Typography>
//                   </Box>

//                   <Divider orientation="vertical" flexItem sx={{ bgcolor: BORDER_COLOR }} />

//                   <Box>
//                     <Typography variant="caption" sx={{ color: TEXT_MUTED, display: "block", mb: 0.5 }}>
//                       Qty to Process
//                     </Typography>
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                       <IconButton
//                         size="small"
//                         onClick={() => adjustQuantity(item.id, -1, maxQty)}
//                         disabled={currentQty <= 0}
//                         sx={{
//                           color: TEXT_PRIMARY,
//                           bgcolor: INPUT_BG,
//                           border: `1px solid ${BORDER_COLOR}`,
//                           "&:hover": { bgcolor: "#374151" },
//                           "&.Mui-disabled": { color: "#6b7280" },
//                         }}
//                       >
//                         <RemoveIcon fontSize="small" />
//                       </IconButton>

//                       <TextField
//                         value={currentQty}
//                         onChange={(e) => handleQuantityChange(item.id, e.target.value, maxQty)}
//                         inputProps={{
//                           inputMode: "numeric",
//                           pattern: "[0-9]*",
//                           style: { textAlign: "center", padding: "6px 0" },
//                         }}
//                         sx={{
//                           width: 72,
//                           ...inputSx,
//                           "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
//                             WebkitAppearance: "none",
//                             margin: 0,
//                           },
//                           "& input[type=number]": { MozAppearance: "textfield" },
//                         }}
//                         size="small"
//                       />

//                       <IconButton
//                         size="small"
//                         onClick={() => adjustQuantity(item.id, 1, maxQty)}
//                         disabled={currentQty >= maxQty}
//                         sx={{
//                           color: TEXT_PRIMARY,
//                           bgcolor: INPUT_BG,
//                           border: `1px solid ${BORDER_COLOR}`,
//                           "&:hover": { bgcolor: "#374151" },
//                           "&.Mui-disabled": { color: "#6b7280" },
//                         }}
//                       >
//                         <AddIcon fontSize="small" />
//                       </IconButton>
//                     </Stack>
//                   </Box>

//                   <Divider orientation="vertical" flexItem sx={{ bgcolor: BORDER_COLOR }} />

//                   <Box>
//                     <Typography variant="caption" sx={{ color: TEXT_MUTED, display: "block" }}>
//                       Assigned To
//                     </Typography>
//                     <Chip
//                       avatar={<Avatar alt={item.assignedTo?.name}>{item.assignedTo?.name?.charAt(0)}</Avatar>}
//                       label={item.assignedTo?.name || "Unassigned"}
//                       size="small"
//                       sx={{
//                         bgcolor: INPUT_BG,
//                         color: TEXT_PRIMARY,
//                         border: `1px solid ${BORDER_COLOR}`,
//                         "& .MuiChip-avatar": { width: 24, height: 24, fontSize: 12 },
//                       }}
//                     />
//                   </Box>
//                 </Stack>

//                 <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, md: 0 } }}>
//                   <IconButton
//                     onClick={() => handleAssignClick(item)}
//                     sx={{
//                       color: "#60a5fa",
//                       bgcolor: "#1e3a8a",
//                       borderRadius: 1.5,
//                       "&:hover": { bgcolor: "#1e40af" },
//                     }}
//                   >
//                     <AssignmentIndOutlinedIcon />
//                   </IconButton>
//                   <IconButton
//                     onClick={() => handleRemoveClick(item)}
//                     sx={{
//                       color: "#f87171",
//                       bgcolor: "#7f1d1d",
//                       borderRadius: 1.5,
//                       "&:hover": { bgcolor: "#991b1b" },
//                     }}
//                   >
//                     <PersonRemoveOutlinedIcon />
//                   </IconButton>
//                 </Stack>
//               </Stack>
//             </Box>
//           );
//         })}
//       </Box>

//       {/* Assign Dialog */}
//       <Dialog
//         open={assignDialogOpen}
//         onClose={() => setAssignDialogOpen(false)}
//         PaperProps={{
//           sx: { bgcolor: CARD_BG, color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}`, borderRadius: 2 },
//         }}
//       >
//         <DialogTitle sx={{ color: TEXT_PRIMARY }}>Assign Item</DialogTitle>
//         <DialogContent>
//           <FormControl fullWidth sx={{ mt: 1, ...selectSx }}>
//             <InputLabel>Assign to</InputLabel>
//             <Select value={selectedUser} label="Assign to" onChange={(e) => setSelectedUser(e.target.value)}>
//               {users.map((u) => (
//                 <MenuItem key={u.id} value={u.id}>
//                   {u.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: TEXT_MUTED }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={confirmAssign}
//             variant="contained"
//             disabled={!selectedUser}
//             sx={{ bgcolor: ACCENT, "&:hover": { bgcolor: "#2563eb" } }}
//           >
//             Assign
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Remove Dialog */}
//       <Dialog
//         open={removeDialogOpen}
//         onClose={() => setRemoveDialogOpen(false)}
//         PaperProps={{
//           sx: { bgcolor: CARD_BG, color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}`, borderRadius: 2 },
//         }}
//       >
//         <DialogTitle sx={{ color: TEXT_PRIMARY }}>Remove Assignment</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to remove the assignment for {itemToRemove?.name}?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setRemoveDialogOpen(false)} sx={{ color: TEXT_MUTED }}>
//             Cancel
//           </Button>
//           <Button onClick={confirmRemove} variant="contained" sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}>
//             Remove
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default OrderProcessByItem;


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
import ApiServices from "../../../Services/ApiServices/ApiServices";
import {
  getDecryptedAccessToken,
  getDecryptedData,
} from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

/* ---------- theme helpers ---------- */
const BG_GRADIENT = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
const SURFACE = "rgba(255,255,255,0.04)";
const SURFACE_STRONG = "rgba(255,255,255,0.07)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(226,232,240,0.65)";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  { value: "COMPLETED", label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
];

const getEmployeeName = (e) => {
  const f = `${e?.first_name || ""} ${e?.last_name || ""}`.trim();
  return f || e?.username || e?.email || `User ${e?.id}`;
};

/* ---------- small presentational pieces ---------- */
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
      <Typography sx={{ fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#f1f5f9", fontWeight: 600, wordBreak: "break-word" }}>
        {value ?? "-"}
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

/* ---------- swipe action ---------- */
const SwipeActionButton = ({ label, disabled, loading, color = "#22c55e", onComplete }) => {
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
    const next = Math.min(100, Math.max(0, ((clientX - rect.left - knob / 2) / max) * 100));
    setProgress(next);
  };

  const onDown = (e) => {
    if (disabled || loading) return;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    update(e.clientX);
  };
  const onMove = (e) => dragging && update(e.clientX);
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
      {/* fill */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          transition: dragging ? "none" : "width 0.25s ease",
        }}
      />
      {/* label */}
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
      {/* knob */}
      <Box
        sx={{
          position: "absolute",
          top: 4,
          left: `calc(${progress}% - ${progress > 0 ? 56 : 4}px + ${progress > 0 ? 0 : 4}px)`,
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
        {loading ? <CircularProgress size={20} sx={{ color }} /> : <ChevronRightRoundedIcon />}
      </Box>
    </Box>
  );
};

/* ---------- main ---------- */
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
  const [, setEmployeesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const isCompleted = processingStatus === "COMPLETED";
  const isAssigned = Boolean(item?.assigned_to);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === processingStatus);
  const maxQuantity = item?.quantity ?? 0;

  useEffect(() => {
    if (!accessToken) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }
    fetchOrder();
    if (isSuperUser) fetchEmployees();
    // eslint-disable-next-line
  }, [accessToken, isSuperUser]);

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.error ||
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    fallback;

  const syncItemState = (updated) => {
    setItem((prev) => ({ ...prev, ...updated }));
    if (updated?.processing_status) setProcessingStatus(updated.processing_status);
    if (updated?.quantity_processed !== undefined) setQuantityProcessed(updated.quantity_processed);
    if (updated?.assigned_to !== undefined) setSelectedEmployeeId(updated.assigned_to ?? "");
  };

  const runWithCompletedConfirmation = (title, message, action) => {
    if (!isSuperUser || !isCompleted) return action();
    setConfirmDialog({ open: true, title, message, onConfirm: action });
  };

  const closeConfirmDialog = () =>
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ApiServices.get(`orders/${orderId}/`, headers);
      const orderData = res?.data;
      const found = (orderData?.items || []).find((i) => String(i.id) === String(itemId));
      if (!found) {
        setError("Order item not found.");
        return;
      }
      setOrder(orderData);
      setItem(found);
      setSelectedEmployeeId(found.assigned_to ?? "");
      setProcessingStatus(found.processing_status || "PENDING");
      setQuantityProcessed(found.quantity ?? 0);
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
      setEmployees(users.filter((e) => e.is_staff));
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
    const res = await ApiServices.patch(
      `order-items/${itemId}/update-status/`,
      { processing_status: status, quantity_processed: Number(qty || 0) },
      headers
    );
    syncItemState(res?.data);
    return res?.data;
  };

  const handleAssignSelectedEmployee = () => {
    if (!selectedEmployeeId) return showToast("Please select employee.", "error");
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
      "This item is already completed. Do you still want to change its status?",
      async () => {
        try {
          closeConfirmDialog();
          setActionLoading(true);
          setProcessingStatus(status);
          await updateItemStatus(status);
          showToast("Status updated successfully.");
        } catch (err) {
          showToast(getErrorMessage(err, "Failed to update status."), "error");
          setProcessingStatus(item?.processing_status || "PENDING");
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const clampQuantity = (val) => {
    let num = Number(val);
    if (Number.isNaN(num) || num < 0) num = 0;
    if (num > maxQuantity) num = maxQuantity;
    return num;
  };

  const handleQuantityChange = (e) => {
    const raw = e.target.value;
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

  const handleStartProcessing = async () => {
    try {
      setActionLoading(true);
      if (!isSuperUser) {
        if (!user?.user_id) return showToast("Logged-in user id not found.", "error");
        await assignEmployee(user.user_id);
      } else if (
        selectedEmployeeId &&
        String(selectedEmployeeId) !== String(item?.assigned_to)
      ) {
        await assignEmployee(Number(selectedEmployeeId));
      }
      await updateItemStatus("IN_PROGRESS", quantityProcessed);
      setProcessingStatus("IN_PROGRESS");
      showToast("Processing started.");
    } catch (err) {
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

    if (!isSuperUser) {
      setTimeout(() => {
        navigate("/employee-user/home");
      }, 1500);
    }
  } catch (err) {
    showToast(getErrorMessage(err, "Failed to complete item."), "error");
  } finally {
    setActionLoading(false);
  }
};

  /* ---------- render ---------- */
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
  const swipeLabel = isAssigned ? "Swipe to Mark as Complete" : "Swipe to Start Processing";
  const swipeColor = isAssigned ? "#22c55e" : "#3b82f6";

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
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7))",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${BORDER}`,
            px: 2,
            py: 2,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, color: TEXT_MUTED, letterSpacing: 1, textTransform: "uppercase" }}>
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
                {order.external_order_id}
                <Box component="span" sx={{ color: TEXT_MUTED, mx: 0.75 }}>/</Box>
                {item.sku}
              </Typography>
            </Box>

            <Chip
              label={selectedStatus?.label || processingStatus}
              size="small"
              sx={{
                bgcolor: selectedStatus?.bg,
                color: selectedStatus?.color,
                fontWeight: 700,
                border: `1px solid ${selectedStatus?.color}33`,
                height: 28,
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ p: 2, maxWidth: 560, mx: "auto" }}>
          {/* Product card */}
          <GlassCard sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", mb: 1.5 }}>
              {item.product_name}
            </Typography>
            <Divider sx={{ borderColor: BORDER, mb: 1 }} />
            <Stack divider={<Divider sx={{ borderColor: BORDER }} />}>
              <InfoTile icon={<Inventory2OutlinedIcon fontSize="small" />} label="SKU" value={item.sku} />
              <InfoTile
                icon={<NumbersOutlinedIcon fontSize="small" />}
                label="Quantity"
                value={item.quantity}
              />
              <InfoTile
                icon={<LocalShippingOutlinedIcon fontSize="small" />}
                label="Order"
                value={order.external_order_id}
              />
            </Stack>
          </GlassCard>

          {/* Employee */}
          {isSuperUser && (
            <Box sx={{ mb: 2 }}>
              <SectionTitle>Assignment</SectionTitle>
              <GlassCard sx={{ p: 2 }}>
                <FormControl fullWidth size="small" sx={selectSx}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    label="Employee"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {getEmployeeName(emp)}
                        {emp.usertype?.name ? ` — ${emp.usertype.name}` : ""}
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

          {/* Status + Qty */}
          {(isSuperUser || !isCompleted) && (
            <Box sx={{ mb: 2 }}>
              <SectionTitle>Status</SectionTitle>
              <GlassCard sx={{ p: 2 }}>
                <Stack direction="row" spacing={1}>
                  {STATUS_OPTIONS.map((s) => {
                    const active = processingStatus === s.value;
                    return (
                      <Button
                        key={s.value}
                        fullWidth
                        disabled={actionLoading}
                        onClick={() => handleStatusChange(s.value)}
                        sx={{
                          minHeight: 48,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "none",
                          color: active ? "#fff" : s.color,
                          bgcolor: active ? s.color : s.bg,
                          border: `1px solid ${s.color}55`,
                          "&:hover": { bgcolor: active ? s.color : s.bg },
                        }}
                      >
                        {s.label}
                      </Button>
                    );
                  })}
                </Stack>

                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 2 }}>
                  <IconButton
                    size="small"
                    disabled={actionLoading || Number(quantityProcessed || 0) <= 0}
                    onClick={() => adjustQuantity(-1)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      color: "#e2e8f0",
                      bgcolor: SURFACE_STRONG,
                      border: `1px solid ${BORDER}`,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                      "&.Mui-disabled": { color: "rgba(255,255,255,0.25)" },
                    }}
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
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                    }}
                  />

                  <IconButton
                    size="small"
                    disabled={actionLoading || Number(quantityProcessed || 0) >= maxQuantity}
                    onClick={() => adjustQuantity(1)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      color: "#e2e8f9",
                      bgcolor: SURFACE_STRONG,
                      border: `1px solid ${BORDER}`,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                      "&.Mui-disabled": { color: "rgba(255,255,255,0.25)" },
                    }}
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
              </GlassCard>
            </Box>
          )}

          {/* Completed state */}
          {isCompleted && (
            <GlassCard
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderColor: "rgba(34,197,94,0.35)",
                bgcolor: "rgba(34,197,94,0.08)",
              }}
            >
              <CheckCircleRoundedIcon sx={{ color: "#22c55e" }} />
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#bbf7d0" }}>
                  Item completed
                </Typography>
                <Typography sx={{ fontSize: 12, color: TEXT_MUTED }}>
                  Processed quantity: {quantityProcessed}
                </Typography>
              </Box>
            </GlassCard>
          )}
        </Box>
      </Box>

      {/* Sticky swipe action */}
      {showBottomSwipe && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            pb: "calc(env(safe-area-inset-bottom) + 16px)",
            background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.95) 40%)",
            zIndex: 20,
          }}
        >
          <Box sx={{ maxWidth: 560, mx: "auto" }}>
            <SwipeActionButton
              label={swipeLabel}
              loading={actionLoading}
              color={swipeColor}
              onComplete={isAssigned ? handleMarkComplete : handleStartProcessing}
            />
          </Box>
        </Box>
      )}

      {/* Confirm dialog */}
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
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent sx={{ color: TEXT_MUTED }}>{confirmDialog.message}</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeConfirmDialog} sx={ghostBtn}>Cancel</Button>
          <Button onClick={() => confirmDialog.onConfirm?.()} sx={primaryBtn}>
            Yes, Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: showBottomSwipe ? 11 : 0 }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

/* ---------- shared sx ---------- */
const primaryBtn = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  minHeight: 44,
  color: "#fff",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
  "&:hover": { background: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
  "&.Mui-disabled": { color: "rgba(255,255,255,0.5)", background: "rgba(59,130,246,0.3)" },
};

const ghostBtn = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  minHeight: 44,
  color: "#e2e8f0",
  bgcolor: SURFACE_STRONG,
  border: `1px solid ${BORDER}`,
  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#f1f5f9",
    bgcolor: SURFACE,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: TEXT_MUTED },
  "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
};

const selectSx = {
  ...inputSx,
  "& .MuiSelect-icon": { color: TEXT_MUTED },
};

export default OrderProcessByItem;
