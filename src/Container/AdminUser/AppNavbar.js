import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import format from "date-fns/format";
import enUS from "date-fns/locale/en-US"; 
import ClinicLogo from "../../Assets/WIMS_Logo_White.png"
import { ExitToApp } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { getDecryptedData, getDecryptedUserType } from "../../Services/LoginUserDetails.js/LoginUserSavedDetails";

function AppNavbar({ toggleDrawer }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isLargeScreen = useMediaQuery("(min-width:1440px)");
  const LoginUserData = getDecryptedData()
  const LoginUserType = getDecryptedUserType()
  const navigate = useNavigate();
  const theme = useTheme();
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    handleClose();
  };

  const handleLogoutConfirm = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
      if( LoginUserType === "Patient"){
        navigate('/');
      }
      else{
        navigate('/provider-emr-login');
      }
    }, 3000);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
    <AppBar position="static" sx={{ backgroundColor: 'white', color: "black" }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          {!isLargeScreen && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer("top", true)}
              sx={{ marginRight: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        <img src={ClinicLogo} alt="Hospital Logo" style={{ maxWidth: "100%", maxHeight: 65 }} />
          
        </Box>
        {isLargeScreen && (
            <Typography variant="body2" sx={{ marginLeft: 2 }}>
              {format(currentTime, "EEE, MMM d, yyyy | hh:mm:ss a", { locale: enUS })}
            </Typography>
          )}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="user account"
          onClick={handleMenu}
        >
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
        {/* <Link to= {LoginUserType === "Patient" ? "/patient/my-cosmos-profile": "/provider/my-cosmos-profile"} style={{textDecoration:"none",color:"black"}}>
          <MenuItem onClick={handleClose}>
          {LoginUserData?.fname.charAt(0).toUpperCase() + LoginUserData?.fname.slice(1)}{" "}
          {LoginUserData?.lname.charAt(0).toUpperCase() + LoginUserData?.lname.slice(1)}
        </MenuItem>
        </Link> */}
        <MenuItem onClick={handleLogoutClick}>
          <Button 
            startIcon={<ExitToApp />} 
            style={{ color: 'red' }} 
          >
            Logout
          </Button>
        </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
    <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">
          Logout Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout, 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} sx={{ color: theme.palette.secondary.main }}>
            No
          </Button>
          <Button onClick={handleLogoutConfirm} sx={{ color: theme.palette.primary.main }}>
          {isLoggingOut ? <CircularProgress size={24} /> : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>
      </>
  );
}

export default AppNavbar;
