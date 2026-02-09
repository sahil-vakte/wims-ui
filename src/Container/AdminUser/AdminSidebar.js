import React, { useState } from 'react'
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import ClinicLogo from "../../Assets/WIMS_Logo_White.png";
import ClinicLogo from "../../Assets/darklogonew.png";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HealingIcon from '@mui/icons-material/Healing';
import MasksIcon from '@mui/icons-material/Masks';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { Collapse } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { getDecryptedData, getDecryptedUserType } from '../../Services/LoginUserDetails.js/LoginUserSavedDetails';
import AppNavbar from './AppNavbar';
import ViewListIcon from '@mui/icons-material/ViewList';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';

export default function AdminSidebar() {
  const [state, setState] = React.useState({ left: false, top: false });
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const isLargeScreen = useMediaQuery("(min-width:1441px)");
  const location = useLocation();
  const navigate = useNavigate();
  const LoginUserDetails = getDecryptedData();
  const LoginUserType= getDecryptedUserType()
  const [openSection, setOpenSection] = useState(null); // 'clinic', 'wellness', 'membership'


  const fullName = `${LoginUserDetails?.fname || ""} ${LoginUserDetails?.lname || ""}`.trim();

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const handleLogoutConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.clear();
      setLoading(false);
      setOpenLogoutDialog(false);
      navigate("/staff-login");
    }, 2000);
  };

  const list = (anchor) => (
    <Box
      sx={{
        width: anchor === "top" || anchor === "bottom" ? "auto" : 250,
        background: "#094C9F",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderTopRightRadius: isLargeScreen ? 30 : 0,
        borderBottomRightRadius: 30,
        overflowX: "hidden",
      }}
      role="presentation"
      onClick={isLargeScreen ? null : toggleDrawer(anchor, false)}
      onKeyDown={isLargeScreen ? null : toggleDrawer(anchor, false)}
    >
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" }}>
        <img src={ClinicLogo} alt="Hospital Logo" style={{ maxWidth: "100%", maxHeight: 65 }} />
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1 }}>
  {/* Common Routes */}
  {[
    { text: "Colors Library", icon: <DashboardIcon />, path: "/admin-user/colors-library" },
    { text: "Products", icon: <ProductionQuantityLimitsIcon />, path: "/admin-user/products" },
    { text: "Locations", icon: <LocationOnIcon />, path: "/admin-user/locations" },
    { text: "Suppliers", icon: <CalendarMonthIcon />, path: "/admin-user/employees" },
    { text: "Stock Batches", icon: <LocalHospitalIcon />, path: "/admin-user/appointments" },
    { text: "Orders", icon: <ViewListIcon />, path: "/admin-user/orders" },
    { text: "Employees", icon: <BadgeIcon />, path: "/admin-user/customers" }
  ].map((item) => (
    <ListItem
      key={item.text}
      disablePadding
      sx={{
        backgroundColor: location.pathname === item.path ? "rgb(255 255 255 / 62%)" : "inherit",
        "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
        width: "100%",
      }}
    >
      <Link to={item.path} style={{ textDecoration: "none", color: "white", width: "100%" }}>
        <ListItemButton onClick={isLargeScreen ? null : toggleDrawer("left", false)}>
          <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      </Link>
    </ListItem>
  ))}

  {/* Admin-Only Routes Grouped */}
  {LoginUserType === "admin" && (
    <>
      {/* Clinic Management */}
      <ListItemButton onClick={() => setOpenSection(openSection === 'clinic' ? null : 'clinic')} sx={{ color: "white" }}>
        <ListItemIcon sx={{ color: "white" }}><AdminPanelSettingsIcon /></ListItemIcon>
        <ListItemText primary="Admin" />
         {openSection === 'clinic' ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openSection === 'clinic'} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {[
            { text: "Colors Library", icon: <DashboardIcon />, path: "/admin-user/colors-library" },
    { text: "Products", icon: <ProductionQuantityLimitsIcon />, path: "/admin-user/products" },
    { text: "Locations", icon: <LocationOnIcon />, path: "/admin-user/locations" },
    { text: "Suppliers", icon: <CalendarMonthIcon />, path: "/admin-user/employees" },
    { text: "Stock Batches", icon: <LocalHospitalIcon />, path: "/admin-user/appointments" },
    { text: "Orders", icon: <ViewListIcon />, path: "/admin-user/orders" },
    { text: "Employees", icon: <BadgeIcon />, path: "/admin-user/customers" }
          ].map((item) => (
            <ListItemButton
              key={item.text}
              sx={{ pl: 4, color: "white", backgroundColor: location.pathname === item.path ? "rgb(255 255 255 / 62%)" : "inherit" }}
              component={Link}
              to={item.path}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  )}
</List>

      {/* User Profile */}
      {fullName && (
        <ListItem disablePadding sx={{ width: "100%", mt: "auto" }}>
          <ListItemButton component={Link} to="/patient/profile" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary={fullName} />
          </ListItemButton>
        </ListItem>
      )} 

      {/* Logout Button */}
      <Box sx={{ paddingBottom: "10px" }}>
        <Divider />
        <ListItem disablePadding sx={{ width: "100%" }}>
          <ListItemButton onClick={() => setOpenLogoutDialog(true)} sx={{ color: "red" }}>
            <ListItemIcon>
              <PowerSettingsNewIcon sx={{ color: "red" }} />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: "white", fontWeight: "bold" }} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <div>
      {!isLargeScreen && <AppNavbar toggleDrawer={toggleDrawer} />}
      {isLargeScreen ? (
        <Drawer
          variant="permanent"
          anchor="left"
          open
          sx={{
            "& .MuiDrawer-paper": {
              width: 250,
              boxSizing: "border-box",
              background: "linear-gradient(135deg, #ffcbc9 0%, #fea5b8 30%, #e990c6 60%, #c196c1 100%)",
              borderTopRightRadius: 30,
              borderBottomRightRadius: 30,
              overflowX: "hidden",
            },
          }}
        >
          {list("left")}
        </Drawer>
      ) : (
        <SwipeableDrawer
          anchor="top"
          open={state.top}
          onClose={toggleDrawer("top", false)}
          onOpen={toggleDrawer("top", true)}
          sx={{
            "& .MuiDrawer-paper": {
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              background: "linear-gradient(135deg, #ffcbc9 0%, #fea5b8 30%, #e990c6 60%, #c196c1 100%)",
              overflowX: "hidden",
            },
          }}
        >
          {list("top")}
        </SwipeableDrawer>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)}>No</Button>
          <Button onClick={handleLogoutConfirm} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
