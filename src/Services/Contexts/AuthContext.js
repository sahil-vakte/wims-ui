// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false);

  useEffect(() => {
    const sessionStatus = sessionStorage.getItem("isPatientLoggedIn") === "true";
    setIsPatientLoggedIn(sessionStatus);
  }, []);

  const login = () => {
    sessionStorage.setItem("isPatientLoggedIn", "true");
    setIsPatientLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem("isPatientLoggedIn");
    sessionStorage.removeItem("accessToken"); // optional cleanup
    setIsPatientLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isPatientLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
