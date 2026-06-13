// import React, { useState } from 'react'
// import Box from "@mui/material/Box";
// import SwipeableDrawer from "@mui/material/SwipeableDrawer";
// import Drawer from "@mui/material/Drawer";
// import List from "@mui/material/List";
// import Divider from "@mui/material/Divider";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import EventNoteIcon from "@mui/icons-material/EventNote";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import PeopleIcon from "@mui/icons-material/People";
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// // import ClinicLogo from "../../Assets/WIMS_Logo_White.png";
// import ClinicLogo from "../../Assets/WIMS_Logo_White.png";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";
// import Button from "@mui/material/Button";
// import CircularProgress from "@mui/material/CircularProgress";
// import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
// import HealingIcon from '@mui/icons-material/Healing';
// import MasksIcon from '@mui/icons-material/Masks';
// import ExpandMore from '@mui/icons-material/ExpandMore';
// import ExpandLess from '@mui/icons-material/ExpandLess';
// import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
// import { Collapse } from '@mui/material';
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// import { getDecryptedData, getDecryptedUserType } from '../../Services/LoginUserDetails.js/LoginUserSavedDetails';
// import AppNavbar from './AppNavbar';
// import ViewListIcon from '@mui/icons-material/ViewList';
// import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import BadgeIcon from '@mui/icons-material/Badge';

// export default function AdminSidebar() {
//   const [state, setState] = React.useState({ left: false, top: false });
//   const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
//   const [loading, setLoading] = React.useState(false);
//   const isLargeScreen = useMediaQuery("(min-width:1441px)");
//   const location = useLocation();
//   const navigate = useNavigate();
//   const LoginUserDetails = getDecryptedData();
//   const LoginUserType= getDecryptedUserType()
//   const [openSection, setOpenSection] = useState(null); // 'clinic', 'wellness', 'membership'


//   const fullName = `${LoginUserDetails?.fname || ""} ${LoginUserDetails?.lname || ""}`.trim();

//   const toggleDrawer = (anchor, open) => (event) => {
//     if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
//       return;
//     }
//     setState({ ...state, [anchor]: open });
//   };

//   const handleLogoutConfirm = () => {
//     setLoading(true);
//     setTimeout(() => {
//       localStorage.clear();
//       setLoading(false);
//       setOpenLogoutDialog(false);
//       navigate("/");
//     }, 2000);
//   };

//   const list = (anchor) => (
//     <Box
//       sx={{
//         width: anchor === "top" || anchor === "bottom" ? "auto" : 250,
//         background: "#094C9F",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         borderTopRightRadius: isLargeScreen ? 30 : 0,
//         borderBottomRightRadius: 30,
//         overflowX: "hidden",
//       }}
//       role="presentation"
//       onClick={isLargeScreen ? null : toggleDrawer(anchor, false)}
//       onKeyDown={isLargeScreen ? null : toggleDrawer(anchor, false)}
//     >
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" }}>
//         <img src={ClinicLogo} alt="Hospital Logo" style={{ maxWidth: "100%", maxHeight: 65 }} />
//       </Box>
//       <Divider />

//       <List sx={{ flexGrow: 1 }}>
//   {/* Common Routes */}
//   {[
//     { text: "Colors Library", icon: <DashboardIcon />, path: "/admin-user/colors-library" },
//     { text: "Products", icon: <ProductionQuantityLimitsIcon />, path: "/admin-user/products" },
//     { text: "Locations", icon: <LocationOnIcon />, path: "/admin-user/locations" },
//     { text: "Orders", icon: <ViewListIcon />, path: "/admin-user/orders" },
//     { text: "Employees", icon: <BadgeIcon />, path: "/admin-user/employees" },
//     { text: "Order Label", icon: <ViewListIcon />, path: "/admin-user/order-label" },
//   ].map((item) => (
//     <ListItem
//       key={item.text}
//       disablePadding
//       sx={{
//         backgroundColor: location.pathname === item.path ? "rgb(255 255 255 / 62%)" : "inherit",
//         "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
//         width: "100%",
//       }}
//     >
//       <Link to={item.path} style={{ textDecoration: "none", color: "white", width: "100%" }}>
//         <ListItemButton onClick={isLargeScreen ? null : toggleDrawer("left", false)}>
//           <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
//           <ListItemText primary={item.text} />
//         </ListItemButton>
//       </Link>
//     </ListItem>
//   ))}

//   {/* Admin-Only Routes Grouped */}
//   {LoginUserType === "admin" && (
//     <>
//       {/* Clinic Management */}
//       <ListItemButton onClick={() => setOpenSection(openSection === 'clinic' ? null : 'clinic')} sx={{ color: "white" }}>
//         <ListItemIcon sx={{ color: "white" }}><AdminPanelSettingsIcon /></ListItemIcon>
//         <ListItemText primary="Admin" />
//          {openSection === 'clinic' ? <ExpandLess /> : <ExpandMore />}
//       </ListItemButton>
//       <Collapse in={openSection === 'clinic'} timeout="auto" unmountOnExit>
//         <List component="div" disablePadding>
//           {[
//             { text: "Colors Library", icon: <DashboardIcon />, path: "/admin-user/colors-library" },
//     { text: "Products", icon: <ProductionQuantityLimitsIcon />, path: "/admin-user/products" },
//     { text: "Locations", icon: <LocationOnIcon />, path: "/admin-user/locations" },
//     { text: "Suppliers", icon: <CalendarMonthIcon />, path: "/admin-user/employees" },
//     { text: "Stock Batches", icon: <LocalHospitalIcon />, path: "/admin-user/appointments" },
//     { text: "Orders", icon: <ViewListIcon />, path: "/admin-user/orders" },
//     { text: "Employees", icon: <BadgeIcon />, path: "/admin-user/employees" },
//     { text: "Order Label", icon: <ViewListIcon />, path: "/admin-user/order-label" },

//           ].map((item) => (
//             <ListItemButton
//               key={item.text}
//               sx={{ pl: 4, color: "white", backgroundColor: location.pathname === item.path ? "rgb(255 255 255 / 62%)" : "inherit" }}
//               component={Link}
//               to={item.path}
//             >
//               <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
//               <ListItemText primary={item.text} />
//             </ListItemButton>
//           ))}
//         </List>
//       </Collapse>
//     </>
//   )}
// </List>

//       {/* User Profile */}
//       {fullName && (
//         <ListItem disablePadding sx={{ width: "100%", mt: "auto" }}>
//           <ListItemButton component={Link} to="/patient/profile" sx={{ color: "white" }}>
//             <ListItemIcon sx={{ color: "white" }}>
//               <AccountCircleIcon />
//             </ListItemIcon>
//             <ListItemText primary={fullName} />
//           </ListItemButton>
//         </ListItem>
//       )} 

//       {/* Logout Button */}
//       <Box sx={{ paddingBottom: "10px" }}>
//         <Divider />
//         <ListItem disablePadding sx={{ width: "100%" }}>
//           <ListItemButton onClick={() => setOpenLogoutDialog(true)} sx={{ color: "red" }}>
//             <ListItemIcon>
//               <PowerSettingsNewIcon sx={{ color: "red" }} />
//             </ListItemIcon>
//             <ListItemText primary="Logout" sx={{ color: "white", fontWeight: "bold" }} />
//           </ListItemButton>
//         </ListItem>
//       </Box>
//     </Box>
//   );

//   return (
//     <div>
//       {!isLargeScreen && <AppNavbar toggleDrawer={toggleDrawer} />}
//       {isLargeScreen ? (
//         <Drawer
//           variant="permanent"
//           anchor="left"
//           open
//           sx={{
//             "& .MuiDrawer-paper": {
//               width: 250,
//               boxSizing: "border-box",
//               background: "linear-gradient(135deg, #ffcbc9 0%, #fea5b8 30%, #e990c6 60%, #c196c1 100%)",
//               borderTopRightRadius: 30,
//               borderBottomRightRadius: 30,
//               overflowX: "hidden",
//             },
//           }}
//         >
//           {list("left")}
//         </Drawer>
//       ) : (
//         <SwipeableDrawer
//           anchor="top"
//           open={state.top}
//           onClose={toggleDrawer("top", false)}
//           onOpen={toggleDrawer("top", true)}
//           sx={{
//             "& .MuiDrawer-paper": {
//               borderBottomLeftRadius: 30,
//               borderBottomRightRadius: 30,
//               background: "linear-gradient(135deg, #ffcbc9 0%, #fea5b8 30%, #e990c6 60%, #c196c1 100%)",
//               overflowX: "hidden",
//             },
//           }}
//         >
//           {list("top")}
//         </SwipeableDrawer>
//       )}

//       {/* Logout Confirmation Dialog */}
//       <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
//         <DialogTitle>Logout</DialogTitle>
//         <DialogContent>
//           <DialogContentText>Are you sure you want to logout?</DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenLogoutDialog(false)}>No</Button>
//           <Button onClick={handleLogoutConfirm} color="error" disabled={loading}>
//             {loading ? <CircularProgress size={24} /> : "Yes"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }




import React, { useState, useMemo } from 'react';
import {
  Box, SwipeableDrawer, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Collapse, Avatar, IconButton,
  Tooltip, TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button, CircularProgress, Typography,
  useMediaQuery,
} from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AppNavbar from './AppNavbar';
import {
  getDecryptedData, getDecryptedUserType,
} from '../../Services/LoginUserDetails.js/LoginUserSavedDetails';

const DRAWER_W = 260;
const MINI_W = 72;

const palette = {
  bgGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  accent: '#6366f1',
  accentSoft: 'rgba(99,102,241,0.15)',
  border: 'rgba(148,163,184,0.12)',
  hover: 'rgba(99,102,241,0.10)',
};

const commonItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-user/dashboard' },
  { text: 'Colors Library', icon: <ViewListIcon />, path: '/admin-user/colors-library' },
  { text: 'Products', icon: <ProductionQuantityLimitsIcon />, path: '/admin-user/products' },
  { text: 'Locations', icon: <LocationOnIcon />, path: '/admin-user/locations' },
  { text: 'Orders', icon: <BadgeIcon />, path: '/admin-user/orders' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/admin-user/employees' },
  { text: 'Order Label', icon: <BadgeIcon />, path: '/admin-user/order-label' },
  { text: 'Batches', icon: <LocalPharmacyIcon />, path: '/admin-user/batches' },
];

const adminGroups = [
  {
    key: 'clinic',
    label: 'Clinic Management',
    icon: <AdminPanelSettingsIcon />,
    items: [
      { text: 'Suppliers', icon: <PeopleIcon />, path: '/admin-user/suppliers' },
      { text: 'Stock Batches', icon: <LocalPharmacyIcon />, path: '/admin-user/stock-batches' },
      { text: 'Appointments', icon: <BadgeIcon />, path: '/admin-user/appointments' },
    ],
  },
];

export default function AdminSidebar({ collapsed, onToggleCollapsed, mobileOpen, 
  setMobileOpen  }) {
  const isLargeScreen = useMediaQuery('(min-width:1441px)');
  const location = useLocation();
  const navigate = useNavigate();
  const user = getDecryptedData();
  const role = getDecryptedUserType();
  const fullName = `${user?.fname || ''} ${user?.lname || ''}`.trim();

  // const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState('clinic');
  const [search, setSearch] = useState('');
  const [openLogout, setOpenLogout] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMini = isLargeScreen && collapsed;
  const width = isMini ? MINI_W : DRAWER_W;

  const filteredCommon = useMemo(
    () => commonItems.filter(i => i.text.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.clear();
      setLoading(false);
      setOpenLogout(false);
      navigate('/');
    }, 1200);
  };

  const itemSx = (active) => ({
    mx: 1, my: 0.5, borderRadius: '12px',
    color: active ? '#fff' : palette.text,
    background: active ? palette.accentSoft : 'transparent',
    position: 'relative',
    transition: 'all .2s ease',
    '&:hover': { background: palette.hover },
    '& .MuiListItemIcon-root': { color: active ? palette.accent : palette.textMuted, minWidth: 40 },
    ...(active && {
      '&::before': {
        content: '""', position: 'absolute', left: 0, top: 8, bottom: 8,
        width: 3, borderRadius: 4, background: palette.accent,
        boxShadow: `0 0 12px ${palette.accent}`,
      },
    }),
  });

  const renderItem = (item) => {
    const active = isActive(item.path);
    const btn = (
      <ListItemButton
        component={Link} to={item.path}
        onClick={() => !isLargeScreen && setMobileOpen(false)}
        sx={itemSx(active)}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        {!isMini && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }} />}
      </ListItemButton>
    );
    return (
      <ListItem key={item.path} disablePadding>
        {isMini ? <Tooltip title={item.text} placement="right" arrow>{btn}</Tooltip> : btn}
      </ListItem>
    );
  };

  const drawerBody = (
    <Box sx={{ width, height: '100%', background: palette.bgGradient, color: palette.text, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${palette.border}`, transition: 'width .25s ease' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: isMini ? 'center' : 'space-between', borderBottom: `1px solid ${palette.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: `linear-gradient(135deg, ${palette.accent}, #818cf8)`, display: 'grid', placeItems: 'center', boxShadow: `0 4px 14px ${palette.accentSoft}` }}>
            <DashboardIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          {!isMini && <Typography sx={{ fontWeight: 700, letterSpacing: 0.3 }}>WIMS Admin</Typography>}
        </Box>
        {isLargeScreen && !isMini && (
          <IconButton size="small" onClick={onToggleCollapsed} sx={{ color: palette.textMuted }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {isLargeScreen && isMini && (
        <IconButton size="small" onClick={onToggleCollapsed} sx={{ alignSelf: 'center', mt: 1, color: palette.textMuted }}>
          <ChevronRightIcon />
        </IconButton>
      )}

      {!isMini && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <TextField
            size="small" fullWidth placeholder="Search menu…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: palette.textMuted, fontSize: 18 }} /></InputAdornment>,
              sx: { color: palette.text, background: 'rgba(255,255,255,0.04)', borderRadius: '10px', '& fieldset': { borderColor: palette.border }, '&:hover fieldset': { borderColor: palette.accent }, fontSize: 13 },
            }}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { background: palette.border, borderRadius: 3 } }}>
        {!isMini && <Typography variant="caption" sx={{ px: 3, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Main</Typography>}
        <List dense>{filteredCommon.map(renderItem)}</List>

        {role === 'admin' && adminGroups.map(group => (
          <Box key={group.key}>
            {!isMini && <Typography variant="caption" sx={{ px: 3, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Admin</Typography>}
            <ListItemButton
              onClick={() => setOpenSection(openSection === group.key ? null : group.key)}
              sx={itemSx(false)}
            >
              <ListItemIcon>{group.icon}</ListItemIcon>
              {!isMini && (
                <>
                  <ListItemText primary={group.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                  {openSection === group.key ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
            <Collapse in={openSection === group.key && !isMini} timeout="auto" unmountOnExit>
              <List dense sx={{ pl: 2 }}>{group.items.map(renderItem)}</List>
            </Collapse>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderTop: `1px solid ${palette.border}`, p: 1.5 }}>
        {fullName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '12px', background: 'rgba(255,255,255,0.03)', mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36, background: `linear-gradient(135deg, ${palette.accent}, #818cf8)`, fontSize: 14, fontWeight: 600 }}>
              {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
            {!isMini && (
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>{fullName}</Typography>
                <Typography noWrap sx={{ fontSize: 11, color: palette.textMuted, textTransform: 'capitalize' }}>{role}</Typography>
              </Box>
            )}
          </Box>
        )}
        <ListItemButton onClick={() => setOpenLogout(true)} sx={{ ...itemSx(false), color: '#f87171', '& .MuiListItemIcon-root': { color: '#f87171', minWidth: 40 } }}>
          <ListItemIcon><PowerSettingsNewIcon /></ListItemIcon>
          {!isMini && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* {!isLargeScreen && <AppNavbar onMenuClick={() => setMobileOpen(true)} />} */}
      {isLargeScreen ? (
        <Drawer variant="permanent" open PaperProps={{ sx: { width, border: 0, background: 'transparent', overflow: 'hidden' } }}>
          {drawerBody}
        </Drawer>
      ) : (
        <SwipeableDrawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} onOpen={() => setMobileOpen(true)} PaperProps={{ sx: { width: DRAWER_W, border: 0 } }}>
          {drawerBody}
        </SwipeableDrawer>
      )}

      <Dialog open={openLogout} onClose={() => setOpenLogout(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 360 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Logout</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to logout?</DialogContentText></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenLogout(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleLogout} variant="contained" sx={{ background: palette.accent, '&:hover': { background: '#4f46e5' } }} disabled={loading}>
            {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Yes, Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
