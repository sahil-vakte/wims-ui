import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Checkbox,
  Button,
  TextField,
} from "@mui/material";

import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import ApiServices from "../../../Services/ApiServices/ApiServices";

const OrderLabelTest = () => {
  const [orders, setOrders] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const accessToken = useMemo(() => getDecryptedAccessToken(), []);
  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await ApiServices.get("orders", headers);
      const data = res?.data?.results || [];
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShortTitle = (name) => {
    if (!name) return "";
    const parts = name.split("-");
    return parts[0];
  };

  const toggleSelect = (id) => {
    setSelectedLabels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAll = () => {
    const all = {};
    filteredOrders.forEach((order) =>
      order?.items?.forEach((item) => {
        all[`${order.id}-${item.id}`] = true;
      })
    );
    setSelectedLabels(all);
  };

  const discardFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter((order) => {
    if (!startDate && !endDate) return true;

    const orderDate = new Date(order.order_date);

    if (startDate && new Date(startDate) > orderDate) return false;
    if (endDate && new Date(endDate) < orderDate) return false;

    return true;
  });

  return (
    <Box p={3}>
      {/* FILTER CONTROLS */}

      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <TextField
          type="date"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Button variant="outlined" onClick={selectAll}>
          Select All
        </Button>

        <Button variant="outlined" color="error" onClick={discardFilters}>
          Discard Filters
        </Button>

        <Button variant="contained" onClick={handlePrint}>
          Print Labels
        </Button>
      </Box>

      {/* PRINT AREA */}

      <Box id="print-area">
        <Grid container spacing={2} direction="column">
          {filteredOrders?.map((order) =>
            order?.items?.map((item) => {
              const labelId = `${order.id}-${item.id}`;
              const orderType = order?.items?.length > 1 ? "M" : "S";

              return (
                <Grid item key={labelId}>
                  <Box display="flex" gap={1}>
                    <Checkbox
                      checked={!!selectedLabels[labelId]}
                      onChange={() => toggleSelect(labelId)}
                      className="no-print"
                    />

                    {/* LABEL */}

                    <Paper
                      elevation={0}
                      sx={{
                        width: "3.5in",
                        height: "1.25in",
                        border: "1px solid #bbb",
                        display: "flex",
                        fontFamily: "Arial",
                        background: "#fff",
                      }}
                    >
                      {/* LEFT */}

                      <Box
                        sx={{
                          width: "30%",
                          borderRight: "1px solid #ddd",
                          p: 0.5,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography fontSize={8}>
                          {formatDate(order?.order_date)}
                        </Typography>

                        <Typography fontSize={11} fontWeight={700}>
                          {orderType}
                        </Typography>

                        <Typography fontSize={9}>WEB</Typography>

                        <Typography fontSize={9}>STANDARD</Typography>

                        <Typography fontSize={9} fontWeight={600}>
                          {order?.external_order_id}
                        </Typography>
                      </Box>

                      {/* CENTER */}

                      <Box
                        sx={{
                          width: "40%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 500,
                            lineHeight: 1.1,
                          }}
                        >
                          {getShortTitle(item?.product_name)}
                        </Typography>
                      </Box>

                      {/* RIGHT */}

                      <Box
                        sx={{
                          width: "30%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          p: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 24,
                            fontWeight: "bold",
                            letterSpacing: 1,
                          }}
                        >
                          {item?.sku}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 20,
                            fontWeight: "bold",
                          }}
                        >
                          {item?.quantity}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>

      {/* PRINT CSS */}

      <style>
        {`
        @media print {

          body * {
            visibility: hidden;
          }

          #print-area, #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
          }

          .no-print {
            display:none !important;
          }

        }
        `}
      </style>
    </Box>
  );
};

export default OrderLabelTest;