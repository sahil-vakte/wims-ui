// // ColorsEdit.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   Grid,
//   CircularProgress,
//   Typography,
// } from "@mui/material";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const ColorsEdit = ({
//   initialData,
//   onClose,
//   onSuccess,
//   onError,
//   headers: parentHeaders,
// }) => {
//   // initialData is the row object passed from parent; ensure it's defined
//   const [form, setForm] = useState({
//     color_code: "",
//     color_name: "",
//     secondary_code: "",
//     abbr: "",
//     hex: "",
//     pantone: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState({});

//   const headers = parentHeaders ?? {
//     Authorization: getDecryptedAccessToken()
//       ? `Bearer ${getDecryptedAccessToken().replace(/(^"|"$)/g, "")}`
//       : "",
//     "Content-Type": "application/json",
//   };

//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         color_code: initialData.color_code ?? "",
//         color_name: initialData.color_name ?? "",
//         secondary_code: initialData.secondary_code ?? "",
//         abbr: initialData.abbr ?? "",
//         hex: initialData.hex ?? "",
//         pantone: initialData.pantone ?? "",
//       });
//     }
//   }, [initialData]);

//   const validate = () => {
//     const e = {};
//     if (!form.color_code || form.color_code.trim().length === 0) {
//       e.color_code = "Color code is required";
//     }
//     if (!form.color_name || form.color_name.trim().length === 0) {
//       e.color_name = "Color name is required";
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleChange = (field) => (e) => {
//     setForm((s) => ({ ...s, [field]: e.target.value }));
//   };

//   const handleSave = async (e) => {
//     e && e.preventDefault();
//     if (!validate()) return;

//     setSaving(true);
//     try {
//       const payload = {
//         color_code: form.color_code.trim(),
//         color_name: form.color_name.trim(),
//         secondary_code: form.secondary_code?.trim() || null,
//         abbr: form.abbr?.trim() || null,
//         hex: form.hex?.trim() || null,
//         pantone: form.pantone?.trim() || null,
//       };

//       // PUT to colors/<color_code>/
//       // Use initialData.color_code if color_code is immutable server-side.
//       const targetCode = initialData?.color_code ?? form.color_code;
//       const url = `colors/${encodeURIComponent(targetCode)}/`;

//       const resp = await ApiServices.put(url, payload, headers );

//       onSuccess && onSuccess("Color updated successfully");
//     } catch (err) {
//       console.error("ColorsEdit error:", err);
//       const message =
//         err?.response?.data?.detail ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to update color";
//       onError && onError(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!initialData) {
//     return (
//       <Box sx={{ py: 3 }}>
//         <Typography>No color data provided.</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box component="form" onSubmit={handleSave} sx={{ mt: 1 }}>
//       <Grid container spacing={2}>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Color Code"
//             value={form.color_code}
//             onChange={handleChange("color_code")}
//             fullWidth
//             required
//             error={!!errors.color_code}
//             helperText={errors.color_code}
//             inputProps={{ maxLength: 50 }}
//             // If server treats color_code as immutable, disable editing:
//             // disabled
//           />
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Color Name"
//             value={form.color_name}
//             onChange={handleChange("color_name")}
//             fullWidth
//             required
//             error={!!errors.color_name}
//             helperText={errors.color_name}
//             inputProps={{ maxLength: 150 }}
//           />
//         </Grid>

//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Secondary Code"
//             value={form.secondary_code}
//             onChange={handleChange("secondary_code")}
//             fullWidth
//             inputProps={{ maxLength: 50 }}
//           />
//         </Grid>

//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Abbr"
//             value={form.abbr}
//             onChange={handleChange("abbr")}
//             fullWidth
//             inputProps={{ maxLength: 20 }}
//           />
//         </Grid>

//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Hex"
//             value={form.hex}
//             onChange={handleChange("hex")}
//             fullWidth
//             placeholder="#RRGGBB"
//             error={!!errors.hex}
//             helperText={errors.hex}
//             inputProps={{ maxLength: 7 }}
//           />
//         </Grid>

//         <Grid item xs={12}>
//           <TextField
//             label="Pantone"
//             value={form.pantone}
//             onChange={handleChange("pantone")}
//             fullWidth
//             inputProps={{ maxLength: 50 }}
//           />
//         </Grid>
//       </Grid>

//       <Box
//         sx={{
//           display: "flex",
//           gap: 1,
//           justifyContent: "flex-end",
//           mt: 3,
//         }}
//       >
//         <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
//           Cancel
//         </Button>

//         <Button
//           type="submit"
//           variant="contained"
//           disabled={saving}
//           sx={{ textTransform: "none" }}
//         >
//           {saving ? <CircularProgress size={20} /> : "Save Changes"}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default ColorsEdit;


import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Grid, CircularProgress, Typography, InputAdornment } from "@mui/material";
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

const ColorsEdit = ({ initialData, onClose, onSuccess, onError, headers: parentHeaders }) => {
  const [form, setForm] = useState({
    color_code: "", color_name: "", secondary_code: "", abbr: "", hex: "", pantone: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const headers = parentHeaders ?? {
    Authorization: getDecryptedAccessToken() ? `Bearer ${getDecryptedAccessToken().replace(/(^"|"$)/g, "")}` : "",
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
    if (!form.color_code?.trim()) e.color_code = "Color code is required";
    if (!form.color_name?.trim()) e.color_name = "Color name is required";
    if (form.hex && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.hex.trim())) {
      e.hex = "Use #RRGGBB or #RGB";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => setForm((s) => ({ ...s, [field]: e.target.value }));

  const handleSave = async (e) => {
    e?.preventDefault();
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
      const targetCode = initialData?.color_code ?? form.color_code;
      await ApiServices.put(`colors/${encodeURIComponent(targetCode)}/`, payload, headers);
      onSuccess?.("Color updated successfully");
    } catch (err) {
      console.error("ColorsEdit error:", err);
      onError?.(err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to update color");
    } finally {
      setSaving(false);
    }
  };

  if (!initialData) {
    return <Box sx={{ py: 3 }}><Typography>No color data provided.</Typography></Box>;
  }

  const isValidHex = form.hex && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.hex.trim());

  return (
    <Box component="form" onSubmit={handleSave}>
      {/* Live preview */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, mb: 3, borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: "12px",
          background: isValidHex ? form.hex : "#e2e8f0",
          border: "3px solid #fff",
          boxShadow: "0 0 0 1px #e2e8f0, 0 4px 14px rgba(0,0,0,0.06)",
        }} />
        <Box>
          <Box sx={{ fontWeight: 600, color: "#0f172a" }}>{form.color_name || "Color"}</Box>
          <Box sx={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{form.color_code || "—"}</Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Color Code *" value={form.color_code} onChange={handleChange("color_code")} fullWidth
            error={!!errors.color_code} helperText={errors.color_code} inputProps={{ maxLength: 50 }} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Color Name *" value={form.color_name} onChange={handleChange("color_name")} fullWidth
            error={!!errors.color_name} helperText={errors.color_name} inputProps={{ maxLength: 150 }} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Secondary Code" value={form.secondary_code} onChange={handleChange("secondary_code")} fullWidth
            inputProps={{ maxLength: 50 }} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Abbreviation" value={form.abbr} onChange={handleChange("abbr")} fullWidth
            inputProps={{ maxLength: 20 }} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Hex" value={form.hex} onChange={handleChange("hex")} fullWidth placeholder="#RRGGBB"
            error={!!errors.hex} helperText={errors.hex} inputProps={{ maxLength: 7 }} sx={fieldSx}
            InputProps={{
              endAdornment: isValidHex ? (
                <InputAdornment position="end">
                  <Box sx={{ width: 22, height: 22, borderRadius: "6px", background: form.hex, border: "1px solid #e2e8f0" }} />
                </InputAdornment>
              ) : null,
            }} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Pantone" value={form.pantone} onChange={handleChange("pantone")} fullWidth
            inputProps={{ maxLength: 50 }} sx={fieldSx} />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 4 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", borderRadius: "10px", color: "#64748b", px: 3 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}
          sx={{ textTransform: "none", borderRadius: "10px", px: 3, fontWeight: 600,
            background: `linear-gradient(135deg, ${accent}, #818cf8)`,
            "&:hover": { background: `linear-gradient(135deg, #4f46e5, #6366f1)` } }}>
          {saving ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default ColorsEdit;
