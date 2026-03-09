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

const OrderLabel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [printer, setPrinter] = useState(null);

  const accessToken = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  /* ---------------- FETCH ORDERS ---------------- */

  const fetchOrders = async () => {
    try {
      const res = await ApiServices.get("orders", headers);
      setOrders(res?.data?.results || []);
    } catch (err) {
      console.error("Orders API error:", err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ---------------- DYMO INIT ---------------- */

  useEffect(() => {
    if (!window.dymo || !window.dymo.label) return;

    try {
      const printers = window.dymo.label.framework.getPrinters();

      if (printers && printers.length > 0) {
        setPrinter(printers[0].name);
      }
    } catch (err) {
      console.error("DYMO init error", err);
    }
  }, []);

  /* ---------------- UTIL ---------------- */

  const getShortTitle = (name) => {
    if (!name) return "";
    return name.split("-")[0];
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
      order.items?.forEach((item) => {
        all[`${order.id}-${item.id}`] = true;
      })
    );

    setSelectedLabels(all);
  };

  /* ---------------- FILTER ORDERS ---------------- */

  const filteredOrders = orders.filter((order) => {
    if (!startDate && !endDate) return true;

    const orderDate = new Date(order.order_date);

    if (startDate && new Date(startDate) > orderDate) return false;
    if (endDate && new Date(endDate) < orderDate) return false;

    return true;
  });

  /* ---------------- DYMO LABEL TEMPLATE ---------------- */

  const getLabelXml = () => `
<DieCutLabel Version="8.0" Units="twips">
<PaperOrientation>Landscape</PaperOrientation>

<ObjectInfo>
<TextObject>
<Name>TYPE</Name>
<Bounds X="0" Y="0" Width="400" Height="200"/>
<StyledText>
<Element>
<String>TYPE</String>
<Attributes>
<Font Family="Arial" Size="10"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

<ObjectInfo>
<TextObject>
<Name>WEB</Name>
<Bounds X="0" Y="200" Width="400" Height="200"/>
<StyledText>
<Element>
<String>WEB</String>
<Attributes>
<Font Family="Arial" Size="9"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

<ObjectInfo>
<TextObject>
<Name>STANDARD</Name>
<Bounds X="0" Y="400" Width="400" Height="200"/>
<StyledText>
<Element>
<String>STANDARD</String>
<Attributes>
<Font Family="Arial" Size="9"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

<ObjectInfo>
<TextObject>
<Name>ORDERID</Name>
<Bounds X="0" Y="600" Width="700" Height="200"/>
<StyledText>
<Element>
<String>ORDERID</String>
<Attributes>
<Font Family="Arial" Size="9"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

<ObjectInfo>
<TextObject>
<Name>PRODUCT</Name>
<Bounds X="800" Y="300" Width="1600" Height="400"/>
<StyledText>
<Element>
<String>PRODUCT</String>
<Attributes>
<Font Family="Arial" Size="11"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

<ObjectInfo>
<TextObject>
<Name>SKU</Name>
<Bounds X="2500" Y="0" Width="1500" Height="400"/>
<StyledText>
<Element>
<String>SKU</String>
<Attributes>
<Font Family="Arial" Size="22" Bold="True"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

<ObjectInfo>
<TextObject>
<Name>QTY</Name>
<Bounds X="2500" Y="500" Width="1500" Height="400"/>
<StyledText>
<Element>
<String>QTY</String>
<Attributes>
<Font Family="Arial" Size="20" Bold="True"/>
</Attributes>
</Element>
</StyledText>
</TextObject>
</ObjectInfo>

</DieCutLabel>
`;

  /* ---------------- PRINT LABEL ---------------- */

  const printLabel = (data) => {
    if (!window.dymo || !printer) {
      alert("DYMO printer not detected");
      return;
    }

    try {
      const label = window.dymo.label.framework.openLabelXml(getLabelXml());

      label.setObjectText("TYPE", data.type);
      label.setObjectText("WEB", "WEB");
      label.setObjectText("STANDARD", "STANDARD");
      label.setObjectText("ORDERID", data.orderId);

      label.setObjectText("PRODUCT", data.product);
      label.setObjectText("SKU", data.sku);
      label.setObjectText("QTY", data.qty);

      label.print(printer);


label.setObjectText("SKU", data.sku);
label.setObjectText("PRODUCT", data.product);
label.setObjectText("QTY", data.qty);
label.setObjectText("ORDERID", data.orderId);

const png = label.render();

console.log(png);
    } catch (err) {
      console.error("Print error:", err);
    }
  };

  /* ---------------- PRINT SELECTED ---------------- */

  const handlePrintSelected = () => {
    Object.keys(selectedLabels).forEach((labelId) => {
      if (!selectedLabels[labelId]) return;

      const [orderId, itemId] = labelId.split("-");

      const order = orders.find((o) => o.id == orderId);
      const item = order?.items?.find((i) => i.id == itemId);

      if (!order || !item) return;

      const type = order.items.length > 1 ? "M" : "S";

      printLabel({
        type,
        sku: item.sku,
        product: getShortTitle(item.product_name),
        qty: item.quantity,
        orderId: order.external_order_id,
      });
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <Box p={3}>
      <Box display="flex" gap={2} mb={3}>
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

        <Button variant="contained" onClick={handlePrintSelected}>
          Print Labels
        </Button>
      </Box>

      <Grid container spacing={2}>
        {filteredOrders.map((order) =>
          order.items?.map((item) => {
            const labelId = `${order.id}-${item.id}`;
            const orderType = order.items.length > 1 ? "M" : "S";

            return (
              <Grid item key={labelId}>
                <Box display="flex" gap={1}>
                  <Checkbox
                    checked={!!selectedLabels[labelId]}
                    onChange={() => toggleSelect(labelId)}
                  />

                  <Paper
                    sx={{
                      width: "3.5in",
                      height: "1.25in",
                      border: "1px solid #bbb",
                      display: "flex",
                      fontFamily: "Arial",
                    }}
                  >
                    {/* LEFT */}
                    <Box
                      sx={{
                        width: "30%",
                        borderRight: "1px solid #ddd",
                        p: 0.5,
                      }}
                    >
                      <Typography fontSize={10}>{orderType}</Typography>
                      <Typography fontSize={9}>WEB</Typography>
                      <Typography fontSize={9}>STANDARD</Typography>
                      <Typography fontSize={9}>
                        {order.external_order_id}
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
                      }}
                    >
                      <Typography fontSize={11}>
                        {getShortTitle(item.product_name)}
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
                      <Typography fontSize={24} fontWeight="bold">
                        {item.sku}
                      </Typography>

                      <Typography fontSize={20} fontWeight="bold">
                        {item.quantity}
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
  );
};

export default OrderLabel;