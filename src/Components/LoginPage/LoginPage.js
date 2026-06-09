// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Typography,
//   IconButton,
//   InputAdornment,
//   CircularProgress,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import logo from "../../Assets/WIMS_Logo_Blue.png"; // adjust path if needed
// import ApiServices from "../../Services/ApiServices/ApiServices";
// import CryptoJS from "crypto-js";

// const secretKey = process.env.REACT_APP_USER_ENC_DEC_KEY || "default_dev_secret"; // make sure to set env var in production

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState(""); // renamed to username
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

//   const handleTogglePassword = () => setShowPassword((s) => !s);
//   const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

//   const encryptAndStore = (key, value) => {
//     try {
//       const cipher = CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
//       localStorage.setItem(key, cipher);
//     } catch (err) {
//       console.error("Encryption/storage error:", err);
//       // fallback: store unencrypted (not recommended)
//       localStorage.setItem(key, JSON.stringify(value));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e && e.preventDefault();
//     setLoading(true);
//     setSnack({ open: false, message: "", severity: "info" });

//     const payload = {
//       username: username.trim(),
//       password,
//     };

//     try {
//       // call to your ApiServices - update endpoint if needed
//       const res = await ApiServices.post("auth/login/", payload);
//       // The response shape may be res.data or res directly depending on ApiServices
//       const data = res?.data ?? res;

//       // Expected keys: access, refresh, user_id, username, email, is_staff, is_superuser
//       // Store tokens & user in localStorage encrypted
//       if (data?.access) encryptAndStore("accessToken", data.access);
//       if (data?.refresh) encryptAndStore("refreshToken", data.refresh);

//       // store user details as an object
//       const userObj = {
//         user_id: data?.user_id ?? null,
//         username: data?.username ?? null,
//         email: data?.email ?? null,
//         is_staff: !!data?.is_staff,
//         is_superuser: !!data?.is_superuser,
//       };
//       encryptAndStore("user", userObj);

//       // helpful for debugging (unencrypted) - remove/comment out in production
//       // console.log("Stored encrypted tokens and user");

//       // navigation logic
//       const isStaff = !!userObj.is_staff;
//       const isSuper = !!userObj.is_superuser;

//       if (isStaff && isSuper) {
//         // admin
//         navigate("/admin-user/dashboard");
//       } else if (isStaff) {
//         // staff user
//         navigate("/employee-user/home");
//         // navigate("/employee-user/dashboard");
//       } else if (isSuper) {
//         // superuser (if you have a different route)
//         navigate("/employee-user/dashboard");
//       } else {
//         // default for regular/customer user
//         navigate("/employee-user/my-orders");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       let message = "Login failed. Please check credentials.";
//       if (err?.response?.data?.detail) message = err.response.data.detail;
//       else if (err?.response?.data) {
//         // try to extract common validation errors
//         const d = err.response.data;
//         if (typeof d === "string") message = d;
//         else if (d.non_field_errors) message = d.non_field_errors.join(" ");
//         else {
//           // pick first field error message if available
//           const firstKey = Object.keys(d)[0];
//           if (firstKey) {
//             const val = d[firstKey];
//             if (Array.isArray(val)) message = val.join(" ");
//             else if (typeof val === "string") message = val;
//             else message = JSON.stringify(val);
//           }
//         }
//       } else if (err?.message) message = err.message;

//       setSnack({ open: true, message, severity: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={rootStyles}>
//       {/* Local styles */}
//       <style>{`
//         .login-card {
//           width: 420px;
//           border-radius: 12px;
//           overflow: visible;
//           background: #ffffff;
//           box-shadow: 0 12px 30px rgba(9, 76, 159, 0.12);
//         }
//         .login-card-content {
//           padding: 28px 28px 36px;
//           display: flex;
//           flex-direction: column;
//           gap: 12px;
//         }
//         .logo-wrap {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           margin-bottom: 4px;
//           justify-content: center;
//         }
//         .app-logo {
//           width: 190px;
//           height: 56px;
//           object-fit: cover;
//           border-radius: 8px;
//           border: 2px solid #094c9f;
//           padding: 2px;
//           background: #fff;
//         }
//         .brand-text { color: #094c9f; font-weight: 700; letter-spacing: 0.2px; }
//         .login-title { color: #094c9f; font-weight: 700; margin-top: 6px; margin-bottom: 6px; text-align:center; }
//         .login-form { margin-top: 8px; display:flex; flex-direction: column; }
//         .login-btn {
//           margin-top: 12px;
//           background-color: #094c9f;
//           color: #ffffff;
//           text-transform: none;
//           font-weight: 600;
//           padding: 10px 12px;
//           box-shadow: none;
//         }
//         .login-btn:hover { background-color: #083b82; box-shadow: none; }
//         .footer-note { margin-top: 12px; color: #6b7280; }
//         @media (max-width:480px) {
//           .login-card { width: 92%; }
//           .app-logo { width: 48px; height: 48px; }
//         }
//       `}</style>

//       <Card className="login-card" elevation={8}>
//         <CardContent className="login-card-content">
//           <Box className="logo-wrap">
//             <img src={logo} alt="logo" className="app-logo" />
//           </Box>

//           <Typography variant="h5" className="login-title">
//             Sign in
//           </Typography>

//           <form onSubmit={handleSubmit} className="login-form" noValidate>
//             <TextField
//               label="Username"
//               variant="outlined"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               fullWidth
//               required
//               margin="normal"
//               autoComplete="username"
//               autoFocus
//             />

//             <TextField
//               label="Password"
//               variant="outlined"
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               fullWidth
//               required
//               margin="normal"
//               autoComplete="current-password"
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={handleTogglePassword} edge="end" aria-label="toggle password">
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             <Button type="submit" variant="contained" className="login-btn" size="large" disabled={loading}>
//               {loading ? <CircularProgress size={22} /> : "Login"}
//             </Button>
//           </form>

//           <Typography variant="body2" className="footer-note">
//             By signing in you agree to our terms...
//           </Typography>
//         </CardContent>
//       </Card>

//       <Snackbar open={snack.open} autoHideDuration={5000} onClose={handleCloseSnack}>
//         <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: "100%" }}>
//           {snack.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default LoginPage;

// /* ---------- container styles ---------- */
// const rootStyles = {
//   minHeight: "85vh",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
//   padding: "24px",
// };



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../../Assets/WIMS_Logo_Blue.png"; // adjust path if needed
import ApiServices from "../../Services/ApiServices/ApiServices";
import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_USER_ENC_DEC_KEY || "default_dev_secret";

const THEME_BLUE = "#3b82f6";
const THEME_BLUE_LIGHT = "#60a5fa";
const THEME_BLUE_DARK = "#2563eb";
const BG_GRADIENT = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
const CARD_BG = "rgba(30, 41, 59, 0.6)";
const BORDER = "rgba(148, 163, 184, 0.15)";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const handleTogglePassword = () => setShowPassword((s) => !s);
  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  const encryptAndStore = (key, value) => {
    try {
      const cipher = CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
      localStorage.setItem(key, cipher);
    } catch (err) {
      console.error("Encryption/storage error:", err);
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setSnack({ open: false, message: "", severity: "info" });

    const payload = {
      username: username.trim(),
      password,
    };

    try {
      const res = await ApiServices.post("auth/login/", payload);
      const data = res?.data ?? res;

      if (data?.access) encryptAndStore("accessToken", data.access);
      if (data?.refresh) encryptAndStore("refreshToken", data.refresh);

      const userObj = {
        user_id: data?.user_id ?? null,
        username: data?.username ?? null,
        email: data?.email ?? null,
        is_staff: !!data?.is_staff,
        is_superuser: !!data?.is_superuser,
      };
      encryptAndStore("user", userObj);

      const isStaff = !!userObj.is_staff;
      const isSuper = !!userObj.is_superuser;

      if (isStaff && isSuper) {
        navigate("/admin-user/dashboard");
      } else if (isStaff) {
        navigate("/employee-user/home");
      } else if (isSuper) {
        navigate("/employee-user/dashboard");
      } else {
        navigate("/employee-user/my-orders");
      }
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please check credentials.";
      if (err?.response?.data?.detail) message = err.response.data.detail;
      else if (err?.response?.data) {
        const d = err.response.data;
        if (typeof d === "string") message = d;
        else if (d.non_field_errors) message = d.non_field_errors.join(" ");
        else {
          const firstKey = Object.keys(d)[0];
          if (firstKey) {
            const val = d[firstKey];
            if (Array.isArray(val)) message = val.join(" ");
            else if (typeof val === "string") message = val;
            else message = JSON.stringify(val);
          }
        }
      } else if (err?.message) message = err.message;

      setSnack({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Shared styling for the dark-themed text fields
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      color: "#f1f5f9",
      bgcolor: "rgba(15, 23, 42, 0.5)",
      "& fieldset": { borderColor: BORDER },
      "&:hover fieldset": { borderColor: "rgba(148, 163, 184, 0.35)" },
      "&.Mui-focused fieldset": { borderColor: THEME_BLUE },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: THEME_BLUE_LIGHT },
    "& .MuiInputBase-input::placeholder": { color: "#64748b" },
  };

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG_GRADIENT,
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 4,
          border: `1px solid ${BORDER}`,
          bgcolor: CARD_BG,
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${THEME_BLUE}, ${THEME_BLUE_LIGHT})`,
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            component="img"
            src={logo}
            alt="WIMS Logo"
            sx={{
              width: 180,
              height: 56,
              objectFit: "contain",
              borderRadius: 2,
              p: 1,
              bgcolor: "#ffffff",
              boxShadow: `0 6px 16px rgba(59, 130, 246, 0.25)`,
            }}
          />
        </Box>

        <Typography
          variant="h5"
          sx={{
            color: "#f8fafc",
            fontWeight: 700,
            textAlign: "center",
            mb: 0.5,
          }}
        >
          Sign in
        </Typography>
        <Typography
          sx={{ color: "#94a3b8", textAlign: "center", fontSize: "0.9rem", mb: 3 }}
        >
          Welcome back, please enter your details
        </Typography>

        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          margin="normal"
          autoComplete="username"
          autoFocus
          sx={fieldSx}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          autoComplete="current-password"
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                  sx={{ color: "#94a3b8" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            minHeight: 52,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.05rem",
            background: `linear-gradient(135deg, ${THEME_BLUE}, ${THEME_BLUE_DARK})`,
            boxShadow: "0 8px 20px rgba(59, 130, 246, 0.35)",
            "&:hover": {
              background: `linear-gradient(135deg, ${THEME_BLUE_LIGHT}, ${THEME_BLUE})`,
              boxShadow: "0 10px 26px rgba(59, 130, 246, 0.45)",
            },
            "&.Mui-disabled": {
              background: "rgba(59, 130, 246, 0.3)",
              color: "#cbd5e1",
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Login"}
        </Button>

        <Typography
          sx={{ mt: 3, color: "#64748b", fontSize: "0.8rem", textAlign: "center" }}
        >
          By signing in you agree to our terms...
        </Typography>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
