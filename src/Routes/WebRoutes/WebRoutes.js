import React from "react";
import { Route, Routes } from "react-router-dom";
import WebNavbar from "../../Container/Website/WebNavbar";
import HomePage from "../../Container/Website/HomePage";
import LoginPage from "../../Components/LoginPage/LoginPage";
import AdminLogin from "../../Components/LoginPage/AdminLogin";

const WebRoutes = () => {
  return (
    <div>
      <WebNavbar />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/admin-login" element={<AdminLogin/>} />
      </Routes>
    </div>
  );
};

export default WebRoutes;
