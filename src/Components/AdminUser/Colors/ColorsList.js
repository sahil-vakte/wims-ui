// ColorsList.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import ColorsAdd from "./ColorsAdd";
import ColorsEdit from "./ColorsEdit";

const ColorsList = () => {
  const accessToken = getDecryptedAccessToken();

  // state
  const [rows, setRows] = useState([]); // current page results
  const [count, setCount] = useState(0); // total count from API
  const [page, setPage] = useState(0); // zero-based for UI
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // snackbars
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success'|'error'|'info'|'warning'

  // headers for ApiServices (assumes ApiServices expects { headers: {...} } or similar)
  const headers = {
    Authorization: accessToken ? `Bearer ${accessToken.replace(/(^"|"$)/g, "")}` : "",
    "Content-Type": "application/json",
  };

  // fetch colors for given page
  const fetchColors = async (pageNumber = 1, pageSizeParam = pageSize) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Assumes API takes ?page=<n>&page_size=<size>
      const resp = await ApiServices.get(`colors/?page=${pageNumber}&page_size=${pageSizeParam}`, 
        headers,
      );
      // adjust according to ApiServices response shape:
      // expecting { data: { count, results, next, previous } } or directly { count, results }.
      const data = resp?.data ?? resp;
      if (data) {
        setRows(Array.isArray(data.results) ? data.results : []);
        setCount(typeof data.count === "number" ? data.count : (data.results || []).length);
      } else {
        setRows([]);
        setCount(0);
      }
    } catch (err) {
      console.error("fetchColors error:", err);
      setErrorMsg("Failed to load colors. Please try again.");
      setSnackbarSeverity("error");
      setSuccessMsg("");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // initial + on page/pageSize change
  useEffect(() => {
    // API page is 1-based
    fetchColors(page + 1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // client-side filtered rows (search on color_name & color_code)
  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const name = (r.color_name || "").toString().toLowerCase();
      const code = (r.color_code || "").toString().toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [rows, search]);

  // handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
  };

  const handleAddOpen = () => {
    setOpenAdd(true);
  };
  const handleAddClose = () => setOpenAdd(false);

  const handleEditOpen = (row) => {
    setEditRow(row);
    setOpenEdit(true);
  };
  const handleEditClose = () => {
    setEditRow(null);
    setOpenEdit(false);
  };

  // callbacks for child components to tell parent to refresh / show messages
  const onItemAdded = (msg) => {
    setSuccessMsg(msg || "Color added successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    handleAddClose();
    // reload current page
    fetchColors(page + 1, pageSize);
  };

  const onItemEdited = (msg) => {
    setSuccessMsg(msg || "Color updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    handleEditClose();
    fetchColors(page + 1, pageSize);
  };

  const onError = (msg) => {
    setErrorMsg(msg || "Something went wrong");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  };

  // Utility to display NA for null/empty values
  const displayVal = (v) => (v === null || v === undefined || v === "" ? "NA" : v);

  return (
    <Box p={2}>
      <Paper elevation={3}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">Colors</Typography>
            <TextField
              size="small"
              placeholder="Search by color name or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOpen}
              sx={{ textTransform: "none" }}
            >
              Add New Color
            </Button>
          </Box>
        </Toolbar>

        <TableContainer component={Paper} sx={{ p: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Color Code</TableCell>
                  <TableCell>Color Name</TableCell>
                  <TableCell>Abbr</TableCell>
                  <TableCell>Hex</TableCell>
                  <TableCell>Pantone</TableCell>
                  <TableCell>Deleted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No colors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow key={row.color_code || Math.random()}>
                      <TableCell>{displayVal(row.color_code)}</TableCell>
                      <TableCell>{displayVal(row.color_name)}</TableCell>
                      <TableCell>{displayVal(row.abbr)}</TableCell>
                      <TableCell>
                        {row.hex ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 18,
                                borderRadius: "3px",
                                border: "1px solid rgba(0,0,0,0.12)",
                                backgroundColor: row.hex,
                              }}
                            />
                            {/* <span>{row.hex}</span> */}
                          </Box>
                        ) : (
                          "NA"
                        )}
                      </TableCell>
                      <TableCell>{displayVal(row.pantone)}</TableCell>
                      <TableCell>{row.is_deleted ? "Yes" : "No"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditOpen(row)}
                          aria-label={`edit-${row.color_code}`}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          showFirstButton
          showLastButton
        />
      </Paper>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={handleAddClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Color</DialogTitle>
        <DialogContent>
          {/* 
            Assumes ColorsAdd accepts:
              - onClose: () => void
              - onSuccess: (message) => void
              - onError: (message) => void
              - headers or accessToken if it needs
          */}
          <ColorsAdd
            onClose={handleAddClose}
            onSuccess={onItemAdded}
            onError={onError}
            headers={headers}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Color</DialogTitle>
        <DialogContent>
          {/* 
            Assumes ColorsEdit accepts:
              - initialData (the row)
              - onClose
              - onSuccess
              - onError
              - headers/accessToken if needed
          */}
          {editRow && (
            <ColorsEdit
              initialData={editRow}
              onClose={handleEditClose}
              onSuccess={onItemEdited}
              onError={onError}
              headers={headers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarSeverity === "success" ? successMsg || "Success" : errorMsg || "An error occurred"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ColorsList;
