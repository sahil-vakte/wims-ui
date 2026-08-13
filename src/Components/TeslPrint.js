import React, { useState } from "react";
import axios from "axios";

const PDF_URL =
  "https://www.wims.cloud/api/v1/orders/2495/shipping-label/public/eyJvcmRlcl9pZCI6MjQ5NSwic2hpcHBpbmdfbGFiZWxfZmlsZSI6InNoaXBwaW5nX2xhYmVscy9yb3lhbF9tYWlsL29yZGVyLTI0OTUtbGFiZWwucGRmIn0:1wuXSk:sSlu339apvn150GSsvnfPPMpBWNw0ctwhSMvQeQypUs/";

const PrintTest = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openPDF = () => {
    window.open(PDF_URL, "_blank");
  };

  const printPDF = async () => {
    try {
      setLoading(true);
      setMessage("Sending PDF to printer...");

      const response = await fetch(PDF_URL);

      if (!response.ok) {
        throw new Error("Unable to download PDF");
      }

      const pdfBlob = await response.blob();

      const formData = new FormData();

      formData.append(
        "file",
        pdfBlob,
        "shipping-label-2495.pdf"
      );

      const printResponse = await axios.post(
        "http://localhost:9100/print-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(printResponse.data);

      setMessage("Print job sent successfully.");
    } catch (error) {
      console.error("Printing error:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Printing failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h2>TSC Printer Test</h2>

      <p>
        Order ID: <strong>2495</strong>
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={openPDF}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Open PDF
        </button>

        <button
          onClick={printPDF}
          disabled={loading}
          style={{
            padding: "12px 20px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Printing..." : "Print Label"}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PrintTest;