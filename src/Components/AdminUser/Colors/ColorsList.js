// // ColorsList.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   Paper,
//   Snackbar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TablePagination,
//   TableRow,
//   TextField,
//   Toolbar,
//   Typography,
//   CircularProgress,
//   Alert,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
// import ColorsAdd from "./ColorsAdd";
// import ColorsEdit from "./ColorsEdit";

// const ColorsList = () => {
//   const accessToken = getDecryptedAccessToken();

//   // state
//   const [rows, setRows] = useState([]); // current page results
//   const [count, setCount] = useState(0); // total count from API
//   const [page, setPage] = useState(0); // zero-based for UI
//   const [pageSize, setPageSize] = useState(25);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [search, setSearch] = useState("");
//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [editRow, setEditRow] = useState(null);

//   // snackbars
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success'|'error'|'info'|'warning'

//   // headers for ApiServices (assumes ApiServices expects { headers: {...} } or similar)
//   const headers = {
//     Authorization: accessToken ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}` : "",
//     "Content-Type": "application/json",
//   };

//   // fetch colors for given page
//   const fetchColors = async (pageNumber = 1, pageSizeParam = pageSize) => {
//     setLoading(true);
//     setErrorMsg("");
//     try {
//       // Assumes API takes ?page=<n>&page_size=<size>
//       const resp = await ApiServices.get(`colors/?page=${pageNumber}&page_size=${pageSizeParam}`, 
//         headers,
//       );
//       // adjust according to ApiServices response shape:
//       // expecting { data: { count, results, next, previous } } or directly { count, results }.
//       const data = resp?.data ?? resp;
//       if (data) {
//         setRows(Array.isArray(data.results) ? data.results : []);
//         setCount(typeof data.count === "number" ? data.count : (data.results || []).length);
//       } else {
//         setRows([]);
//         setCount(0);
//       }
//     } catch (err) {
//       console.error("fetchColors error:", err);
//       setErrorMsg("Failed to load colors. Please try again.");
//       setSnackbarSeverity("error");
//       setSuccessMsg("");
//       setSnackbarOpen(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // initial + on page/pageSize change
//   useEffect(() => {
//     // API page is 1-based
//     fetchColors(page + 1, pageSize);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, pageSize]);

//   // client-side filtered rows (search on color_name & color_code)
//   const filteredRows = useMemo(() => {
//     if (!search) return rows;
//     const q = search.trim().toLowerCase();
//     return rows.filter((r) => {
//       const name = (r.color_name || "").toString().toLowerCase();
//       const code = (r.color_code || "").toString().toLowerCase();
//       return name.includes(q) || code.includes(q);
//     });
//   }, [rows, search]);

//   // handlers
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     const newSize = parseInt(event.target.value, 10);
//     setPageSize(newSize);
//     setPage(0);
//   };

//   const handleAddOpen = () => {
//     setOpenAdd(true);
//   };
//   const handleAddClose = () => setOpenAdd(false);

//   const handleEditOpen = (row) => {
//     setEditRow(row);
//     setOpenEdit(true);
//   };
//   const handleEditClose = () => {
//     setEditRow(null);
//     setOpenEdit(false);
//   };

//   // callbacks for child components to tell parent to refresh / show messages
//   const onItemAdded = (msg) => {
//     setSuccessMsg(msg || "Color added successfully");
//     setSnackbarSeverity("success");
//     setSnackbarOpen(true);
//     handleAddClose();
//     // reload current page
//     fetchColors(page + 1, pageSize);
//   };

//   const onItemEdited = (msg) => {
//     setSuccessMsg(msg || "Color updated successfully");
//     setSnackbarSeverity("success");
//     setSnackbarOpen(true);
//     handleEditClose();
//     fetchColors(page + 1, pageSize);
//   };

//   const onError = (msg) => {
//     setErrorMsg(msg || "Something went wrong");
//     setSnackbarSeverity("error");
//     setSnackbarOpen(true);
//   };

//   // Utility to display NA for null/empty values
//   const displayVal = (v) => (v === null || v === undefined || v === "" ? "NA" : v);

//   return (
//     <Box p={2}>
//       <Paper elevation={3}>
//         <Toolbar
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             gap: 2,
//             flexWrap: "wrap",
//             alignItems: "center",
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <Typography variant="h6">Colors</Typography>
//             <TextField
//               size="small"
//               placeholder="Search by color name or code"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               sx={{ minWidth: 260 }}
//             />
//           </Box>

//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={handleAddOpen}
//               sx={{ textTransform: "none" }}
//             >
//               Add New Color
//             </Button>
//           </Box>
//         </Toolbar>

//         <TableContainer component={Paper} sx={{ p: 1 }}>
//           {loading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Color Code</TableCell>
//                   <TableCell>Color Name</TableCell>
//                   <TableCell>Abbr</TableCell>
//                   <TableCell>Hex</TableCell>
//                   <TableCell>Pantone</TableCell>
//                   <TableCell>Deleted</TableCell>
//                   <TableCell align="right">Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredRows.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       No colors found.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredRows.map((row) => (
//                     <TableRow key={row.color_code || Math.random()}>
//                       <TableCell>{displayVal(row.color_code)}</TableCell>
//                       <TableCell>{displayVal(row.color_name)}</TableCell>
//                       <TableCell>{displayVal(row.abbr)}</TableCell>
//                       <TableCell>
//                         {row.hex ? (
//                           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                             <Box
//                               sx={{
//                                 width: 24,
//                                 height: 18,
//                                 borderRadius: "3px",
//                                 border: "1px solid rgba(0,0,0,0.12)",
//                                 backgroundColor: row.hex,
//                               }}
//                             />
//                             {/* <span>{row.hex}</span> */}
//                           </Box>
//                         ) : (
//                           "NA"
//                         )}
//                       </TableCell>
//                       <TableCell>{displayVal(row.pantone)}</TableCell>
//                       <TableCell>{row.is_deleted ? "Yes" : "No"}</TableCell>
//                       <TableCell align="right">
//                         <IconButton
//                           size="small"
//                           onClick={() => handleEditOpen(row)}
//                           aria-label={`edit-${row.color_code}`}
//                         >
//                           <EditIcon />
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </TableContainer>

//         <TablePagination
//           component="div"
//           count={count}
//           page={page}
//           onPageChange={handleChangePage}
//           rowsPerPage={pageSize}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           rowsPerPageOptions={[10, 25, 50, 100]}
//           showFirstButton
//           showLastButton
//         />
//       </Paper>

//       {/* Add Dialog */}
//       <Dialog open={openAdd} onClose={handleAddClose} fullWidth maxWidth="sm">
//         <DialogTitle>Add New Color</DialogTitle>
//         <DialogContent>
//           {/* 
//             Assumes ColorsAdd accepts:
//               - onClose: () => void
//               - onSuccess: (message) => void
//               - onError: (message) => void
//               - headers or accessToken if it needs
//           */}
//           <ColorsAdd
//             onClose={handleAddClose}
//             onSuccess={onItemAdded}
//             onError={onError}
//             headers={headers}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Edit Dialog */}
//       <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="sm">
//         <DialogTitle>Edit Color</DialogTitle>
//         <DialogContent>
//           {/* 
//             Assumes ColorsEdit accepts:
//               - initialData (the row)
//               - onClose
//               - onSuccess
//               - onError
//               - headers/accessToken if needed
//           */}
//           {editRow && (
//             <ColorsEdit
//               initialData={editRow}
//               onClose={handleEditClose}
//               onSuccess={onItemEdited}
//               onError={onError}
//               headers={headers}
//             />
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={4000}
//         onClose={() => setSnackbarOpen(false)}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert
//           onClose={() => setSnackbarOpen(false)}
//           severity={snackbarSeverity}
//           sx={{ width: "100%" }}
//         >
//           {snackbarSeverity === "success" ? successMsg || "Success" : errorMsg || "An error occurred"}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ColorsList;


import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Typography, CircularProgress,
  Alert, InputAdornment, Chip, Tooltip, Stack, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PaletteIcon from "@mui/icons-material/Palette";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import ColorsAdd from "./ColorsAdd";
import ColorsEdit from "./ColorsEdit";

const theme = {
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.10)",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
};

const ColorsList = () => {
  const accessToken = getDecryptedAccessToken();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const headers = {
    Authorization: accessToken ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}` : "",
    "Content-Type": "application/json",
  };

  const fetchColors = async (pageNumber = 1, pageSizeParam = pageSize) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const resp = await ApiServices.get(`colors/?page=${pageNumber}&page_size=${pageSizeParam}`, headers);
      const data = resp?.data ?? resp;
      if (data) {
        setRows(Array.isArray(data.results) ? data.results : []);
        setCount(typeof data.count === "number" ? data.count : (data.results || []).length);
      } else {
        setRows([]); setCount(0);
      }
    } catch (err) {
      console.error("fetchColors error:", err);
      setErrorMsg("Failed to load colors. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors(page + 1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (r.color_name || "").toLowerCase().includes(q) ||
      (r.color_code || "").toLowerCase().includes(q) ||
      (r.pantone || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const onItemAdded = (msg) => {
    setSuccessMsg(msg || "Color added successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setOpenAdd(false);
    fetchColors(page + 1, pageSize);
  };

  const onItemEdited = (msg) => {
    setSuccessMsg(msg || "Color updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setEditRow(null);
    setOpenEdit(false);
    fetchColors(page + 1, pageSize);
  };

  const onError = (msg) => {
    setErrorMsg(msg || "Something went wrong");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  };

  const displayVal = (v) => (v === null || v === undefined || v === "" ? "—" : v);

  return (
    <Box sx={{ background: theme.bg, minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ background: `linear-gradient(135deg, ${theme.accent}, #818cf8)`, width: 48, height: 48, boxShadow: `0 4px 14px ${theme.accentSoft}` }}>
            <PaletteIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.text }}>Colors Library</Typography>
            <Typography variant="body2" sx={{ color: theme.muted }}>
              {count} {count === 1 ? "color" : "colors"} total
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => fetchColors(page + 1, pageSize)} sx={{ background: theme.card, border: `1px solid ${theme.border}`, "&:hover": { background: theme.accentSoft } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{
              textTransform: "none", fontWeight: 600, px: 2.5, py: 1, borderRadius: "10px",
              background: `linear-gradient(135deg, ${theme.accent}, #818cf8)`,
              boxShadow: `0 4px 14px ${theme.accentSoft}`,
              "&:hover": { background: `linear-gradient(135deg, #4f46e5, #6366f1)` },
            }}
          >
            Add New Color
          </Button>
        </Stack>
      </Stack>

      {/* Search bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: "14px", border: `1px solid ${theme.border}` }}>
        <TextField
          fullWidth size="small" placeholder="Search by name, code or pantone…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.muted, fontSize: 20 }} /></InputAdornment>,
            sx: { borderRadius: "10px", background: theme.bg, "& fieldset": { border: "none" } },
          }}
        />
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: "14px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: theme.accent }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: theme.bg }}>
                  {["Color", "Code", "Name", "Abbr", "Pantone", "Status", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: theme.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${theme.border}` }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: theme.muted }}>
                      <PaletteIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                      <Typography>No colors found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow key={row.color_code} sx={{ "&:hover": { background: theme.accentSoft }, transition: "background .15s" }}>
                      <TableCell>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: "10px",
                          background: row.hex || "#e2e8f0",
                          border: `2px solid ${theme.card}`,
                          boxShadow: `0 0 0 1px ${theme.border}`,
                        }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: theme.text }}>{displayVal(row.color_code)}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: theme.text }}>{displayVal(row.color_name)}</TableCell>
                      <TableCell sx={{ color: theme.muted }}>{displayVal(row.abbr)}</TableCell>
                      <TableCell sx={{ color: theme.muted }}>{displayVal(row.pantone)}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.is_deleted ? "Deleted" : "Active"}
                          size="small"
                          sx={{
                            fontWeight: 600, fontSize: 11,
                            background: row.is_deleted ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                            color: row.is_deleted ? "#dc2626" : "#16a34a",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => { setEditRow(row); setOpenEdit(true); }} sx={{ color: theme.accent, "&:hover": { background: theme.accentSoft } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ borderTop: `1px solid ${theme.border}` }}
        />
      </Paper>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, fontWeight: 700 }}>
          Add New Color
          <IconButton onClick={() => setOpenAdd(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <ColorsAdd onClose={() => setOpenAdd(false)} onSuccess={onItemAdded} onError={onError} headers={headers} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, fontWeight: 700 }}>
          Edit Color
          <IconButton onClick={() => setOpenEdit(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editRow && (
            <ColorsEdit initialData={editRow} onClose={() => setOpenEdit(false)} onSuccess={onItemEdited} onError={onError} headers={headers} />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ borderRadius: "10px", fontWeight: 500 }}>
          {snackbarSeverity === "success" ? successMsg || "Success" : errorMsg || "An error occurred"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ColorsList;
