// ColorsAdd.jsx
import React, { useState } from "react";
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

const ColorsAdd = ({ onClose, onSuccess, onError, headers: parentHeaders }) => {
  const [form, setForm] = useState({
    color_code: "",
    color_name: "",
    abbr: "",
    hex: "",
    pantone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const headers = parentHeaders ?? {
    Authorization: getDecryptedAccessToken()
      ? `Bearer ${getDecryptedAccessToken().replace(/(^"|"$)/g, "")}`
      : "",
    "Content-Type": "application/json",
  };

  const validate = () => {
    const e = {};
    if (!form.color_code || form.color_code.trim().length === 0) {
      e.color_code = "Color code is required";
    }
    if (!form.color_name || form.color_name.trim().length === 0) {
      e.color_name = "Color name is required";
    }
    // optional: validate hex format if provided
    if (form.hex && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.hex.trim())) {
      e.hex = "Hex must be in format #RRGGBB or #RGB";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        color_code: form.color_code.trim(),
        color_name: form.color_name.trim(),
        abbr: form.abbr?.trim() || null,
        hex: form.hex?.trim() || null,
        pantone: form.pantone?.trim() || null,
      };

      // POST to colors/
      const resp = await ApiServices.post("colors/", payload, headers);
      // assume success if no error thrown
      onSuccess && onSuccess("Color added successfully");
    } catch (err) {
      console.error("ColorsAdd error:", err);
      // try to extract message
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add color";
      onError && onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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

        <Grid item xs={12} sm={4}>
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
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none" }}>
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? <CircularProgress size={20} /> : "Add Color"}
        </Button>
      </Box>
    </Box>
  );
};

export default ColorsAdd;
