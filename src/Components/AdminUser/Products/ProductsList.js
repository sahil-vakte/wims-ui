// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   CircularProgress,
//   Checkbox,
//   Tooltip,
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import SearchIcon from "@mui/icons-material/Search";
// import EditIcon from "@mui/icons-material/Edit";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import ProductsAdd from "./ProductsAdd";
// import ProductsEdit from "./ProductsEdit";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const ProductsList = () => {
//   /* ---------------- AUTH (stable) ---------------- */
//   const accessToken = useMemo(() => getDecryptedAccessToken(), []);
//   const headers = useMemo(
//     () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//     [accessToken]
//   );

//   /* ---------------- STATE ---------------- */
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [page, setPage] = useState(0); // 0-based
//   const [pageSize, setPageSize] = useState(25);
//   const [rowCount, setRowCount] = useState(0);

//   const [search, setSearch] = useState("");
//   const [searchKey, setSearchKey] = useState(0);

//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [editingRow, setEditingRow] = useState(null);

//   /* ---------------- API ---------------- */
//   const fetchProducts = useCallback(
//     async ({ pageParam = 1, pageSizeParam = 25, q = "" } = {}) => {
//       setLoading(true);
//       try {
//         const params = new URLSearchParams();
//         params.set("page", pageParam);
//         params.set("page_size", pageSizeParam);
//         if (q) params.set("search", q);

//         const res = await ApiServices.get(`products/?${params.toString()}`, headers);
//         const data = res?.data ?? res;

//         if (data?.results) {
//           const mapped = data.results.map((item, index) => ({
//             id: item.vs_child_id,
//             sr_no: page * pageSize + index,
//             child_reference: item.child_reference,
//             title: item.child_product_title,
//             price: item.effective_price,
//             is_active: item.is_active,
//             __raw: item,
//           }));
//           setRows(mapped);
//           setRowCount(data.count ?? mapped.length);
//         }
//       } catch (err) {
//         console.error("Failed to fetch products", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [headers, page, pageSize]
//   );

//   /* ---------------- EFFECTS ---------------- */
//   useEffect(() => {
//     fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });
//   }, [fetchProducts, page, pageSize, searchKey, search]);

//   useEffect(() => {
//     const t = setTimeout(() => setSearchKey((k) => k + 1), 400);
//     return () => clearTimeout(t);
//   }, [search]);

//   /* ---------------- COLUMNS ---------------- */
//   const columns = useMemo(
//     () => [
//       { field: "sr_no", headerName: "Sr No", width: 90 },
//       { field: "child_reference", headerName: "Child", width: 140 },
//       { field: "title", headerName: "Title", flex: 1, minWidth: 300 },
//       { field: "price", headerName: "Price", width: 120 },
//       {
//         field: "is_active",
//         headerName: "Active",
//         width: 110,
//         renderCell: (params) => <Checkbox checked={params.value} disabled />,
//       },
//       {
//         field: "actions",
//         headerName: "Actions",
//         width: 110,
//         sortable: false,
//         filterable: false,
//         renderCell: (params) => (
//           <Tooltip title="Edit">
//             <IconButton
//               size="small"
//               onClick={() => {
//                 setEditingRow(params.row.__raw);
//                 setOpenEdit(true);
//               }}
//             >
//               <EditIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         ),
//       },
//     ],
//     []
//   );

//   /* ---------------- RENDER ---------------- */
//   return (
//     <Paper sx={{ p: 2, minHeight: 600, display: "flex", flexDirection: "column" }}>
//       {/* Header */}
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//         <Typography variant="h6" fontWeight={700}>Products</Typography>

//         <Box sx={{ display: "flex", gap: 1 }}>
//           <TextField
//             size="small"
//             placeholder="Search products"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ width: 300 }}
//           />

//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             sx={{ textTransform: "none" }}
//             onClick={() => setOpenAdd(true)}
//           >
//             Add Product
//           </Button>
//         </Box>
//       </Box>

//       {/* Table */}
//       <Box sx={{ flex: 1 }}>
//         {loading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pagination
//             paginationMode="server"
//             page={page}
//             pageSize={pageSize}
//             rowCount={rowCount}
//             rowsPerPageOptions={[10, 25, 50]}
//             onPageChange={(p) => setPage(p)}
//             onPageSizeChange={(s) => {
//               setPageSize(s);
//               setPage(0);
//             }}
//             disableSelectionOnClick
//             sx={{
//               border: 0,
//               '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.03)' },
//               '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(25,118,210,0.04)' },
//             }}
//           />
//         )}
//       </Box>

//       {/* ADD DIALOG */}
//       <Dialog open={openAdd} fullWidth maxWidth="md" disableEscapeKeyDown>
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Add Product
//           <IconButton onClick={() => setOpenAdd(false)}><CloseIcon /></IconButton>
//         </DialogTitle>
//         <DialogContent>
//           <ProductsAdd
//             onClose={() => setOpenAdd(false)}
//             onSuccess={() => {
//               setOpenAdd(false);
//               fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });
//             }}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* EDIT DIALOG */}
//       <Dialog open={openEdit} fullWidth maxWidth="md" disableEscapeKeyDown>
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Edit Product
//           <IconButton onClick={() => setOpenEdit(false)}><CloseIcon /></IconButton>
//         </DialogTitle>
//         <DialogContent>
//           {editingRow && (
//             <ProductsEdit
//               product={editingRow}
//               onClose={() => setOpenEdit(false)}
//               onSuccess={() => {
//                 setOpenEdit(false);
//                 setEditingRow(null);
//                 fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });
//               }}
//             />
//           )}
//         </DialogContent>
//       </Dialog>
//     </Paper>
//   );
// };

// export default ProductsList;

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Checkbox,
  Tooltip,
  MenuItem,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ProductsAdd from "./ProductsAdd";
import ProductsEdit from "./ProductsEdit";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const ProductsList = () => {

  /* ---------------- AUTH (stable) ---------------- */
  const accessToken = useMemo(() => getDecryptedAccessToken(), []);
  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  /* ---------------- STATE ---------------- */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState(0);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  /* ---------- NEW STATE : LOCATIONS ---------- */
  const [locations, setLocations] = useState([]);

  /* ---------------- API ---------------- */

  const fetchLocations = useCallback(async () => {
    try {
      const res = await ApiServices.get(`locations/`, headers);
      const data = res?.data ?? res;
      setLocations(data?.results || []);
    } catch (e) {
      console.error("Failed to fetch locations", e);
    }
  }, [headers]);

  const patchProductLocation = async (productId, payload) => {
    try {
      await ApiServices.patch(`products/${productId}/`, payload, headers);

      // refresh only this page
      fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });

    } catch (e) {
      console.error("Failed to update product location", e);
    }
  };

  const fetchProducts = useCallback(
    async ({ pageParam = 1, pageSizeParam = 25, q = "" } = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", pageParam);
        params.set("page_size", pageSizeParam);
        if (q) params.set("search", q);

        const res = await ApiServices.get(`products/?${params.toString()}`, headers);
        const data = res?.data ?? res;

        if (data?.results) {
          const mapped = data.results.map((item, index) => ({
            id: item.vs_child_id,
            sr_no: page * pageSize + index,
            child_reference: item.child_reference,
            title: item.child_product_title,
            price: item.effective_price,
            is_active: item.is_active,

            /* ---- NEW FIELDS ---- */
            primary_location: item.primary_location || "",
            secondary_location: item.secondary_location || "",

            __raw: item,
          }));
          setRows(mapped);
          setRowCount(data.count ?? mapped.length);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    },
    [headers, page, pageSize]
  );

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });
  }, [fetchProducts, page, pageSize, searchKey, search]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    const t = setTimeout(() => setSearchKey((k) => k + 1), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- COLUMNS ---------------- */
  const columns = useMemo(
    () => [
      { field: "sr_no", headerName: "Sr No", width: 90 },
      { field: "child_reference", headerName: "Child", width: 140 },
      { field: "title", headerName: "Title", flex: 1, minWidth: 300 },
      { field: "price", headerName: "Price", width: 120 },

      {
        field: "primary_location",
        headerName: "Primary Location",
        width: 180,
        renderCell: (params) => (
          <Select
            size="small"
            fullWidth
            value={params.value || ""}
            displayEmpty
            onChange={(e) =>
              patchProductLocation(params.row.id, {
                primary_location: e.target.value || null,
              })
            }
          >
            <MenuItem value="">None</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        ),
      },

      {
        field: "secondary_location",
        headerName: "Secondary Location",
        width: 180,
        renderCell: (params) => (
          <Select
            size="small"
            fullWidth
            value={params.value || ""}
            displayEmpty
            onChange={(e) =>
              patchProductLocation(params.row.id, {
                secondary_location: e.target.value || null,
              })
            }
          >
            <MenuItem value="">None</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        ),
      },

      {
        field: "is_active",
        headerName: "Active",
        width: 110,
        renderCell: (params) => <Checkbox checked={params.value} disabled />,
      },

      {
        field: "actions",
        headerName: "Actions",
        width: 110,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditingRow(params.row.__raw);
                setOpenEdit(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [locations]
  );

  /* ---------------- RENDER ---------------- */
  return (
    <Paper sx={{ p: 2, minHeight: 600, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Products</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">3
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenAdd(true)}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server"
            page={page}
            pageSize={pageSize}
            rowCount={rowCount}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(0);
            }}
            disableSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.03)' },
              '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(25,118,210,0.04)' },
            }}
          />
        )}
      </Box>

      {/* ADD DIALOG */}
      <Dialog open={openAdd} fullWidth maxWidth="md" disableEscapeKeyDown>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Add Product
          <IconButton onClick={() => setOpenAdd(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <ProductsAdd
            onClose={() => setOpenAdd(false)}
            onSuccess={() => {
              setOpenAdd(false);
              fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} fullWidth maxWidth="md" disableEscapeKeyDown>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Edit Product
          <IconButton onClick={() => setOpenEdit(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {editingRow && (
            <ProductsEdit
              product={editingRow}
              onClose={() => setOpenEdit(false)}
              onSuccess={() => {
                setOpenEdit(false);
                setEditingRow(null);
                fetchProducts({ pageParam: page + 1, pageSizeParam: pageSize, q: search });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

    </Paper>
  );
};

export default ProductsList;
