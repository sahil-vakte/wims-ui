import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import LocationsAdd from "./LocationsAdd";
import { data } from "react-router-dom";

const LocationsList = () => {
  const token = getDecryptedAccessToken();

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");

  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await ApiServices.get("locations/", {
        Authorization: `Bearer ${token}`,
      });
      setLocations(res?.data?.results || []);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await ApiServices.delete(`locations/${deleteId}/`, {
        Authorization: `Bearer ${token}`,
      });
      setDeleteConfirm(false);
      setDeleteId(null);
      fetchLocations();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <Box p={2}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <TextField
          size="small"
          placeholder="Search by ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedLocation(null);
            setOpenAddEdit(true);
          }}
        >
          Add Location
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>No locations found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedLocation(row);
                        setOpenAddEdit(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => {
                        setDeleteId(row.id);
                        setDeleteConfirm(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={openAddEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedLocation ? "Edit Location" : "Add Location"}
        </DialogTitle>
        <DialogContent>
          <LocationsAdd
            initialData={selectedLocation}
            onSuccess={() => {
              setOpenAddEdit(false);
              fetchLocations();
            }}
            onCancel={() => setOpenAddEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this location?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationsList;
