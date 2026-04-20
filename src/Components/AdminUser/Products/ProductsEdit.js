// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   Grid,
//   Switch,
//   FormControlLabel,
//   Snackbar,
//   Alert,
//   Typography,
// } from "@mui/material";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const ProductsEdit = ({ product, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     child_product_title: "",
//     child_reference: "",
//     effective_price: "",
//     featured: false,
//     child_active: false,
//     is_active: false,
//   });

//   const [loading, setLoading] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   // Prefill form
//   useEffect(() => {
//     if (product) {
//       setFormData({
//         child_product_title: product.child_product_title || "",
//         child_reference: product.child_reference || "",
//         effective_price: product.effective_price || "",
//         featured: product.featured || false,
//         child_active: product.child_active || false,
//         is_active: product.is_active || false,
//       });
//     }
//   }, [product]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSwitchChange = (e) => {
//     const { name, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: checked,
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!formData.child_product_title || !formData.child_reference) {
//       setSnackbar({
//         open: true,
//         message: "Please fill all required fields",
//         severity: "error",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = getDecryptedAccessToken();

//       /**
//        * ✅ Backend required payload
//        */
//       const payload = {
//         vs_child_id: product.vs_child_id,
//         vs_parent_id: product.vs_child_id, // SAME AS vs_child_id
//         parent_product_title: formData.child_product_title, // SAME AS child title

//         child_product_title: formData.child_product_title,
//         child_reference: formData.child_reference,
//         effective_price: Number(formData.effective_price),
//         featured: formData.featured,
//         child_active: formData.child_active,
//         is_active: formData.is_active,
//       };

//       await ApiServices.put(
//         `products/${product.vs_child_id}/`,
//         payload,
//         {
//           Authorization: `Bearer ${token}`,
//         }
//       );

//       setSnackbar({
//         open: true,
//         message: "Product updated successfully",
//         severity: "success",
//       });

//       if (onSuccess) onSuccess();
//     } catch (error) {
//       console.error("Update failed:", error);
//       setSnackbar({
//         open: true,
//         message:
//           error?.response?.data?.message ||
//           "Failed to update product. Please try again.",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box p={3}>
//       <Typography variant="h6" mb={2}>
//         Edit Product
//       </Typography>

//       <Grid container spacing={2}>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Product Title"
//             name="child_product_title"
//             value={formData.child_product_title}
//             onChange={handleChange}
//             required
//           />
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             label="Reference"
//             name="child_reference"
//             value={formData.child_reference}
//             onChange={handleChange}
//             required
//           />
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             label="Effective Price"
//             name="effective_price"
//             type="number"
//             value={formData.effective_price}
//             onChange={handleChange}
//           />
//         </Grid>

//         <Grid item xs={12} sm={4}>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={formData.child_active}
//                 onChange={handleSwitchChange}
//                 name="child_active"
//               />
//             }
//             label="Child Active"
//           />
//         </Grid>

//         <Grid item xs={12} sm={4}>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={formData.is_active}
//                 onChange={handleSwitchChange}
//                 name="is_active"
//               />
//             }
//             label="Is Active"
//           />
//         </Grid>

//         <Grid item xs={12} sm={4}>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={formData.featured}
//                 onChange={handleSwitchChange}
//                 name="featured"
//               />
//             }
//             label="Featured"
//           />
//         </Grid>

//         <Grid item xs={12}>
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Saving..." : "Save Changes"}
//           </Button>
//         </Grid>
//       </Grid>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert
//           severity={snackbar.severity}
//           variant="filled"
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ProductsEdit;



import React, { useEffect, useState } from "react";
import {
  Box, TextField, Button, Grid, Switch, FormControlLabel,
  Snackbar, Alert, Stack, CircularProgress, InputAdornment, Paper, Typography,
} from "@mui/material";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const accent = "#6366f1";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&:hover fieldset": { borderColor: accent },
    "&.Mui-focused fieldset": { borderColor: accent },
  },
  "& label.Mui-focused": { color: accent },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: accent },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: accent },
};

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
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (!formData.child_product_title || !formData.child_reference) {
      setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const token = getDecryptedAccessToken();
      const payload = {
        vs_child_id: product.vs_child_id,
        vs_parent_id: product.vs_child_id,
        parent_product_title: formData.child_product_title,
        child_product_title: formData.child_product_title,
        child_reference: formData.child_reference,
        effective_price: Number(formData.effective_price),
        featured: formData.featured,
        child_active: formData.child_active,
        is_active: formData.is_active,
      };
      await ApiServices.put(`products/${product.vs_child_id}/`, payload, { Authorization: `Bearer ${token}` });
      setSnackbar({ open: true, message: "Product updated successfully", severity: "success" });
      onSuccess?.();
    } catch (error) {
      console.error("Update failed:", error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update product. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField fullWidth label="Product Title *" name="child_product_title"
            value={formData.child_product_title} onChange={handleChange} sx={fieldSx} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Reference *" name="child_reference"
            value={formData.child_reference} onChange={handleChange} sx={fieldSx} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Effective Price" name="effective_price" type="number"
            value={formData.effective_price} onChange={handleChange} sx={fieldSx}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Visibility & Status
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
              <FormControlLabel
                control={<Switch checked={formData.child_active} onChange={handleSwitchChange} name="child_active" sx={switchSx} />}
                label="Child Active"
              />
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={handleSwitchChange} name="is_active" sx={switchSx} />}
                label="Is Active"
              />
              <FormControlLabel
                control={<Switch checked={formData.featured} onChange={handleSwitchChange} name="featured" sx={switchSx} />}
                label="Featured"
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="contained" onClick={handleSubmit} disabled={loading}
              sx={{
                textTransform: "none", borderRadius: "10px", px: 3, fontWeight: 600,
                background: `linear-gradient(135deg, ${accent}, #818cf8)`,
                "&:hover": { background: `linear-gradient(135deg, #4f46e5, #6366f1)` },
              }}>
              {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Save Changes"}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: "10px", fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsEdit;
