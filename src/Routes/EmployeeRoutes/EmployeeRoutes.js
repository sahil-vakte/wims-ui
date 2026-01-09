

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useMediaQuery } from '@mui/system'
import AdminSidebar from '../../Container/AdminUser/AdminSidebar'
import OrdersList from '../../Components/AdminUser/Orders/OrdersList'
import OrderProcessing from '../../Components/AdminUser/Orders/OrderProcessing'
import EmployeeSidebar from '../../Container/EmployeeUser/EmployeeSidebar'
import OrderProcessByItem from '../../Components/AdminUser/Orders/OrderProcessByItem'


const EmployeeRoutes = () => {
  const isLargeScreen = useMediaQuery("(min-width:1441px)");

  return (
    <div>
          <div>
      <EmployeeSidebar />
      <div style={{ marginLeft: isLargeScreen ? '250px' : '0', flexGrow: 1, padding: "10px" }}>

      <Routes>
          <Route path="/my-orders"  element={<OrdersList/>}/>
          <Route path="/order-processing/:id"  element={<OrderProcessing/>}/>
          <Route path="/order-process-item/:orderId/:itemId"  element={<OrderProcessByItem/>}/>
          
      </Routes>
    </div>
    </div>
    </div>
  )
}

export default EmployeeRoutes