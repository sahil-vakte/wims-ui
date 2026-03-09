import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Typography
} from "@mui/material";

import ApiServices from "../../../Services/ApiServices/ApiServices";

const EmployeesType = ({ headers, onSuccess }) => {

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const [userTypes, setUserTypes] = useState([]);

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

      console.log("USER TYPES:", data);

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

  /* ---------------- FORM HANDLER ---------------- */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- CREATE USER TYPE ---------------- */

  const handleSubmit = async () => {

    try {

      const res = await ApiServices.post(
        "usertypes/",
        form,
        headers
      );

      console.log("USER TYPE CREATED:", res);

      setSnackbar({
        open: true,
        message: "User type created successfully",
        severity: "success"
      });

      setForm({
        name: "",
        description: ""
      });

      fetchUserTypes();

      if (onSuccess) onSuccess();

    } catch (err) {

      console.error("Failed to create user type", err);

      setSnackbar({
        open: true,
        message: "Failed to create user type",
        severity: "error"
      });

    }

  };

  /* ---------------- RENDER ---------------- */

  return (

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

      {/* EXISTING USER TYPES */}

      <Box>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Available User Types
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">

          {userTypes.map((type) => (
            <Chip
              key={type.id}
              label={type.name}
              color="primary"
              variant="outlined"
            />
          ))}

        </Stack>

      </Box>

      {/* FORM */}

      <TextField
        label="User Type Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        fullWidth
      />

      <Button
        variant="contained"
        onClick={handleSubmit}
      >
        Create User Type
      </Button>

      {/* SNACKBAR */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >

        <Alert
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>

  );
};

export default EmployeesType;