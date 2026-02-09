import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const ProductsEdit = ({ product, onSuccess }) => {
  const [formData, setFormData] = useState({
    child_product_title: "",
    child_reference: "",
    effective_price: "",
    featured: false,
    child_active: false,
    is_active: false,
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Prefill form
  useEffect(() => {
    if (product) {
      setFormData({
        child_product_title: product.child_product_title || "",
        child_reference: product.child_reference || "",
        effective_price: product.effective_price || "",
        featured: product.featured || false,
        child_active: product.child_active || false,
        is_active: product.is_active || false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.child_product_title || !formData.child_reference) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const token = getDecryptedAccessToken();

      /**
       * ✅ Backend required payload
       */
      const payload = {
        vs_child_id: product.vs_child_id,
        vs_parent_id: product.vs_child_id, // SAME AS vs_child_id
        parent_product_title: formData.child_product_title, // SAME AS child title

        child_product_title: formData.child_product_title,
        child_reference: formData.child_reference,
        effective_price: Number(formData.effective_price),
        featured: formData.featured,
        child_active: formData.child_active,
        is_active: formData.is_active,
      };

      await ApiServices.put(
        `products/${product.vs_child_id}/`,
        payload,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      setSnackbar({
        open: true,
        message: "Product updated successfully",
        severity: "success",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Update failed:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          "Failed to update product. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Edit Product
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Title"
            name="child_product_title"
            value={formData.child_product_title}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Reference"
            name="child_reference"
            value={formData.child_reference}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Effective Price"
            name="effective_price"
            type="number"
            value={formData.effective_price}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.child_active}
                onChange={handleSwitchChange}
                name="child_active"
              />
            }
            label="Child Active"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleSwitchChange}
                name="is_active"
              />
            }
            label="Is Active"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.featured}
                onChange={handleSwitchChange}
                name="featured"
              />
            }
            label="Featured"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsEdit;
