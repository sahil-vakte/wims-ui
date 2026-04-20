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
} from "@mui/material";

import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";
import ApiServices from "../../../Services/ApiServices/ApiServices";

const OrderLabel = () => {
  const [orders, setOrders] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [printer, setPrinter] = useState("");
  const [printerList, setPrinterList] = useState([]);

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

  /* ---------------- FETCH ORDERS ---------------- */

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

  /* ---------------- DYMO INIT ---------------- */

  const initDymo = () => {
    try {
      if (
        !window.dymo ||
        !window.dymo.label ||
        !window.dymo.label.framework
      ) {
        showSnackbar(
          "DYMO framework not found. Install DYMO Connect and load the DYMO script.",
          "warning"
        );
        return;
      }

      if (typeof window.dymo.label.framework.init === "function") {
        try {
          window.dymo.label.framework.init();
        } catch (e) {
          // ignore if already initialized
        }
      }

      const printers = window.dymo.label.framework.getPrinters() || [];
      setPrinterList(printers);

      if (!printers.length) {
        showSnackbar("No DYMO printers detected", "warning");
        return;
      }

      const labelWriterPrinter =
        printers.find((p) => p.printerType === "LabelWriterPrinter") ||
        printers[0];

      setPrinter(labelWriterPrinter.name);
      showSnackbar(`Printer detected: ${labelWriterPrinter.name}`, "success");
    } catch (err) {
      console.error("DYMO init error:", err);
      showSnackbar("Failed to initialize DYMO printer", "error");
    }
  };

  useEffect(() => {
    initDymo();
  }, []);

  /* ---------------- UTIL ---------------- */

  const getShortTitle = (name) => {
    if (!name) return "";
    return name.split("-")[0]?.trim();
  };

  const toggleSelect = (id) => {
    setSelectedLabels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAll = () => {
    const all = {};

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        all[`${order.id}-${item.id}`] = true;
      });
    });

    setSelectedLabels(all);
  };

  const clearSelection = () => {
    setSelectedLabels({});
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
      <Bounds X="40" Y="330" Width="650" Height="160" />
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
      <Bounds X="40" Y="510" Width="900" Height="170" />
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
      <Bounds X="950" Y="260" Width="1150" Height="320" />
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
      <Bounds X="2200" Y="610" Width="760" Height="280" />
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

  /* ---------------- BUILD LABEL INSTANCE ---------------- */

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

  /* ---------------- SINGLE PRINT ---------------- */

  const printLabel = async (data) => {
    if (
      !window.dymo ||
      !window.dymo.label ||
      !window.dymo.label.framework ||
      !printer
    ) {
      throw new Error("DYMO printer not detected");
    }

    const label = buildLabel(data);
    label.print(printer);

    // Small gap keeps bulk printing stable
    await sleep(350);
  };

  /* ---------------- PREVIEW LABEL ---------------- */

  const previewLabel = (data) => {
    try {
      if (
        !window.dymo ||
        !window.dymo.label ||
        !window.dymo.label.framework ||
        !printer
      ) {
        showSnackbar("Printer not ready for preview", "warning");
        return;
      }

      const label = buildLabel(data);
      const png = label.render();
      const previewWindow = window.open("", "_blank");

      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head><title>Label Preview</title></head>
            <body style="margin:20px;font-family:Arial">
              <h3>Label Preview</h3>
              <img src="data:image/png;base64,${png}" alt="Label Preview" />
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (err) {
      console.error("Preview error:", err);
      showSnackbar("Failed to generate preview", "error");
    }
  };

  /* ---------------- CREATE PRINT JOBS ---------------- */

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

  /* ---------------- PRINT SELECTED SEQUENTIALLY ---------------- */

  const handlePrintSelected = async () => {
    if (isPrinting) return;

    const jobs = getSelectedPrintJobs();

    if (!jobs.length) {
      showSnackbar("Please select at least one label", "warning");
      return;
    }

    if (
      !window.dymo ||
      !window.dymo.label ||
      !window.dymo.label.framework ||
      !printer
    ) {
      showSnackbar("DYMO printer not detected", "error");
      return;
    }

    setIsPrinting(true);
    setFailedPrints([]);
    setPrintProgress({
      total: jobs.length,
      printed: 0,
      failed: 0,
    });

    const failed = [];
    let printedCount = 0;
    let failedCount = 0;

    for (const job of jobs) {
      try {
        await printLabel(job);
        printedCount += 1;

        setPrintProgress({
          total: jobs.length,
          printed: printedCount,
          failed: failedCount,
        });
      } catch (error) {
        console.error("Print failed for label:", job, error);

        failed.push({
          ...job,
          error: error?.message || "Print failed",
        });

        failedCount += 1;

        setPrintProgress({
          total: jobs.length,
          printed: printedCount,
          failed: failedCount,
        });
      }
    }

    setFailedPrints(failed);
    setIsPrinting(false);

    if (failed.length > 0) {
      showSnackbar(
        `Printing finished. Printed: ${printedCount}, Failed: ${failed.length}`,
        "warning"
      );
    } else {
      showSnackbar(`All ${printedCount} labels printed successfully`, "success");
    }
  };

  /* ---------------- RETRY FAILED ---------------- */

  const handleRetryFailed = async () => {
    if (!failedPrints.length || isPrinting) return;

    setIsPrinting(true);

    const retryFailures = [];
    let printedCount = 0;
    let failedCount = 0;

    setPrintProgress({
      total: failedPrints.length,
      printed: 0,
      failed: 0,
    });

    for (const job of failedPrints) {
      try {
        await printLabel(job);
        printedCount += 1;

        setPrintProgress({
          total: failedPrints.length,
          printed: printedCount,
          failed: failedCount,
        });
      } catch (error) {
        retryFailures.push({
          ...job,
          error: error?.message || "Retry failed",
        });

        failedCount += 1;

        setPrintProgress({
          total: failedPrints.length,
          printed: printedCount,
          failed: failedCount,
        });
      }
    }

    setFailedPrints(retryFailures);
    setIsPrinting(false);

    if (retryFailures.length > 0) {
      showSnackbar(
        `Retry completed. Still failed: ${retryFailures.length}`,
        "warning"
      );
    } else {
      showSnackbar("All failed labels printed successfully", "success");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Order Labels
      </Typography>

      <Box
        display="flex"
        gap={2}
        mb={3}
        flexWrap="wrap"
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

        <Button variant="outlined" onClick={selectAll} disabled={isPrinting}>
          Select All
        </Button>

        <Button variant="outlined" onClick={clearSelection} disabled={isPrinting}>
          Clear Selection
        </Button>

        <Button variant="outlined" onClick={initDymo} disabled={isPrinting}>
          Refresh Printer
        </Button>

        <Button
          variant="contained"
          onClick={handlePrintSelected}
          disabled={isPrinting}
        >
          {isPrinting ? "Printing..." : "Print Labels"}
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

      <Box mb={2}>
        <Typography variant="body2">
          <strong>Selected Printer:</strong> {printer || "Not detected"}
        </Typography>
        <Typography variant="body2">
          <strong>Available Printers:</strong>{" "}
          {printerList.length
            ? printerList.map((p) => p.name).join(", ")
            : "None"}
        </Typography>
      </Box>

      {isPrinting && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CircularProgress size={22} />
          <Typography variant="body2">
            Printing {printProgress.printed + printProgress.failed} /{" "}
            {printProgress.total} | Printed: {printProgress.printed} | Failed:{" "}
            {printProgress.failed}
          </Typography>
        </Box>
      )}

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
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderLabel;