import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const theme = {
  accent: "#6366f1",
  bg: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
};

const BatchesAdd = ({ onSuccess }) => {
  const token = useMemo(() => getDecryptedAccessToken(), []);
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("Incoming stock batch");
  const [rolls, setRolls] = useState([
    { roll_number: 1, meterage: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async (search = "") => {
    try {
      setProductLoading(true);

      const params = new URLSearchParams();
      params.set("page_size", 25);
      if (search) params.set("search", search);

      const res = await ApiServices.get(`stock/?${params.toString()}`, headers);
      const data = res?.data || res;

      setProducts(data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(productSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [productSearch]);

  const addRoll = () => {
    setRolls((prev) => [
      ...prev,
      {
        roll_number: prev.length + 1,
        meterage: "",
      },
    ]);
  };

  const removeRoll = (index) => {
    setRolls((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((roll, i) => ({
          ...roll,
          roll_number: i + 1,
        }))
    );
  };

  const updateRoll = (index, field, value) => {
    setRolls((prev) =>
      prev.map((roll, i) =>
        i === index
          ? {
              ...roll,
              [field]: value,
            }
          : roll
      )
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedProduct?.sku) {
      setError("Please select product.");
      return;
    }

    if (!supplier.trim()) {
      setError("Please enter supplier.");
      return;
    }

    const validRolls = rolls
      .map((roll, index) => ({
        roll_number: Number(roll.roll_number || index + 1),
        meterage: Number(roll.meterage || 0),
      }))
      .filter((roll) => roll.meterage > 0);

    if (!validRolls.length) {
      setError("Please enter at least one roll meterage.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        sku: selectedProduct.sku,
        supplier: supplier.trim(),
        notes,
        rolls: validRolls,
      };

      await ApiServices.post("stock-batches/", payload, {
        ...headers,
        "Content-Type": "application/json",
      });

      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to create incoming batch."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getProductLabel = (item) => {
    const name =
      item?.product?.child_product_title ||
      item?.product?.parent_product_title ||
      item?.product_type ||
      item?.sku;

    return `${item?.sku || ""} — ${name || ""}`;
  };

  const totalMeterage = rolls.reduce(
    (sum, roll) => sum + Number(roll.meterage || 0),
    0
  );

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Autocomplete
        options={products}
        loading={productLoading}
        value={selectedProduct}
        onChange={(_, value) => setSelectedProduct(value)}
        inputValue={productSearch}
        onInputChange={(_, value) => setProductSearch(value)}
        getOptionLabel={getProductLabel}
        isOptionEqualToValue={(option, value) => option?.sku === value?.sku}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Product By SKU / Name"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {productLoading ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {selectedProduct && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
          }}
        >
          <Typography sx={{ fontWeight: 800, color: theme.text }}>
            {selectedProduct?.product?.child_product_title ||
              selectedProduct?.product_type}
          </Typography>
          <Typography sx={{ color: theme.muted, fontSize: 13 }}>
            SKU: {selectedProduct?.sku}
          </Typography>
          <Typography sx={{ color: theme.muted, fontSize: 13 }}>
            Current Stock: {selectedProduct?.available_stock_in_mtr ?? 0} mtr
          </Typography>
        </Paper>
      )}

      <TextField
        size="small"
        label="Supplier"
        value={supplier}
        onChange={(e) => setSupplier(e.target.value)}
        fullWidth
      />

      <TextField
        size="small"
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        fullWidth
        multiline
        minRows={2}
      />

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography sx={{ fontWeight: 800, color: theme.text }}>
            Rolls
          </Typography>
          <Typography sx={{ color: theme.muted, fontSize: 13 }}>
            Total meterage: {totalMeterage} mtr
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={addRoll}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Add Roll
        </Button>
      </Stack>

      <Stack spacing={1}>
        {rolls.map((roll, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{ p: 1.5, borderRadius: 2 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                size="small"
                label="Roll Number"
                value={roll.roll_number}
                onChange={(e) =>
                  updateRoll(index, "roll_number", e.target.value)
                }
                sx={{ width: 140 }}
              />

              <TextField
                size="small"
                label="Meterage"
                type="number"
                value={roll.meterage}
                onChange={(e) =>
                  updateRoll(index, "meterage", e.target.value)
                }
                fullWidth
              />

              <IconButton
                color="error"
                disabled={rolls.length === 1}
                onClick={() => removeRoll(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Button
        variant="contained"
        disabled={submitting}
        onClick={handleSubmit}
        sx={{
          textTransform: "none",
          fontWeight: 800,
          borderRadius: 2,
          background: theme.accent,
          minHeight: 44,
        }}
      >
        {submitting ? "Creating..." : "Create Incoming Batch"}
      </Button>
    </Stack>
  );
};

export default BatchesAdd;