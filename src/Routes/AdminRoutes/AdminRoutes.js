import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useMediaQuery } from '@mui/system'
import AdminSidebar from '../../Container/AdminUser/AdminSidebar'
import ColorsList from '../../Components/AdminUser/Colors/ColorsList'
import AdminRouteAccess from './AdminRouteAccess'
import ProductsList from '../../Components/AdminUser/Products/ProductsList'
import OrdersList from '../../Components/AdminUser/Orders/OrdersList'
import OrderProcessing from '../../Components/AdminUser/Orders/OrderProcessing'
import LocationsList from '../../Components/AdminUser/Locations/LocationsList'


const AdminRoutes = () => {
  const isLargeScreen = useMediaQuery("(min-width:1441px)");

  return (
    <div>
          <div>
      <AdminSidebar />
      <div style={{ marginLeft: isLargeScreen ? '250px' : '0', flexGrow: 1, padding: "10px" }}>

      <Routes>
          <Route path="/colors-library"  element={<ColorsList/>}/>
          <Route path="/products"  element={<ProductsList/>}/>
          <Route path="/orders"  element={<OrdersList/>}/>
          <Route path="/order-processing/:id"  element={<OrderProcessing/>}/>
          <Route path="/locations"  element={<LocationsList/>}/>
          
      </Routes>
    </div>
    </div>
    </div>
  )
}

export default AdminRoutes