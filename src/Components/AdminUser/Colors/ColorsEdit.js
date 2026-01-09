// ColorsEdit.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
} from "@mui/material";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const ColorsEdit = ({
  initialData,
  onClose,
  onSuccess,
  onError,
  headers: parentHeaders,
}) => {
  // initialData is the row object passed from parent; ensure it's defined
  const [form, setForm] = useState({
    color_code: "",
    color_name: "",
    secondary_code: "",
    abbr: "",
    hex: "",
    pantone: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const headers = parentHeaders ?? {
    Authorization: getDecryptedAccessToken()
      ? `Bearer ${getDecryptedAccessToken().replace(/(^"|"$)/g, "")}`
      : "",
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        color_code: initialData.color_code ?? "",
        color_name: initialData.color_name ?? "",
        secondary_code: initialData.secondary_code ?? "",
        abbr: initialData.abbr ?? "",
        hex: initialData.hex ?? "",
        pantone: initialData.pantone ?? "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.color_code || form.color_code.trim().length === 0) {
      e.color_code = "Color code is required";
    }
    if (!form.color_name || form.color_name.trim().length === 0) {
      e.color_name = "Color name is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e && e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        color_code: form.color_code.trim(),
        color_name: form.color_name.trim(),
        secondary_code: form.secondary_code?.trim() || null,
        abbr: form.abbr?.trim() || null,
        hex: form.hex?.trim() || null,
        pantone: form.pantone?.trim() || null,
      };

      // PUT to colors/<color_code>/
      // Use initialData.color_code if color_code is immutable server-side.
      const targetCode = initialData?.color_code ?? form.color_code;
      const url = `colors/${encodeURIComponent(targetCode)}/`;

      const resp = await ApiServices.put(url, payload, headers );

      onSuccess && onSuccess("Color updated successfully");
    } catch (err) {
      console.error("ColorsEdit error:", err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update color";
      onError && onError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!initialData) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography>No color data provided.</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSave} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Color Code"
            value={form.color_code}
            onChange={handleChange("color_code")}
            fullWidth
            required
            error={!!errors.color_code}
            helperText={errors.color_code}
            inputProps={{ maxLength: 50 }}
            // If server treats color_code as immutable, disable editing:
            // disabled
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Color Name"
            value={form.color_name}
            onChange={handleChange("color_name")}
            fullWidth
            required
            error={!!errors.color_name}
            helperText={errors.color_name}
            inputProps={{ maxLength: 150 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Secondary Code"
            value={form.secondary_code}
            onChange={handleChange("secondary_code")}
            fullWidth
            inputProps={{ maxLength: 50 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Abbr"
            value={form.abbr}
            onChange={handleChange("abbr")}
            fullWidth
            inputProps={{ maxLength: 20 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Hex"
            value={form.hex}
            onChange={handleChange("hex")}
            fullWidth
            placeholder="#RRGGBB"
            error={!!errors.hex}
            helperText={errors.hex}
            inputProps={{ maxLength: 7 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Pantone"
            value={form.pantone}
            onChange={handleChange("pantone")}
            fullWidth
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
          mt: 3,
        }}
      >
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          sx={{ textTransform: "none" }}
        >
          {saving ? <CircularProgress size={20} /> : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default ColorsEdit;
