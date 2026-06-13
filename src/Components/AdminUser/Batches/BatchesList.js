import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import BatchesAdd from "./BatchesAdd";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const theme = {
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.10)",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#16a34a",
  successSoft: "rgba(34,197,94,0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(239,68,68,0.10)",
};

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

const BatchesList = () => {
  const token = useMemo(() => getDecryptedAccessToken(), []);
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState("");

  const [sku, setSku] = useState("");
  const [supplier, setSupplier] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [batchDetail, setBatchDetail] = useState(null);
  const [labels, setLabels] = useState([]);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (sku.trim()) params.set("sku", sku.trim());
      if (supplier.trim()) params.set("supplier", supplier.trim());
      if (search.trim()) params.set("search", search.trim());
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await ApiServices.get(
        `stock-batches/?${params.toString()}`,
        headers
      );

      const data = res?.data || res;
      setBatches(data?.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch batches.");
    } finally {
      setLoading(false);
    }
  }, [headers, sku, supplier, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const openDetail = async (batchId) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setBatchDetail(null);
      setLabels([]);

      const res = await ApiServices.get(`stock-batches/${batchId}/`, headers);
      setBatchDetail(res?.data || res);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch batch detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const generateLabels = async (batchId) => {
    try {
      setDetailLoading(true);

      const res = await ApiServices.get(
        `stock-batches/${batchId}/labels/`,
        headers
      );

      const data = res?.data || res;
      setLabels(Array.isArray(data) ? data : data?.results || data?.labels || []);
    } catch (err) {
      console.error(err);
      setError("Failed to generate labels.");
    } finally {
      setDetailLoading(false);
    }
  };

  const markLabelsGenerated = async (batchId) => {
    try {
      setDetailLoading(true);

      await ApiServices.post(
        `stock-batches/${batchId}/mark-labels-generated/`,
        {},
        headers
      );

      await openDetail(batchId);
      await fetchBatches();
    } catch (err) {
      console.error(err);
      setError("Failed to mark labels generated.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box sx={{ background: theme.bg, minHeight: "100vh", p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.text }}>
            Stock Incoming Batches
          </Typography>
          <Typography sx={{ color: theme.muted, fontSize: 14 }}>
            Create, list, view, and generate labels for incoming stock batches.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBatches}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              background: theme.accent,
              fontWeight: 700,
            }}
          >
            Create Batch
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${theme.border}` }} elevation={0}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField size="small" label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} fullWidth />
          <TextField size="small" label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} fullWidth />
          <TextField size="small" label="Search Batch ID" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
          <TextField size="small" type="date" label="Date From" InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} fullWidth />
          <TextField size="small" type="date" label="Date To" InputLabelProps={{ shrink: true }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} fullWidth />
          <Button variant="contained" onClick={fetchBatches} sx={{ minWidth: 120, textTransform: "none", background: theme.accent }}>
            Filter
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : !batches.length ? (
          <Typography sx={{ p: 3, color: theme.muted, textAlign: "center" }}>
            No batches found.
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            {batches.map((batch, index) => {
              const batchId = batch?.id || batch?.batch_id;

              return (
                <Stack
                  key={batchId || index}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ p: 2 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: theme.text }}>
                      Batch: {safe(batchId)}
                    </Typography>
                    <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                      SKU: {safe(batch?.sku)} | Supplier: {safe(batch?.supplier)}
                    </Typography>
                    <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                      Notes: {safe(batch?.notes)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={batch?.labels_generated ? "Labels Generated" : "Labels Pending"}
                      size="small"
                      sx={{
                        background: batch?.labels_generated
                          ? theme.successSoft
                          : theme.accentSoft,
                        color: batch?.labels_generated ? theme.success : theme.accent,
                        fontWeight: 700,
                      }}
                    />

                    <Tooltip title="View Detail">
                      <IconButton onClick={() => openDetail(batchId)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Create Incoming Batch
          <IconButton onClick={() => setOpenAdd(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <BatchesAdd
            onSuccess={() => {
              setOpenAdd(false);
              fetchBatches();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Batch Detail
          <IconButton onClick={() => setDetailOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {detailLoading ? (
            <Stack alignItems="center" sx={{ py: 5 }}>
              <CircularProgress />
            </Stack>
          ) : batchDetail ? (
            <Stack spacing={2}>
              <Paper sx={{ p: 2, borderRadius: 3, background: theme.bg }} elevation={0}>
                <Typography sx={{ fontWeight: 800 }}>
                  Batch: {safe(batchDetail?.id || batchDetail?.batch_id)}
                </Typography>
                <Typography>SKU: {safe(batchDetail?.sku)}</Typography>
                <Typography>Supplier: {safe(batchDetail?.supplier)}</Typography>
                <Typography>Notes: {safe(batchDetail?.notes)}</Typography>
              </Paper>

              <Box>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Rolls</Typography>
                <Stack spacing={1}>
                  {(batchDetail?.rolls || []).map((roll, i) => (
                    <Paper key={roll?.id || i} sx={{ p: 1.5, borderRadius: 2 }} variant="outlined">
                      <Typography>
                        Roll #{safe(roll?.roll_number)} — {safe(roll?.meterage)} mtr
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<LocalOfferIcon />}
                  variant="outlined"
                  onClick={() => generateLabels(batchDetail?.id || batchDetail?.batch_id)}
                  sx={{ textTransform: "none" }}
                >
                  Generate Labels
                </Button>

                <Button
                  startIcon={<CheckCircleIcon />}
                  variant="contained"
                  onClick={() => markLabelsGenerated(batchDetail?.id || batchDetail?.batch_id)}
                  sx={{ textTransform: "none", background: theme.success }}
                >
                  Mark Labels Generated
                </Button>
              </Stack>

              {!!labels.length && (
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>Labels</Typography>
                  <Stack spacing={1}>
                    {labels.map((label, i) => (
                      <Paper key={i} sx={{ p: 1.5, borderRadius: 2 }} variant="outlined">
                        <Typography sx={{ fontWeight: 700 }}>
                          {safe(label?.sku)} — Roll {safe(label?.roll_number)}
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                          Product: {safe(label?.product_name)}
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                          Meterage: {safe(label?.meterage)}
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                          Batch: {safe(label?.batch_id)}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BatchesList;