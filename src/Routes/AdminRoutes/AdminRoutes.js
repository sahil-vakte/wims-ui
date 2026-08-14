import React, { useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useMediaQuery } from '@mui/system'
import AdminSidebar from '../../Container/AdminUser/AdminSidebar'
import ColorsList from '../../Components/AdminUser/Colors/ColorsList'
import AdminRouteAccess from './AdminRouteAccess'
import ProductsList from '../../Components/AdminUser/Products/ProductsList'
import OrdersList from '../../Components/AdminUser/Orders/OrdersList'
import OrderProcessing from '../../Components/AdminUser/Orders/OrderProcessing'
import LocationsList from '../../Components/AdminUser/Locations/LocationsList'
import EmployeesList from '../../Components/AdminUser/Employees/EmployeesList'
import OrderLabel from '../../Components/AdminUser/Orders/OrderLabel'
import OrderProcessByItem from '../../Components/AdminUser/Orders/OrderProcessByItem'
import { Box,Breadcrumbs, Typography, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BatchesList from '../../Components/AdminUser/Batches/BatchesList'
import Dashboard from '../../Components/Dashboard/Dashboard'
import OrderBatchManager from '../../Components/AdminUser/Orders/OrderBatchManager'
import PrintTest from '../../Components/TeslPrint'

const TopBar = ({ onMenuClick }) => {
  const location = useLocation();
  const crumbs = location.pathname.split('/').filter(Boolean);
  return (
    <Box sx={{
      position: 'sticky', top: 0, zIndex: 10,
      height: 60, px: 2, display: 'flex', alignItems: 'center', gap: 2,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <IconButton onClick={onMenuClick} size="small"><MenuIcon /></IconButton>
      <Breadcrumbs separator="›" sx={{ fontSize: 14 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none' }}>
          <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} /> Home
        </Link>
        {crumbs.map((c, i) => (
          <Typography key={i} sx={{ fontSize: 14, color: i === crumbs.length - 1 ? '#0f172a' : '#64748b', textTransform: 'capitalize' }}>
            {c.replace(/-/g, ' ')}
          </Typography>
        ))}
      </Breadcrumbs>
    </Box>
  );
};


const AdminRoutes = () => {
  const isLargeScreen = useMediaQuery("(min-width:1441px)");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // ✅ NEW

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}                // ✅ PASS
        setMobileOpen={setMobileOpen}          // ✅ PASS
      />

      <Box
        sx={{
          flexGrow: 1,
          ml: isLargeScreen ? (collapsed ? "72px" : "260px") : 0,
        }}
      >
        <TopBar
          onMenuClick={() => {
            if (isLargeScreen) {
              setCollapsed(prev => !prev);
            } else {
              setMobileOpen(true); // ✅ OPEN DRAWER
            }
          }}
        />

        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/colors-library" element={<ColorsList />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/order-processing/:id" element={<OrderProcessing />} />
            <Route path="/locations" element={<LocationsList />} />
            <Route path="/employees" element={<EmployeesList />} />
            <Route path="/order-label" element={<OrderLabel />} />
            <Route path="/order-batch-manager" element={<OrderBatchManager/>} />
            <Route path="/batches" element={<BatchesList/>} />
            <Route path="/order-process-item/:orderId/:itemId" element={<OrderProcessByItem />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminRoutes


// import React, { useState } from 'react';
// import { Route, Routes, useLocation, Link } from 'react-router-dom';
// import { Box, useMediaQuery, Breadcrumbs, Typography, IconButton } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// import HomeIcon from '@mui/icons-material/Home';
// import AdminSidebar from '../../Container/AdminUser/AdminSidebar';
// import AdminRouteAccess from './AdminRouteAccess';
// import ColorsList from '../../Components/AdminUser/Colors/ColorsList';
// import ProductsList from '../../Components/AdminUser/Products/ProductsList';
// import OrdersList from '../../Components/AdminUser/Orders/OrdersList';
// import OrderProcessing from '../../Components/AdminUser/Orders/OrderProcessing';
// import LocationsList from '../../Components/AdminUser/Locations/LocationsList';
// import EmployeesList from '../../Components/AdminUser/Employees/EmployeesList';
// import OrderLabel from '../../Components/AdminUser/Orders/OrderLabel';
// import OrderLabelTest from '../../Components/AdminUser/Orders/OrderLabelTest';
// import OrderProcessByItem from '../../Components/AdminUser/Orders/OrderProcessByItem';

// const DRAWER_W = 260;
// const MINI_W = 72;

// const TopBar = ({ onMenuClick }) => {
//   const location = useLocation();
//   const crumbs = location.pathname.split('/').filter(Boolean);
//   return (
//     <Box sx={{
//       position: 'sticky', top: 0, zIndex: 10,
//       height: 60, px: 2, display: 'flex', alignItems: 'center', gap: 2,
//       background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
//       borderBottom: '1px solid #e2e8f0',
//     }}>
//       <IconButton onClick={onMenuClick} size="small"><MenuIcon /></IconButton>
//       <Breadcrumbs separator="›" sx={{ fontSize: 14 }}>
//         <Link to="/" style={{ display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none' }}>
//           <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} /> Home
//         </Link>
//         {crumbs.map((c, i) => (
//           <Typography key={i} sx={{ fontSize: 14, color: i === crumbs.length - 1 ? '#0f172a' : '#64748b', textTransform: 'capitalize' }}>
//             {c.replace(/-/g, ' ')}
//           </Typography>
//         ))}
//       </Breadcrumbs>
//     </Box>
//   );
// };

// const AdminRoutes = () => {
//   const isLargeScreen = useMediaQuery('(min-width:1441px)');
//   const [collapsed, setCollapsed] = useState(false);
//   const sidebarWidth = isLargeScreen ? (collapsed ? MINI_W : DRAWER_W) : 0;

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
//       <AdminSidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed(c => !c)} />
//       <Box sx={{ flex: 1, ml: `${sidebarWidth}px`, transition: 'margin .25s ease', display: 'flex', flexDirection: 'column' }}>
//         <TopBar onMenuClick={() => setCollapsed(c => !c)} />
//         <Box component="main" sx={{ flex: 1, p: 3 }}>
//           <Routes>
//             <Route path="colors-library" element={<AdminRouteAccess><ColorsList /></AdminRouteAccess>} />
//             <Route path="products" element={<AdminRouteAccess><ProductsList /></AdminRouteAccess>} />
//             <Route path="locations" element={<AdminRouteAccess><LocationsList /></AdminRouteAccess>} />
//             <Route path="orders" element={<AdminRouteAccess><OrdersList /></AdminRouteAccess>} />
//             <Route path="order-processing/:id" element={<AdminRouteAccess><OrderProcessing /></AdminRouteAccess>} />
//             <Route path="order-process-by-item/:id" element={<AdminRouteAccess><OrderProcessByItem /></AdminRouteAccess>} />
//             <Route path="employees" element={<AdminRouteAccess><EmployeesList /></AdminRouteAccess>} />
//             <Route path="order-label" element={<AdminRouteAccess><OrderLabel /></AdminRouteAccess>} />
//             <Route path="order-label-test" element={<AdminRouteAccess><OrderLabelTest /></AdminRouteAccess>} />
//           </Routes>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default AdminRoutes;
