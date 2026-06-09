import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LogoutIcon from "@mui/icons-material/Logout";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { getDecryptedData } from "../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const EmployeeHomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const user = getDecryptedData();
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);

  const [scannerOpen, setScannerOpen] = useState(false);

  const getRouteFromQr = (qrValue) => {
    try {
      const url = new URL(qrValue);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return qrValue.startsWith("/") ? qrValue : `/${qrValue}`;
    }
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.clear?.();
    } catch (error) {
      console.warn("Scanner cleanup failed", error);
    } finally {
      scannerRef.current = null;
      scannedRef.current = false;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!scannerOpen) {
      stopScanner();
      return;
    }

    const timer = setTimeout(() => {
      const scannerElement = document.getElementById("employee-qr-reader");
      if (!scannerElement || scannerRef.current) return;

      const scanner = new Html5QrcodeScanner(
        "employee-qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(async (decodedText) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        const route = getRouteFromQr(decodedText);

        await stopScanner();
        setScannerOpen(false);
        navigate(route);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [scannerOpen, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        display: "flex",
        justifyContent: "center",
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 520, p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Employee Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {user?.username || user?.email || "Employee"}
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScannerOpen(true)}
              sx={{ minHeight: 52 }}
            >
              Scan QR
            </Button>

            <Button
              fullWidth
              size="large"
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ minHeight: 52 }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        keepMounted
      >
        <DialogTitle fontWeight={700}>Scan QR Code</DialogTitle>
        <DialogContent>
          <Box
            id="employee-qr-reader"
            sx={{
              width: "100%",
              minHeight: 320,
              "& video": {
                width: "100% !important",
                borderRadius: 1,
              },
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeeHomePage;