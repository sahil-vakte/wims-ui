import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import ApiServices from "../../../../Services/ApiServices/ApiServices";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import qz from "qz-tray";
import PrinterService from "../../../PrinterService";
import tialogoo from "../../../../Assets/TK_Logo_png.png";
import Qrimagee from "../../../../Assets/reviewQR.jpeg";
import Bannerimagee from "../../../../Assets/Packing_Banner.jpg.jpeg";

const BATCH_API = "order-batches/";
const DYMO_LABEL_TEMPLATE = `${process.env.PUBLIC_URL}/labels/tiaknight-product-label-fixed.dymo`;

const LOW_STOCK_LIMIT = 10;

/*
 * Packing-list assets.
 *
 * Keep these pointed at the SAME three image files used by your existing
 * packing-list PDF component. If your files live at different public paths,
 * only change these three path values; the PDF drawing code below is unchanged.
 */
const LOGO_PATH = tialogoo;

const Qrimage = Qrimagee;

const Bannerimage = Bannerimagee;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const getError = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.detail ||
  error?.message ||
  fallback;

const getAvailableStock = (item) => {
  const direct = Number(item?.available_stock_in_mtr);

  if (Number.isFinite(direct)) {
    return direct;
  }

  const nested = Number(item?.stock_detail?.available_stock_in_mtr);

  return Number.isFinite(nested) ? nested : 0;
};

const getRequiredQuantity = (item) => {
  const value = Number(item?.quantity || 0);

  return Number.isFinite(value) ? value : 0;
};

const isInsufficientStock = (item) =>
  getRequiredQuantity(item) > getAvailableStock(item);

const isLowStock = (item) =>
  !isInsufficientStock(item) && getAvailableStock(item) <= LOW_STOCK_LIMIT;

const getStockState = (items = []) => {
  if (items.some(isInsufficientStock)) {
    return "INSUFFICIENT";
  }

  if (items.some(isLowStock)) {
    return "LOW";
  }

  return "OK";
};

const StockTooltipContent = ({ items = [] }) => {
  if (!items.length) {
    return "No stock information";
  }

  return (
    <Box
      sx={{
        p: 0.5,
        maxWidth: 460,
      }}
    >
      {items.map((item, index) => {
        const required = getRequiredQuantity(item);

        const available = getAvailableStock(item);

        const insufficient = required > available;

        const low = !insufficient && available <= LOW_STOCK_LIMIT;

        return (
          <Box
            key={item?.id || `${item?.sku}-${index}`}
            sx={{
              mb: index < items.length - 1 ? 1.25 : 0,
            }}
          >
            <Typography variant="caption" fontWeight={700} display="block">
              {item?.product_name || "-"}
            </Typography>

            <Typography variant="caption" display="block">
              SKU: {item?.sku || "-"}
            </Typography>

            <Typography variant="caption" display="block">
              Required: {required} m
            </Typography>

            <Typography variant="caption" display="block">
              Available: {available} m
            </Typography>

            {insufficient && (
              <Typography
                variant="caption"
                fontWeight={700}
                display="block"
                sx={{
                  color: "#ffb4b4",
                }}
              >
                Insufficient stock — short by{" "}
                {Math.max(required - available, 0)} m
              </Typography>
            )}

            {low && (
              <Typography
                variant="caption"
                fontWeight={700}
                display="block"
                sx={{
                  color: "#ffe082",
                }}
              >
                Low stock — 10m or less remaining
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const OrderBatchDetailTab = ({
  batchId,
  headers,
  onUpdated,
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [packingPrinting, setPackingPrinting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Internal detail view: show either Orders or Labels.
  const [detailContentTab, setDetailContentTab] = useState(0);

  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Normal A4 printers handled through QZ Tray.
  const [a4Printers, setA4Printers] = useState([]);
  const [selectedA4Printer, setSelectedA4Printer] = useState("");
  const [connectingA4, setConnectingA4] = useState(false);

  const getDymoFramework = useCallback(() => {
    const framework = window?.dymo?.label?.framework;

    if (!framework) {
      throw new Error(
        "DYMO JavaScript Framework is not loaded. Check public/index.html.",
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
                "DYMO connection timed out. Start DYMO Connect for Desktop and its Web Service.",
              ),
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
          environment?.errorDetails || "This browser is not supported by DYMO.",
        );
      }

      if (environment?.isFrameworkInstalled === false) {
        throw new Error(
          "DYMO Connect Web Service was not detected. Install/start DYMO Connect for Desktop.",
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
          : labelWriters[0].name,
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

  const connectA4Printer = useCallback(async () => {
    try {
      setConnectingA4(true);
      setError("");
      setMessage("Connecting to normal A4 printer...");

      /*
       * Reuse the same QZ security/certificate setup from PrinterService.
       */
      await PrinterService.connect();

      const installedPrinters = await qz.printers.find();

      const normalPrinters = (
        Array.isArray(installedPrinters) ? installedPrinters : []
      ).filter((printerName) => {
        const name = String(printerName || "").toLowerCase();

        /*
         * Do not offer the DYMO/TSC label printers as the A4 packing-list
         * printer. Also skip common virtual printers.
         */
        return !(
          name.includes("dymo") ||
          name.includes("labelwriter") ||
          name.includes("tsc") ||
          name.includes("da210") ||
          name.includes("da220") ||
          name.includes("da310") ||
          name.includes("da320") ||
          name.includes("microsoft print to pdf") ||
          name.includes("onenote") ||
          name.includes("fax")
        );
      });

      setA4Printers(normalPrinters);

      if (!normalPrinters.length) {
        setSelectedA4Printer("");

        throw new Error("No normal A4 printer was detected by QZ Tray.");
      }

      setSelectedA4Printer((current) =>
        normalPrinters.includes(current) ? current : normalPrinters[0],
      );

      setMessage(`A4 printer ready: ${normalPrinters[0]}.`);
    } catch (err) {
      console.error("A4 printer connection error:", err);

      setA4Printers([]);
      setSelectedA4Printer("");
      setMessage("");

      setError(getError(err, "Unable to connect to normal A4 printer."));
    } finally {
      setConnectingA4(false);
    }
  }, []);

  const fetchDetail = useCallback(async () => {
    if (!batchId) return;

    try {
      setLoading(true);
      setError("");

      const response = await ApiServices.get(
        `${BATCH_API}${batchId}/`,
        headers,
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
    if (!batchId) return;

    fetchDetail();
    connectDymo();
    connectA4Printer();
  }, [batchId, fetchDetail, connectDymo, connectA4Printer]);

  const orderMap = useMemo(() => {
    return new Map(
      (detail?.orders || []).map((order) => [Number(order.id), order]),
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

        order_number: label?.order_number || order?.order_number,

        external_order_id: label?.external_order_id || order?.external_order_id,

        customer_name: label?.customer_name || order?.customer_name,

        customer_phone: label?.customer_phone || order?.customer_phone,

        shipping_address_1:
          label?.shipping_address_1 || order?.shipping_address_1,

        shipping_address_2:
          label?.shipping_address_2 || order?.shipping_address_2,

        shipping_city: label?.shipping_city || order?.shipping_city,

        shipping_county: label?.shipping_county || order?.shipping_county,

        shipping_country: label?.shipping_country || order?.shipping_country,

        shipping_postcode: label?.shipping_postcode || order?.shipping_postcode,

        courier_service_name:
          label?.courier_service_name || order?.courier_service_name,

        courier_service_code:
          label?.courier_service_code || order?.courier_service_code,

        shipping_method: label?.shipping_method || order?.shipping_method,

        carrier: label?.carrier || order?.carrier,

        order_source: order?.order_source || "WEB",

        order_date: order?.order_date || order?.created_at,

        created_at: item?.created_at || order?.created_at,

        item_count: order?.item_count || order?.items_total || 1,
      };
    });
  }, [detail, orderMap]);

  const itemsByOrder = useMemo(() => {
    const map = new Map();

    labelItems.forEach((item) => {
      const orderId = Number(item?.order_id);

      if (!map.has(orderId)) {
        map.set(orderId, []);
      }

      map.get(orderId).push(item);
    });

    return map;
  }, [labelItems]);

  const printableItems = useMemo(
    () =>
      labelItems.filter(
        (item) =>
          item?.lable_printed !== true &&
          item?.processing_status !== "COMPLETED" &&
          item?.processing_status_display !== "Completed",
      ),
    [labelItems],
  );

  const buildQrUrl = useCallback((item) => {
    /*
     * IMPORTANT QR BEHAVIOUR
     *
     * The QR itself points to the public product page.
     *
     * Normal phone camera / normal QR scanner:
     *   -> opens child_product_url on tiaknightfabrics.co.uk
     *
     * WIMS Employee scanner:
     *   -> reads wims_order_id + wims_item_id from the same URL
     *   -> converts it to the internal employee processing route.
     *
     * Example QR:
     * https://www.tiaknightfabrics.co.uk/.../s27394
     *   ?wims_order_id=972&wims_item_id=2932
     */

    const orderId = item?.order_id;
    const itemId = item?.id;

    const rawChildUrl = String(item?.child_product_url || "").trim();

    /*
     * If the API does not provide a product URL, keep a safe public-site
     * fallback rather than encoding the private employee route in the QR.
     */
    const fallbackUrl = "https://www.tiaknightfabrics.co.uk/";

    let productUrl = fallbackUrl;

    try {
      if (rawChildUrl) {
        /*
         * Supports both:
         * /fabrics-c1/.../s27394
         *
         * and:
         * https://www.tiaknightfabrics.co.uk/fabrics-c1/.../s27394
         */
        productUrl = new URL(
          rawChildUrl,
          "https://www.tiaknightfabrics.co.uk",
        ).toString();
      }

      const url = new URL(productUrl);

      if (orderId) {
        url.searchParams.set("wims_order_id", String(orderId));
      }

      if (itemId) {
        url.searchParams.set("wims_item_id", String(itemId));
      }

      return url.toString();
    } catch (error) {
      console.warn("Unable to build product QR URL:", error);

      const params = new URLSearchParams();

      if (orderId) {
        params.set("wims_order_id", String(orderId));
      }

      if (itemId) {
        params.set("wims_item_id", String(itemId));
      }

      const query = params.toString();

      return query ? `${fallbackUrl}?${query}` : fallbackUrl;
    }
  }, []);

  const replaceQrValueInDymoXml = useCallback((labelXml, qrUrl) => {
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(labelXml, "application/xml");

    const parserError = xmlDocument.querySelector("parsererror");

    if (parserError) {
      throw new Error(`Unable to parse DYMO XML: ${parserError.textContent}`);
    }

    const qrObjects = Array.from(
      xmlDocument.getElementsByTagName("QRCodeObject"),
    );

    const qrObject = qrObjects.find((object) => {
      const nameNode = object.getElementsByTagName("Name")[0];

      return nameNode?.textContent?.trim() === "QR Code";
    });

    if (!qrObject) {
      throw new Error(
        'QR object named "QR Code" was not found in the DYMO template.',
      );
    }

    const dataString = qrObject.getElementsByTagName("DataString")[0];

    const textDataHolder = qrObject.getElementsByTagName("TextDataHolder")[0];

    const holderValue = textDataHolder?.getElementsByTagName("Value")[0];

    if (!dataString) {
      throw new Error("DataString was not found inside the DYMO QR object.");
    }

    dataString.textContent = qrUrl;

    if (holderValue) {
      holderValue.textContent = qrUrl;
    }

    return new XMLSerializer().serializeToString(xmlDocument);
  }, []);

  const loadDymoLabel = useCallback(
    async (qrUrl) => {
      const framework = getDymoFramework();

      const response = await fetch(DYMO_LABEL_TEMPLATE, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(
          `Unable to load DYMO template. HTTP ${response.status}.`,
        );
      }

      const originalXml = await response.text();

      const labelXml = replaceQrValueInDymoXml(originalXml, qrUrl);

      const label = framework.openLabelXml(labelXml);

      const objectNames = Array.from(label.getObjectNames?.() || []);

      return {
        label,
        objectNames,
      };
    },
    [getDymoFramework, replaceQrValueInDymoXml],
  );

  const setDymoValue = useCallback((label, objectNames, objectName, value) => {
    if (!objectNames.includes(objectName)) {
      return;
    }

    label.setObjectText(objectName, String(value ?? ""));
  }, []);

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
    (label, objectNames, item) => {
      const typeValue = Number(item?.item_count || 0) > 1 ? "M" : "S";

      const courierValue =
        item?.courier_service_code || item?.courier_service_name || "STD";

      const externalOrderId =
        item?.external_order_id || item?.order_number || "";

      const parsedDate = new Date(
        item?.order_date || item?.created_at || Date.now(),
      );

      const dateValue = Number.isNaN(parsedDate.getTime())
        ? ""
        : parsedDate.toLocaleString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

      setDymoValue(label, objectNames, "QR Code", buildQrUrl(item));

      setDymoValue(label, objectNames, "TEXT", item?.product_name || "");

      setDymoValue(label, objectNames, "TEXT2", item?.quantity ?? 0);

      setDymoValue(label, objectNames, "TEXT3",  "WEB");

      setDymoValue(label, objectNames, "TEXT4", item?.sku || "");

      setDymoValue(label, objectNames, "TEXT5", courierValue);

      setDymoValue(label, objectNames, "TEXT37", externalOrderId);

      setDymoValue(label, objectNames, "TEXT6", typeValue);

      setDymoValue(label, objectNames, "TEXT7", "SCAN ME");

      setDymoValue(label, objectNames, "DATE-TIME", dateValue);

      return externalOrderId;
    },
    [buildQrUrl, setDymoValue],
  );

  // ---------------------------------------------------------------------------
  // PACKING LIST PDF
  // ---------------------------------------------------------------------------
  // This is the same packing-list PDF drawing logic from your existing code.
  // The only data-source adaptation is that this dialog uses detail.orders
  // instead of the other component's orders state.
  // ---------------------------------------------------------------------------

  const getImageBase64 = async (path) => {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to load image: ${path}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };

  const formatOrderDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

  const getDeliveryLines = (order) =>
    [
      order.customer_name,
      order.shipping_address,
      // order.shipping_address_line1,
      // order.shipping_address_line2,
      // order.shipping_city,
      // order.shipping_state,
      // order.shipping_county,
      // order.shipping_country || "UK - Mainland",
      order.shipping_postcode,
      order.customer_phone,
    ].filter(Boolean);

  const downloadSelectedOrdersPdf = async (selected) => {
    if (!selected?.length) {
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    const pageW = doc.internal.pageSize.getWidth();

    const pageH = doc.internal.pageSize.getHeight();

    const logoBase64 = await getImageBase64(LOGO_PATH);

    const reviewQrBase64 = await getImageBase64(Qrimage);

    const bannerBase64 = await getImageBase64(Bannerimage);

    const COLORS = {
      pink: [214, 65, 150],
      dark: [0, 0, 0],
      text: [25, 25, 25],
      white: [255, 255, 255],
    };

    const FS = {
      title: 9,
      info: 10,
      promoTitle: 9,
      promoBody: 9.5,
      scan: 8,
    };

    const grouped = selected.reduce((accumulator, item) => {
      if (!accumulator[item.order_id]) {
        accumulator[item.order_id] = [];
      }

      accumulator[item.order_id].push(item);

      return accumulator;
    }, {});

    const drawRoundedBox = (
      x,
      y,
      width,
      height,
      fill = null,
      lineWidth = 0.32,
    ) => {
      doc.setDrawColor(...COLORS.pink);

      doc.setLineWidth(lineWidth);

      if (fill) {
        doc.setFillColor(...fill);

        doc.roundedRect(x, y, width, height, 1.3, 1.3, "FD");
      } else {
        doc.roundedRect(x, y, width, height, 1.3, 1.3, "S");
      }
    };

    const addFooterAndBanner = (startY) => {
      let y = startY + 5;

      if (y + 90 > pageH - 8) {
        doc.addPage();
        y = 12;
      }

      const policyText =
        "If you are not happy with your fabric, please email info@tiaknight.co.uk within 14 days of receiving your order. " +
        "Claims cannot be made on fabric that has been cut or processed. No refunds on samples, seconds fabrics and clearance/sale items.";

      doc.setFont("helvetica", "normal");

      doc.setFontSize(8);
      doc.setTextColor(...COLORS.text);

      const policyLines = doc.splitTextToSize(policyText, pageW - 20);

      doc.text(policyLines, 10, y);

      y += policyLines.length * 4 + 4;

      const bannerX = 10;
      const bannerW = pageW - 20;
      const bannerH = 80;

      drawRoundedBox(bannerX, y, bannerW, bannerH, null, 0.3);

      doc.addImage(
        bannerBase64,
        "JPEG",
        bannerX + 1,
        y + 1,
        bannerW - 2,
        bannerH - 2,
      );
    };

    Object.values(grouped).forEach((items, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const first = items[0];

      const order =
        (detail?.orders || []).find(
          (currentOrder) => Number(currentOrder.id) === Number(first.order_id),
        ) || first;

      const orderRef = first.external_order_id || first.order_number || "";

      drawRoundedBox(8, 8, pageW - 16, 18, COLORS.white, 0.42);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(11);
      doc.setTextColor(...COLORS.dark);

      doc.text("PACKING LIST", 12, 20);

      doc.addImage(logoBase64, "PNG", 73, 10, 58, 14);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(9);

      doc.text("CONTACT US", pageW - 55, 13.5);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(8);

      doc.text("+44 (0116) 254 2366", pageW - 55, 17.5);

      doc.text("info@tiaknight.co.uk", pageW - 55, 21.5);

      const topY = 32;
      const gap = 3;
      const leftX = 8;
      const rightX = 138;
      const leftW = 127;

      const rightW = pageW - rightX - 8;

      const cardW = (leftW - gap * 2) / 3;

      const cardH = 22;

      const drawTopCard = (label, value, x) => {
        drawRoundedBox(x, topY, cardW, cardH, COLORS.white, 0.32);

        doc.setFont("helvetica", "bold");

        doc.setFontSize(FS.title);
        doc.setTextColor(...COLORS.dark);

        doc.text(label, x + 3, topY + 7);

        doc.setFont("helvetica", "normal");

        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.text);

        const valueLines = doc.splitTextToSize(value || "-", cardW - 6);

        doc.text(valueLines, x + 3, topY + 12);
      };

      drawTopCard("ORDER REFERENCE", orderRef, leftX);

      drawTopCard(
        "ORDER DATE",
        formatOrderDate(first.order_date || order.created_at),
        leftX + cardW + gap,
      );

      drawTopCard(
        "DELIVERY METHOD",
        first.courier_service_name ||
          first.courier_service_code ||
          order.courier_service_name ||
          "Standard Delivery",
        leftX + cardW * 2 + gap * 2,
      );

      const addressY = topY + cardH + gap;

      const addressH = 40;

      drawRoundedBox(leftX, addressY, leftW, addressH, COLORS.white, 0.32);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(FS.title);
      doc.setTextColor(...COLORS.dark);

      doc.text("DELIVERY ADDRESS", leftX + 3, addressY + 7);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(FS.info);
      doc.setTextColor(...COLORS.text);

      doc.text(getDeliveryLines(order), leftX + 3, addressY + 15);

      const promoH = cardH + gap + addressH;

      drawRoundedBox(rightX, topY, rightW, promoH, COLORS.white, 0.32);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(FS.promoTitle);

      doc.setTextColor(...COLORS.dark);

      doc.text("FANCY A £50 GIFT VOUCHER?", rightX + rightW / 2, topY + 7, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");

      doc.setFontSize(FS.promoBody);

      const promoBodyLines = doc.splitTextToSize(
        "Tell us something that you love about our fabrics or post a picture of your creation and you could be in for the chance to win. For a valid entry, post your review/picture to Google Reviews or scan the QR code.",
        rightW - 8,
      );

      const promoBodyY = topY + 12;

      doc.text(promoBodyLines, rightX + 4, promoBodyY);

      const bodyBottomY = promoBodyY + promoBodyLines.length * 3.2;

      const qrSize = 22;
      const scanGap = 4;
      const bottomPad = 3;

      const qrBlockH = qrSize + scanGap;

      const qrY = Math.max(
        bodyBottomY + 2,
        topY + promoH - qrBlockH - bottomPad,
      );

      const qrX = rightX + (rightW - qrSize) / 2;

      doc.addImage(reviewQrBase64, "JPEG", qrX, qrY, qrSize, qrSize);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(FS.scan);

      doc.text("SCAN ME", rightX + rightW / 2, qrY + qrSize + scanGap, {
        align: "center",
      });

      const tableStartY = Math.max(addressY + addressH, topY + promoH) + 5;

      autoTable(doc, {
        startY: tableStartY,

        margin: {
          left: 8,
          right: 8,
          bottom: 10,
        },

        head: [["#", "Reference", "Product Information", "Qty"]],

        body: items.map((item, itemIndex) => [
          itemIndex + 1,
          item.sku || "",
          item.product_name || "",
          item.quantity || "",
        ]),

        theme: "grid",
        pageBreak: "auto",
        rowPageBreak: "avoid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 1.8,
          lineColor: COLORS.pink,
          lineWidth: 0.15,
          valign: "middle",
          textColor: [0, 0, 0],
          overflow: "linebreak",
        },

        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          lineColor: COLORS.pink,
          lineWidth: 0.25,
        },

        bodyStyles: {
          fillColor: [255, 255, 255],
        },

        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },

        columnStyles: {
          0: {
            cellWidth: 12,
            halign: "center",
          },
          1: {
            cellWidth: 30,
          },
          2: {
            cellWidth: 132,
          },
          3: {
            cellWidth: 18,
            halign: "center",
          },
        },
      });

      addFooterAndBanner(doc.lastAutoTable.finalY);
    });

    const filename = `Packing_List_${Date.now()}.pdf`;

    /*
     * Create the PDF only once.
     *
     * 1. Base64 is returned for direct QZ printing.
     * 2. The exact same jsPDF document is also downloaded locally.
     */
    const dataUri = doc.output("datauristring");

    const base64 = String(dataUri).split(",")[1];

    if (!base64) {
      throw new Error("Unable to convert packing-list PDF for printing.");
    }

    doc.save(filename);

    return {
      base64,
      filename,
    };
  };

  const printPackingListToA4 = async (pdfBase64) => {
    if (!selectedA4Printer) {
      throw new Error("Select a normal A4 printer before printing.");
    }

    if (!pdfBase64) {
      throw new Error("Packing-list PDF data is missing.");
    }

    /*
     * PrinterService.connect() initializes your existing QZ security
     * certificate/signing configuration and opens the QZ websocket.
     */
    await PrinterService.connect();

    const config = qz.configs.create(selectedA4Printer, {
      copies: 1,
      units: "mm",
      size: {
        width: 210,
        height: 297,
      },
      orientation: "portrait",
      margins: 0,
      scaleContent: true,
      rasterize: true,
    });

    const printData = [
      {
        type: "pixel",
        format: "pdf",
        flavor: "base64",
        data: pdfBase64,
      },
    ];

    await qz.print(config, printData);

    return true;
  };

  const printBatch = async () => {
    /*
     * DYMO printing is completely independent from the A4 printer.
     */
    if (!selectedPrinter) {
      setError("Select a DYMO printer before printing labels.");
      return;
    }

    if (!printableItems.length) {
      setError("There are no pending DYMO labels to print in this batch.");
      return;
    }

    try {
      setPrinting(true);
      setError("");
      setMessage("");

      const framework = getDymoFramework();

      const successfulItemIds = [];

      for (let index = 0; index < printableItems.length; index += 1) {
        const item = printableItems[index];

        setMessage(
          `Preparing DYMO label ${index + 1} of ${printableItems.length}: ${
            item?.sku || item?.external_order_id || item?.id
          }`,
        );

        const qrUrl = buildQrUrl(item);

        const { label, objectNames } = await loadDymoLabel(qrUrl);

        const externalOrderId = populateDymoLabel(label, objectNames, item);

        const printParamsXml = framework.createLabelWriterPrintParamsXml({
          copies: 1,
          jobTitle: `${externalOrderId || "WIMS"} - ${
            item?.sku || "Item Label"
          }`,
          printQuality: "BarcodeAndGraphics",
        });

        framework.printLabel(
          selectedPrinter,
          printParamsXml,
          label.getLabelXml(),
        );

        successfulItemIds.push(item.id);

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
            order_item_ids: successfulItemIds,
          },
          headers,
        );
      }

      setMessage(
        `${successfulItemIds.length} DYMO label${
          successfulItemIds.length === 1 ? "" : "s"
        } sent to ${selectedPrinter}.`,
      );

      await fetchDetail();
      await onUpdated?.();
    } catch (err) {
      console.error("Batch DYMO printing error:", err);

      setError(getError(err, "Unable to print DYMO labels."));
    } finally {
      setPrinting(false);
    }
  };

  const handlePackingList = async () => {
    /*
     * Packing-list handling is completely independent from DYMO.
     *
     * The PDF ALWAYS downloads locally.
     * If an A4 printer is selected/connected, the exact same PDF is also
     * submitted to that printer. If no A4 printer is available, download
     * still succeeds.
     */
    if (!labelItems.length) {
      setError("There are no batch items available for the packing list.");
      return;
    }

    try {
      setPackingPrinting(true);
      setError("");
      setMessage("Generating and downloading packing list PDF...");

      const packingPdf = await downloadSelectedOrdersPdf(labelItems);

      /*
       * No A4 printer: downloading the PDF is a valid successful action.
       */
      if (!selectedA4Printer) {
        setMessage(
          "Packing list PDF downloaded. No A4 printer is connected, so printer output was skipped.",
        );
        return;
      }

      try {
        setMessage(
          `Packing list downloaded. Sending the same PDF to ${selectedA4Printer}...`,
        );

        await printPackingListToA4(packingPdf.base64);

        setMessage(
          `Packing list PDF downloaded and sent to ${selectedA4Printer}.`,
        );
      } catch (printError) {
        /*
         * The local PDF has already been downloaded. An A4 print failure must
         * not turn the download itself into a failure or affect DYMO.
         */
        console.error("A4 packing-list print error:", printError);

        setMessage("Packing list PDF downloaded successfully.");

        setError(
          `PDF was downloaded, but A4 printing failed: ${getError(
            printError,
            "Unable to print packing list.",
          )}`,
        );
      }
    } catch (err) {
      console.error("Packing-list PDF error:", err);

      setError(getError(err, "Unable to generate packing-list PDF."));
    } finally {
      setPackingPrinting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 2 }}>
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
            <Typography variant="h6" fontWeight={700}>
              {detail?.batch_name || "Order Batch Details"}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Batch #{batchId}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Orders: ${detail?.orders_count ?? 0}`} />

            <Chip
              label={`Labels: ${detail?.labels_printed_count ?? 0} / ${
                detail?.labels_total_count ?? 0
              }`}
              color={
                detail?.labels_total_count > 0 &&
                detail?.labels_printed_count === detail?.labels_total_count
                  ? "success"
                  : "warning"
              }
            />
          </Stack>
        </Stack>
      </Box>

      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {message && (
              <Alert
                severity={
                  message.startsWith("Connected") || message.includes("sent to")
                    ? "success"
                    : "info"
                }
                onClose={() => setMessage("")}
              >
                {message}
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2 }}>
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
                  <Typography variant="caption" color="text.secondary">
                    Batch Date
                  </Typography>
                  <Typography fontWeight={700}>
                    {detail?.batch_date || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography fontWeight={700}>
                    {detail?.created_by_username || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Platform
                  </Typography>
                  <Typography fontWeight={700}>
                    {detail?.filters_snapshot?.platform || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Courier
                  </Typography>
                  <Typography fontWeight={700}>
                    {detail?.filters_snapshot?.courier_service_code || "-"}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography fontWeight={700}>
                    {detail?.notes || "-"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                A4 Packing List Printer
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
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel>Normal A4 Printer</InputLabel>

                  <Select
                    value={selectedA4Printer}
                    label="Normal A4 Printer"
                    disabled={connectingA4 || printing}
                    onChange={(event) =>
                      setSelectedA4Printer(event.target.value)
                    }
                  >
                    {!a4Printers.length && (
                      <MenuItem value="">No A4 printer detected</MenuItem>
                    )}

                    {a4Printers.map((printerName) => (
                      <MenuItem key={printerName} value={printerName}>
                        {printerName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={connectA4Printer}
                  disabled={connectingA4 || packingPrinting}
                >
                  {connectingA4 ? "Connecting..." : "Reconnect A4 Printer"}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePackingList}
                  disabled={packingPrinting || !labelItems.length}
                  startIcon={
                    packingPrinting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : null
                  }
                >
                  {packingPrinting
                    ? "Preparing Packing List..."
                    : selectedA4Printer
                      ? "Print + Download Packing List"
                      : "Download Packing List PDF"}
                </Button>

                <Typography variant="body2" color="text.secondary">
                  PDF download is always available. If an A4 printer is
                  connected, the same PDF is also printed automatically.
                </Typography>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
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
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel>DYMO Printer</InputLabel>

                  <Select
                    value={selectedPrinter}
                    label="DYMO Printer"
                    disabled={connecting || printing}
                    onChange={(event) => setSelectedPrinter(event.target.value)}
                  >
                    {!printers.length && (
                      <MenuItem value="">No printer detected</MenuItem>
                    )}

                    {printers.map((printer) => (
                      <MenuItem key={printer.name} value={printer.name}>
                        {printer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={connectDymo}
                  disabled={connecting || printing}
                >
                  {connecting ? "Connecting..." : "Reconnect DYMO"}
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
                      <CircularProgress size={18} color="inherit" />
                    ) : null
                  }
                >
                  {printing
                    ? "Printing DYMO Labels..."
                    : `Print DYMO Labels (${printableItems.length})`}
                </Button>
              </Stack>
            </Paper>

            {/* ============================================================
                ORDERS / LABELS INTERNAL TABS
                ============================================================ */}

            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <Tabs
                value={detailContentTab}
                onChange={(_, value) => setDetailContentTab(value)}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                  },
                }}
              >
                <Tab
                  label={`Orders (${detail?.orders?.length || 0})`}
                />

                <Tab
                  label={`Labels (${labelItems.length})`}
                />
              </Tabs>
            </Paper>

            {detailContentTab === 0 && (
              <Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Courier</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(detail?.orders || []).map((order) => {
                    const orderItems = itemsByOrder.get(Number(order.id)) || [];

                    const stockState = getStockState(orderItems);

                    const issueItems = orderItems.filter(
                      (item) => isInsufficientStock(item) || isLowStock(item),
                    );

                    const lowCount = orderItems.filter(isLowStock).length;

                    const insufficientCount =
                      orderItems.filter(isInsufficientStock).length;

                    return (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{
                          bgcolor:
                            stockState === "INSUFFICIENT"
                              ? "#fff1f2"
                              : stockState === "LOW"
                                ? "#fffbeb"
                                : undefined,
                          "&:hover": {
                            bgcolor:
                              stockState === "INSUFFICIENT"
                                ? "#ffe4e6 !important"
                                : stockState === "LOW"
                                  ? "#fef3c7 !important"
                                  : undefined,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={700}>
                            {order.external_order_id ||
                              order.order_number ||
                              `#${order.id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.order_number}
                          </Typography>
                        </TableCell>

                        <TableCell>{order.customer_name || "-"}</TableCell>

                        <TableCell>
                          {order.courier_service_code ||
                            order.courier_service_name ||
                            "-"}
                        </TableCell>

                        <TableCell>{order.order_source || "-"}</TableCell>

                        <TableCell>
                          {order.item_count ?? order.items_total ?? 0}
                        </TableCell>

                        <TableCell>
                          {stockState === "INSUFFICIENT" ? (
                            <Tooltip
                              arrow
                              placement="top"
                              title={<StockTooltipContent items={issueItems} />}
                            >
                              <Chip
                                size="small"
                                color="error"
                                label={`${insufficientCount} insufficient`}
                                sx={{
                                  cursor: "help",
                                  fontWeight: 700,
                                }}
                              />
                            </Tooltip>
                          ) : stockState === "LOW" ? (
                            <Tooltip
                              arrow
                              placement="top"
                              title={<StockTooltipContent items={issueItems} />}
                            >
                              <Chip
                                size="small"
                                color="warning"
                                label={`${lowCount} low stock`}
                                sx={{
                                  cursor: "help",
                                  fontWeight: 700,
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              size="small"
                              color="success"
                              label="Stock OK"
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={`${Number(
                              order.completion_percentage || 0,
                            )}%`}
                            color={
                              Number(order.completion_percentage || 0) >= 100
                                ? "success"
                                : "info"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

              </Box>
            )}

            {detailContentTab === 1 && (
              <Box>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxHeight: 460 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Courier</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Item Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {labelItems.length ? (
                    labelItems.map((item) => {
                      const insufficient = isInsufficientStock(item);

                      const low = isLowStock(item);

                      const available = getAvailableStock(item);

                      const required = getRequiredQuantity(item);

                      return (
                        <TableRow
                          key={item.id}
                          hover
                          sx={{
                            bgcolor: insufficient
                              ? "#fff1f2"
                              : low
                                ? "#fffbeb"
                                : undefined,
                            "&:hover": {
                              bgcolor: insufficient
                                ? "#ffe4e6 !important"
                                : low
                                  ? "#fef3c7 !important"
                                  : undefined,
                            },
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight={700}>
                              {item.external_order_id ||
                                item.order_number ||
                                "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                Number(item.item_count || 0) > 1 ? "M" : "S"
                              }
                              color={
                                Number(item.item_count || 0) > 1
                                  ? "secondary"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Tooltip
                              arrow
                              placement="top"
                              title={<StockTooltipContent items={[item]} />}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  bgcolor: insufficient
                                    ? "#fee2e2"
                                    : low
                                      ? "#fef3c7"
                                      : "#f8fafc",
                                  border: insufficient
                                    ? "1px solid #ef4444"
                                    : low
                                      ? "1px solid #f59e0b"
                                      : "1px solid #e2e8f0",
                                  cursor: "help",
                                }}
                              >
                                <Typography fontWeight={700} fontSize={13}>
                                  {item.sku || "-"}
                                </Typography>

                                <Typography variant="body2">
                                  {item.product_name || "-"}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>

                          <TableCell>{item.quantity ?? 0}</TableCell>

                          <TableCell>
                            <Tooltip
                              arrow
                              placement="top"
                              title={<StockTooltipContent items={[item]} />}
                            >
                              {insufficient ? (
                                <Chip
                                  size="small"
                                  color="error"
                                  label={`Need ${required}m / Have ${available}m`}
                                  sx={{
                                    cursor: "help",
                                    fontWeight: 700,
                                  }}
                                />
                              ) : low ? (
                                <Chip
                                  size="small"
                                  color="warning"
                                  label={`Low: ${available}m`}
                                  sx={{
                                    cursor: "help",
                                    fontWeight: 700,
                                  }}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  color="success"
                                  label={`${available}m available`}
                                  sx={{
                                    cursor: "help",
                                  }}
                                />
                              )}
                            </Tooltip>
                          </TableCell>

                          <TableCell>
                            {item.courier_service_code ||
                              item.courier_service_name ||
                              "-"}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={item.lable_printed ? "Printed" : "Pending"}
                              color={item.lable_printed ? "success" : "warning"}
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
                                item.processing_status === "COMPLETED" ||
                                item.processing_status_display === "Completed"
                                  ? "success"
                                  : "info"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No labels found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default OrderBatchDetailTab;
