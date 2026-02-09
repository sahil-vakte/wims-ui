import React, { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const LocationsAdd = ({ initialData, onSuccess, onCancel }) => {
  const token = getDecryptedAccessToken();

  const [locId, setLocId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialData) {
      setLocId(initialData.id);
      setName(initialData.name);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    try {
      const payload = {
        loc_id: locId,
        name,
      };

      if (initialData) {
        await ApiServices.put(`locations/${initialData.id}/`, payload, {
          Authorization: `Bearer ${token}`,
        });
      } else {
        await ApiServices.post("locations/", payload, {
          Authorization: `Bearer ${token}`,
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Save location failed", err);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
     

      <TextField
        label="Location Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </Box>
    </Box>
  );
};

export default LocationsAdd;
