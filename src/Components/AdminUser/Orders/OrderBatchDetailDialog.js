import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import ApiServices from "../../../Services/ApiServices/ApiServices";

const BATCH_API = "order-batches/";
const DYMO_LABEL_TEMPLATE =
  `${process.env.PUBLIC_URL}/labels/tiaknight-product-label.dymo`;

const wait = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const getError = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.detail ||
  error?.message ||
  fallback;

const OrderBatchDetailDialog = ({
  open,
  batchId,
  headers,
  onClose,
  onUpdated,
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [connecting, setConnecting] = useState(false);

  const getDymoFramework = useCallback(() => {
    const framework = window?.dymo?.label?.framework;

    if (!framework) {
      throw new Error(
        "DYMO JavaScript Framework is not loaded. Check public/index.html."
      );
    }

    return framework;
  }, []);

  const connectDymo = useCallback(async () => {
    try {
      setConnecting(true);
      setError("");
      setMessage("Connecting to DYMO Web Service...");

      const framework = getDymoFramework();

      await new Promise((resolve, reject) => {
        let completed = false;

        const timeoutId = window.setTimeout(() => {
          if (!completed) {
            reject(
              new Error(
                "DYMO connection timed out. Start DYMO Connect for Desktop and its Web Service."
              )
            );
          }
        }, 15000);

        framework.init(() => {
          completed = true;
          window.clearTimeout(timeoutId);
          resolve();
        });
      });

      const environment = framework.checkEnvironment();

      if (environment?.isBrowserSupported === false) {
        throw new Error(
          environment?.errorDetails || "This browser is not supported by DYMO."
        );
      }

      if (environment?.isFrameworkInstalled === false) {
        throw new Error(
          "DYMO Connect Web Service was not detected. Install/start DYMO Connect for Desktop."
        );
      }

      const installed = Array.from(framework.getPrinters?.() || []);

      const labelWriters = installed.filter((printer) => {
        const name = String(printer?.name || "").toLowerCase();
        const model = String(printer?.modelName || "").toLowerCase();

        return (
          printer?.printerType === "LabelWriterPrinter" ||
          name.includes("labelwriter") ||
          model.includes("labelwriter")
        );
      });

      if (!labelWriters.length) {
        throw new Error("No DYMO LabelWriter printer was detected.");
      }

      setPrinters(labelWriters);
      setSelectedPrinter((current) =>
        labelWriters.some((printer) => printer.name === current)
          ? current
          : labelWriters[0].name
      );

      setMessage(`Connected to ${labelWriters[0].name}.`);
    } catch (err) {
      console.error("DYMO connection error:", err);
      setPrinters([]);
      setSelectedPrinter("");
      setMessage("");
      setError(getError(err, "Unable to connect to DYMO."));
    } finally {
      setConnecting(false);
    }
  }, [getDymoFramework]);

  const fetchDetail = useCallback(async () => {
    if (!batchId) return;

    try {
      setLoading(true);
      setError("");

      const response = await ApiServices.get(
        `${BATCH_API}${batchId}/`,
        headers
      );

      setDetail(response?.data || response || null);
    } catch (err) {
      console.error("Batch detail error:", err);
      setError(getError(err, "Failed to load batch detail."));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, headers]);

  useEffect(() => {
    if (!open || !batchId) return;
    fetchDetail();
    connectDymo();
  }, [open, batchId, fetchDetail, connectDymo]);

  const orderMap = useMemo(() => {
    return new Map(
      (detail?.orders || []).map((order) => [Number(order.id), order])
    );
  }, [detail]);

  /*
   * IMPORTANT:
   * batch API returns:
   * labels[] -> label.item
   *
   * Convert that structure into the same shape used by OrderLabel DYMO logic.
   */
  const labelItems = useMemo(() => {
    return (detail?.labels || []).map((label) => {
      const item = label?.item || {};
      const order = orderMap.get(Number(label?.order_id)) || {};

      return {
        ...item,

        id: item.id,
        order_id: label?.order_id || item?.order,

        order_number:
          label?.order_number ||
          order?.order_number,

        external_order_id:
          label?.external_order_id ||
          order?.external_order_id,

        customer_name:
          label?.customer_name ||
          order?.customer_name,

        courier_service_name:
          label?.courier_service_name ||
          order?.courier_service_name,

        courier_service_code:
          label?.courier_service_code ||
          order?.courier_service_code,

        shipping_method:
          label?.shipping_method ||
          order?.shipping_method,

        carrier:
          label?.carrier ||
          order?.carrier,

        order_source:
          order?.order_source || "WEB",

        order_date:
          order?.order_date ||
          order?.created_at,

        created_at:
          item?.created_at ||
          order?.created_at,

        item_count:
          order?.item_count ||
          order?.items_total ||
          1,
      };
    });
  }, [detail, orderMap]);

  const printableItems = useMemo(
    () =>
      labelItems.filter(
        (item) =>
          item?.lable_printed !== true &&
          item?.processing_status !== "COMPLETED" &&
          item?.processing_status_display !== "Completed"
      ),
    [labelItems]
  );

  const buildQrUrl = useCallback((item) => {
    if (!item?.order_id || !item?.id) {
      return "https://wims.cloud/employee-user/order-process-item";
    }

    return `https://wims.cloud/employee-user/order-process-item/${item.order_id}/${item.id}`;
  }, []);

  const replaceQrValueInDymoXml = useCallback((labelXml, qrUrl) => {
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(
      labelXml,
      "application/xml"
    );

    const parserError =
      xmlDocument.querySelector("parsererror");

    if (parserError) {
      throw new Error(
        `Unable to parse DYMO XML: ${parserError.textContent}`
      );
    }

    const qrObjects = Array.from(
      xmlDocument.getElementsByTagName("QRCodeObject")
    );

    const qrObject = qrObjects.find((object) => {
      const nameNode =
        object.getElementsByTagName("Name")[0];

      return nameNode?.textContent?.trim() === "QR Code";
    });

    if (!qrObject) {
      throw new Error(
        'QR object named "QR Code" was not found in the DYMO template.'
      );
    }

    const dataString =
      qrObject.getElementsByTagName("DataString")[0];

    const textDataHolder =
      qrObject.getElementsByTagName("TextDataHolder")[0];

    const holderValue =
      textDataHolder?.getElementsByTagName("Value")[0];

    if (!dataString) {
      throw new Error(
        "DataString was not found inside the DYMO QR object."
      );
    }

    dataString.textContent = qrUrl;

    if (holderValue) {
      holderValue.textContent = qrUrl;
    }

    return new XMLSerializer().serializeToString(
      xmlDocument
    );
  }, []);

  const loadDymoLabel = useCallback(
    async (qrUrl) => {
      const framework = getDymoFramework();

      const response = await fetch(
        DYMO_LABEL_TEMPLATE,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load DYMO template. HTTP ${response.status}.`
        );
      }

      const originalXml = await response.text();

      const labelXml =
        replaceQrValueInDymoXml(
          originalXml,
          qrUrl
        );

      const label =
        framework.openLabelXml(labelXml);

      const objectNames = Array.from(
        label.getObjectNames?.() || []
      );

      return {
        label,
        objectNames,
      };
    },
    [
      getDymoFramework,
      replaceQrValueInDymoXml,
    ]
  );

  const setDymoValue = useCallback(
    (
      label,
      objectNames,
      objectName,
      value
    ) => {
      if (!objectNames.includes(objectName)) {
        return;
      }

      label.setObjectText(
        objectName,
        String(value ?? "")
      );
    },
    []
  );

  /*
   * Same object mapping as your original OrderLabel:
   * TEXT     -> Product Name
   * TEXT2    -> Qty
   * TEXT3    -> Source
   * TEXT4    -> SKU
   * TEXT5    -> Courier
   * TEXT37   -> External Order ID
   * TEXT6    -> M/S
   * TEXT7    -> SCAN ME
   * DATE-TIME-> Order/printed date
   */
  const populateDymoLabel = useCallback(
    (
      label,
      objectNames,
      item
    ) => {
      const typeValue =
        Number(item?.item_count || 0) > 1
          ? "M"
          : "S";

      const courierValue =
        item?.courier_service_code ||
        item?.courier_service_name ||
        "STD";

      const externalOrderId =
        item?.external_order_id ||
        item?.order_number ||
        "";

      const parsedDate =
        new Date(
          item?.order_date ||
            item?.created_at ||
            Date.now()
        );

      const dateValue =
        Number.isNaN(parsedDate.getTime())
          ? ""
          : parsedDate.toLocaleString(
              "en-GB",
              {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }
            );

      setDymoValue(
        label,
        objectNames,
        "QR Code",
        buildQrUrl(item)
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT",
        item?.product_name || ""
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT2",
        item?.quantity ?? 0
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT3",
        item?.order_source || "WEB"
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT4",
        item?.sku || ""
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT5",
        courierValue
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT37",
        externalOrderId
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT6",
        typeValue
      );

      setDymoValue(
        label,
        objectNames,
        "TEXT7",
        "SCAN ME"
      );

      setDymoValue(
        label,
        objectNames,
        "DATE-TIME",
        dateValue
      );

      return externalOrderId;
    },
    [
      buildQrUrl,
      setDymoValue,
    ]
  );

  const printBatch = async () => {
    if (!selectedPrinter) {
      setError(
        "Select a DYMO printer before printing."
      );
      return;
    }

    if (!printableItems.length) {
      setError(
        "There are no pending labels to print in this batch."
      );
      return;
    }

    try {
      setPrinting(true);
      setError("");
      setMessage("");

      const framework =
        getDymoFramework();

      const successfulItemIds = [];

      for (
        let index = 0;
        index < printableItems.length;
        index += 1
      ) {
        const item =
          printableItems[index];

        setMessage(
          `Preparing label ${index + 1} of ${
            printableItems.length
          }: ${
            item?.sku ||
            item?.external_order_id ||
            item?.id
          }`
        );

        const qrUrl =
          buildQrUrl(item);

        const {
          label,
          objectNames,
        } = await loadDymoLabel(qrUrl);

        const externalOrderId =
          populateDymoLabel(
            label,
            objectNames,
            item
          );

        const printParamsXml =
          framework.createLabelWriterPrintParamsXml(
            {
              copies: 1,
              jobTitle: `${
                externalOrderId || "WIMS"
              } - ${
                item?.sku || "Item Label"
              }`,
              printQuality:
                "BarcodeAndGraphics",
            }
          );

        framework.printLabel(
          selectedPrinter,
          printParamsXml,
          label.getLabelXml()
        );

        successfulItemIds.push(
          item.id
        );

        await wait(700);
      }

      /*
       * Mark only labels successfully submitted to DYMO.
       */
      if (successfulItemIds.length) {
        await ApiServices.patch(
          `${BATCH_API}${batchId}/labels/printed/`,
          {
            lable_printed: true,
            order_item_ids:
              successfulItemIds,
          },
          headers
        );
      }

      setMessage(
        `${successfulItemIds.length} label${
          successfulItemIds.length === 1
            ? ""
            : "s"
        } sent to ${selectedPrinter}.`
      );

      await fetchDetail();
      await onUpdated?.();
    } catch (err) {
      console.error(
        "Batch DYMO printing error:",
        err
      );

      setError(
        getError(
          err,
          "Unable to print batch labels."
        )
      );
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={
        printing ? undefined : onClose
      }
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {detail?.batch_name ||
                "Order Batch Details"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Batch #{batchId}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={`Orders: ${
                detail?.orders_count ?? 0
              }`}
            />

            <Chip
              label={`Labels: ${
                detail?.labels_printed_count ??
                0
              } / ${
                detail?.labels_total_count ??
                0
              }`}
              color={
                detail?.labels_total_count > 0 &&
                detail?.labels_printed_count ===
                  detail?.labels_total_count
                  ? "success"
                  : "warning"
              }
            />
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            py={6}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {message && (
              <Alert
                severity={
                  message.startsWith(
                    "Connected"
                  ) ||
                  message.includes(
                    "sent to"
                  )
                    ? "success"
                    : "info"
                }
                onClose={() =>
                  setMessage("")
                }
              >
                {message}
              </Alert>
            )}

            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={2}
                flexWrap="wrap"
                useFlexGap
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Batch Date
                  </Typography>
                  <Typography
                    fontWeight={700}
                  >
                    {detail?.batch_date ||
                      "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Created By
                  </Typography>
                  <Typography
                    fontWeight={700}
                  >
                    {detail?.created_by_username ||
                      "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Platform
                  </Typography>
                  <Typography
                    fontWeight={700}
                  >
                    {detail?.filters_snapshot
                      ?.platform || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Courier
                  </Typography>
                  <Typography
                    fontWeight={700}
                  >
                    {detail?.filters_snapshot
                      ?.courier_service_code ||
                      "-"}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Notes
                  </Typography>
                  <Typography
                    fontWeight={700}
                  >
                    {detail?.notes || "-"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1.5 }}
              >
                DYMO Label Printer
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={1.5}
                alignItems={{
                  xs: "stretch",
                  md: "center",
                }}
              >
                <FormControl
                  size="small"
                  sx={{ minWidth: 280 }}
                >
                  <InputLabel>
                    DYMO Printer
                  </InputLabel>

                  <Select
                    value={selectedPrinter}
                    label="DYMO Printer"
                    disabled={
                      connecting ||
                      printing
                    }
                    onChange={(event) =>
                      setSelectedPrinter(
                        event.target.value
                      )
                    }
                  >
                    {!printers.length && (
                      <MenuItem value="">
                        No printer detected
                      </MenuItem>
                    )}

                    {printers.map(
                      (printer) => (
                        <MenuItem
                          key={printer.name}
                          value={printer.name}
                        >
                          {printer.name}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={connectDymo}
                  disabled={
                    connecting ||
                    printing
                  }
                >
                  {connecting
                    ? "Connecting..."
                    : "Reconnect DYMO"}
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={printBatch}
                  disabled={
                    printing ||
                    connecting ||
                    !selectedPrinter ||
                    !printableItems.length
                  }
                  startIcon={
                    printing ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : null
                  }
                >
                  {printing
                    ? "Printing Batch..."
                    : `Print Pending Labels (${printableItems.length})`}
                </Button>
              </Stack>
            </Paper>

            <Typography
              variant="subtitle1"
              fontWeight={700}
            >
              Orders
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Order
                    </TableCell>
                    <TableCell>
                      Customer
                    </TableCell>
                    <TableCell>
                      Courier
                    </TableCell>
                    <TableCell>
                      Source
                    </TableCell>
                    <TableCell>
                      Items
                    </TableCell>
                    <TableCell>
                      Progress
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(detail?.orders || []).map(
                    (order) => (
                      <TableRow
                        key={order.id}
                        hover
                      >
                        <TableCell>
                          <Typography
                            fontWeight={700}
                          >
                            {order.external_order_id ||
                              order.order_number ||
                              `#${order.id}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {order.order_number}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {order.customer_name ||
                            "-"}
                        </TableCell>

                        <TableCell>
                          {order.courier_service_code ||
                            order.courier_service_name ||
                            "-"}
                        </TableCell>

                        <TableCell>
                          {order.order_source ||
                            "-"}
                        </TableCell>

                        <TableCell>
                          {order.item_count ??
                            order.items_total ??
                            0}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={`${Number(
                              order.completion_percentage ||
                                0
                            )}%`}
                            color={
                              Number(
                                order.completion_percentage ||
                                  0
                              ) >= 100
                                ? "success"
                                : "info"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography
              variant="subtitle1"
              fontWeight={700}
            >
              Batch Labels / Order Items
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxHeight: 460 }}
            >
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Order
                    </TableCell>
                    <TableCell>
                      Type
                    </TableCell>
                    <TableCell>
                      Product
                    </TableCell>
                    <TableCell>
                      Qty
                    </TableCell>
                    <TableCell>
                      Courier
                    </TableCell>
                    <TableCell>
                      Label
                    </TableCell>
                    <TableCell>
                      Item Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {labelItems.length ? (
                    labelItems.map(
                      (item) => (
                        <TableRow
                          key={item.id}
                          hover
                        >
                          <TableCell>
                            <Typography
                              fontWeight={700}
                            >
                              {item.external_order_id ||
                                item.order_number ||
                                "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                Number(
                                  item.item_count ||
                                    0
                                ) > 1
                                  ? "M"
                                  : "S"
                              }
                              color={
                                Number(
                                  item.item_count ||
                                    0
                                ) > 1
                                  ? "secondary"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor:
                                  "#f8fafc",
                                border:
                                  "1px solid #e2e8f0",
                              }}
                            >
                              <Typography
                                fontWeight={700}
                                fontSize={13}
                              >
                                {item.sku ||
                                  "-"}
                              </Typography>

                              <Typography
                                variant="body2"
                              >
                                {item.product_name ||
                                  "-"}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            {item.quantity ??
                              0}
                          </TableCell>

                          <TableCell>
                            {item.courier_service_code ||
                              item.courier_service_name ||
                              "-"}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                item.lable_printed
                                  ? "Printed"
                                  : "Pending"
                              }
                              color={
                                item.lable_printed
                                  ? "success"
                                  : "warning"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                item.processing_status_display ||
                                item.processing_status ||
                                "Unknown"
                              }
                              color={
                                item.processing_status ===
                                  "COMPLETED" ||
                                item.processing_status_display ===
                                  "Completed"
                                  ? "success"
                                  : "info"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                      >
                        No labels found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={printing}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderBatchDetailDialog;