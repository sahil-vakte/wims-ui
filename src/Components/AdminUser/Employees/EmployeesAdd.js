import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import ApiServices from "../../../Services/ApiServices/ApiServices";

const EmployeesAdd = ({ headers, onSuccess }) => {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: ""
  });

  const [userTypes, setUserTypes] = useState([]);

  const [generatedPassword, setGeneratedPassword] = useState("");

  const [passwordDialog, setPasswordDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ---------------- FETCH USER TYPES ---------------- */

  const fetchUserTypes = useCallback(async () => {

    try {

      const res = await ApiServices.get("usertypes/", headers);

      const data = res?.data ?? res;

      setUserTypes(data?.results || []);

    } catch (err) {

      console.error("Failed to fetch user types", err);

      setSnackbar({
        open: true,
        message: "Failed to load user types",
        severity: "error"
      });

    }

  }, [headers]);

  useEffect(() => {
    fetchUserTypes();
  }, [fetchUserTypes]);

  /* ---------------- FORM CHANGE ---------------- */

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  /* ---------------- CREATE EMPLOYEE ---------------- */

  const handleSubmit = async () => {

    try {

      const payload = {
        username: form.email, // email used as username
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        position: form.position
      };

      const res = await ApiServices.post(
        "auth/register/",
        payload,
        headers
      );

      const data = res?.data ?? res;

      console.log("EMPLOYEE CREATED:", data);

      setGeneratedPassword(data?.password || "");

      setPasswordDialog(true);

      setSnackbar({
        open: true,
        message: "Employee created successfully",
        severity: "success"
      });

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        position: ""
      });

      if (onSuccess) onSuccess();

    } catch (err) {

      console.error("Failed to create employee", err);

      setSnackbar({
        open: true,
        message: "Failed to create employee",
        severity: "error"
      });

    }

  };

  /* ---------------- COPY PASSWORD ---------------- */

  const copyPassword = () => {

    navigator.clipboard.writeText(generatedPassword);

    setSnackbar({
      open: true,
      message: "Password copied to clipboard",
      severity: "success"
    });

  };

  /* ---------------- RENDER ---------------- */

  return (

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

      <TextField
        label="First Name"
        name="first_name"
        value={form.first_name}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Last Name"
        name="last_name"
        value={form.last_name}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
      />

      {/* USER TYPE DROPDOWN */}

      <TextField
        select
        label="User Type"
        name="position"
        value={form.position}
        onChange={handleChange}
        fullWidth
      >

        {userTypes.map((type) => (
          <MenuItem key={type.id} value={type.id}>
            {type.name}
          </MenuItem>
        ))}

      </TextField>

      <Button
        variant="contained"
        onClick={handleSubmit}
      >
        Create Employee
      </Button>

      {/* PASSWORD DISPLAY DIALOG */}

      <Dialog open={passwordDialog}>

        <DialogTitle>
          Employee Created
        </DialogTitle>

        <DialogContent>

          <Typography sx={{ mb: 1 }}>
            Copy this password and store it securely.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              border: "1px solid #ddd",
              borderRadius: 1
            }}
          >

            <Typography sx={{ flexGrow: 1 }}>
              {generatedPassword}
            </Typography>

            <IconButton onClick={copyPassword}>
              <ContentCopyIcon />
            </IconButton>

          </Box>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setPasswordDialog(false)}>
            Close
          </Button>

        </DialogActions>

      </Dialog>

      {/* SNACKBAR */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >

        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>

  );
};

export default EmployeesAdd;