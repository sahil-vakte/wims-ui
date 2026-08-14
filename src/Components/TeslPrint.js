
// import React, { useState } from "react";
// import { Button } from "@mui/material";
// import PrintIcon from "@mui/icons-material/Print";

// import PrinterService from "./PrinterService";

// const TeslPrint = () => {
//   const [printing, setPrinting] = useState(false);

//   const pdfUrl =
//     "https://www.wims.cloud/api/v1/orders/2495/shipping-label/public/eyJvcmRlcl9pZCI6MjQ5NSwic2hpcHBpbmdfbGFiZWxfZmlsZSI6InNoaXBwaW5nX2xhYmVscy9yb3lhbF9tYWlsL29yZGVyLTI0OTUtbGFiZWwucGRmIn0:1wuXSk:sSlu339apvn150GSsvnfPPMpBWNw0ctwhSMvQeQypUs/";

//   const handlePrint = async () => {
//     try {
//       setPrinting(true);

//       const printers = await PrinterService.getPrinters();

//       console.log("Available printers:", printers);

//       const tscPrinter = printers.find((printer) =>
//         printer.toLowerCase().includes("tsc")
//       );

//       if (!tscPrinter) {
//         alert("TSC printer not found.");
//         return;
//       }

//       const result = await PrinterService.printPdf(
//         pdfUrl,
//         tscPrinter
//       );

//       if (!result.success) {
//         alert(result.error);
//       }
//     } finally {
//       setPrinting(false);
//     }
//   };

//   return (
//     <Button
//       variant="contained"
//       startIcon={<PrintIcon />}
//       onClick={handlePrint}
//       disabled={printing}
//     >
//       {printing ? "Printing..." : "Print Label"}
//     </Button>
//   );
// };

// export default TeslPrint;


import React, {
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import {
  CheckCircleOutline,
  Print,
  Usb
} from "@mui/icons-material";

import PrinterService from "./PrinterService";

const TestPrint = () => {
  const [
    connecting,
    setConnecting
  ] = useState(false);

  const [
    printing,
    setPrinting
  ] = useState(false);

  const [
    printerName,
    setPrinterName
  ] = useState("");

  const [
    message,
    setMessage
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const pdfUrl =
    "https://www.wims.cloud/api/v1/orders/2495/shipping-label/public/eyJvcmRlcl9pZCI6MjQ5NSwic2hpcHBpbmdfbGFiZWxfZmlsZSI6InNoaXBwaW5nX2xhYmVscy9yb3lhbF9tYWlsL29yZGVyLTI0OTUtbGFiZWwucGRmIn0:1wuXSk:sSlu339apvn150GSsvnfPPMpBWNw0ctwhSMvQeQypUs/";

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ---------------------------------------------------------
  // TEST CONNECTION
  // ---------------------------------------------------------

  const handleConnect =
    async () => {
      clearMessages();

      setConnecting(true);

      try {
        const printer =
          await PrinterService.testPrinter();

        setPrinterName(
          printer
        );

        setMessage(
          `Connected successfully to ${printer}`
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.message ||
            "Unable to connect to printer"
        );
      } finally {
        setConnecting(false);
      }
    };

  // ---------------------------------------------------------
  // PRINT
  // ---------------------------------------------------------

  const handlePrint =
    async () => {
      clearMessages();

      setPrinting(true);

      try {
        const result =
          await PrinterService.printPdf({
            pdfUrl,

            width: 4,

            height: 6,

            copies: 1
          });

        if (!result.success) {
          throw new Error(
            result.error
          );
        }

        setPrinterName(
          result.printer
        );

        setMessage(
          `Shipping label sent successfully to ${result.printer}`
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.message ||
            "Unable to print label"
        );
      } finally {
        setPrinting(false);
      }
    };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 650,
        margin: "0 auto"
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2
        }}
      >
        <Stack
          spacing={3}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={600}
            >
              TSC Label Printer
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Direct 4 × 6 shipping
              label printing
            </Typography>
          </Box>

          <Divider />

          {printerName && (
            <Alert
              severity="success"
              icon={
                <CheckCircleOutline />
              }
            >
              Printer detected:
              {" "}
              <strong>
                {printerName}
              </strong>
            </Alert>
          )}

          {message && (
            <Alert
              severity="success"
            >
              {message}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
            >
              {error}
            </Alert>
          )}

          <Button
            variant="outlined"
            startIcon={
              connecting ? (
                <CircularProgress
                  size={18}
                />
              ) : (
                <Usb />
              )
            }
            onClick={
              handleConnect
            }
            disabled={
              connecting ||
              printing
            }
          >
            {connecting
              ? "Connecting..."
              : "Detect TSC Printer"}
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={
              printing ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Print />
              )
            }
            onClick={
              handlePrint
            }
            disabled={
              printing ||
              connecting
            }
          >
            {printing
              ? "Printing Label..."
              : "Print Shipping Label"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TestPrint;