import { Route, Routes } from 'react-router-dom';
import WebRoutes from './Routes/WebRoutes/WebRoutes';
import AdminRoutes from './Routes/AdminRoutes/AdminRoutes';
import EmployeeRoutes from './Routes/EmployeeRoutes/EmployeeRoutes';


function App() {
  return (
    <div className="App">
         <Routes>
        <Route path="/*" element={<WebRoutes/>} />
        <Route path="/admin-user/*" element={<AdminRoutes/>} />
        <Route path="/employee-user/*" element={<EmployeeRoutes/>} />
        </Routes>
    </div>
  );
}

export default App;
