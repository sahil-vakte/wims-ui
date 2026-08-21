import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import { QRCodeCanvas } from "qrcode.react";

import BatchesAdd from "./BatchesAdd";
import ApiServices from "../../../Services/ApiServices/ApiServices";

import {
  getDecryptedAccessToken,
  getDecryptedUserType,
} from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

/*
 * UI colors used by this component.
 */
const theme = {
  accent: "#6366f1",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#16a34a",
  successSoft: "rgba(34,197,94,0.10)",
  warn: "#d97706",
  warnSoft: "rgba(245,158,11,0.10)",
};

/*
 * Place the DYMO label template at:
 *
 * public/
 *   labels/
 *     wims-batch-roll-label.dymo
 */
const DYMO_LABEL_TEMPLATE = `${process.env.PUBLIC_URL}/labels/wims-batch-roll-label.dymo`;

/*
 * QR URL format:
 *
 * https://wims.cloud/employee-user/batch-process/{batchId}/{rollId}
 *
 * Change only this constant if your React route is different.
 */
const getUserTypeObject = (userType) => {
  if (userType && typeof userType === "object") {
    return userType;
  }

  if (typeof userType === "string") {
    try {
      return JSON.parse(userType);
    } catch {
      return null;
    }
  }

  return null;
};

const getBatchRoutePrefix = (userType) => {
  const user = getUserTypeObject(userType);

  return user?.is_staff === true && user?.is_superuser === true
    ? "admin-user"
    : "employee-user";
};

/*
 * Used to prevent sending too many jobs to the local
 * DYMO Web Service at exactly the same time.
 */
const wait = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

/*
 * Display-safe value helper.
 */
const safe = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return value;
};

/*
 * Supports APIs that return either:
 *
 * {
 *   id: ...
 * }
 *
 * or:
 *
 * {
 *   batch_id: ...
 * }
 */
const getBatchId = (batch) =>
  batch?.batch_id ?? batch?.id;

/*
 * A batch is treated as fully printed when:
 *
 * 1. A batch-level printed/generated flag is true, or
 * 2. Every roll has label_generated === true.
 */
const areAllRollLabelsGenerated = (batch) => {
  const rolls = Array.isArray(batch?.rolls)
    ? batch.rolls
    : [];

  if (batch?.labels_generated === true) {
    return true;
  }

  if (batch?.label_printed === true) {
    return true;
  }

  if (batch?.is_label_printed === true) {
    return true;
  }

  if (!rolls.length) {
    return false;
  }

  return rolls.every(
    (roll) => roll?.label_generated === true
  );
};

/*
 * Generates a unique QR URL for every roll.
 *
 * Example:
 *
 * https://wims.cloud/employee-user/batch-process/2050/6089
 */
const buildBatchRollQrUrl = (batch, roll, userType) => {
  const batchId = getBatchId(batch);
  const rollId = roll?.id;

  if (
    batchId === null ||
    batchId === undefined ||
    batchId === "" ||
    rollId === null ||
    rollId === undefined ||
    rollId === ""
  ) {
    throw new Error(
      "Cannot create QR URL because the batch ID or roll ID is missing."
    );
  }

  const routePrefix = getBatchRoutePrefix(userType);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wims.cloud";

  return `${origin}/${routePrefix}/batch-process/${encodeURIComponent(
    String(batchId)
  )}/${encodeURIComponent(String(rollId))}`;
};

/*
 * DYMO templates sometimes keep the original QR value
 * inside two separate XML locations:
 *
 * <Data>
 *   <DataString>...</DataString>
 * </Data>
 *
 * <TextDataHolder>
 *   <Value>...</Value>
 * </TextDataHolder>
 *
 * setObjectText() alone may update the JavaScript label object,
 * while the printer still renders the original template QR.
 *
 * This function directly replaces both stored QR values before
 * the label is opened by the DYMO framework.
 */
const replaceQrValueInDymoXml = (
  originalLabelXml,
  qrUrl
) => {
  if (!originalLabelXml?.trim()) {
    throw new Error(
      "The DYMO template XML is empty."
    );
  }

  if (!qrUrl?.trim()) {
    throw new Error(
      "The QR URL is empty."
    );
  }

  const parser = new DOMParser();

  const xmlDocument = parser.parseFromString(
    originalLabelXml,
    "application/xml"
  );

  const parserError =
    xmlDocument.querySelector("parsererror");

  if (parserError) {
    throw new Error(
      `Unable to parse the DYMO template XML: ${
        parserError.textContent ||
        "Unknown XML parsing error."
      }`
    );
  }

  const qrObjects = Array.from(
    xmlDocument.getElementsByTagName(
      "QRCodeObject"
    )
  );

  const targetQrObject = qrObjects.find(
    (qrObject) => {
      const nameNodes =
        qrObject.getElementsByTagName("Name");

      const nameNode = nameNodes?.[0];

      return (
        nameNode?.textContent?.trim() ===
        "QR Code"
      );
    }
  );

  if (!targetQrObject) {
    throw new Error(
      'The DYMO template does not contain a QRCodeObject named "QR Code".'
    );
  }

  const dataStringNodes =
    targetQrObject.getElementsByTagName(
      "DataString"
    );

  const dataStringNode =
    dataStringNodes?.[0];

  if (!dataStringNode) {
    throw new Error(
      'The "QR Code" object does not contain a DataString element.'
    );
  }

  /*
   * Using textContent automatically escapes XML special
   * characters such as &, < and >.
   */
  dataStringNode.textContent = qrUrl;

  const textDataHolderNodes =
    targetQrObject.getElementsByTagName(
      "TextDataHolder"
    );

  const textDataHolderNode =
    textDataHolderNodes?.[0];

  if (textDataHolderNode) {
    const valueNodes =
      textDataHolderNode.getElementsByTagName(
        "Value"
      );

    const valueNode = valueNodes?.[0];

    if (valueNode) {
      valueNode.textContent = qrUrl;
    }
  }

  return new XMLSerializer().serializeToString(
    xmlDocument
  );
};

/*
 * DYMO framework versions return printers in different shapes:
 *
 * - Normal arrays
 * - Array-like collections
 * - Plain objects keyed by index or printer name
 *
 * This helper converts them into a normal JavaScript array.
 */
const normalizeDymoPrinters = (
  printerCollection
) => {
  if (!printerCollection) {
    return [];
  }

  if (Array.isArray(printerCollection)) {
    return printerCollection.filter(Boolean);
  }

  if (
    typeof printerCollection.length ===
    "number"
  ) {
    const printers = [];

    for (
      let index = 0;
      index < printerCollection.length;
      index += 1
    ) {
      const printer =
        printerCollection[index];

      if (printer) {
        printers.push(printer);
      }
    }

    return printers;
  }

  if (
    typeof printerCollection === "object"
  ) {
    return Object.values(
      printerCollection
    ).filter(
      (printer) =>
        printer &&
        typeof printer === "object" &&
        printer?.name
    );
  }

  return [];
};

/*
 * Detects usable LabelWriter printers without relying on one
 * exact printerType value.
 *
 * Different DYMO versions can return values such as:
 *
 * - LabelWriterPrinter
 * - LabelWriter
 * - undefined
 * - empty string
 *
 * We reject only clearly detected tape/LabelManager printers.
 */
const getUsableDymoPrinters = (
  installedPrinters
) => {
  if (!Array.isArray(installedPrinters)) {
    return [];
  }

  const nonTapePrinters =
    installedPrinters.filter((printer) => {
      const printerName = String(
        printer?.name || ""
      ).toLowerCase();

      const modelName = String(
        printer?.modelName || ""
      ).toLowerCase();

      const printerType = String(
        printer?.printerType || ""
      ).toLowerCase();

      const isTapePrinter =
        printerType.includes("tape") ||
        printerName.includes(
          "labelmanager"
        ) ||
        modelName.includes(
          "labelmanager"
        );

      return !isTapePrinter;
    });

  const clearLabelWriterMatches =
    nonTapePrinters.filter((printer) => {
      const printerName = String(
        printer?.name || ""
      ).toLowerCase();

      const modelName = String(
        printer?.modelName || ""
      ).toLowerCase();

      const printerType = String(
        printer?.printerType || ""
      ).toLowerCase();

      return (
        printerType.includes(
          "labelwriter"
        ) ||
        printerName.includes(
          "labelwriter"
        ) ||
        modelName.includes(
          "labelwriter"
        ) ||
        printerName.includes("dymo") ||
        modelName.includes("dymo")
      );
    });

  /*
   * Prefer printers that clearly identify as LabelWriter.
   *
   * When DYMO returns incomplete metadata, allow all
   * detected non-tape printers as a fallback.
   */
  return clearLabelWriterMatches.length
    ? clearLabelWriterMatches
    : nonTapePrinters;
};

/*
 * Builds a readable printer description for errors and logs.
 */
const describeDymoPrinter = (printer) => {
  const name =
    printer?.name || "Unknown printer";

  const type =
    printer?.printerType ||
    printer?.modelName ||
    "unknown type";

  return `${name} (${type})`;
};

const BatchesList = () => {
  /*
   * Authentication
   */
  const token = useMemo(
    () => getDecryptedAccessToken(),
    []
  );
  const UserType = useMemo(() => getDecryptedUserType(), []);
  const userTypeObject = useMemo(
    () => getUserTypeObject(UserType),
    [UserType]
  );
  const headers = useMemo(() => {
    if (!token) {
      return {};
    }

    const cleanToken = String(token).replace(
      /(^"|"$)/g,
      ""
    );

    return {
      Authorization: `Bearer ${cleanToken}`,
    };
  }, [token]);

  /*
   * Dialog and page states
   */
  const [openAdd, setOpenAdd] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [batches, setBatches] =
    useState([]);

  const [
    selectedBatches,
    setSelectedBatches,
  ] = useState([]);

  const [error, setError] =
    useState("");

  /*
   * Filters
   */
  const [sku, setSku] = useState("");

  const [supplier, setSupplier] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [
    labelFilter,
    setLabelFilter,
  ] = useState("ALL");

  /*
   * Detail dialog states
   */
  const [
    detailOpen,
    setDetailOpen,
  ] = useState(false);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    batchDetail,
    setBatchDetail,
  ] = useState(null);

  /*
   * DYMO states
   */
  const [
    dymoPrinters,
    setDymoPrinters,
  ] = useState([]);

  const [
    selectedDymoPrinter,
    setSelectedDymoPrinter,
  ] = useState("");

  const [
    dymoConnecting,
    setDymoConnecting,
  ] = useState(false);

  const [
    printingLabels,
    setPrintingLabels,
  ] = useState(false);

  const [
    printMessage,
    setPrintMessage,
  ] = useState("");

    /*
   * Fetch batch list
   */
  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (sku.trim()) {
        params.set("sku", sku.trim());
      }

      if (supplier.trim()) {
        params.set("supplier", supplier.trim());
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (dateFrom) {
        params.set("date_from", dateFrom);
      }

      if (dateTo) {
        params.set("date_to", dateTo);
      }

      const url = params.toString()
        ? `stock-batches/?${params.toString()}`
        : "stock-batches/";

      const response = await ApiServices.get(
        url,
        headers
      );

      const responseData =
        response?.data || response;

      const batchResults = Array.isArray(
        responseData
      )
        ? responseData
        : responseData?.results || [];

      setBatches(batchResults);
      setSelectedBatches([]);
    } catch (err) {
      console.error(
        "Fetch batches error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch batches."
      );

      setBatches([]);
      setSelectedBatches([]);
    } finally {
      setLoading(false);
    }
  }, [
    headers,
    sku,
    supplier,
    search,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  /*
   * Filter batches locally by label state.
   */
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const fullyPrinted =
        areAllRollLabelsGenerated(batch);

      if (labelFilter === "PRINTED") {
        return fullyPrinted;
      }

      if (labelFilter === "NOT_PRINTED") {
        return !fullyPrinted;
      }

      return true;
    });
  }, [batches, labelFilter]);

  /*
   * Only batches containing pending roll labels
   * may be selected for printing.
   */
  const selectableBatchIds = useMemo(() => {
    return filteredBatches
      .filter(
        (batch) =>
          !areAllRollLabelsGenerated(batch)
      )
      .map((batch) => getBatchId(batch))
      .filter(
        (batchId) =>
          batchId !== null &&
          batchId !== undefined &&
          batchId !== ""
      );
  }, [filteredBatches]);

  const allSelected =
    selectableBatchIds.length > 0 &&
    selectableBatchIds.every((batchId) =>
      selectedBatches.includes(batchId)
    );

  const partiallySelected =
    selectedBatches.length > 0 &&
    selectableBatchIds.some((batchId) =>
      selectedBatches.includes(batchId)
    ) &&
    !allSelected;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBatches(
        selectableBatchIds
      );
    } else {
      setSelectedBatches([]);
    }
  };

  const handleSelectBatch = (batchId) => {
    if (
      batchId === null ||
      batchId === undefined ||
      batchId === ""
    ) {
      return;
    }

    setSelectedBatches((previous) =>
      previous.includes(batchId)
        ? previous.filter(
            (selectedId) =>
              selectedId !== batchId
          )
        : [...previous, batchId]
    );
  };

  /*
   * Return the DYMO JavaScript framework.
   */
  const getDymoFramework =
    useCallback(() => {
      const framework =
        window?.dymo?.label?.framework;

      if (!framework) {
        throw new Error(
          "DYMO JavaScript Framework is not loaded. Verify that the DYMO framework script is included in public/index.html."
        );
      }

      return framework;
    }, []);

  /*
   * Initialise DYMO Connect and detect printers.
   *
   * This implementation supports:
   * - Arrays
   * - Array-like printer collections
   * - Plain object collections
   * - Missing or inconsistent printerType values
   */
  const initializeDymoPrinter =
    useCallback(async () => {
      try {
        setDymoConnecting(true);
        setError("");
        setPrintMessage(
          "Connecting to DYMO Web Service..."
        );

        const framework =
          getDymoFramework();

        await new Promise(
          (resolve, reject) => {
            let completed = false;

            const timeoutId =
              window.setTimeout(() => {
                if (!completed) {
                  reject(
                    new Error(
                      "DYMO connection timed out. Start DYMO Connect for Desktop and make sure its Web Service is running."
                    )
                  );
                }
              }, 15000);

            framework.init(() => {
              completed = true;

              window.clearTimeout(
                timeoutId
              );

              resolve();
            });
          }
        );

        const environment =
          framework.checkEnvironment();

        console.log(
          "DYMO environment:",
          environment
        );

        if (
          environment?.isBrowserSupported ===
          false
        ) {
          throw new Error(
            environment?.errorDetails ||
              "This browser is not supported by the DYMO framework."
          );
        }

        if (
          environment?.isFrameworkInstalled ===
          false
        ) {
          throw new Error(
            "DYMO Connect Web Service was not detected. Install and start DYMO Connect for Desktop."
          );
        }

        if (
          Object.prototype.hasOwnProperty.call(
            environment || {},
            "isWebServicePresent"
          ) &&
          environment?.isWebServicePresent ===
            false
        ) {
          throw new Error(
            "DYMO Web Service is installed but not currently running."
          );
        }

        const rawPrinterCollection =
          framework.getPrinters();

        console.log(
          "Raw DYMO printer collection:",
          rawPrinterCollection
        );

        const installedPrinters =
          normalizeDymoPrinters(
            rawPrinterCollection
          );

        console.log(
          "Normalized DYMO printers:",
          installedPrinters
        );

        if (!installedPrinters.length) {
          throw new Error(
            "DYMO Connect is running, but no printers were returned. Check the printer USB connection, Windows printer settings, DYMO driver, and printer power."
          );
        }

        const usablePrinters =
          getUsableDymoPrinters(
            installedPrinters
          );

        console.log(
          "Usable DYMO printers:",
          usablePrinters
        );

        if (!usablePrinters.length) {
          const printerDescriptions =
            installedPrinters
              .map(describeDymoPrinter)
              .join(", ");

          throw new Error(
            `Printers were detected, but none are usable for this label format. Detected printers: ${
              printerDescriptions ||
              "Unknown"
            }`
          );
        }

        setDymoPrinters(
          usablePrinters
        );

        setSelectedDymoPrinter(
          (currentPrinter) => {
            const printerStillExists =
              usablePrinters.some(
                (printer) =>
                  printer?.name ===
                  currentPrinter
              );

            if (printerStillExists) {
              return currentPrinter;
            }

            return (
              usablePrinters[0]?.name ||
              ""
            );
          }
        );

        setPrintMessage(
          `Connected to ${
            usablePrinters[0]?.name ||
            "DYMO printer"
          }.`
        );
      } catch (err) {
        console.error(
          "DYMO initialization error:",
          err
        );

        setDymoPrinters([]);
        setSelectedDymoPrinter("");
        setPrintMessage("");

        setError(
          err?.message ||
            "Unable to connect to the DYMO printer."
        );
      } finally {
        setDymoConnecting(false);
      }
    }, [getDymoFramework]);

  useEffect(() => {
    initializeDymoPrinter();
  }, [initializeDymoPrinter]);

  /*
   * Mark one or more batches as having generated labels.
   */
  const markLabelsGeneratedByBatchIds =
    useCallback(
      async (batchIds) => {
        const validBatchIds =
          batchIds.filter(
            (batchId) =>
              batchId !== null &&
              batchId !== undefined &&
              batchId !== ""
          );

        if (!validBatchIds.length) {
          return;
        }

        await ApiServices.post(
          "stock-batches/mark-labels-generated",
          {
            batch_ids: validBatchIds,
          },
          headers
        );
      },
      [headers]
    );

  /*
   * Fetch one batch and open its detail dialog.
   */
  const openDetail = async (batchId) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setBatchDetail(null);
      setError("");

      const response =
        await ApiServices.get(
          `stock-batches/${batchId}/`,
          headers
        );

      setBatchDetail(
        response?.data || response
      );
    } catch (err) {
      console.error(
        "Fetch batch detail error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch batch detail."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /*
   * Manual fallback for marking a single batch.
   */
  const markSingleBatchLabelsGenerated =
    async (batchId) => {
      try {
        setDetailLoading(true);
        setError("");

        await markLabelsGeneratedByBatchIds([
          batchId,
        ]);

        const response =
          await ApiServices.get(
            `stock-batches/${batchId}/`,
            headers
          );

        setBatchDetail(
          response?.data || response
        );

        await fetchBatches();
      } catch (err) {
        console.error(
          "Mark batch labels error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to mark batch labels as generated."
        );
      } finally {
        setDetailLoading(false);
      }
    };
      /*
   * Load the DYMO template for one specific roll.
   *
   * The QR URL is injected directly into the XML before
   * the label is opened by the DYMO framework.
   */
  const loadDymoLabel = useCallback(
    async (qrUrl) => {
      const framework =
        getDymoFramework();

      const response = await fetch(
        DYMO_LABEL_TEMPLATE,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load DYMO template. HTTP ${response.status}. Place wims-batch-roll-label.dymo inside public/labels.`
        );
      }

      const originalLabelXml =
        await response.text();

      if (!originalLabelXml.trim()) {
        throw new Error(
          "The DYMO label template is empty."
        );
      }

      const lowerXml =
        originalLabelXml.toLowerCase();

      if (
        lowerXml.includes(
          "<!doctype html"
        ) ||
        lowerXml.includes("<html")
      ) {
        throw new Error(
          "React returned index.html instead of the DYMO template. Put wims-batch-roll-label.dymo inside public/labels."
        );
      }

      const labelXml =
        replaceQrValueInDymoXml(
          originalLabelXml,
          qrUrl
        );

      let label;

      try {
        label =
          framework.openLabelXml(
            labelXml
          );
      } catch (err) {
        console.error(
          "DYMO template parsing error:",
          err
        );

        throw new Error(
          "DYMO could not open the batch roll label template."
        );
      }

      const objectNames = Array.from(
        label.getObjectNames?.() || []
      );

      console.log(
        "Batch DYMO template objects:",
        objectNames
      );

      const requiredObjects = [
        "QR Code",
        "BATCH_ID",
        "SKU",
        "PRODUCT_NAME",
        "ROLL_NUMBER",
        "METERAGE",
        "SUPPLIER",
        "LABEL_TYPE",
        "SCAN_TEXT",
      ];

      const missingObjects =
        requiredObjects.filter(
          (objectName) =>
            !objectNames.includes(
              objectName
            )
        );

      if (missingObjects.length) {
        throw new Error(
          `The DYMO template is missing: ${missingObjects.join(
            ", "
          )}. Available objects: ${
            objectNames.join(", ") ||
            "none"
          }`
        );
      }

      return {
        label,
        objectNames,
      };
    },
    [getDymoFramework]
  );

  /*
   * Safely update one named object in the DYMO template.
   */
  const setDymoObjectValue =
    useCallback(
      (
        label,
        objectNames,
        objectName,
        value
      ) => {
        if (
          !objectNames.includes(
            objectName
          )
        ) {
          console.warn(
            `DYMO object "${objectName}" was not found.`
          );

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
   * Populate the template using batch and roll information.
   */
  const populateBatchRollLabel =
    useCallback(
      (
        label,
        objectNames,
        batch,
        roll,
        qrUrl
      ) => {
        const batchId =
          getBatchId(batch);

        setDymoObjectValue(
          label,
          objectNames,
          "QR Code",
          qrUrl
        );

        setDymoObjectValue(
          label,
          objectNames,
          "BATCH_ID",
          batchId
        );

        setDymoObjectValue(
          label,
          objectNames,
          "SKU",
          batch?.sku || ""
        );

        setDymoObjectValue(
          label,
          objectNames,
          "PRODUCT_NAME",
          batch?.product_name || ""
        );

        setDymoObjectValue(
          label,
          objectNames,
          "ROLL_NUMBER",
          `Roll #${
            roll?.roll_number ?? ""
          }`
        );

        setDymoObjectValue(
          label,
          objectNames,
          "METERAGE",
          `${
            roll?.meterage ?? 0
          } mtr`
        );

        setDymoObjectValue(
          label,
          objectNames,
          "SUPPLIER",
          batch?.supplier || ""
        );

        setDymoObjectValue(
          label,
          objectNames,
          "LABEL_TYPE",
          "ROLL"
        );

        setDymoObjectValue(
          label,
          objectNames,
          "SCAN_TEXT",
          "SCAN TO PROCESS"
        );

        const printedAt =
          new Date().toLocaleString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }
          );

        setDymoObjectValue(
          label,
          objectNames,
          "DATE-TIME",
          printedAt
        );
      },
      [setDymoObjectValue]
    );

  /*
   * Print one label for every pending roll
   * in the selected batches.
   */
  const printSelectedBatchLabels =
    async () => {
      try {
        setError("");
        setPrintMessage("");

        if (!selectedDymoPrinter) {
          setError(
            "Select a DYMO printer before printing."
          );

          return;
        }

        const selected =
          batches.filter((batch) =>
            selectedBatches.includes(
              getBatchId(batch)
            )
          );

        if (!selected.length) {
          setError(
            "Please select at least one batch."
          );

          return;
        }

        const printJobs =
          selected.flatMap((batch) =>
            (batch?.rolls || [])
              .filter(
                (roll) =>
                  roll?.label_generated !==
                  true
              )
              .map((roll) => ({
                batch,
                roll,
              }))
          );

        if (!printJobs.length) {
          setError(
            "The selected batches do not contain any pending roll labels."
          );

          return;
        }

        setPrintingLabels(true);

        const framework =
          getDymoFramework();

        const submittedRollIds = [];

        const successfulJobsByBatch =
          new Map();

        for (
          let index = 0;
          index < printJobs.length;
          index += 1
        ) {
          const { batch, roll } =
            printJobs[index];

          const batchId =
            getBatchId(batch);

          const qrUrl =
            buildBatchRollQrUrl(
              batch,
              roll,
              userTypeObject
            );

          setPrintMessage(
            `Preparing label ${
              index + 1
            } of ${
              printJobs.length
            }: Batch ${batchId}, Roll ${
              roll?.roll_number ??
              roll?.id
            }`
          );

          console.log(
            "Printing batch roll QR:",
            qrUrl
          );

          const {
            label,
            objectNames,
          } = await loadDymoLabel(
            qrUrl
          );

          populateBatchRollLabel(
            label,
            objectNames,
            batch,
            roll,
            qrUrl
          );

          const printParamsXml =
            framework.createLabelWriterPrintParamsXml(
              {
                copies: 1,
                jobTitle: `Batch ${batchId} - Roll ${
                  roll?.roll_number ??
                  roll?.id
                }`,
                printQuality:
                  "BarcodeAndGraphics",
              }
            );

          const populatedLabelXml =
            label.getLabelXml();

          const escapedQrUrl =
            qrUrl.replace(
              /&/g,
              "&amp;"
            );

          const containsQr =
            populatedLabelXml.includes(
              qrUrl
            ) ||
            populatedLabelXml.includes(
              escapedQrUrl
            );

          console.log(
            "Final label contains QR:",
            containsQr,
            qrUrl
          );

          if (!containsQr) {
            throw new Error(
              `The generated label XML does not contain the QR URL for batch ${batchId}, roll ${roll?.id}.`
            );
          }

          framework.printLabel(
            selectedDymoPrinter,
            printParamsXml,
            populatedLabelXml
          );

          submittedRollIds.push(
            roll?.id
          );

          if (
            !successfulJobsByBatch.has(
              batchId
            )
          ) {
            successfulJobsByBatch.set(
              batchId,
              {
                totalPending: 0,
                submitted: 0,
              }
            );
          }

          const batchStatus =
            successfulJobsByBatch.get(
              batchId
            );

          batchStatus.submitted += 1;

          /*
           * Avoid flooding the local DYMO Web Service.
           */
          await wait(800);
        }

        selected.forEach((batch) => {
          const batchId =
            getBatchId(batch);

          const pendingRollCount =
            (batch?.rolls || []).filter(
              (roll) =>
                roll?.label_generated !==
                true
            ).length;

          if (
            successfulJobsByBatch.has(
              batchId
            )
          ) {
            successfulJobsByBatch.get(
              batchId
            ).totalPending =
              pendingRollCount;
          }
        });

        /*
         * Mark only batches where every pending roll
         * was successfully submitted to DYMO.
         */
        const completelySubmittedBatchIds =
          Array.from(
            successfulJobsByBatch.entries()
          )
            .filter(
              ([, status]) =>
                status.totalPending > 0 &&
                status.submitted ===
                  status.totalPending
            )
            .map(
              ([batchId]) => batchId
            )
            .filter(
              (batchId) =>
                batchId !== null &&
                batchId !== undefined
            );

        if (
          completelySubmittedBatchIds.length
        ) {
          await markLabelsGeneratedByBatchIds(
            completelySubmittedBatchIds
          );
        }

        setPrintMessage(
          `${submittedRollIds.length} roll label${
            submittedRollIds.length ===
            1
              ? ""
              : "s"
          } sent to ${selectedDymoPrinter}.`
        );

        setSelectedBatches([]);

        await fetchBatches();
      } catch (err) {
        console.error(
          "Batch DYMO printing error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "Unable to print the selected batch labels."
        );
      } finally {
        setPrintingLabels(false);
      }
    };
    return (
  <Box
    sx={{
      background: theme.bg,
      minHeight: "100vh",
      p: 3,
    }}
  >
    {/* ================= HEADER ================= */}

    <Stack
      direction={{
        xs: "column",
        md: "row",
      }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: theme.text,
          }}
        >
          Stock Incoming Batches
        </Typography>

        <Typography
          sx={{
            color: theme.muted,
            fontSize: 14,
          }}
        >
          Print one DYMO label for every pending roll.
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        {/* DYMO Printer */}

        <FormControl
          size="small"
          sx={{
            minWidth: 260,
          }}
        >
          <InputLabel>
            DYMO Printer
          </InputLabel>

          <Select
            value={selectedDymoPrinter}
            label="DYMO Printer"
            disabled={
              dymoConnecting ||
              printingLabels
            }
            onChange={(e) =>
              setSelectedDymoPrinter(
                e.target.value
              )
            }
          >
            {!dymoPrinters.length && (
              <MenuItem value="">
                No Printer Found
              </MenuItem>
            )}

            {dymoPrinters.map(
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

        {/* PRINT */}

        <Button
          variant="contained"
          color="success"
          startIcon={
            printingLabels ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <PrintIcon />
            )
          }
          disabled={
            printingLabels ||
            dymoConnecting ||
            !selectedDymoPrinter ||
            selectedBatches.length === 0
          }
          onClick={
            printSelectedBatchLabels
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {printingLabels
            ? "Printing..."
            : `Print Labels (${selectedBatches.length})`}
        </Button>

        {/* RECONNECT */}

        <Button
          variant="outlined"
          onClick={
            initializeDymoPrinter
          }
          disabled={
            dymoConnecting ||
            printingLabels
          }
        >
          {dymoConnecting
            ? "Connecting..."
            : "Reconnect DYMO"}
        </Button>

        {/* REFRESH */}

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBatches}
        >
          Refresh
        </Button>

        {/* CREATE */}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            setOpenAdd(true)
          }
        >
          Create Batch
        </Button>
      </Stack>
    </Stack>

    {/* STATUS */}

    <Typography
      sx={{
        mb: 2,
        color: theme.muted,
      }}
    >
      Total Batches: {batches.length}
      {" | "}
      Showing: {filteredBatches.length}
      {" | "}
      Selected: {selectedBatches.length}
    </Typography>

    {error && (
      <Alert
        severity="error"
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    )}

    {printMessage && (
      <Alert
        severity="success"
        sx={{ mb: 2 }}
      >
        {printMessage}
      </Alert>
    )}

    {/* FILTERS */}

    <Paper
      sx={{
        p: 2,
        mb: 2,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
      >
        <TextField
          size="small"
          label="SKU"
          value={sku}
          onChange={(e) =>
            setSku(
              e.target.value
            )
          }
          fullWidth
        />

        <TextField
          size="small"
          label="Supplier"
          value={supplier}
          onChange={(e) =>
            setSupplier(
              e.target.value
            )
          }
          fullWidth
        />

        <TextField
          size="small"
          label="Batch"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>
            Label Status
          </InputLabel>

          <Select
            value={labelFilter}
            label="Label Status"
            onChange={(e) =>
              setLabelFilter(
                e.target.value
              )
            }
          >
            <MenuItem value="ALL">
              All
            </MenuItem>

            <MenuItem value="PRINTED">
              Printed
            </MenuItem>

            <MenuItem value="NOT_PRINTED">
              Pending
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="date"
          size="small"
          value={dateFrom}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) =>
            setDateFrom(
              e.target.value
            )
          }
        />

        <TextField
          type="date"
          size="small"
          value={dateTo}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) =>
            setDateTo(
              e.target.value
            )
          }
        />

        <Button
          variant="contained"
          onClick={fetchBatches}
        >
          Filter
        </Button>
      </Stack>
    </Paper>

    {/* LIST */}

    <Paper>

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: 2,
          py: 1.5,
        }}
      >
        <Checkbox
          checked={allSelected}
          indeterminate={
            partiallySelected
          }
          onChange={
            handleSelectAll
          }
        />

        <Typography
          fontWeight={700}
        >
          Select All
        </Typography>
      </Stack>

      <Divider />

      {loading ? (
        <Box
          sx={{
            p: 5,
            textAlign: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        filteredBatches.map(
          (batch) => {
            const batchId =
              getBatchId(batch);

            const printed =
              areAllRollLabelsGenerated(
                batch
              );

            return (
              <Box
                key={batchId}
                sx={{
                  p: 2,
                  borderBottom:
                    "1px solid #eee",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                  >
                    <Checkbox
                      checked={selectedBatches.includes(
                        batchId
                      )}
                      disabled={
                        printed
                      }
                      onChange={() =>
                        handleSelectBatch(
                          batchId
                        )
                      }
                    />

                    <Box>
                      <Typography
                        fontWeight={700}
                      >
                        {batch.product_name}
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        SKU:
                        {batch.sku}
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        Supplier:
                        {
                          batch.supplier
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        Rolls:
                        {
                          batch.roll_count
                        }
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Chip
                      color={
                        printed
                          ? "success"
                          : "warning"
                      }
                      label={
                        printed
                          ? "Printed"
                          : "Pending"
                      }
                    />

                    <Tooltip title="View">
                      <IconButton
                        onClick={() =>
                          openDetail(
                            batchId
                          )
                        }
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
            );
          }
        )
      )}

    </Paper>

        {/* CREATE BATCH DIALOG */}

    <Dialog
      open={openAdd}
      onClose={() => {
        if (!printingLabels) {
          setOpenAdd(false);
        }
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Create Incoming Batch

        <IconButton
          onClick={() => setOpenAdd(false)}
          disabled={printingLabels}
        >
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

    {/* BATCH DETAIL DIALOG */}

    <Dialog
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Batch Detail

        <IconButton
          onClick={() => setDetailOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {detailLoading ? (
          <Stack
            alignItems="center"
            sx={{ py: 5 }}
          >
            <CircularProgress />
          </Stack>
        ) : batchDetail ? (
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                background: theme.bg,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                Batch:{" "}
                {safe(
                  getBatchId(batchDetail)
                )}
              </Typography>

              <Typography>
                SKU:{" "}
                {safe(batchDetail?.sku)}
              </Typography>

              <Typography>
                Stock Item:{" "}
                {safe(
                  batchDetail?.stock_item
                )}
              </Typography>

              <Typography>
                Supplier:{" "}
                {safe(
                  batchDetail?.supplier
                )}
              </Typography>

              <Typography>
                Product:{" "}
                {safe(
                  batchDetail?.product_name
                )}
              </Typography>

              <Typography>
                Total Meterage:{" "}
                {safe(
                  batchDetail?.total_meterage
                )}{" "}
                mtr
              </Typography>

              <Typography>
                Roll Count:{" "}
                {safe(
                  batchDetail?.roll_count
                )}
              </Typography>

              <Typography>
                Batch Date:{" "}
                {safe(
                  batchDetail?.batch_date
                )}
              </Typography>
            </Paper>

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                Rolls
              </Typography>

              <Stack spacing={1}>
                {(batchDetail?.rolls || []).map(
                  (roll, index) => {
                    let qrUrl = "";

                    try {
                        qrUrl =
                          buildBatchRollQrUrl(
                            batchDetail,
                            roll,
                            userTypeObject
                          );
                    } catch (err) {
                      console.error(
                        "Unable to create roll QR URL:",
                        err
                      );
                    }

                    return (
                      <Paper
                        key={
                          roll?.id || index
                        }
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ minWidth: 0, flex: 1 }}
                          >
                            {qrUrl && (
                              <Box
                                component="a"
                                href={qrUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open details for roll ${roll?.roll_number ?? roll?.id}`}
                                sx={{
                                  display: "inline-flex",
                                  p: 1,
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: 2,
                                  backgroundColor: "#fff",
                                  flexShrink: 0,
                                  cursor: "pointer",
                                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                                  "&:hover": {
                                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.16)",
                                    transform: "translateY(-1px)",
                                  },
                                }}
                              >
                                <QRCodeCanvas
                                  value={qrUrl}
                                  size={128}
                                  level="M"
                                  includeMargin
                                />
                              </Box>
                            )}

                            <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              Roll #
                              {safe(
                                roll?.roll_number
                              )}
                              {" — "}
                              {safe(
                                roll?.meterage
                              )}{" "}
                              mtr
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 13,
                                color: theme.muted,
                              }}
                            >
                              Roll ID:{" "}
                              {safe(roll?.id)}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 13,
                                color: theme.muted,
                              }}
                            >
                              Created At:{" "}
                              {safe(
                                roll?.created_at
                              )}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 13,
                                color: theme.muted,
                              }}
                            >
                              Label Generated At:{" "}
                              {safe(
                                roll?.label_generated_at
                              )}
                            </Typography>

                              {qrUrl && (
                                <Typography
                                  component="a"
                                  href={qrUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    display: "block",
                                    mt: 0.75,
                                    fontSize: 12,
                                    color: theme.accent,
                                    wordBreak: "break-all",
                                    textDecoration: "none",
                                    "&:hover": {
                                      textDecoration: "underline",
                                    },
                                  }}
                                >
                                  Open roll details: {qrUrl}
                                </Typography>
                              )}
                            </Box>
                          </Stack>

                          <Chip
                            size="small"
                            label={
                              roll?.label_generated
                                ? "Label Printed"
                                : "Label Pending"
                            }
                            sx={{
                              width: "fit-content",
                              background:
                                roll?.label_generated
                                  ? theme.successSoft
                                  : theme.warnSoft,
                              color:
                                roll?.label_generated
                                  ? theme.success
                                  : theme.warn,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Paper>
                    );
                  }
                )}
              </Stack>
            </Box>

            <Button
              startIcon={
                <CheckCircleIcon />
              }
              variant="contained"
              onClick={() =>
                markSingleBatchLabelsGenerated(
                  getBatchId(batchDetail)
                )
              }
              disabled={detailLoading}
              sx={{
                textTransform: "none",
                background: theme.success,
              }}
            >
              Mark This Batch Labels Generated
            </Button>
          </Stack>
        ) : (
          <Typography
            sx={{
              py: 4,
              textAlign: "center",
              color: theme.muted,
            }}
          >
            Batch detail is not available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  </Box>
);
};

export default BatchesList;