// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Box,
//   Button,
//   Checkbox,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   FormControl,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Stack,
//   TextField,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import LocalOfferIcon from "@mui/icons-material/LocalOffer";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import DownloadIcon from "@mui/icons-material/Download";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// import BatchesAdd from "./BatchesAdd";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const theme = {
//   accent: "#6366f1",
//   accentSoft: "rgba(99,102,241,0.10)",
//   bg: "#f8fafc",
//   card: "#ffffff",
//   text: "#0f172a",
//   muted: "#64748b",
//   border: "#e2e8f0",
//   success: "#16a34a",
//   successSoft: "rgba(34,197,94,0.10)",
//   danger: "#dc2626",
//   dangerSoft: "rgba(239,68,68,0.10)",
//   warn: "#d97706",
//   warnSoft: "rgba(245,158,11,0.10)",
// };

// const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

// const getBatchId = (batch) => batch?.batch_id || batch?.id;

// const isBatchLabelPrinted = (batch) =>
//   batch?.labels_generated === true ||
//   batch?.label_printed === true ||
//   batch?.lable_printed === true ||
//   batch?.is_label_printed === true;

// const BatchesList = () => {
//   const token = useMemo(() => getDecryptedAccessToken(), []);

//   const headers = useMemo(
//     () => (token ? { Authorization: `Bearer ${token}` } : {}),
//     [token]
//   );

//   const [openAdd, setOpenAdd] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [downloadLoading, setDownloadLoading] = useState(false);
//   const [batches, setBatches] = useState([]);
//   const [selectedBatches, setSelectedBatches] = useState([]);
//   const [error, setError] = useState("");

//   const [sku, setSku] = useState("");
//   const [supplier, setSupplier] = useState("");
//   const [search, setSearch] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [labelFilter, setLabelFilter] = useState("ALL");

//   const [detailOpen, setDetailOpen] = useState(false);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [batchDetail, setBatchDetail] = useState(null);
//   const [labels, setLabels] = useState([]);

//   const fetchBatches = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const params = new URLSearchParams();
//       if (sku.trim()) params.set("sku", sku.trim());
//       if (supplier.trim()) params.set("supplier", supplier.trim());
//       if (search.trim()) params.set("search", search.trim());
//       if (dateFrom) params.set("date_from", dateFrom);
//       if (dateTo) params.set("date_to", dateTo);

//       const res = await ApiServices.get(
//         `stock-batches/?${params.toString()}`,
//         headers
//       );

//       const data = res?.data || res;
//       setBatches(data?.results || []);
//       setSelectedBatches([]);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch batches.");
//     } finally {
//       setLoading(false);
//     }
//   }, [headers, sku, supplier, search, dateFrom, dateTo]);

//   useEffect(() => {
//     fetchBatches();
//   }, [fetchBatches]);

//   const filteredBatches = useMemo(() => {
//     return batches.filter((batch) => {
//       const printed = isBatchLabelPrinted(batch);

//       if (labelFilter === "PRINTED") return printed;
//       if (labelFilter === "NOT_PRINTED") return !printed;

//       return true;
//     });
//   }, [batches, labelFilter]);

//   const selectableBatchIds = useMemo(
//     () =>
//       filteredBatches
//         .filter((batch) => !isBatchLabelPrinted(batch))
//         .map((batch) => getBatchId(batch))
//         .filter(Boolean),
//     [filteredBatches]
//   );

//   const allSelected =
//     selectableBatchIds.length > 0 &&
//     selectableBatchIds.every((id) => selectedBatches.includes(id));

//   const partiallySelected =
//     selectedBatches.length > 0 &&
//     selectableBatchIds.some((id) => selectedBatches.includes(id)) &&
//     !allSelected;

//   const handleSelectAll = (event) => {
//     if (event.target.checked) {
//       setSelectedBatches(selectableBatchIds);
//     } else {
//       setSelectedBatches([]);
//     }
//   };

//   const handleSelectBatch = (batchId) => {
//     setSelectedBatches((prev) =>
//       prev.includes(batchId)
//         ? prev.filter((id) => id !== batchId)
//         : [...prev, batchId]
//     );
//   };

//  const downloadSelectedBatches = async () => {
//   try {
//     setError("");

//     const selected = batches.filter((batch) =>
//       selectedBatches.includes(getBatchId(batch))
//     );

//     if (!selected.length) {
//       setError("Please select at least one batch.");
//       return;
//     }

//     setDownloadLoading(true);

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Batch Labels");

//     worksheet.columns = [
//       { header: "Batch ID", key: "batch_id", width: 22 },
//       { header: "SKU", key: "sku", width: 22 },
//       { header: "Product Name", key: "product_name", width: 60 },
//       { header: "Supplier", key: "supplier", width: 24 },
//       { header: "Batch Date", key: "batch_date", width: 18 },
//       { header: "Roll Count", key: "roll_count", width: 14 },
//       { header: "Total Meterage", key: "total_meterage", width: 18 },
//       { header: "Created By", key: "created_by_username", width: 20 },
//       { header: "Label Status", key: "label_status", width: 18 },
//       { header: "Created At", key: "created_at", width: 28 },
//       { header: "Updated At", key: "updated_at", width: 28 },
//     ];

//     worksheet.getRow(1).font = { bold: true };

//     selected.forEach((batch) => {
//       worksheet.addRow({
//         batch_id: safe(getBatchId(batch)),
//         sku: safe(batch?.sku),
//         product_name: safe(batch?.product_name),
//         supplier: safe(batch?.supplier),
//         batch_date: safe(batch?.batch_date),
//         roll_count: batch?.roll_count ?? 0,
//         total_meterage: batch?.total_meterage ?? 0,
//         created_by_username: safe(batch?.created_by_username),
//         label_status: isBatchLabelPrinted(batch) ? "Printed" : "Pending",
//         created_at: safe(batch?.created_at),
//         updated_at: safe(batch?.updated_at),
//       });
//     });

//     worksheet.eachRow((row) => {
//       row.eachCell((cell) => {
//         cell.alignment = {
//           vertical: "middle",
//           horizontal: "center",
//           wrapText: true,
//         };

//         cell.border = {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: "thin" },
//           bottom: { style: "thin" },
//         };
//       });
//     });

//     const buffer = await workbook.xlsx.writeBuffer();

//     saveAs(
//       new Blob([buffer], {
//         type:
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       }),
//       `Selected_Batches_${Date.now()}.xlsx`
//     );

//     await ApiServices.post(
//       "stock-batches/mark-labels-generated",
//       {
//         batch_ids: selected.map((batch) => getBatchId(batch)),
//       },
//       headers
//     );

//     setSelectedBatches([]);
//     await fetchBatches();
//   } catch (err) {
//     console.error(err);
//     setError(
//       err?.response?.data?.detail ||
//         err?.response?.data?.message ||
//         "Excel downloaded, but failed to update selected batches as label generated."
//     );
//   } finally {
//     setDownloadLoading(false);
//   }
// };

//   const openDetail = async (batchId) => {
//     try {
//       setDetailOpen(true);
//       setDetailLoading(true);
//       setBatchDetail(null);
//       setLabels([]);

//       const res = await ApiServices.get(`stock-batches/${batchId}/`, headers);
//       setBatchDetail(res?.data || res);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch batch detail.");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const generateLabels = async (batchId) => {
//     try {
//       setDetailLoading(true);

//       const res = await ApiServices.get(
//         `stock-batches/${batchId}/labels/`,
//         headers
//       );

//       const data = res?.data || res;
//       setLabels(Array.isArray(data) ? data : data?.results || data?.labels || []);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to generate labels.");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const markLabelsGenerated = async (batchId) => {
//     try {
//       setDetailLoading(true);

//       await ApiServices.post(
//         `stock-batches/${batchId}/mark-labels-generated/`,
//         {},
//         headers
//       );

//       await openDetail(batchId);
//       await fetchBatches();
//     } catch (err) {
//       console.error(err);
//       setError("Failed to mark labels generated.");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ background: theme.bg, minHeight: "100vh", p: 3 }}>
//       <Stack
//         direction={{ xs: "column", md: "row" }}
//         justifyContent="space-between"
//         spacing={2}
//         sx={{ mb: 3 }}
//       >
//         <Box>
//           <Typography variant="h5" sx={{ fontWeight: 800, color: theme.text }}>
//             Stock Incoming Batches
//           </Typography>

//           <Typography sx={{ color: theme.muted, fontSize: 14 }}>
//             Create, select, download, view, and generate labels for incoming stock batches.
//           </Typography>
//         </Box>

//         <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//           <Button
//             variant="contained"
//             startIcon={<DownloadIcon />}
//             onClick={downloadSelectedBatches}
//             disabled={downloadLoading || selectedBatches.length === 0}
//             sx={{
//               textTransform: "none",
//               borderRadius: 2,
//               background: theme.success,
//               fontWeight: 700,
//             }}
//           >
//             {downloadLoading ? "Downloading..." : "Download Selected"}
//           </Button>

//           <Button
//             variant="outlined"
//             startIcon={<RefreshIcon />}
//             onClick={fetchBatches}
//             sx={{ textTransform: "none", borderRadius: 2 }}
//           >
//             Refresh
//           </Button>

//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={() => setOpenAdd(true)}
//             sx={{
//               textTransform: "none",
//               borderRadius: 2,
//               background: theme.accent,
//               fontWeight: 700,
//             }}
//           >
//             Create Batch
//           </Button>
//         </Stack>
//       </Stack>

//       <Typography variant="body2" sx={{ mb: 2, color: theme.muted }}>
//         Total Batches: {batches.length} | Showing: {filteredBatches.length} |
//         Selected: {selectedBatches.length}
//       </Typography>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
//           {error}
//         </Alert>
//       )}

//       <Paper
//         sx={{
//           p: 2,
//           mb: 2,
//           borderRadius: 3,
//           border: `1px solid ${theme.border}`,
//         }}
//         elevation={0}
//       >
//         <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
//           <TextField
//             size="small"
//             label="SKU"
//             value={sku}
//             onChange={(e) => setSku(e.target.value)}
//             fullWidth
//           />

//           <TextField
//             size="small"
//             label="Supplier"
//             value={supplier}
//             onChange={(e) => setSupplier(e.target.value)}
//             fullWidth
//           />

//           <TextField
//             size="small"
//             label="Search Batch ID"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             fullWidth
//           />

//           <FormControl size="small" fullWidth>
//             <InputLabel>Label Status</InputLabel>
//             <Select
//               value={labelFilter}
//               label="Label Status"
//               onChange={(e) => {
//                 setLabelFilter(e.target.value);
//                 setSelectedBatches([]);
//               }}
//             >
//               <MenuItem value="ALL">All Batches</MenuItem>
//               <MenuItem value="PRINTED">Label Printed</MenuItem>
//               <MenuItem value="NOT_PRINTED">Label Not Printed</MenuItem>
//             </Select>
//           </FormControl>

//           <TextField
//             size="small"
//             type="date"
//             label="Date From"
//             InputLabelProps={{ shrink: true }}
//             value={dateFrom}
//             onChange={(e) => setDateFrom(e.target.value)}
//             fullWidth
//           />

//           <TextField
//             size="small"
//             type="date"
//             label="Date To"
//             InputLabelProps={{ shrink: true }}
//             value={dateTo}
//             onChange={(e) => setDateTo(e.target.value)}
//             fullWidth
//           />

//           <Button
//             variant="contained"
//             onClick={fetchBatches}
//             sx={{
//               minWidth: 120,
//               textTransform: "none",
//               background: theme.accent,
//             }}
//           >
//             Filter
//           </Button>
//         </Stack>
//       </Paper>

//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: 3,
//           border: `1px solid ${theme.border}`,
//           overflow: "hidden",
//         }}
//       >
//         {loading ? (
//           <Stack alignItems="center" sx={{ py: 6 }}>
//             <CircularProgress />
//           </Stack>
//         ) : !filteredBatches.length ? (
//           <Typography sx={{ p: 3, color: theme.muted, textAlign: "center" }}>
//             No batches found.
//           </Typography>
//         ) : (
//           <Stack divider={<Divider />}>
//             <Stack
//               direction="row"
//               alignItems="center"
//               spacing={2}
//               sx={{ px: 2, py: 1.5, background: theme.card }}
//             >
//               <Checkbox
//                 checked={allSelected}
//                 indeterminate={partiallySelected}
//                 onChange={handleSelectAll}
//               />

//               <Typography sx={{ fontWeight: 800, color: theme.text }}>
//                 Select All
//               </Typography>

//               <Typography sx={{ color: theme.muted, fontSize: 13 }}>
//                 Printed batches are skipped automatically.
//               </Typography>
//             </Stack>

//             {filteredBatches.map((batch, index) => {
//               const batchId = getBatchId(batch);
//               const printed = isBatchLabelPrinted(batch);

//               return (
//                 <Stack
//                   key={batchId || index}
//                   direction={{ xs: "column", md: "row" }}
//                   justifyContent="space-between"
//                   spacing={2}
//                   sx={{ p: 2 }}
//                 >
//                   <Stack direction="row" spacing={1.5} alignItems="flex-start">
//                     <Box>
//                       <Checkbox
//                         checked={selectedBatches.includes(batchId)}
//                         onChange={() => handleSelectBatch(batchId)}
//                       />

//                       {printed && (
//                         <Typography
//                           variant="caption"
//                           display="block"
//                           color="text.secondary"
//                           textAlign="center"
//                         >
//                           Printed
//                         </Typography>
//                       )}
//                     </Box>

//                     <Box>
//                       <Typography sx={{ fontWeight: 800, color: theme.text }}>
//                         {safe(batchId)}
//                       </Typography>

//                       <Typography sx={{ color: theme.text, fontSize: 14 }}>
//                         {safe(batch?.product_name)}
//                       </Typography>

//                       <Typography sx={{ color: theme.muted, fontSize: 13 }}>
//                         SKU: {safe(batch?.sku)} | Supplier: {safe(batch?.supplier)}
//                       </Typography>

//                       <Typography sx={{ color: theme.muted, fontSize: 13 }}>
//                         Rolls: {safe(batch?.roll_count)} | Total Meterage:{" "}
//                         {safe(batch?.total_meterage)} mtr | Batch Date:{" "}
//                         {safe(batch?.batch_date)}
//                       </Typography>

//                       <Typography sx={{ color: theme.muted, fontSize: 13 }}>
//                         Created By: {safe(batch?.created_by_username)}
//                       </Typography>
//                     </Box>
//                   </Stack>

//                   <Stack direction="row" spacing={1} alignItems="center">
//                     <Chip
//                       label={printed ? "Labels Generated" : "Labels Pending"}
//                       size="small"
//                       sx={{
//                         background: printed ? theme.successSoft : theme.warnSoft,
//                         color: printed ? theme.success : theme.warn,
//                         fontWeight: 700,
//                       }}
//                     />

//                     <Tooltip title="View Detail">
//                       <IconButton onClick={() => openDetail(batchId)}>
//                         <VisibilityIcon />
//                       </IconButton>
//                     </Tooltip>
//                   </Stack>
//                 </Stack>
//               );
//             })}
//           </Stack>
//         )}
//       </Paper>

//       <Dialog
//         open={openAdd}
//         onClose={() => setOpenAdd(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Create Incoming Batch
//           <IconButton onClick={() => setOpenAdd(false)}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent>
//           <BatchesAdd
//             onSuccess={() => {
//               setOpenAdd(false);
//               fetchBatches();
//             }}
//           />
//         </DialogContent>
//       </Dialog>

//       <Dialog
//         open={detailOpen}
//         onClose={() => setDetailOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Batch Detail
//           <IconButton onClick={() => setDetailOpen(false)}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent>
//           {detailLoading ? (
//             <Stack alignItems="center" sx={{ py: 5 }}>
//               <CircularProgress />
//             </Stack>
//           ) : batchDetail ? (
//             <Stack spacing={2}>
//               <Paper
//                 sx={{ p: 2, borderRadius: 3, background: theme.bg }}
//                 elevation={0}
//               >
//                 <Typography sx={{ fontWeight: 800 }}>
//                   Batch: {safe(batchDetail?.id || batchDetail?.batch_id)}
//                 </Typography>
//                 <Typography>SKU: {safe(batchDetail?.sku)}</Typography>
//                 <Typography>Supplier: {safe(batchDetail?.supplier)}</Typography>
//                 <Typography>Product: {safe(batchDetail?.product_name)}</Typography>
//                 <Typography>
//                   Total Meterage: {safe(batchDetail?.total_meterage)} mtr
//                 </Typography>
//               </Paper>

//               <Box>
//                 <Typography sx={{ fontWeight: 800, mb: 1 }}>Rolls</Typography>

//                 <Stack spacing={1}>
//                   {(batchDetail?.rolls || []).map((roll, i) => (
//                     <Paper
//                       key={roll?.id || i}
//                       sx={{ p: 1.5, borderRadius: 2 }}
//                       variant="outlined"
//                     >
//                       <Typography>
//                         Roll #{safe(roll?.roll_number)} —{" "}
//                         {safe(roll?.meterage)} mtr
//                       </Typography>
//                     </Paper>
//                   ))}
//                 </Stack>
//               </Box>

//               <Stack direction="row" spacing={1}>
//                 <Button
//                   startIcon={<LocalOfferIcon />}
//                   variant="outlined"
//                   onClick={() =>
//                     generateLabels(batchDetail?.id || batchDetail?.batch_id)
//                   }
//                   sx={{ textTransform: "none" }}
//                 >
//                   Generate Labels
//                 </Button>

//                 <Button
//                   startIcon={<CheckCircleIcon />}
//                   variant="contained"
//                   onClick={() =>
//                     markLabelsGenerated(
//                       batchDetail?.id || batchDetail?.batch_id
//                     )
//                   }
//                   sx={{ textTransform: "none", background: theme.success }}
//                 >
//                   Mark Labels Generated
//                 </Button>
//               </Stack>

//               {!!labels.length && (
//                 <Box>
//                   <Typography sx={{ fontWeight: 800, mb: 1 }}>
//                     Labels
//                   </Typography>

//                   <Stack spacing={1}>
//                     {labels.map((label, i) => (
//                       <Paper
//                         key={i}
//                         sx={{ p: 1.5, borderRadius: 2 }}
//                         variant="outlined"
//                       >
//                         <Typography sx={{ fontWeight: 700 }}>
//                           {safe(label?.sku)} — Roll {safe(label?.roll_number)}
//                         </Typography>
//                         <Typography sx={{ fontSize: 13 }}>
//                           Product: {safe(label?.product_name)}
//                         </Typography>
//                         <Typography sx={{ fontSize: 13 }}>
//                           Meterage: {safe(label?.meterage)}
//                         </Typography>
//                         <Typography sx={{ fontSize: 13 }}>
//                           Batch: {safe(label?.batch_id)}
//                         </Typography>
//                       </Paper>
//                     ))}
//                   </Stack>
//                 </Box>
//               )}
//             </Stack>
//           ) : null}
//         </DialogContent>
//       </Dialog>
//     </Box>
//   );
// };

// export default BatchesList;


import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import BatchesAdd from "./BatchesAdd";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const theme = {
  accent: "#6366f1",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#16a34a",
  successSoft: "rgba(34,197,94,0.10)",
  warn: "#d97706",
  warnSoft: "rgba(245,158,11,0.10)",
};

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

const getBatchId = (batch) => batch?.batch_id || batch?.id;

const areAllRollLabelsGenerated = (batch) => {
  const rolls = batch?.rolls || [];

  if (batch?.labels_generated === true) return true;
  if (batch?.label_printed === true) return true;
  if (batch?.is_label_printed === true) return true;

  if (!rolls.length) return false;

  return rolls.every((roll) => roll?.label_generated === true);
};

const BatchesList = () => {
  const token = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [error, setError] = useState("");

  const [sku, setSku] = useState("");
  const [supplier, setSupplier] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [labelFilter, setLabelFilter] = useState("ALL");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [batchDetail, setBatchDetail] = useState(null);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (sku.trim()) params.set("sku", sku.trim());
      if (supplier.trim()) params.set("supplier", supplier.trim());
      if (search.trim()) params.set("search", search.trim());
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const url = params.toString()
        ? `stock-batches/?${params.toString()}`
        : "stock-batches/";

      const res = await ApiServices.get(url, headers);
      const data = res?.data || res;

      setBatches(data?.results || []);
      setSelectedBatches([]);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch batches.");
    } finally {
      setLoading(false);
    }
  }, [headers, sku, supplier, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const printed = areAllRollLabelsGenerated(batch);

      if (labelFilter === "PRINTED") return printed;
      if (labelFilter === "NOT_PRINTED") return !printed;

      return true;
    });
  }, [batches, labelFilter]);

  const selectableBatchIds = useMemo(
    () =>
      filteredBatches
        .filter((batch) => !areAllRollLabelsGenerated(batch))
        .map((batch) => getBatchId(batch))
        .filter(Boolean),
    [filteredBatches]
  );

  const allSelected =
    selectableBatchIds.length > 0 &&
    selectableBatchIds.every((id) => selectedBatches.includes(id));

  const partiallySelected =
    selectedBatches.length > 0 &&
    selectableBatchIds.some((id) => selectedBatches.includes(id)) &&
    !allSelected;

  const handleSelectAll = (event) => {
    setSelectedBatches(event.target.checked ? selectableBatchIds : []);
  };

  const handleSelectBatch = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  const markLabelsGeneratedByBatchIds = async (batchIds) => {
    await ApiServices.post(
      "stock-batches/mark-labels-generated",
      {
        batch_ids: batchIds,
      },
      headers
    );
  };

  const downloadSelectedBatches = async () => {
    try {
      setError("");

      const selected = batches.filter((batch) =>
        selectedBatches.includes(getBatchId(batch))
      );

      if (!selected.length) {
        setError("Please select at least one batch.");
        return;
      }

      setDownloadLoading(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Roll Labels");

      worksheet.columns = [
        { header: "Batch ID", key: "batch_id", width: 24 },
        { header: "Stock Item", key: "stock_item", width: 24 },
        { header: "SKU", key: "sku", width: 24 },
        { header: "Product Name", key: "product_name", width: 60 },
        { header: "Supplier", key: "supplier", width: 22 },
        { header: "Batch Date", key: "batch_date", width: 18 },
        { header: "Total Meterage", key: "total_meterage", width: 18 },
        { header: "Batch Roll Count", key: "roll_count", width: 18 },
        { header: "Roll ID", key: "roll_id", width: 14 },
        { header: "Roll Number", key: "roll_number", width: 16 },
        { header: "Roll Meterage", key: "roll_meterage", width: 18 },
        { header: "Roll Label Status", key: "roll_label_status", width: 20 },
        { header: "Roll Label Generated At", key: "label_generated_at", width: 28 },
        { header: "Created By", key: "created_by_username", width: 20 },
        { header: "Notes", key: "notes", width: 30 },
        { header: "Batch Created At", key: "created_at", width: 28 },
        { header: "Batch Updated At", key: "updated_at", width: 28 },
      ];

      worksheet.getRow(1).font = { bold: true };

      selected.forEach((batch) => {
        const rolls = batch?.rolls?.length ? batch.rolls : [{}];

        rolls.forEach((roll) => {
          worksheet.addRow({
            batch_id: safe(getBatchId(batch)),
            stock_item: safe(batch?.stock_item),
            sku: safe(batch?.sku),
            product_name: safe(batch?.product_name),
            supplier: safe(batch?.supplier),
            batch_date: safe(batch?.batch_date),
            total_meterage: batch?.total_meterage ?? 0,
            roll_count: batch?.roll_count ?? 0,
            roll_id: safe(roll?.id),
            roll_number: safe(roll?.roll_number),
            roll_meterage: roll?.meterage ?? "—",
            roll_label_status: roll?.label_generated ? "Printed" : "Pending",
            label_generated_at: safe(roll?.label_generated_at),
            created_by_username: safe(batch?.created_by_username),
            notes: safe(batch?.notes),
            created_at: safe(batch?.created_at),
            updated_at: safe(batch?.updated_at),
          });
        });
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };

          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `Selected_Roll_Labels_${Date.now()}.xlsx`
      );

      await markLabelsGeneratedByBatchIds(
        selected.map((batch) => getBatchId(batch)).filter(Boolean)
      );

      setSelectedBatches([]);
      await fetchBatches();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Excel downloaded, but failed to mark labels as generated."
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const openDetail = async (batchId) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setBatchDetail(null);

      const res = await ApiServices.get(`stock-batches/${batchId}/`, headers);
      setBatchDetail(res?.data || res);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch batch detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const markSingleBatchLabelsGenerated = async (batchId) => {
    try {
      setDetailLoading(true);

      await markLabelsGeneratedByBatchIds([batchId]);

      await openDetail(batchId);
      await fetchBatches();
    } catch (err) {
      console.error(err);
      setError("Failed to mark labels generated.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box sx={{ background: theme.bg, minHeight: "100vh", p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.text }}>
            Stock Incoming Batches
          </Typography>

          <Typography sx={{ color: theme.muted, fontSize: 14 }}>
            Select batches, download roll-wise label Excel, and mark labels as generated.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadSelectedBatches}
            disabled={downloadLoading || selectedBatches.length === 0}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              background: theme.success,
              fontWeight: 700,
            }}
          >
            {downloadLoading ? "Downloading..." : "Download Selected Labels"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBatches}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              background: theme.accent,
              fontWeight: 700,
            }}
          >
            Create Batch
          </Button>
        </Stack>
      </Stack>

      <Typography variant="body2" sx={{ mb: 2, color: theme.muted }}>
        Total Batches: {batches.length} | Showing: {filteredBatches.length} |
        Selected: {selectedBatches.length}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${theme.border}`,
        }}
        elevation={0}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            fullWidth
          />

          <TextField
            size="small"
            label="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            fullWidth
          />

          <TextField
            size="small"
            label="Search Batch ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Label Status</InputLabel>
            <Select
              value={labelFilter}
              label="Label Status"
              onChange={(e) => {
                setLabelFilter(e.target.value);
                setSelectedBatches([]);
              }}
            >
              <MenuItem value="ALL">All Batches</MenuItem>
              <MenuItem value="PRINTED">Label Printed</MenuItem>
              <MenuItem value="NOT_PRINTED">Label Not Printed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="Date From"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            fullWidth
          />

          <TextField
            size="small"
            type="date"
            label="Date To"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={fetchBatches}
            sx={{
              minWidth: 120,
              textTransform: "none",
              background: theme.accent,
            }}
          >
            Filter
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.border}`,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : !filteredBatches.length ? (
          <Typography sx={{ p: 3, color: theme.muted, textAlign: "center" }}>
            No batches found.
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ px: 2, py: 1.5, background: theme.card }}
            >
              <Checkbox
                checked={allSelected}
                indeterminate={partiallySelected}
                onChange={handleSelectAll}
              />

              <Typography sx={{ fontWeight: 800, color: theme.text }}>
                Select All
              </Typography>

              <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                Fully printed batches are skipped automatically.
              </Typography>
            </Stack>

            {filteredBatches.map((batch, index) => {
              const batchId = getBatchId(batch);
              const printed = areAllRollLabelsGenerated(batch);

              return (
                <Box key={batchId || index} sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box>
                        <Checkbox
                          checked={selectedBatches.includes(batchId)}
                          disabled={printed}
                          onChange={() => handleSelectBatch(batchId)}
                        />

                        {printed && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            textAlign="center"
                          >
                            Printed
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 800, color: theme.text }}>
                          {safe(batchId)}
                        </Typography>

                        <Typography sx={{ color: theme.text, fontSize: 14 }}>
                          {safe(batch?.product_name)}
                        </Typography>

                        <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                          SKU: {safe(batch?.sku)} | Supplier:{" "}
                          {safe(batch?.supplier)}
                        </Typography>

                        <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                          Rolls: {safe(batch?.roll_count)} | Total Meterage:{" "}
                          {safe(batch?.total_meterage)} mtr | Batch Date:{" "}
                          {safe(batch?.batch_date)}
                        </Typography>

                        <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                          Created By: {safe(batch?.created_by_username)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={printed ? "Labels Generated" : "Labels Pending"}
                        size="small"
                        sx={{
                          background: printed ? theme.successSoft : theme.warnSoft,
                          color: printed ? theme.success : theme.warn,
                          fontWeight: 700,
                        }}
                      />

                      <Tooltip title="View Detail">
                        <IconButton onClick={() => openDetail(batchId)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Box sx={{ mt: 2, pl: { xs: 0, md: 6 } }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: theme.text,
                        fontSize: 14,
                        mb: 1,
                      }}
                    >
                      Roll Details
                    </Typography>

                    <Stack spacing={1}>
                      {(batch?.rolls || []).map((roll) => (
                        <Paper
                          key={roll?.id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: "#fff",
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                Roll #{safe(roll?.roll_number)}
                              </Typography>

                              <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                                Roll ID: {safe(roll?.id)} | Meterage:{" "}
                                {safe(roll?.meterage)} mtr
                              </Typography>

                              <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                                Created At: {safe(roll?.created_at)}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              label={
                                roll?.label_generated
                                  ? "Label Printed"
                                  : "Label Pending"
                              }
                              sx={{
                                width: "fit-content",
                                background: roll?.label_generated
                                  ? theme.successSoft
                                  : theme.warnSoft,
                                color: roll?.label_generated
                                  ? theme.success
                                  : theme.warn,
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Create Incoming Batch
          <IconButton onClick={() => setOpenAdd(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <BatchesAdd
            onSuccess={() => {
              setOpenAdd(false);
              fetchBatches();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Batch Detail
          <IconButton onClick={() => setDetailOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {detailLoading ? (
            <Stack alignItems="center" sx={{ py: 5 }}>
              <CircularProgress />
            </Stack>
          ) : batchDetail ? (
            <Stack spacing={2}>
              <Paper sx={{ p: 2, borderRadius: 3, background: theme.bg }} elevation={0}>
                <Typography sx={{ fontWeight: 800 }}>
                  Batch: {safe(getBatchId(batchDetail))}
                </Typography>
                <Typography>SKU: {safe(batchDetail?.sku)}</Typography>
                <Typography>Stock Item: {safe(batchDetail?.stock_item)}</Typography>
                <Typography>Supplier: {safe(batchDetail?.supplier)}</Typography>
                <Typography>Product: {safe(batchDetail?.product_name)}</Typography>
                <Typography>
                  Total Meterage: {safe(batchDetail?.total_meterage)} mtr
                </Typography>
              </Paper>

              <Box>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Rolls</Typography>

                <Stack spacing={1}>
                  {(batchDetail?.rolls || []).map((roll, i) => (
                    <Paper
                      key={roll?.id || i}
                      sx={{ p: 1.5, borderRadius: 2 }}
                      variant="outlined"
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>
                            Roll #{safe(roll?.roll_number)} —{" "}
                            {safe(roll?.meterage)} mtr
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: theme.muted }}>
                            Roll ID: {safe(roll?.id)}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: theme.muted }}>
                            Label Generated At: {safe(roll?.label_generated_at)}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            roll?.label_generated ? "Label Printed" : "Label Pending"
                          }
                          sx={{
                            width: "fit-content",
                            background: roll?.label_generated
                              ? theme.successSoft
                              : theme.warnSoft,
                            color: roll?.label_generated
                              ? theme.success
                              : theme.warn,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Button
                startIcon={<CheckCircleIcon />}
                variant="contained"
                onClick={() => markSingleBatchLabelsGenerated(getBatchId(batchDetail))}
                sx={{ textTransform: "none", background: theme.success }}
              >
                Mark This Batch Labels Generated
              </Button>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BatchesList;