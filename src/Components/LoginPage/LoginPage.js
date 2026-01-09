import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
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

const secretKey = process.env.REACT_APP_USER_ENC_DEC_KEY || "default_dev_secret"; // make sure to set env var in production

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // renamed to username
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
      // fallback: store unencrypted (not recommended)
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
      // call to your ApiServices - update endpoint if needed
      const res = await ApiServices.post("auth/login/", payload);
      // The response shape may be res.data or res directly depending on ApiServices
      const data = res?.data ?? res;

      // Expected keys: access, refresh, user_id, username, email, is_staff, is_superuser
      // Store tokens & user in localStorage encrypted
      if (data?.access) encryptAndStore("accessToken", data.access);
      if (data?.refresh) encryptAndStore("refreshToken", data.refresh);

      // store user details as an object
      const userObj = {
        user_id: data?.user_id ?? null,
        username: data?.username ?? null,
        email: data?.email ?? null,
        is_staff: !!data?.is_staff,
        is_superuser: !!data?.is_superuser,
      };
      encryptAndStore("user", userObj);

      // helpful for debugging (unencrypted) - remove/comment out in production
      // console.log("Stored encrypted tokens and user");

      // navigation logic
      const isStaff = !!userObj.is_staff;
      const isSuper = !!userObj.is_superuser;

      if (isStaff && isSuper) {
        // admin
        navigate("/admin-user/dashboard");
      } else if (isStaff) {
        // staff user
        navigate("/staff/dashboard");
      } else if (isSuper) {
        // superuser (if you have a different route)
        navigate("/superuser/dashboard");
      } else {
        // default for regular/customer user
        navigate("/employee-user/my-orders");
      }
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please check credentials.";
      if (err?.response?.data?.detail) message = err.response.data.detail;
      else if (err?.response?.data) {
        // try to extract common validation errors
        const d = err.response.data;
        if (typeof d === "string") message = d;
        else if (d.non_field_errors) message = d.non_field_errors.join(" ");
        else {
          // pick first field error message if available
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

  return (
    <Box sx={rootStyles}>
      {/* Local styles */}
      <style>{`
        .login-card {
          width: 420px;
          border-radius: 12px;
          overflow: visible;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(9, 76, 159, 0.12);
        }
        .login-card-content {
          padding: 28px 28px 36px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
          justify-content: center;
        }
        .app-logo {
          width: 190px;
          height: 56px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #094c9f;
          padding: 2px;
          background: #fff;
        }
        .brand-text { color: #094c9f; font-weight: 700; letter-spacing: 0.2px; }
        .login-title { color: #094c9f; font-weight: 700; margin-top: 6px; margin-bottom: 6px; text-align:center; }
        .login-form { margin-top: 8px; display:flex; flex-direction: column; }
        .login-btn {
          margin-top: 12px;
          background-color: #094c9f;
          color: #ffffff;
          text-transform: none;
          font-weight: 600;
          padding: 10px 12px;
          box-shadow: none;
        }
        .login-btn:hover { background-color: #083b82; box-shadow: none; }
        .footer-note { margin-top: 12px; color: #6b7280; }
        @media (max-width:480px) {
          .login-card { width: 92%; }
          .app-logo { width: 48px; height: 48px; }
        }
      `}</style>

      <Card className="login-card" elevation={8}>
        <CardContent className="login-card-content">
          <Box className="logo-wrap">
            <img src={logo} alt="logo" className="app-logo" />
          </Box>

          <Typography variant="h5" className="login-title">
            Sign in
          </Typography>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
              autoComplete="username"
              autoFocus
            />

            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end" aria-label="toggle password">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" className="login-btn" size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Login"}
            </Button>
          </form>

          <Typography variant="body2" className="footer-note">
            By signing in you agree to our terms.
          </Typography>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;

/* ---------- container styles ---------- */
const rootStyles = {
  minHeight: "85vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
  padding: "24px",
};
