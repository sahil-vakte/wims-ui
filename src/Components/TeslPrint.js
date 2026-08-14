
import React, { useState } from "react";
import { Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

import PrinterService from "./PrinterService";

const TeslPrint = () => {
  const [printing, setPrinting] = useState(false);

  const pdfUrl =
    "https://www.wims.cloud/api/v1/orders/2495/shipping-label/public/eyJvcmRlcl9pZCI6MjQ5NSwic2hpcHBpbmdfbGFiZWxfZmlsZSI6InNoaXBwaW5nX2xhYmVscy9yb3lhbF9tYWlsL29yZGVyLTI0OTUtbGFiZWwucGRmIn0:1wuXSk:sSlu339apvn150GSsvnfPPMpBWNw0ctwhSMvQeQypUs/";

  const handlePrint = async () => {
    try {
      setPrinting(true);

      const printers = await PrinterService.getPrinters();

      console.log("Available printers:", printers);

      const tscPrinter = printers.find((printer) =>
        printer.toLowerCase().includes("tsc")
      );

      if (!tscPrinter) {
        alert("TSC printer not found.");
        return;
      }

      const result = await PrinterService.printPdf(
        pdfUrl,
        tscPrinter
      );

      if (!result.success) {
        alert(result.error);
      }
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={<PrintIcon />}
      onClick={handlePrint}
      disabled={printing}
    >
      {printing ? "Printing..." : "Print Label"}
    </Button>
  );
};

export default TeslPrint;