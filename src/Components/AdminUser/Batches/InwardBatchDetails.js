import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  AddCircleOutline,
  ArrowForwardRounded,
  Inventory2Outlined,
  QrCode2Outlined,
  ScaleOutlined,
} from "@mui/icons-material";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const safe = (value, fallback = "—") =>
  value === null || value === undefined || value === ""
    ? fallback
    : value;

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Info = ({ label, value, large = false }) => (
  <Box
    sx={{
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: "#64748b",
        mb: 0.5,
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: large
          ? {
              xs: 17,
              sm: 20,
            }
          : 14,
        lineHeight: 1.4,
        fontWeight: large ? 800 : 600,
        color: "#0f172a",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      }}
    >
      {safe(value)}
    </Typography>
  </Box>
);

const MetricCard = ({
  label,
  value,
  suffix = "",
  subtext,
  highlight = false,
}) => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      p: {
        xs: 1.75,
        sm: 2,
      },
      borderRadius: 2.5,
      border: highlight
        ? "2px solid #22c55e"
        : "1px solid #e2e8f0",
      background: highlight ? "#f0fdf4" : "#fff",
      overflow: "hidden",
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        color: "#64748b",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </Typography>

    <Box
      sx={{
        mt: 0.6,
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: 0.6,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: {
            xs: 24,
            sm: 28,
          },
          lineHeight: 1.1,
          fontWeight: 900,
          color: highlight ? "#15803d" : "#0f172a",
          overflowWrap: "anywhere",
        }}
      >
        {safe(value)}
      </Typography>

      {value !== null &&
        value !== undefined &&
        value !== "" &&
        suffix && (
          <Typography
            component="span"
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            {suffix}
          </Typography>
        )}
    </Box>

    {subtext && (
      <Typography
        sx={{
          mt: 0.8,
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {subtext}
      </Typography>
    )}
  </Paper>
);

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const InwardBatchDetails = () => {
  const { batchId, rollId } = useParams();

  const token = useMemo(
    () => getDecryptedAccessToken(),
    []
  );

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    if (!token) return {};

    return {
      Authorization: `Bearer ${String(token).replace(
        /(^"|"$)/g,
        ""
      )}`,
    };
  }, [token]);

  useEffect(() => {
    if (!token || !batchId) {
      setLoading(false);
      return;
    }

    const fetchBatch = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await ApiServices.get(
          `stock-batches/${encodeURIComponent(batchId)}/`,
          headers
        );

        setBatch(response?.data || response);
      } catch (err) {
        const status = err?.response?.status;

        if (status === 401 || status === 403) {
          setError(
            "You don't have access to view these details. Please contact the administrator."
          );
        } else if (status === 404) {
          setError("Batch details could not be found.");
        } else {
          setError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              err?.message ||
              "Unable to load batch details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId, headers, token]);

  const scannedRoll = useMemo(
    () =>
      batch?.rolls?.find(
        (roll) => String(roll?.id) === String(rollId)
      ) || null,
    [batch, rollId]
  );

  const otherRolls = useMemo(
    () =>
      (batch?.rolls || []).filter(
        (roll) => String(roll?.id) !== String(rollId)
      ),
    [batch, rollId]
  );

  const movement = batch?.stock_movement;

  /* ------------------------------------------------------------------------ */
  /* Access                                                                   */
  /* ------------------------------------------------------------------------ */

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            boxSizing: "border-box",
            p: {
              xs: 2.5,
              sm: 4,
            },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <QrCode2Outlined
            sx={{
              fontSize: 56,
              color: "#94a3b8",
              mb: 1.5,
            }}
          />

          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Access Required
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            You don't have access to see these stock details.
            Please log in with an authorised account or contact the
            administrator.
          </Typography>

          <Typography
            sx={{
              mt: 2,
              fontSize: 12,
              color: "#94a3b8",
              overflowWrap: "anywhere",
            }}
          >
            Batch: {batchId || "—"} · Roll: {rollId || "—"}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Stack
        minHeight="70vh"
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading stock information...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          p: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!batch) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        overflowX: "hidden",
        p: {
          xs: 1.25,
          sm: 2,
          md: 3,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        {/* ================================================================== */}
        {/* PRODUCT                                                           */}
        {/* ================================================================== */}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: {
              xs: 2,
              sm: 2.5,
            },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            mb: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1fr) auto",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#64748b",
                  letterSpacing: 0.7,
                  mb: 0.5,
                }}
              >
                INCOMING STOCK
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 19,
                    sm: 24,
                  },
                  fontWeight: 900,
                  lineHeight: 1.3,
                  color: "#0f172a",
                  overflowWrap: "anywhere",
                }}
              >
                {batch.product_name}
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",

                  "& .MuiChip-root": {
                    maxWidth: "100%",
                  },

                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              >
                <Chip
                  size="small"
                  label={`SKU: ${batch.sku}`}
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  size="small"
                  label={`Batch: ${batch.batch_id}`}
                  variant="outlined"
                />

                <Chip
                  size="small"
                  label={`Supplier: ${safe(batch.supplier)}`}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box
              sx={{
                minWidth: {
                  md: 130,
                },
                textAlign: {
                  xs: "left",
                  md: "right",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                }}
              >
                BATCH DATE
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  fontWeight: 800,
                }}
              >
                {batch.batch_date}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ================================================================== */}
        {/* STOCK MOVEMENT                                                     */}
        {/* ================================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            mb: 2,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mb={2}
          >
            <Inventory2Outlined color="primary" />

            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                Stock Update
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                Inventory change after receiving this batch
              </Typography>
            </Box>
          </Stack>

          {/* DESKTOP */}

          <Box
            sx={{
              display: {
                xs: "none",
                md: "grid",
              },
              gridTemplateColumns:
                "minmax(0,1fr) 40px minmax(0,1fr) 40px minmax(0,1fr)",
              alignItems: "stretch",
              gap: 1,
            }}
          >
            <MetricCard
              label="Previous Stock"
              value={movement?.old_stock_level}
              suffix="mtr"
              subtext="Before this inward batch"
            />

            <Stack
              alignItems="center"
              justifyContent="center"
            >
              <ArrowForwardRounded
                sx={{
                  fontSize: 28,
                  color: "#94a3b8",
                }}
              />
            </Stack>

            <MetricCard
              label="Stock Added"
              value={
                movement?.quantity !== undefined
                  ? `+${movement.quantity}`
                  : "—"
              }
              suffix="mtr"
              subtext="Quantity received"
            />

            <Stack
              alignItems="center"
              justifyContent="center"
            >
              <ArrowForwardRounded
                sx={{
                  fontSize: 28,
                  color: "#94a3b8",
                }}
              />
            </Stack>

            <MetricCard
              label="Latest Stock"
              value={movement?.new_stock_level}
              suffix="mtr"
              subtext="Current stock level"
              highlight
            />
          </Box>

          {/* MOBILE / TABLET */}

          <Box
            sx={{
              display: {
                xs: "grid",
                md: "none",
              },
              gridTemplateColumns: {
                xs: "minmax(0,1fr)",
                sm: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}
          >
            <MetricCard
              label="Previous Stock"
              value={movement?.old_stock_level}
              suffix="mtr"
            />

            <MetricCard
              label="Stock Added"
              value={
                movement?.quantity !== undefined
                  ? `+${movement.quantity}`
                  : "—"
              }
              suffix="mtr"
            />

            <MetricCard
              label="Latest Stock"
              value={movement?.new_stock_level}
              suffix="mtr"
              highlight
            />
          </Box>

          <Alert
            severity="success"
            icon={<AddCircleOutline />}
            sx={{
              mt: 2,
              borderRadius: 2,
              alignItems: "center",

              "& .MuiAlert-message": {
                minWidth: 0,
                overflowWrap: "anywhere",
              },
            }}
          >
            <strong>{safe(movement?.quantity, 0)} mtr</strong>{" "}
            added. Stock changed from{" "}
            <strong>
              {safe(movement?.old_stock_level)} mtr
            </strong>{" "}
            to{" "}
            <strong>
              {safe(movement?.new_stock_level)} mtr
            </strong>
            .
          </Alert>
        </Paper>

        {/* ================================================================== */}
        {/* BATCH SUMMARY                                                      */}
        {/* ================================================================== */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
            mb: 2,
          }}
        >
          <MetricCard
            label="Roll Quantity"
            value={batch.roll_count}
            suffix={
              batch.roll_count === 1 ? "roll" : "rolls"
            }
            subtext="Number of rolls received"
          />

          <MetricCard
            label="Total Meterage"
            value={batch.total_meterage}
            suffix="mtr"
            subtext="Total meterage in this batch"
          />
        </Box>

        {/* ================================================================== */}
        {/* SCANNED ROLL                                                       */}
        {/* ================================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            mb: 2,
            borderRadius: 3,
            border: "2px solid #6366f1",
            background:
              "linear-gradient(135deg,#fff 0%,#f5f3ff 100%)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                minWidth: 0,
              }}
            >
              <QrCode2Outlined color="primary" />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  Scanned Roll
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  Roll identified from the QR label
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              color="primary"
              label="SCANNED"
              sx={{
                fontWeight: 800,
                flexShrink: 0,
              }}
            />
          </Box>

          {scannedRoll ? (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: {
                    xs: 2,
                    md: 3,
                  },
                }}
              >
                <Info
                  label="Roll Number"
                  value={`#${scannedRoll.roll_number}`}
                  large
                />

                <Info
                  label="Roll ID"
                  value={scannedRoll.id}
                  large
                />

                <Info
                  label="Roll Meterage"
                  value={`${scannedRoll.meterage} mtr`}
                  large
                />

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      mb: 0.6,
                      textTransform: "uppercase",
                    }}
                  >
                    Label Status
                  </Typography>

                  <Chip
                    size="small"
                    color={
                      scannedRoll.label_generated
                        ? "success"
                        : "warning"
                    }
                    label={
                      scannedRoll.label_generated
                        ? "Generated"
                        : "Pending"
                    }
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  p: 1.5,
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    mb: 0.5,
                  }}
                >
                  SCANNED QR DATA
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#334155",
                    overflowWrap: "anywhere",
                  }}
                >
                  /batch-process/{batch.batch_id}/
                  {scannedRoll.id}
                </Typography>
              </Box>
            </>
          ) : (
            <Alert severity="warning">
              Roll ID <strong>{rollId}</strong> was not found in
              batch <strong>{batch.batch_id}</strong>.
            </Alert>
          )}
        </Paper>

        {/* ================================================================== */}
        {/* OTHER ROLLS                                                        */}
        {/* ================================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            mb: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: 1,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                Other Rolls
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                {otherRolls.length} additional roll
                {otherRolls.length === 1 ? "" : "s"} in this
                batch
              </Typography>
            </Box>

            <Chip
              size="small"
              icon={<ScaleOutlined />}
              label={`${batch.total_meterage} mtr total`}
              variant="outlined"
            />
          </Box>

          {otherRolls.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {otherRolls.map((roll) => (
                <Paper
                  key={roll.id}
                  variant="outlined"
                  sx={{
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    p: 2,
                    borderRadius: 2.5,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    >
                      Roll #{roll.roll_number}
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        roll.label_generated
                          ? "Generated"
                          : "Pending"
                      }
                      color={
                        roll.label_generated
                          ? "success"
                          : "warning"
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0,1fr))",
                      gap: 1.5,
                    }}
                  >
                    <Info
                      label="Roll ID"
                      value={roll.id}
                    />

                    <Info
                      label="Meterage"
                      value={`${roll.meterage} mtr`}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Info
                    label="Created"
                    value={formatDateTime(roll.created_at)}
                  />
                </Paper>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              This batch contains only the scanned roll.
            </Alert>
          )}
        </Paper>

        {/* ================================================================== */}
        {/* BATCH INFORMATION                                                  */}
        {/* ================================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              mb: 2,
            }}
          >
            Batch Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0,1fr)",
                sm: "repeat(2, minmax(0,1fr))",
                md: "repeat(3, minmax(0,1fr))",
              },
              gap: {
                xs: 2,
                md: 2.5,
              },
            }}
          >
            <Info
              label="Product Name"
              value={batch.product_name}
            />

            <Info label="SKU" value={batch.sku} />

            <Info
              label="Supplier"
              value={batch.supplier}
            />

            <Info
              label="Batch ID"
              value={batch.batch_id}
            />

            <Info
              label="Stock Item"
              value={batch.stock_item}
            />

            <Info
              label="Roll Quantity"
              value={batch.roll_count}
            />

            <Info
              label="Total Meterage"
              value={`${batch.total_meterage} mtr`}
            />

            <Info
              label="Created By"
              value={batch.created_by_username}
            />

            <Info
              label="Batch Date"
              value={batch.batch_date}
            />

            <Info
              label="Created At"
              value={formatDateTime(batch.created_at)}
            />

            <Info
              label="Last Updated"
              value={formatDateTime(batch.updated_at)}
            />
          </Box>

          {batch.notes && (
            <>
              <Divider sx={{ my: 2 }} />

              <Info
                label="Notes"
                value={batch.notes}
              />
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default InwardBatchDetails;