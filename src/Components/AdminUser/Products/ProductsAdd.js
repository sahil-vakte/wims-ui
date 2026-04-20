// import React, { useMemo, useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   Stack,
//   Typography,
//   CircularProgress,
// } from "@mui/material";
// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const ProductsAdd = ({ onClose, onSuccess }) => {

//   /* ---------------- AUTH ---------------- */
//   const accessToken = useMemo(() => getDecryptedAccessToken(), []);
//   const headers = useMemo(
//     () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//     [accessToken]
//   );

//   /* ---------------- STATE ---------------- */
//   const [form, setForm] = useState({
//     prod_id: "",
//     name: "",
//     default_unit: "",
//     description: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   /* ---------------- HANDLERS ---------------- */

//   const handleChange = (field) => (e) => {
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleSubmit = async () => {
//     setError("");

//     if (!form.prod_id || !form.name || !form.default_unit) {
//       setError("Please fill all required fields");
//       return;
//     }

//     setLoading(true);
//     try {
//       await ApiServices.post("products/", form, headers);

//       if (onSuccess) onSuccess();

//     } catch (err) {
//       console.error("Create product failed", err);
//       setError(
//         err?.response?.data?.message ||
//         "Failed to create product"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <Box sx={{ p: 1 }}>
//       <Typography variant="h6" mb={2}>
//         Create Product
//       </Typography>

//       <Stack spacing={2}>

//         <TextField
//           label="Product ID"
//           value={form.prod_id}
//           onChange={handleChange("prod_id")}
//           fullWidth
//           required
//         />

//         <TextField
//           label="Product Name"
//           value={form.name}
//           onChange={handleChange("name")}
//           fullWidth
//           required
//         />

//         <TextField
//           label="Default Unit"
//           value={form.default_unit}
//           onChange={handleChange("default_unit")}
//           fullWidth
//           required
//         />

//         <TextField
//           label="Description"
//           value={form.description}
//           onChange={handleChange("description")}
//           fullWidth
//           multiline
//           rows={3}
//         />

//         {error && (
//           <Typography color="error" fontSize={14}>
//             {error}
//           </Typography>
//         )}

//         <Stack direction="row" spacing={2} justifyContent="flex-end">

//           <Button
//             variant="outlined"
//             onClick={onClose}
//             disabled={loading}
//           >
//             Cancel
//           </Button>

//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? (
//               <CircularProgress size={22} color="inherit" />
//             ) : (
//               "Create Product"
//             )}
//           </Button>

//         </Stack>
//       </Stack>
//     </Box>
//   );
// };

// export default ProductsAdd;


import React, { useMemo, useState } from "react";
import { Box, TextField, Button, Stack, CircularProgress, Alert } from "@mui/material";
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

const ProductsAdd = ({ onClose, onSuccess }) => {
  const accessToken = useMemo(() => getDecryptedAccessToken(), []);
  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  const [form, setForm] = useState({ prod_id: "", name: "", default_unit: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.prod_id || !form.name || !form.default_unit) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await ApiServices.post("products/", form, headers);
      onSuccess?.();
    } catch (err) {
      console.error("Create product failed", err);
      setError(err?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack spacing={2.5}>
        {error && <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>}

        <TextField label="Product ID *" value={form.prod_id} onChange={handleChange("prod_id")} fullWidth sx={fieldSx} />
        <TextField label="Product Name *" value={form.name} onChange={handleChange("name")} fullWidth sx={fieldSx} />
        <TextField label="Default Unit *" value={form.default_unit} onChange={handleChange("default_unit")} fullWidth
          placeholder="e.g. roll, meter, piece" sx={fieldSx} />
        <TextField label="Description" value={form.description} onChange={handleChange("description")} fullWidth
          multiline rows={3} sx={fieldSx} />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", borderRadius: "10px", color: "#64748b", px: 3 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}
            sx={{
              textTransform: "none", borderRadius: "10px", px: 3, fontWeight: 600,
              background: `linear-gradient(135deg, ${accent}, #818cf8)`,
              "&:hover": { background: `linear-gradient(135deg, #4f46e5, #6366f1)` },
            }}>
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create Product"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProductsAdd;
