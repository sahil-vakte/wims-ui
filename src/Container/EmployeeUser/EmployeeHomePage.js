// import React, { useEffect, useRef, useState } from "react";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Paper,
//   Stack,
//   Typography,
//   Avatar,
//   useMediaQuery,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
// import LogoutIcon from "@mui/icons-material/Logout";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import { Html5Qrcode } from "html5-qrcode";
// import { useNavigate } from "react-router-dom";
// import { getDecryptedData } from "../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const THEME_BLUE = "#3b82f6";
// const THEME_BLUE_LIGHT = "#60a5fa";
// const THEME_BLUE_DARK = "#2563eb";
// const BG_GRADIENT = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
// const CARD_BG = "rgba(30, 41, 59, 0.6)";
// const BORDER = "rgba(148, 163, 184, 0.15)";

// const EmployeeHomePage = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const user = getDecryptedData();
//   const scannerRef = useRef(null);
//   const scannedRef = useRef(false);

//   const [scannerOpen, setScannerOpen] = useState(false);
//   const [logoutOpen, setLogoutOpen] = useState(false);

//   // const getRouteFromQr = (qrValue) => {
//   //   try {
//   //     const url = new URL(qrValue);
//   //     return `${url.pathname}${url.search}${url.hash}`;
//   //   } catch {
//   //     return qrValue.startsWith("/") ? qrValue : `/${qrValue}`;
//   //   }
//   // };

//   const getRouteFromQr = (qrValue) => {
//   try {
//     const url = new URL(qrValue);

//     const orderId = url.searchParams.get("wims_order_id");
//     const itemId = url.searchParams.get("wims_item_id");

//     if (orderId && itemId) {
//       return `/employee-user/order-process-item/${orderId}/${itemId}`;
//     }

//     return `${url.pathname}${url.search}${url.hash}`;
//   } catch {
//     return qrValue.startsWith("/") ? qrValue : `/${qrValue}`;
//   }
// };

//   const stopScanner = async () => {
//     try {
//       if (scannerRef.current?.isScanning) {
//         await scannerRef.current.stop();
//       }
//       await scannerRef.current?.clear?.();
//     } catch (error) {
//       console.warn("Scanner cleanup failed", error);
//     } finally {
//       scannerRef.current = null;
//       scannedRef.current = false;
//     }
//   };

//   const confirmLogout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/", { replace: true });
//   };

//   useEffect(() => {
//     if (!scannerOpen) {
//       stopScanner();
//       return;
//     }

//     const timer = setTimeout(async () => {
//       const scannerElement = document.getElementById("employee-qr-reader");
//       if (!scannerElement || scannerRef.current) return;

//       const scanner = new Html5Qrcode("employee-qr-reader");
//       scannerRef.current = scanner;

//       const onScanSuccess = async (decodedText) => {
//         if (scannedRef.current) return;
//         scannedRef.current = true;

//         const route = getRouteFromQr(decodedText);

//         await stopScanner();
//         setScannerOpen(false);
//         navigate(route);
//       };

//       try {
//         await scanner.start(
//           { facingMode: { exact: "environment" } },
//           { fps: 10, qrbox: { width: 250, height: 250 } },
//           onScanSuccess,
//           () => {}
//         );
//       } catch (error) {
//         console.warn("Exact back camera failed, trying environment camera", error);
//         try {
//           await scanner.start(
//             { facingMode: "environment" },
//             { fps: 10, qrbox: { width: 250, height: 250 } },
//             onScanSuccess,
//             () => {}
//           );
//         } catch (fallbackError) {
//           console.error("Camera permission or back camera failed", fallbackError);
//           await stopScanner();
//           setScannerOpen(false);
//         }
//       }
//     }, 300);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [scannerOpen, navigate]);

//   const displayName = user?.username || user?.email || "Employee";
//   const initial = displayName.charAt(0).toUpperCase();

//   return (
//     <Box
//       sx={{
//         minHeight: "100dvh",
//         background: BG_GRADIENT,
//         px: { xs: 2, sm: 3 },
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         overflow: "hidden",
//       }}
//     >
//       <Paper
//         elevation={0}
//         sx={{
//           width: "100%",
//           maxWidth: 480,
//           p: { xs: 3, sm: 4.5 },
//           borderRadius: 4,
//           border: `1px solid ${BORDER}`,
//           bgcolor: CARD_BG,
//           backdropFilter: "blur(16px)",
//           boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
//           position: "relative",
//           overflow: "hidden",
//           "&::before": {
//             content: '""',
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             height: 4,
//             background: `linear-gradient(90deg, ${THEME_BLUE}, ${THEME_BLUE_LIGHT})`,
//           },
//         }}
//       >
//         <Stack spacing={3.5}>
//           {/* Profile header */}
//           <Stack direction="row" spacing={2} alignItems="center">
//             <Avatar
//               sx={{
//                 width: 56,
//                 height: 56,
//                 bgcolor: THEME_BLUE,
//                 fontWeight: 700,
//                 fontSize: "1.4rem",
//                 boxShadow: `0 6px 16px rgba(59, 130, 246, 0.4)`,
//               }}
//             >
//               {initial || <PersonOutlineIcon />}
//             </Avatar>
//             <Box sx={{ minWidth: 0 }}>
//               <Typography
//                 variant="h5"
//                 fontWeight={700}
//                 sx={{ color: "#f8fafc", lineHeight: 1.2 }}
//               >
//                 Welcome back
//               </Typography>
//               <Typography
//                 noWrap
//                 sx={{ color: "#94a3b8", fontSize: "0.95rem", mt: 0.25 }}
//               >
//                 {displayName}
//               </Typography>
//             </Box>
//           </Stack>

//           <Box
//             sx={{
//               height: "1px",
//               background: BORDER,
//             }}
//           />

//           {/* Actions */}
//           <Stack spacing={1.75}>
//             <Button
//               fullWidth
//               size="large"
//               variant="contained"
//               startIcon={<QrCodeScannerIcon />}
//               onClick={() => setScannerOpen(true)}
//               sx={{
//                 minHeight: 56,
//                 borderRadius: 2.5,
//                 textTransform: "none",
//                 fontWeight: 600,
//                 fontSize: "1.05rem",
//                 background: `linear-gradient(135deg, ${THEME_BLUE}, ${THEME_BLUE_DARK})`,
//                 boxShadow: "0 8px 20px rgba(59, 130, 246, 0.35)",
//                 "&:hover": {
//                   background: `linear-gradient(135deg, ${THEME_BLUE_LIGHT}, ${THEME_BLUE})`,
//                   boxShadow: "0 10px 26px rgba(59, 130, 246, 0.45)",
//                 },
//               }}
//             >
//               Scan QR
//             </Button>

//             <Button
//               fullWidth
//               size="large"
//               variant="outlined"
//               startIcon={<LogoutIcon />}
//               onClick={() => setLogoutOpen(true)}
//               sx={{
//                 minHeight: 52,
//                 borderRadius: 2.5,
//                 textTransform: "none",
//                 fontWeight: 600,
//                 fontSize: "1rem",
//                 color: "#f87171",
//                 borderColor: "rgba(248, 113, 113, 0.3)",
//                 bgcolor: "rgba(248, 113, 113, 0.08)",
//                 "&:hover": {
//                   bgcolor: "rgba(248, 113, 113, 0.15)",
//                   borderColor: "rgba(248, 113, 113, 0.5)",
//                 },
//               }}
//             >
//               Logout
//             </Button>
//           </Stack>
//         </Stack>
//       </Paper>

//       {/* QR Scanner Dialog */}
//       <Dialog
//         open={scannerOpen}
//         onClose={() => setScannerOpen(false)}
//         fullWidth
//         maxWidth="sm"
//         fullScreen={isMobile}
//         keepMounted
//         PaperProps={{
//           sx: {
//             borderRadius: isMobile ? 0 : 4,
//             background: BG_GRADIENT,
//             border: `1px solid ${BORDER}`,
//           },
//         }}
//       >
//         <DialogTitle fontWeight={700} sx={{ color: "#f8fafc", pb: 1 }}>
//           Scan QR Code
//         </DialogTitle>
//         <DialogContent sx={{ pt: 1 }}>
//           <Box
//             id="employee-qr-reader"
//             sx={{
//               width: "100%",
//               minHeight: 320,
//               overflow: "hidden",
//               borderRadius: 3,
//               border: `1px solid ${BORDER}`,
//               "& video": {
//                 width: "100% !important",
//                 borderRadius: 3,
//               },
//             }}
//           />
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2.5 }}>
//           <Button
//             onClick={() => setScannerOpen(false)}
//             sx={{
//               textTransform: "none",
//               fontWeight: 600,
//               color: "#94a3b8",
//               borderRadius: 2,
//               px: 3,
//             }}
//           >
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Logout Confirmation Dialog */}
//       <Dialog
//         open={logoutOpen}
//         onClose={() => setLogoutOpen(false)}
//         fullWidth
//         maxWidth="xs"
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             background: BG_GRADIENT,
//             border: `1px solid ${BORDER}`,
//           },
//         }}
//       >
//         <DialogTitle fontWeight={700} sx={{ color: "#f8fafc" }}>
//           Confirm Logout
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ color: "#94a3b8" }}>
//             Are you sure you want to logout?
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//           <Button
//             onClick={() => setLogoutOpen(false)}
//             sx={{
//               textTransform: "none",
//               fontWeight: 600,
//               color: "#94a3b8",
//               borderRadius: 2,
//               px: 3,
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={confirmLogout}
//             startIcon={<LogoutIcon />}
//             sx={{
//               textTransform: "none",
//               fontWeight: 600,
//               borderRadius: 2,
//               bgcolor: "#ef4444",
//               boxShadow: "none",
//               "&:hover": {
//                 bgcolor: "#dc2626",
//                 boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
//               },
//             }}
//           >
//             Logout
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default EmployeeHomePage;








import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { getDecryptedData } from "../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const THEME_BLUE = "#3b82f6";
const THEME_BLUE_LIGHT = "#60a5fa";
const THEME_BLUE_DARK = "#2563eb";
const BG_GRADIENT = "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
const CARD_BG = "rgba(30, 41, 59, 0.6)";
const BORDER = "rgba(148, 163, 184, 0.15)";

const EmployeeHomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const user = getDecryptedData();
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // const getRouteFromQr = (qrValue) => {
  //   try {
  //     const url = new URL(qrValue);
  //     return `${url.pathname}${url.search}${url.hash}`;
  //   } catch {
  //     return qrValue.startsWith("/") ? qrValue : `/${qrValue}`;
  //   }
  // };

  const getRouteFromQr = (qrValue) => {
    try {
      /*
       * Printed QR points to the public child product URL:
       *
       * https://www.tiaknightfabrics.co.uk/product-path
       *   ?wims_order_id=972&wims_item_id=2932
       *
       * Because this function runs ONLY inside the logged-in WIMS scanner,
       * the WIMS IDs are used to navigate to the internal processing screen.
       *
       * A normal phone camera never executes this function, so it simply
       * opens the public child_product_url encoded in the QR.
       */
      const url = new URL(qrValue);

      const orderId = url.searchParams.get("wims_order_id");
      const itemId = url.searchParams.get("wims_item_id");

      if (orderId && itemId) {
        return `/employee-user/order-process-item/${encodeURIComponent(
          orderId,
        )}/${encodeURIComponent(itemId)}`;
      }

      /*
       * Backward compatibility with older labels which may contain the
       * direct WIMS processing URL.
       */
      const internalMatch = url.pathname.match(
        /^\/employee-user\/order-process-item\/(\d+)\/(\d+)\/?$/,
      );

      if (internalMatch) {
        return `/employee-user/order-process-item/${internalMatch[1]}/${internalMatch[2]}`;
      }

      /*
       * No WIMS metadata: preserve the scanned path.
       */
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return qrValue.startsWith("/") ? qrValue : `/${qrValue}`;
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.clear?.();
    } catch (error) {
      console.warn("Scanner cleanup failed", error);
    } finally {
      scannerRef.current = null;
      scannedRef.current = false;
    }
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!scannerOpen) {
      stopScanner();
      return;
    }

    const timer = setTimeout(async () => {
      const scannerElement = document.getElementById("employee-qr-reader");
      if (!scannerElement || scannerRef.current) return;

      const scanner = new Html5Qrcode("employee-qr-reader");
      scannerRef.current = scanner;

      const onScanSuccess = async (decodedText) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        const route = getRouteFromQr(decodedText);

        await stopScanner();
        setScannerOpen(false);
        navigate(route);
      };

      try {
        await scanner.start(
          { facingMode: { exact: "environment" } },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          () => {}
        );
      } catch (error) {
        console.warn("Exact back camera failed, trying environment camera", error);
        try {
          await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            () => {}
          );
        } catch (fallbackError) {
          console.error("Camera permission or back camera failed", fallbackError);
          await stopScanner();
          setScannerOpen(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [scannerOpen, navigate]);

  const displayName = user?.username || user?.email || "Employee";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        background: BG_GRADIENT,
        px: { xs: 2, sm: 3 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 4,
          border: `1px solid ${BORDER}`,
          bgcolor: CARD_BG,
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${THEME_BLUE}, ${THEME_BLUE_LIGHT})`,
          },
        }}
      >
        <Stack spacing={3.5}>
          {/* Profile header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: THEME_BLUE,
                fontWeight: 700,
                fontSize: "1.4rem",
                boxShadow: `0 6px 16px rgba(59, 130, 246, 0.4)`,
              }}
            >
              {initial || <PersonOutlineIcon />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: "#f8fafc", lineHeight: 1.2 }}
              >
                Welcome back
              </Typography>
              <Typography
                noWrap
                sx={{ color: "#94a3b8", fontSize: "0.95rem", mt: 0.25 }}
              >
                {displayName}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              height: "1px",
              background: BORDER,
            }}
          />

          {/* Actions */}
          <Stack spacing={1.75}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScannerOpen(true)}
              sx={{
                minHeight: 56,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1.05rem",
                background: `linear-gradient(135deg, ${THEME_BLUE}, ${THEME_BLUE_DARK})`,
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.35)",
                "&:hover": {
                  background: `linear-gradient(135deg, ${THEME_BLUE_LIGHT}, ${THEME_BLUE})`,
                  boxShadow: "0 10px 26px rgba(59, 130, 246, 0.45)",
                },
              }}
            >
              Scan QR
            </Button>

            <Button
              fullWidth
              size="large"
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() => setLogoutOpen(true)}
              sx={{
                minHeight: 52,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: "#f87171",
                borderColor: "rgba(248, 113, 113, 0.3)",
                bgcolor: "rgba(248, 113, 113, 0.08)",
                "&:hover": {
                  bgcolor: "rgba(248, 113, 113, 0.15)",
                  borderColor: "rgba(248, 113, 113, 0.5)",
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* QR Scanner Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        keepMounted
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            background: BG_GRADIENT,
            border: `1px solid ${BORDER}`,
          },
        }}
      >
        <DialogTitle fontWeight={700} sx={{ color: "#f8fafc", pb: 1 }}>
          Scan QR Code
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box
            id="employee-qr-reader"
            sx={{
              width: "100%",
              minHeight: 320,
              overflow: "hidden",
              borderRadius: 3,
              border: `1px solid ${BORDER}`,
              "& video": {
                width: "100% !important",
                borderRadius: 3,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setScannerOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#94a3b8",
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: BG_GRADIENT,
            border: `1px solid ${BORDER}`,
          },
        }}
      >
        <DialogTitle fontWeight={700} sx={{ color: "#f8fafc" }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94a3b8" }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setLogoutOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#94a3b8",
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmLogout}
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: "#ef4444",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#dc2626",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeHomePage;
