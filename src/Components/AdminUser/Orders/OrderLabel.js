// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Paper,
//   Checkbox,
//   Button,
//   TextField,
// } from "@mui/material";

// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
// import ApiServices from "../../../Services/ApiServices/ApiServices";

// const OrderLabel = () => {
//   const [orders, setOrders] = useState([]);
//   const [selectedLabels, setSelectedLabels] = useState({});
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [printer, setPrinter] = useState(null);

//   const accessToken = useMemo(() => getDecryptedAccessToken(), []);

//   const headers = useMemo(
//     () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//     [accessToken]
//   );

//   /* ---------------- FETCH ORDERS ---------------- */

//   const fetchOrders = async () => {
//     try {
//       const res = await ApiServices.get("orders", headers);
//       setOrders(res?.data?.results || []);
//     } catch (err) {
//       console.error("Orders API error:", err);
//       setOrders([]);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   /* ---------------- DYMO INIT ---------------- */

//   useEffect(() => {
//     if (!window.dymo || !window.dymo.label) return;

//     try {
//       const printers = window.dymo.label.framework.getPrinters();

//       if (printers && printers.length > 0) {
//         setPrinter(printers[0].name);
//       }
//     } catch (err) {
//       console.error("DYMO init error", err);
//     }
//   }, []);

//   /* ---------------- UTIL ---------------- */

//   const getShortTitle = (name) => {
//     if (!name) return "";
//     return name.split("-")[0];
//   };

//   const toggleSelect = (id) => {
//     setSelectedLabels((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   const selectAll = () => {
//     const all = {};

//     filteredOrders.forEach((order) =>
//       order.items?.forEach((item) => {
//         all[`${order.id}-${item.id}`] = true;
//       })
//     );

//     setSelectedLabels(all);
//   };

//   /* ---------------- FILTER ORDERS ---------------- */

//   const filteredOrders = orders.filter((order) => {
//     if (!startDate && !endDate) return true;

//     const orderDate = new Date(order.order_date);

//     if (startDate && new Date(startDate) > orderDate) return false;
//     if (endDate && new Date(endDate) < orderDate) return false;

//     return true;
//   });

//   /* ---------------- DYMO LABEL TEMPLATE ---------------- */

//   const getLabelXml = () => `
// <DieCutLabel Version="8.0" Units="twips">
// <PaperOrientation>Landscape</PaperOrientation>

// <ObjectInfo>
// <TextObject>
// <Name>TYPE</Name>
// <Bounds X="0" Y="0" Width="400" Height="200"/>
// <StyledText>
// <Element>
// <String>TYPE</String>
// <Attributes>
// <Font Family="Arial" Size="10"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// <ObjectInfo>
// <TextObject>
// <Name>WEB</Name>
// <Bounds X="0" Y="200" Width="400" Height="200"/>
// <StyledText>
// <Element>
// <String>WEB</String>
// <Attributes>
// <Font Family="Arial" Size="9"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// <ObjectInfo>
// <TextObject>
// <Name>STANDARD</Name>
// <Bounds X="0" Y="400" Width="400" Height="200"/>
// <StyledText>
// <Element>
// <String>STANDARD</String>
// <Attributes>
// <Font Family="Arial" Size="9"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// <ObjectInfo>
// <TextObject>
// <Name>ORDERID</Name>
// <Bounds X="0" Y="600" Width="700" Height="200"/>
// <StyledText>
// <Element>
// <String>ORDERID</String>
// <Attributes>
// <Font Family="Arial" Size="9"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// <ObjectInfo>
// <TextObject>
// <Name>PRODUCT</Name>
// <Bounds X="800" Y="300" Width="1600" Height="400"/>
// <StyledText>
// <Element>
// <String>PRODUCT</String>
// <Attributes>
// <Font Family="Arial" Size="11"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// <ObjectInfo>
// <TextObject>
// <Name>SKU</Name>
// <Bounds X="2500" Y="0" Width="1500" Height="400"/>
// <StyledText>
// <Element>
// <String>SKU</String>
// <Attributes>
// <Font Family="Arial" Size="22" Bold="True"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// <ObjectInfo>
// <TextObject>
// <Name>QTY</Name>
// <Bounds X="2500" Y="500" Width="1500" Height="400"/>
// <StyledText>
// <Element>
// <String>QTY</String>
// <Attributes>
// <Font Family="Arial" Size="20" Bold="True"/>
// </Attributes>
// </Element>
// </StyledText>
// </TextObject>
// </ObjectInfo>

// </DieCutLabel>
// `;

//   /* ---------------- PRINT LABEL ---------------- */

//   const printLabel = (data) => {
//     if (!window.dymo || !printer) {
//       alert("DYMO printer not detected");
//       return;
//     }

//     try {
//       const label = window.dymo.label.framework.openLabelXml(getLabelXml());

//       label.setObjectText("TYPE", data.type);
//       label.setObjectText("WEB", "WEB");
//       label.setObjectText("STANDARD", "STANDARD");
//       label.setObjectText("ORDERID", data.orderId);

//       label.setObjectText("PRODUCT", data.product);
//       label.setObjectText("SKU", data.sku);
//       label.setObjectText("QTY", data.qty);

//       label.print(printer);


// label.setObjectText("SKU", data.sku);
// label.setObjectText("PRODUCT", data.product);
// label.setObjectText("QTY", data.qty);
// label.setObjectText("ORDERID", data.orderId);

// const png = label.render();

// console.log(png);
//     } catch (err) {
//       console.error("Print error:", err);
//     }
//   };

//   /* ---------------- PRINT SELECTED ---------------- */

//   const handlePrintSelected = () => {
//     Object.keys(selectedLabels).forEach((labelId) => {
//       if (!selectedLabels[labelId]) return;

//       const [orderId, itemId] = labelId.split("-");

//       const order = orders.find((o) => o.id == orderId);
//       const item = order?.items?.find((i) => i.id == itemId);

//       if (!order || !item) return;

//       const type = order.items.length > 1 ? "M" : "S";

//       printLabel({
//         type,
//         sku: item.sku,
//         product: getShortTitle(item.product_name),
//         qty: item.quantity,
//         orderId: order.external_order_id,
//       });
//     });
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <Box p={3}>
//       <Box display="flex" gap={2} mb={3}>
//         <TextField
//           type="date"
//           label="Start Date"
//           InputLabelProps={{ shrink: true }}
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//         />

//         <TextField
//           type="date"
//           label="End Date"
//           InputLabelProps={{ shrink: true }}
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//         />

//         <Button variant="outlined" onClick={selectAll}>
//           Select All
//         </Button>

//         <Button variant="contained" onClick={handlePrintSelected}>
//           Print Labels
//         </Button>
//       </Box>

//       <Grid container spacing={2}>
//         {filteredOrders.map((order) =>
//           order.items?.map((item) => {
//             const labelId = `${order.id}-${item.id}`;
//             const orderType = order.items.length > 1 ? "M" : "S";

//             return (
//               <Grid item key={labelId}>
//                 <Box display="flex" gap={1}>
//                   <Checkbox
//                     checked={!!selectedLabels[labelId]}
//                     onChange={() => toggleSelect(labelId)}
//                   />

//                   <Paper
//                     sx={{
//                       width: "3.5in",
//                       height: "1.25in",
//                       border: "1px solid #bbb",
//                       display: "flex",
//                       fontFamily: "Arial",
//                     }}
//                   >
//                     {/* LEFT */}
//                     <Box
//                       sx={{
//                         width: "30%",
//                         borderRight: "1px solid #ddd",
//                         p: 0.5,
//                       }}
//                     >
//                       <Typography fontSize={10}>{orderType}</Typography>
//                       <Typography fontSize={9}>WEB</Typography>
//                       <Typography fontSize={9}>STANDARD</Typography>
//                       <Typography fontSize={9}>
//                         {order.external_order_id}
//                       </Typography>
//                     </Box>

//                     {/* CENTER */}
//                     <Box
//                       sx={{
//                         width: "40%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         px: 1,
//                       }}
//                     >
//                       <Typography fontSize={11}>
//                         {getShortTitle(item.product_name)}
//                       </Typography>
//                     </Box>

//                     {/* RIGHT */}
//                     <Box
//                       sx={{
//                         width: "30%",
//                         display: "flex",
//                         flexDirection: "column",
//                         justifyContent: "space-between",
//                         alignItems: "flex-end",
//                         p: 0.5,
//                       }}
//                     >
//                       <Typography fontSize={24} fontWeight="bold">
//                         {item.sku}
//                       </Typography>

//                       <Typography fontSize={20} fontWeight="bold">
//                         {item.quantity}
//                       </Typography>
//                     </Box>
//                   </Paper>
//                 </Box>
//               </Grid>
//             );
//           })
//         )}
//       </Grid>
//     </Box>
//   );
// };

// export default OrderLabel;


import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Checkbox,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";

import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import ApiServices from "../../../Services/ApiServices/ApiServices";

const OrderLabel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [printer, setPrinter] = useState("");
  const [printerStatus, setPrinterStatus] = useState("checking"); // checking | connected | not_connected

  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState({
    total: 0,
    printed: 0,
    failed: 0,
  });
  const [failedPrints, setFailedPrints] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const accessToken = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getShortTitle = (name) => {
    if (!name) return "";
    return String(name).split("-")[0].trim();
  };

  const fetchOrders = async () => {
    try {
      const res = await ApiServices.get("orders", headers);
      setOrders(res?.data?.results || []);
    } catch (err) {
      console.error("Orders API error:", err);
      setOrders([]);
      showSnackbar("Failed to fetch orders", "error");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const initDymo = () => {
    try {
      setPrinterStatus("checking");

      if (
        !window.dymo ||
        !window.dymo.label ||
        !window.dymo.label.framework
      ) {
        setPrinter("");
        setPrinterStatus("not_connected");
        showSnackbar(
          "DYMO not detected. Please connect printer and install/run DYMO software.",
          "warning"
        );
        return;
      }

      try {
        if (typeof window.dymo.label.framework.init === "function") {
          window.dymo.label.framework.init();
        }
      } catch (e) {
        // ignore repeated init
      }

      const printers = window.dymo.label.framework.getPrinters() || [];

      if (!printers.length) {
        setPrinter("");
        setPrinterStatus("not_connected");
        showSnackbar("No DYMO printer found", "warning");
        return;
      }

      const selectedPrinter =
        printers.find((p) => p.printerType === "LabelWriterPrinter") ||
        printers[0];

      setPrinter(selectedPrinter.name);
      setPrinterStatus("connected");
      showSnackbar(`Printer connected: ${selectedPrinter.name}`, "success");
    } catch (err) {
      console.error("DYMO init error:", err);
      setPrinter("");
      setPrinterStatus("not_connected");
      showSnackbar("Failed to detect DYMO printer", "error");
    }
  };

  useEffect(() => {
    initDymo();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!startDate && !endDate) return true;

    const orderDate = new Date(order.order_date);

    if (startDate && new Date(startDate) > orderDate) return false;
    if (endDate && new Date(endDate) < orderDate) return false;

    return true;
  });

  const toggleSelect = (id) => {
    if (isPrinting) return;

    setSelectedLabels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAll = () => {
    if (isPrinting) return;

    const all = {};
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        all[`${order.id}-${item.id}`] = true;
      });
    });
    setSelectedLabels(all);
  };

  const clearSelection = () => {
    if (isPrinting) return;
    setSelectedLabels({});
  };

  const selectedCount = Object.values(selectedLabels).filter(Boolean).length;

  const getLabelXml = () => `
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="3060" Height="1260" Rx="0" Ry="0" />
  </DrawCommands>

  <ObjectInfo>
    <TextObject>
      <Name>TYPE</Name>
      <Bounds X="40" Y="20" Width="500" Height="180" />
      <StyledText>
        <Element>
          <String>TYPE</String>
          <Attributes>
            <Font Family="Arial" Size="10" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>

  <ObjectInfo>
    <TextObject>
      <Name>WEB</Name>
      <Bounds X="40" Y="180" Width="500" Height="160" />
      <StyledText>
        <Element>
          <String>WEB</String>
          <Attributes>
            <Font Family="Arial" Size="9" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>

  <ObjectInfo>
    <TextObject>
      <Name>STANDARD</Name>
      <Bounds X="40" Y="330" Width="700" Height="160" />
      <StyledText>
        <Element>
          <String>STANDARD</String>
          <Attributes>
            <Font Family="Arial" Size="9" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>

  <ObjectInfo>
    <TextObject>
      <Name>ORDERID</Name>
      <Bounds X="40" Y="520" Width="950" Height="180" />
      <StyledText>
        <Element>
          <String>ORDERID</String>
          <Attributes>
            <Font Family="Arial" Size="9" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>

  <ObjectInfo>
    <TextObject>
      <Name>PRODUCT</Name>
      <Bounds X="930" Y="250" Width="1200" Height="350" />
      <StyledText>
        <Element>
          <String>PRODUCT</String>
          <Attributes>
            <Font Family="Arial" Size="11" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>

  <ObjectInfo>
    <TextObject>
      <Name>SKU</Name>
      <Bounds X="2200" Y="40" Width="760" Height="300" />
      <StyledText>
        <Element>
          <String>SKU</String>
          <Attributes>
            <Font Family="Arial" Size="20" Bold="True" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>

  <ObjectInfo>
    <TextObject>
      <Name>QTY</Name>
      <Bounds X="2200" Y="630" Width="760" Height="260" />
      <StyledText>
        <Element>
          <String>QTY</String>
          <Attributes>
            <Font Family="Arial" Size="18" Bold="True" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>
`;

  const buildLabel = (data) => {
    const label = window.dymo.label.framework.openLabelXml(getLabelXml());

    label.setObjectText("TYPE", String(data.type || ""));
    label.setObjectText("WEB", "WEB");
    label.setObjectText("STANDARD", "STANDARD");
    label.setObjectText("ORDERID", String(data.orderId || ""));
    label.setObjectText("PRODUCT", String(data.product || ""));
    label.setObjectText("SKU", String(data.sku || ""));
    label.setObjectText("QTY", String(data.qty || ""));

    return label;
  };

  const printLabel = async (data) => {
    if (
      !window.dymo ||
      !window.dymo.label ||
      !window.dymo.label.framework ||
      !printer
    ) {
      throw new Error("Printer not ready");
    }

    const label = buildLabel(data);
    label.print(printer);

    await sleep(350);
  };

  const previewLabel = (data) => {
    try {
      if (
        !window.dymo ||
        !window.dymo.label ||
        !window.dymo.label.framework
      ) {
        showSnackbar("DYMO not ready for preview", "warning");
        return;
      }

      const label = buildLabel(data);
      const png = label.render();
      const previewWindow = window.open("", "_blank");

      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head><title>Label Preview</title></head>
            <body style="font-family:Arial;padding:20px;">
              <h3>Label Preview</h3>
              <img src="data:image/png;base64,${png}" alt="Label Preview" />
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to open preview", "error");
    }
  };

  const getSelectedPrintJobs = () => {
    const jobs = [];

    Object.keys(selectedLabels).forEach((labelId) => {
      if (!selectedLabels[labelId]) return;

      const [orderId, itemId] = labelId.split("-");

      const order = orders.find((o) => String(o.id) === String(orderId));
      const item = order?.items?.find((i) => String(i.id) === String(itemId));

      if (!order || !item) return;

      const type = order.items?.length > 1 ? "M" : "S";

      jobs.push({
        labelId,
        type,
        sku: item.sku,
        product: getShortTitle(item.product_name),
        qty: item.quantity,
        orderId: order.external_order_id,
      });
    });

    return jobs;
  };

  const handlePrintSelected = async () => {
    if (isPrinting) return;

    if (printerStatus !== "connected" || !printer) {
      showSnackbar("Printer is not connected", "error");
      return;
    }

    const jobs = getSelectedPrintJobs();

    if (!jobs.length) {
      showSnackbar("Please select labels to print", "warning");
      return;
    }

    setIsPrinting(true);
    setFailedPrints([]);
    setPrintProgress({
      total: jobs.length,
      printed: 0,
      failed: 0,
    });

    let printedCount = 0;
    let failedCount = 0;
    const failed = [];

    for (const job of jobs) {
      try {
        await printLabel(job);
        printedCount += 1;
      } catch (error) {
        failedCount += 1;
        failed.push({
          ...job,
          error: error?.message || "Print failed",
        });
      }

      setPrintProgress({
        total: jobs.length,
        printed: printedCount,
        failed: failedCount,
      });
    }

    setFailedPrints(failed);
    setIsPrinting(false);

    if (failed.length > 0) {
      showSnackbar(
        `Printing completed. Printed: ${printedCount}, Failed: ${failed.length}`,
        "warning"
      );
    } else {
      showSnackbar(`All ${printedCount} labels printed successfully`, "success");
    }
  };

  const handleRetryFailed = async () => {
    if (isPrinting || !failedPrints.length) return;

    setIsPrinting(true);
    setPrintProgress({
      total: failedPrints.length,
      printed: 0,
      failed: 0,
    });

    let printedCount = 0;
    let failedCount = 0;
    const retryFailures = [];

    for (const job of failedPrints) {
      try {
        await printLabel(job);
        printedCount += 1;
      } catch (error) {
        failedCount += 1;
        retryFailures.push({
          ...job,
          error: error?.message || "Retry failed",
        });
      }

      setPrintProgress({
        total: failedPrints.length,
        printed: printedCount,
        failed: failedCount,
      });
    }

    setFailedPrints(retryFailures);
    setIsPrinting(false);

    if (retryFailures.length > 0) {
      showSnackbar(
        `Retry finished. Still failed: ${retryFailures.length}`,
        "warning"
      );
    } else {
      showSnackbar("All failed labels printed successfully", "success");
    }
  };

  const getStatusChip = () => {
    if (printerStatus === "checking") {
      return <Chip label="Checking printer..." color="warning" />;
    }

    if (printerStatus === "connected") {
      return <Chip label="Printer Connected" color="success" />;
    }

    return <Chip label="Printer Not Connected" color="error" />;
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Order Label Printing
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          alignItems="center"
          mb={2}
        >
          {getStatusChip()}

          <Typography variant="body1" fontWeight={600}>
            {printer ? printer : "No printer selected"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          alignItems="center"
        >
          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
          />

          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
          />

          <Button variant="outlined" onClick={initDymo} disabled={isPrinting}>
            Refresh Printer
          </Button>

          <Button variant="outlined" onClick={selectAll} disabled={isPrinting}>
            Select All
          </Button>

          <Button
            variant="outlined"
            onClick={clearSelection}
            disabled={isPrinting}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={handlePrintSelected}
            disabled={isPrinting || printerStatus !== "connected"}
          >
            {isPrinting ? "Printing..." : `Print Selected (${selectedCount})`}
          </Button>

          {failedPrints.length > 0 && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleRetryFailed}
              disabled={isPrinting}
            >
              Retry Failed ({failedPrints.length})
            </Button>
          )}
        </Box>

        {isPrinting && (
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <CircularProgress size={22} />
            <Typography variant="body2">
              Printing {printProgress.printed + printProgress.failed} /{" "}
              {printProgress.total} | Printed: {printProgress.printed} | Failed:{" "}
              {printProgress.failed}
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={2}>
        {filteredOrders.map((order) =>
          order.items?.map((item) => {
            const labelId = `${order.id}-${item.id}`;
            const orderType = order.items?.length > 1 ? "M" : "S";

            const previewData = {
              type: orderType,
              sku: item.sku,
              product: getShortTitle(item.product_name),
              qty: item.quantity,
              orderId: order.external_order_id,
            };

            return (
              <Grid item key={labelId}>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <Checkbox
                    checked={!!selectedLabels[labelId]}
                    onChange={() => toggleSelect(labelId)}
                    disabled={isPrinting}
                  />

                  <Paper
                    sx={{
                      width: "3.5in",
                      minHeight: "1.25in",
                      border: "1px solid #bbb",
                      display: "flex",
                      fontFamily: "Arial",
                      overflow: "hidden",
                    }}
                  >
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
                      <Typography fontSize={11}>
                        {getShortTitle(item.product_name)}
                      </Typography>
                    </Box>

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
                      <Typography fontSize={20} fontWeight="bold">
                        {item.sku}
                      </Typography>

                      <Typography fontSize={18} fontWeight="bold">
                        {item.quantity}
                      </Typography>
                    </Box>
                  </Paper>

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => previewLabel(previewData)}
                    disabled={isPrinting}
                  >
                    Preview
                  </Button>
                </Box>
              </Grid>
            );
          })
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderLabel;