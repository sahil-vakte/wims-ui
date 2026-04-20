// // ColorsAdd.jsx
// import React, { useState } from "react";
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

// const ColorsAdd = ({ onClose, onSuccess, onError, headers: parentHeaders }) => {
//   const [form, setForm] = useState({
//     color_code: "",
//     color_name: "",
//     abbr: "",
//     hex: "",
//     pantone: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const headers = parentHeaders ?? {
//     Authorization: getDecryptedAccessToken()
//       ? `Bearer ${getDecryptedAccessToken().replace(/(^"|"$)/g, "")}`
//       : "",
//     "Content-Type": "application/json",
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.color_code || form.color_code.trim().length === 0) {
//       e.color_code = "Color code is required";
//     }
//     if (!form.color_name || form.color_name.trim().length === 0) {
//       e.color_name = "Color name is required";
//     }
//     // optional: validate hex format if provided
//     if (form.hex && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.hex.trim())) {
//       e.hex = "Hex must be in format #RRGGBB or #RGB";
//     }
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleChange = (field) => (e) => {
//     setForm((s) => ({ ...s, [field]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e && e.preventDefault();
//     if (!validate()) return;

//     setLoading(true);
//     try {
//       const payload = {
//         color_code: form.color_code.trim(),
//         color_name: form.color_name.trim(),
//         abbr: form.abbr?.trim() || null,
//         hex: form.hex?.trim() || null,
//         pantone: form.pantone?.trim() || null,
//       };

//       // POST to colors/
//       const resp = await ApiServices.post("colors/", payload, headers);
//       // assume success if no error thrown
//       onSuccess && onSuccess("Color added successfully");
//     } catch (err) {
//       console.error("ColorsAdd error:", err);
//       // try to extract message
//       const message =
//         err?.response?.data?.detail ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to add color";
//       onError && onError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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

//         <Grid item xs={12} sm={4}>
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
//         <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none" }}>
//           Cancel
//         </Button>

//         <Button
//           type="submit"
//           variant="contained"
//           disabled={loading}
//           sx={{ textTransform: "none" }}
//         >
//           {loading ? <CircularProgress size={20} /> : "Add Color"}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default ColorsAdd;



import React, { useState } from "react";
import { Box, Button, TextField, Grid, CircularProgress, InputAdornment } from "@mui/material";
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

const ColorsAdd = ({ onClose, onSuccess, onError, headers: parentHeaders }) => {
  const [form, setForm] = useState({ color_code: "", color_name: "", abbr: "", hex: "", pantone: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const headers = parentHeaders ?? {
    Authorization: getDecryptedAccessToken() ? `Bearer ${getDecryptedAccessToken().replace(/(^"|"$)/g, "")}` : "",
    "Content-Type": "application/json",
  };

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

  const handleSubmit = async (e) => {
    e?.preventDefault();
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
      await ApiServices.post("colors/", payload, headers);
      onSuccess?.("Color added successfully");
    } catch (err) {
      console.error("ColorsAdd error:", err);
      onError?.(err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to add color");
    } finally {
      setLoading(false);
    }
  };

  const isValidHex = form.hex && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.hex.trim());

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Live preview */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, mb: 3, borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: "12px",
          background: isValidHex ? form.hex : "#e2e8f0",
          border: "3px solid #fff",
          boxShadow: "0 0 0 1px #e2e8f0, 0 4px 14px rgba(0,0,0,0.06)",
        }} />
        <Box>
          <Box sx={{ fontWeight: 600, color: "#0f172a" }}>{form.color_name || "New Color"}</Box>
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
        <Grid item xs={12} sm={4}>
          <TextField label="Pantone" value={form.pantone} onChange={handleChange("pantone")} fullWidth
            inputProps={{ maxLength: 50 }} sx={fieldSx} />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 4 }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", borderRadius: "10px", color: "#64748b", px: 3 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}
          sx={{ textTransform: "none", borderRadius: "10px", px: 3, fontWeight: 600,
            background: `linear-gradient(135deg, ${accent}, #818cf8)`,
            "&:hover": { background: `linear-gradient(135deg, #4f46e5, #6366f1)` } }}>
          {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Add Color"}
        </Button>
      </Box>
    </Box>
  );
};

export default ColorsAdd;
