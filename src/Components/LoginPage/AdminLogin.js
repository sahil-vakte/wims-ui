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
import logo from "../../Assets/WIMS_Logo_Blue.png"; // adjust if your logo path differs
import ApiServices from "../../Services/ApiServices/ApiServices";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const toggleShowPassword = () => setShowPassword((s) => !s);
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setSnack({ open: false, message: "", severity: "info" });

    const payload = { username: username.trim(), password };

    try {
      const res = await ApiServices.post("auth/login/", payload);
      const data = res?.data ?? res;

      // store full response for convenience
    //   sessionStorage.setItem("adminAuthResponse", JSON.stringify(data || {}));

      // store token if present
      if (data?.token) sessionStorage.setItem("authToken", data.token);

      // store username (from form) and userType manually as requested
      sessionStorage.setItem("username", username.trim());
      sessionStorage.setItem("userType", "admin");

      // success feedback then navigate
      setSnack({ open: true, message: "Logged in successfully", severity: "success" });

      // navigate to admin dashboard
      navigate("/admin-user/dashboard");
    } catch (err) {
      let message = "Login failed. Please check credentials.";
      if (err?.response?.data?.detail) message = err.response.data.detail;
      else if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      setSnack({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={rootStyles}>
      <style>{`
        .admin-card {
          width: 420px;
          border-radius: 12px;
          overflow: visible;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(9, 76, 159, 0.12);
        }
        .admin-card-content {
          padding: 28px 28px 36px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
          justify-content: center;
        }
        .admin-logo {
          width: 190px;
          height: 56px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #094c9f;
          padding: 2px;
          background: #fff;
        }
        .brand {
          color: #094c9f;
          font-weight: 700;
          letter-spacing: 0.2px;
        }
        .admin-title {
          color: #094c9f;
          font-weight: 700;
          margin-top: 6px;
          margin-bottom: 6px;
          text-align: center;
        }
        .admin-form {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
        }
        .admin-btn {
          margin-top: 12px;
          background-color: #094c9f;
          color: #ffffff;
          text-transform: none;
          font-weight: 600;
          padding: 10px 12px;
          box-shadow: none;
        }
        .admin-btn:hover {
          background-color: #083b82;
          box-shadow: none;
        }
        .note {
          margin-top: 12px;
          color: #6b7280;
        }
        @media (max-width: 480px) {
          .admin-card { width: 92%; }
          .admin-logo { width: 48px; height: 48px; }
        }
      `}</style>

      <Card className="admin-card" elevation={8}>
        <CardContent className="admin-card-content">
          <Box className="logo-row">
            <img src={logo} alt="logo" className="admin-logo" />
            {/* <Typography variant="h6" className="brand">
              WIMS - Admin
            </Typography> */}
          </Box>

          <Typography variant="h5" className="admin-title">
            Admin Sign in
          </Typography>

          <form onSubmit={handleSubmit} className="admin-form" noValidate>
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end" aria-label="toggle password">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              className="admin-btn"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : "Login"}
            </Button>
          </form>

          <Typography variant="body2" className="note">
            Only authorized admins may sign in.
          </Typography>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4500} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLogin;

/* container styles used via sx prop */
const rootStyles = {
  minHeight: "85vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
  padding: "24px",
};
