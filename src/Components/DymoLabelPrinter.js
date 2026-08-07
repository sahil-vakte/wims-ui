import React, { useCallback, useEffect, useState } from "react";

const LABEL_TEMPLATE_PATH = "/labels/shipping-label.dymo";

const DymoLabelPrinter = () => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [loadingPrinters, setLoadingPrinters] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "Shipping Label",
    name: "",
    address: "",
    orderNumber: "",
    copies: 1,
  });

  const getDymoFramework = () => {
    const framework = window?.dymo?.label?.framework;

    if (!framework) {
      throw new Error(
        "DYMO JavaScript Framework is not loaded. Check public/index.html."
      );
    }

    return framework;
  };

  const initializeDymo = useCallback(async () => {
    setLoadingPrinters(true);
    setStatus("Connecting to DYMO Web Service...");

    try {
      const framework = getDymoFramework();

      await new Promise((resolve, reject) => {
        framework.init(() => {
          try {
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      const environment = framework.checkEnvironment();

      if (!environment.isBrowserSupported) {
        throw new Error(
          environment.errorDetails ||
            "This browser is not supported by the DYMO Framework."
        );
      }

      if (!environment.isFrameworkInstalled) {
        throw new Error(
          "DYMO Connect Web Service was not detected. Install or start DYMO Connect for Desktop."
        );
      }

      if (!environment.isWebServicePresent) {
        throw new Error(
          "DYMO Web Service is not running. Start it from DYMO Connect."
        );
      }

      const installedPrinters = framework.getPrinters();

      const labelWriterPrinters = Array.from(installedPrinters || []).filter(
        (printer) =>
          printer &&
          (
            printer.printerType === "LabelWriterPrinter" ||
            printer.modelName?.toLowerCase().includes("labelwriter") ||
            printer.name?.toLowerCase().includes("labelwriter")
          )
      );

      if (!labelWriterPrinters.length) {
        throw new Error(
          "No DYMO LabelWriter printer was found. Check the USB connection and driver."
        );
      }

      setPrinters(labelWriterPrinters);
      setSelectedPrinter(labelWriterPrinters[0].name);
      setStatus(`Connected to ${labelWriterPrinters[0].name}.`);
    } catch (error) {
      console.error("DYMO initialization error:", error);
      setPrinters([]);
      setSelectedPrinter("");
      setStatus(error.message || "Unable to connect to the DYMO printer.");
    } finally {
      setLoadingPrinters(false);
    }
  }, []);

  useEffect(() => {
    initializeDymo();
  }, [initializeDymo]);

const loadLabel = async () => {
  const framework = window?.dymo?.label?.framework;

  if (!framework) {
    throw new Error(
      "DYMO framework is not loaded. Check the script in public/index.html."
    );
  }

  const templateUrl = `${process.env.PUBLIC_URL}/labels/shipping-label.dymo`;

  const response = await fetch(templateUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Could not load DYMO template. HTTP ${response.status}. ` +
        `Expected file at public/labels/shipping-label.dymo`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const labelXml = await response.text();

  console.log("Template URL:", templateUrl);
  console.log("Template content type:", contentType);
  console.log("Template start:", labelXml.substring(0, 250));

  if (!labelXml.trim()) {
    throw new Error("The DYMO label template file is empty.");
  }

  const lowerXml = labelXml.toLowerCase();

  if (
    contentType.includes("text/html") ||
    lowerXml.includes("<!doctype html") ||
    lowerXml.includes("<html")
  ) {
    throw new Error(
      "React returned index.html instead of the DYMO template. " +
        "Create public/labels/shipping-label.dymo."
    );
  }

  let label;

  try {
    label = framework.openLabelXml(labelXml);
  } catch (error) {
    console.error("DYMO XML parsing error:", error);

    throw new Error(
      "The file was found, but it is not valid DYMO label XML. " +
        "Open and save the template using DYMO Connect for Desktop."
    );
  }

  const objectNames = Array.from(label.getObjectNames?.() || []);

  console.log("DYMO label objects:", objectNames);

  if (!objectNames.length) {
    console.warn(
      "The template was opened, but it does not contain named editable objects."
    );
  }

  return label;
};

  const setLabelObjectText = (label, objectName, value) => {
    try {
      const objectNames =
        typeof label.getObjectNames === "function"
          ? Array.from(label.getObjectNames() || [])
          : [];

      if (objectNames.length && !objectNames.includes(objectName)) {
        console.warn(
          `Object "${objectName}" does not exist in the DYMO template.`
        );
        return;
      }

      label.setObjectText(objectName, String(value ?? ""));
    } catch (error) {
      console.warn(`Could not set DYMO object "${objectName}".`, error);
    }
  };

  const prepareLabel = async () => {
    const label = await loadLabel();

    setLabelObjectText(label, "TITLE", formData.title);
    setLabelObjectText(label, "NAME", formData.name);
    setLabelObjectText(label, "ADDRESS", formData.address);
    setLabelObjectText(label, "ORDER_NUMBER", formData.orderNumber);

    return label;
  };

  const validateForm = () => {
    if (!selectedPrinter) {
      throw new Error("Select a DYMO printer.");
    }

    if (!formData.name.trim()) {
      throw new Error("Enter the customer name.");
    }

    if (!formData.address.trim()) {
      throw new Error("Enter the address.");
    }

    const copies = Number(formData.copies);

    if (!Number.isInteger(copies) || copies < 1 || copies > 100) {
      throw new Error("Copies must be between 1 and 100.");
    }
  };

  const handlePreview = async () => {
    setStatus("Generating label preview...");

    try {
      validateForm();

      const label = await prepareLabel();

      const renderParamsXml = window.dymo.label.framework.createLabelRenderParamsXml(
        {
          shadowDepth: 0,
          flowDirection: "LeftToRight",
        }
      );

      const base64Image = label.render(renderParamsXml, selectedPrinter);

      setPreviewUrl(`data:image/png;base64,${base64Image}`);
      setStatus("Preview generated successfully.");
    } catch (error) {
      console.error("Preview error:", error);
      setPreviewUrl("");
      setStatus(error.message || "Unable to generate preview.");
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    setStatus("Sending label to printer...");

    try {
      validateForm();

      const label = await prepareLabel();
      const copies = Number(formData.copies);

      const printParamsXml =
        window.dymo.label.framework.createLabelWriterPrintParamsXml({
          copies,
          jobTitle: `Order ${formData.orderNumber || "Label"}`,
          printQuality: "Text",
        });

      label.print(selectedPrinter, printParamsXml);

      setStatus(
        `${copies} label${copies > 1 ? "s" : ""} sent to ${selectedPrinter}.`
      );
    } catch (error) {
      console.error("DYMO print error:", error);
      setStatus(error.message || "Unable to print the label.");
    } finally {
      setPrinting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 12,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>DYMO LabelWriter Printer</h2>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="printer">
          <strong>Printer</strong>
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <select
            id="printer"
            value={selectedPrinter}
            disabled={loadingPrinters}
            onChange={(event) => setSelectedPrinter(event.target.value)}
            style={{
              flex: 1,
              minHeight: 40,
              padding: 8,
            }}
          >
            <option value="">
              {loadingPrinters
                ? "Searching for printers..."
                : "Select printer"}
            </option>

            {printers.map((printer) => (
              <option key={printer.name} value={printer.name}>
                {printer.name}
              </option>
            ))}
          </select>

          <button type="button" onClick={initializeDymo}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Title
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 10,
              marginTop: 5,
            }}
          />
        </label>

        <label>
          Customer name
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer name"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 10,
              marginTop: 5,
            }}
          />
        </label>

        <label>
          Address
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full delivery address"
            rows={4}
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 10,
              marginTop: 5,
            }}
          />
        </label>

        <label>
          Order number
          <input
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            placeholder="ORD-1001"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 10,
              marginTop: 5,
            }}
          />
        </label>

        <label>
          Copies
          <input
            type="number"
            name="copies"
            min="1"
            max="100"
            value={formData.copies}
            onChange={handleChange}
            style={{
              display: "block",
              width: 120,
              padding: 10,
              marginTop: 5,
            }}
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={handlePreview}
          disabled={!selectedPrinter || printing}
        >
          Preview
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!selectedPrinter || printing}
        >
          {printing ? "Printing..." : "Print Label"}
        </button>
      </div>

      {status && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 6,
          }}
        >
          {status}
        </div>
      )}

      {previewUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Preview</h3>
          <img
            src={previewUrl}
            alt="DYMO label preview"
            style={{
              maxWidth: "100%",
              border: "1px solid #ddd",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DymoLabelPrinter;