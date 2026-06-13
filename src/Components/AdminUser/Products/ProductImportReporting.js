import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import RefreshIcon from "@mui/icons-material/Refresh";

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
};

const safeValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return value;
};

const ProductImportReporting = ({ sku = "" }) => {
  const accessToken = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  const [localSku, setLocalSku] = useState(sku || "");
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalSku(sku || "");
  }, [sku]);

  const fetchBatches = async () => {
    setError("");

    if (!localSku?.trim()) {
      setError("Please enter SKU.");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("sku", localSku.trim());

      const res = await ApiServices.get(
        `stock-batches/?${params.toString()}`,
        headers
      );

      const data = res?.data || res;

      setBatches(data?.results || []);
      setCount(data?.count || data?.results?.length || 0);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to fetch incoming batches."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: `1px solid ${theme.border}`,
        background: theme.card,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: theme.text, fontSize: 18 }}>
            Incoming Stock Batches
          </Typography>

          <Typography sx={{ color: theme.muted, fontSize: 13, mt: 0.5 }}>
            List incoming stock batches by SKU.
          </Typography>
        </Box>

        <Chip
          label={`${count} batches`}
          size="small"
          sx={{
            background: theme.accentSoft,
            color: theme.accent,
            fontWeight: 700,
          }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          label="SKU"
          value={localSku}
          onChange={(event) => setLocalSku(event.target.value)}
          placeholder="Enter SKU"
        />

        <Button
          variant="contained"
          onClick={fetchBatches}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <RefreshIcon />
            )
          }
          sx={{
            minWidth: 170,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 700,
            background: theme.accent,
          }}
        >
          {loading ? "Loading..." : "Get Batches"}
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {!loading && !batches.length && (
        <Box
          sx={{
            p: 3,
            borderRadius: "12px",
            background: theme.bg,
            border: `1px dashed ${theme.border}`,
            textAlign: "center",
          }}
        >
          <Inventory2Icon sx={{ color: theme.muted, mb: 1 }} />

          <Typography sx={{ color: theme.muted, fontWeight: 600 }}>
            No batches found.
          </Typography>
        </Box>
      )}

      {!!batches.length && (
        <Stack spacing={1.5}>
          {batches.map((batch, index) => (
            <Box
              key={batch?.id || batch?.batch_id || index}
              sx={{
                p: 2,
                borderRadius: "14px",
                background: theme.bg,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: theme.text,
                      fontSize: 15,
                      wordBreak: "break-word",
                    }}
                  >
                    {safeValue(batch?.batch_id || batch?.id)}
                  </Typography>

                  <Typography sx={{ color: theme.muted, fontSize: 13, mt: 0.4 }}>
                    SKU: {safeValue(batch?.sku)}
                  </Typography>
                </Box>

                <Chip
                  label={safeValue(batch?.roll_count || batch?.roll_count)}
                  size="small"
                  sx={{
                    background: theme.successSoft,
                    color: theme.success,
                    fontWeight: 700,
                    width: "fit-content",
                  }}
                />
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1,
                }}
              >
                <Info label="Supplier" value={batch?.supplier} />
                <Info label="Quantity" value={batch?.total_meterage} />
                <Info label="User" value={batch?.created_by_username} />
                <Info label="Date" value={batch?.date || batch?.created_at} />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

const Info = ({ label, value }) => (
  <Box>
    <Typography
      sx={{
        fontSize: 11,
        color: theme.muted,
        fontWeight: 700,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: 13,
        color: theme.text,
        fontWeight: 600,
        wordBreak: "break-word",
      }}
    >
      {safeValue(value)}
    </Typography>
  </Box>
);

export default ProductImportReporting;