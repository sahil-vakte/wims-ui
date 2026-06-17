import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  Tooltip,
  MenuItem,
  Select,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import ProductsAdd from "./ProductsAdd";
import ProductsEdit from "./ProductsEdit";
import ProductDetailsDialog from "./ProductDetailsDialog";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const theme = {
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.10)",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#16a34a",
  successSoft: "rgba(34,197,94,0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(239,68,68,0.10)",
  warn: "#d97706",
  warnSoft: "rgba(245,158,11,0.10)",
};

const stockStatusStyle = (status) => {
  const s = (status || "").toLowerCase();

  if (s.includes("inactive")) {
    return { color: theme.muted, bg: "rgba(100,116,139,0.12)" };
  }

  if (s.includes("out")) {
    return { color: theme.danger, bg: theme.dangerSoft };
  }

  if (s.includes("low")) {
    return { color: theme.warn, bg: theme.warnSoft };
  }

  return { color: theme.success, bg: theme.successSoft };
};

const ProductsList = () => {
  const accessToken = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState(0);
const searchRef = useRef("");

useEffect(() => {
  searchRef.current = search;
}, [search]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [locations, setLocations] = useState([]);

  const [openDetails, setOpenDetails] = useState(false);
  const [selectedSku, setSelectedSku] = useState(null);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await ApiServices.get("locations/", headers);
      const data = res?.data ?? res;
      setLocations(data?.results || []);
    } catch (e) {
      console.error("Failed to fetch locations", e);
    }
  }, [headers]);

  // const patchProductLocation = async (sku, payload) => {
  //   try {
  //     await ApiServices.patch(`stock/${encodeURIComponent(sku)}/`, payload, headers);

  //     fetchProducts({
  //       pageParam: page + 1,
  //       pageSizeParam: pageSize,
  //       q: search,
  //     });
  //   } catch (e) {
  //     console.error("Failed to update product location", e);
  //   }
  // };

  const patchProductLocation = async (sku, payload) => {
  try {
    await ApiServices.patch(
      `stock/${encodeURIComponent(sku)}/`,
      payload,
      headers
    );

    await fetchProducts({
      pageParam: page + 1,
      pageSizeParam: pageSize,
      q: searchRef.current,
    });
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

        if (q) {
          params.set("search", q);
        }

        const res = await ApiServices.get(`stock/?${params.toString()}`, headers);
        const data = res?.data ?? res;

        if (data?.results) {
          const mapped = data.results.map((item, index) => {
            const product = item.product || {};

            return {
              id: item.sku || product.vs_child_id || `${pageParam}-${index}`,
              sr_no: (Number(pageParam) - 1) * Number(pageSizeParam) + index + 1,

              sku: item.sku,
              product_type: item.product_type,

              child_reference: product.child_reference || item.sku,
              title: product.child_product_title || item.product_type || item.sku,
              price: product.price_break_1_price,

              color: item.color,

              available_stock_in_mtr: item.available_stock_in_mtr ?? 0,

              // User requested: Total should display available_stock_in_mtr
              total_available_stock: item.available_stock_in_mtr ?? 0,

              reserved_stock: item.reserved_stock ?? 0,
              stock_status: item.stock_status,
              is_active: item.is_active,
              is_low_stock: item.is_low_stock,

              parent_image:
                item.parent_product_images ||
                product.parent_product_images ||
                "",

              primary_location:
                item.primary_location?.id ??
                item.primary_location ??
                "",

              secondary_location:
                item.secondary_location?.id ??
                item.secondary_location ??
                "",

              __rawProduct: product,
              __rawStock: item,
            };
          });

          setRows(mapped);
          setRowCount(data.count ?? mapped.length);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    fetchProducts({
      pageParam: page + 1,
      pageSizeParam: pageSize,
      q: search,
    });
  }, [fetchProducts, page, pageSize, searchKey]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKey((prev) => prev + 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const openProductDetails = (sku) => {
    setSelectedSku(sku);
    setOpenDetails(true);
  };

  const selectSx = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.accent,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.accent,
    },
    borderRadius: "8px",
    fontSize: 13,
  };

  const columns = useMemo(
    () => [
      {
        field: "sku",
        headerName: "SKU",
        width: 160,
        renderCell: (params) => (
          <Typography
            sx={{
              fontFamily: "monospace",
              fontWeight: 600,
              fontSize: 13,
              color: theme.text,
            }}
          >
            {params.value || "—"}
          </Typography>
        ),
      },
      {
        field: "title",
        headerName: "Product",
        flex: 1,
        minWidth: 340,
        renderCell: (params) => (
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            onClick={(event) => {
              event.stopPropagation();
              openProductDetails(params.row.sku);
            }}
            sx={{
              width: "100%",
              cursor: "pointer",
              overflow: "hidden",
              "&:hover .product-title": {
                color: theme.accent,
                textDecoration: "underline",
              },
            }}
          >
            <Avatar
              variant="rounded"
              src={params.row.parent_image || ""}
              sx={{
                width: 42,
                height: 42,
                bgcolor: theme.accentSoft,
                color: theme.accent,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Inventory2Icon fontSize="small" />
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                className="product-title"
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: theme.text,
                  transition: "0.2s ease",
                }}
                noWrap
              >
                {params.value || "—"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: theme.muted,
                }}
                noWrap
              >
                Ref: {params.row.child_reference || "—"}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "price",
        headerName: "Price",
        width: 100,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, color: theme.text }}>
            {params.value === null ||
            params.value === undefined ||
            params.value === ""
              ? "—"
              : `£${params.value}`}
          </Typography>
        ),
      },
    
      {
        field: "total_available_stock",
        headerName: "Total",
        width: 110,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={`${params.value ?? 0} mtr`}
            size="small"
            sx={{
              background: theme.accentSoft,
              color: theme.accent,
              fontWeight: 700,
            }}
          />
        ),
      },
      {
        field: "stock_status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => {
          const status = stockStatusStyle(params.value);

          return (
            <Chip
              label={params.value || "—"}
              size="small"
              sx={{
                background: status.bg,
                color: status.color,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
          );
        },
      },
      {
        field: "primary_location",
        headerName: "Primary Location",
        width: 190,
        renderCell: (params) => (
          <Select
            size="small"
            fullWidth
            value={params.value || ""}
            displayEmpty
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              patchProductLocation(params.row.sku, {
                primary_location: event.target.value || null,
              })
            }
            sx={selectSx}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>

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
        width: 200,
        renderCell: (params) => (
          <Select
            size="small"
            fullWidth
            value={params.value || ""}
            displayEmpty
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              patchProductLocation(params.row.sku, {
                secondary_location: event.target.value || null,
              })
            }
            sx={selectSx}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>

            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        ),
      },
      {
        field: "actions",
        headerName: "",
        width: 70,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title="Edit product">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setEditingRow(params.row.__rawProduct);
                setOpenEdit(true);
              }}
              sx={{
                color: theme.accent,
                "&:hover": {
                  background: theme.accentSoft,
                },
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

  return (
    <Box
      sx={{
        background: theme.bg,
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              background: `linear-gradient(135deg, ${theme.accent}, #818cf8)`,
              width: 48,
              height: 48,
              boxShadow: `0 4px 14px ${theme.accentSoft}`,
            }}
          >
            <Inventory2Icon />
          </Avatar>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.text,
              }}
            >
              Products & Inventory
            </Typography>

            <Typography variant="body2" sx={{ color: theme.muted }}>
              {rowCount} {rowCount === 1 ? "product" : "products"} in stock
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh">
            <IconButton
              // onClick={() =>
              //   fetchProducts({
              //     pageParam: page + 1,
              //     pageSizeParam: pageSize,
              //     q: search,
              //   })
              // }
              onClick={() =>
  fetchProducts({
    pageParam: page + 1,
    pageSizeParam: pageSize,
    q: searchRef.current,
  })
}
              sx={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                "&:hover": {
                  background: theme.accentSoft,
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${theme.accent}, #818cf8)`,
              boxShadow: `0 4px 14px ${theme.accentSoft}`,
              "&:hover": {
                background: `linear-gradient(135deg, #4f46e5, #6366f1)`,
              },
            }}
          >
            Add Product
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: "14px",
          border: `1px solid ${theme.border}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by SKU or product title…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.muted, fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "10px",
                background: theme.bg,
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />

          <Button
            variant="outlined"
            // onClick={() => {
            //   setSearch("");
            //   setPage(0);
            // }}

            onClick={() => {
  setSearch("");
  searchRef.current = "";
  setPage(0);

  fetchProducts({
    pageParam: 1,
    pageSizeParam: pageSize,
    q: "",
  });
}}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              borderColor: theme.border,
              color: theme.muted,
              "&:hover": {
                borderColor: theme.accent,
                color: theme.accent,
                background: theme.accentSoft,
              },
            }}
          >
            Clear
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "14px",
          border: `1px solid ${theme.border}`,
          overflow: "hidden",
        }}
      >
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          rowCount={rowCount}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(0);
          }}
          rowHeight={68}
          disableSelectionOnClick
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              background: theme.bg,
              borderBottom: `1px solid ${theme.border}`,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
              color: theme.muted,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${theme.border}`,
              "&:focus, &:focus-within": {
                outline: "none",
              },
            },
            "& .MuiDataGrid-row:hover": {
              background: theme.accentSoft,
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `1px solid ${theme.border}`,
            },
          }}
        />
      </Paper>

      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.border}`,
            fontWeight: 700,
          }}
        >
          Add Product

          <IconButton onClick={() => setOpenAdd(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <ProductsAdd
            onClose={() => setOpenAdd(false)}
            onSuccess={() => {
              setOpenAdd(false);
              fetchProducts({
                pageParam: page + 1,
                pageSizeParam: pageSize,
                q: search,
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.border}`,
            fontWeight: 700,
          }}
        >
          Edit Product

          <IconButton onClick={() => setOpenEdit(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {editingRow && (
            <ProductsEdit
              product={editingRow}
              onSuccess={() => {
                setOpenEdit(false);
                fetchProducts({
                  pageParam: page + 1,
                  pageSizeParam: pageSize,
                  q: search,
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ProductDetailsDialog
        open={openDetails}
        sku={selectedSku}
        onClose={() => {
          setOpenDetails(false);
          setSelectedSku(null);
        }}
      />
    </Box>
  );
};

export default ProductsList;