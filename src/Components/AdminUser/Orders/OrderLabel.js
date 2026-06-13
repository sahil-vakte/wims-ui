import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const OrderLabel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [labelFilter, setLabelFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accessToken = getDecryptedAccessToken();

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken?.replace(/(^"|"$)/g, "")}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  );

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let allOrders = [];
      let nextUrl = "orders/with-items/";

      while (nextUrl) {
        const response = await ApiServices.get(nextUrl, headers);
        const data = response?.data;

        if (!data) break;

        allOrders = [...allOrders, ...(data.results || [])];

        if (data.next) {
          try {
            const url = new URL(data.next);
            nextUrl = `${url.pathname.replace("/api/v1/", "")}${url.search}`;
          } catch {
            nextUrl = null;
          }
        } else {
          nextUrl = null;
        }
      }

      allOrders.sort(
        (a, b) =>
          new Date(b.created_at || b.order_date) -
          new Date(a.created_at || a.order_date)
      );

      setOrders(allOrders);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const items = order.items || [];

      if (labelFilter === "ALL") return true;

      const hasPrinted = items.some((item) => item.lable_printed === true);
      const allPrinted =
        items.length > 0 && items.every((item) => item.lable_printed === true);

      if (labelFilter === "PRINTED") return hasPrinted;
      if (labelFilter === "NOT_PRINTED") return !allPrinted;

      return true;
    });
  }, [orders, labelFilter]);

  const isOrderFullyPrinted = (order) => {
    const items = order.items || [];
    return items.length > 0 && items.every((item) => item.lable_printed === true);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const selectableOrders = filteredOrders
        .filter((order) => !isOrderFullyPrinted(order))
        .map((order) => order.id);

      setSelectedOrders(selectableOrders);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const downloadSelectedOrders = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Order Labels");

      worksheet.columns = [
        { header: "Type", key: "type", width: 10 },
        { header: "SKU", key: "sku", width: 20 },
        { header: "Product Name", key: "product", width: 60 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "External Order ID", key: "externalOrderId", width: 20 },
        { header: "Source", key: "source", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Date", key: "date", width: 25 },
        { header: "QR URL", key: "qr", width: 70 },
        { header: "Label Printed", key: "labelPrinted", width: 18 },
      ];

      worksheet.getRow(1).font = { bold: true };

      const selected = orders.filter((order) =>
        selectedOrders.includes(order.id)
      );

      selected.forEach((order) => {
        order.items?.forEach((item) => {
          worksheet.addRow({
            type: order.items?.length > 1 ? "M" : "S",
            sku: item.sku,
            product: item.product_name,
            qty: item.quantity,
            externalOrderId: order.external_order_id,
            source: "WEB",
            status: order.order_status_display,
            date: new Date(order.order_date).toLocaleString(),
            qr: `https://wims.cloud/employee-user/order-process-item/${order.id}/${item.id}`,
            labelPrinted: item.lable_printed ? "Printed" : "Pending",
          });
        });
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };

          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `Order_Labels_${Date.now()}.xlsx`
      );
    } catch (err) {
      console.error("Download Error:", err);
    }
  };

  const allSelectableIds = filteredOrders
    .filter((order) => !isOrderFullyPrinted(order))
    .map((order) => order.id);

  const allSelected =
    allSelectableIds.length > 0 &&
    allSelectableIds.every((id) => selectedOrders.includes(id));

  const partiallySelected =
    selectedOrders.length > 0 &&
    allSelectableIds.some((id) => selectedOrders.includes(id)) &&
    !allSelected;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Order Labels Download
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Total Orders: {orders.length} | Showing: {filteredOrders.length} |
        Selected Orders: {selectedOrders.length}
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Button
          variant="contained"
          onClick={downloadSelectedOrders}
          disabled={selectedOrders.length === 0}
        >
          Download Selected Orders
        </Button>

        <Button variant="outlined" onClick={fetchAllOrders}>
          Refresh
        </Button>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Label Status</InputLabel>

          <Select
            value={labelFilter}
            label="Label Status"
            onChange={(e) => {
              setLabelFilter(e.target.value);
              setSelectedOrders([]);
            }}
          >
            <MenuItem value="ALL">All Orders</MenuItem>
            <MenuItem value="PRINTED">Label Printed</MenuItem>
            <MenuItem value="NOT_PRINTED">Label Not Printed</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={partiallySelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>

                <TableCell>
                  <strong>External Order ID</strong>
                </TableCell>

                <TableCell>
                  <strong>Customer</strong>
                </TableCell>

                <TableCell width={90}>
                  <strong>Type</strong>
                </TableCell>

                <TableCell>
                  <strong>Products</strong>
                </TableCell>

                <TableCell>
                  <strong>Label Printing</strong>
                </TableCell>

                <TableCell>
                  <strong>Status</strong>
                </TableCell>

                <TableCell>
                  <strong>Payment</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const fullyPrinted = isOrderFullyPrinted(order);

                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                        {fullyPrinted && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Printed
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={700}>
                          {order.external_order_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.order_number}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600}>
                          {order.customer_name || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer_email || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.items?.length > 1 ? "M" : "S"}
                          size="small"
                          color={order.items?.length > 1 ? "secondary" : "default"}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack spacing={1}>
                          {order.items?.map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <Typography fontWeight={700} fontSize={13}>
                                {item.sku}
                              </Typography>

                              <Typography variant="body2">
                                {item.product_name}
                              </Typography>

                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} | Status:{" "}
                                {item.processing_status_display ||
                                  item.processing_status}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {order.items?.map((item) => (
                            <Chip
                              key={item.id}
                              label={
                                item.lable_printed ? "Printed" : "Pending"
                              }
                              size="small"
                              color={item.lable_printed ? "success" : "warning"}
                            />
                          ))}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.order_status_display || order.order_status}
                          color="info"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            order.payment_status_display ||
                            order.payment_status
                          }
                          color={
                            order.payment_status === "PAID"
                              ? "success"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No Orders Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default OrderLabel;