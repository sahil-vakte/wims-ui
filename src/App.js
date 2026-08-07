// import { Route, Routes } from 'react-router-dom';
// import WebRoutes from './Routes/WebRoutes/WebRoutes';
// import AdminRoutes from './Routes/AdminRoutes/AdminRoutes';
// import EmployeeRoutes from './Routes/EmployeeRoutes/EmployeeRoutes';


// function App() {
//   return (
//     <div className="App">
//          <Routes>
//         <Route path="/*" element={<WebRoutes/>} />
//         <Route path="/admin-user/*" element={<AdminRoutes/>} />
//         <Route path="/employee-user/*" element={<EmployeeRoutes/>} />
//         </Routes>
//     </div>
//   );
// }

// export default App;


import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import WebRoutes from "./Routes/WebRoutes/WebRoutes";
import AdminRoutes from "./Routes/AdminRoutes/AdminRoutes";
import EmployeeRoutes from "./Routes/EmployeeRoutes/EmployeeRoutes";
import { refreshAccessToken } from "./Services/ApiServices/ApiServices";
import { getDecryptedRefreshToken } from "./Services/LoginUserDetails.js/LoginUserSavedDetails";
import DymoLabelPrinter from "./Components/DymoLabelPrinter";

function App() {
  useEffect(() => {
    const refreshToken = getDecryptedRefreshToken();

    if (!refreshToken) return;

    refreshAccessToken().catch((err) => {
      console.error("Initial token refresh failed:", err);
    });

    const interval = setInterval(() => {
      refreshAccessToken().catch((err) => {
        console.error("Scheduled token refresh failed:", err);
      });
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* <Route path="/" element={<DymoLabelPrinter/>} /> */}
        <Route path="/*" element={<WebRoutes />} />
        <Route path="/admin-user/*" element={<AdminRoutes />} />
        <Route path="/employee-user/*" element={<EmployeeRoutes />} />
      </Routes>
    </div>
  );
}

export default App;