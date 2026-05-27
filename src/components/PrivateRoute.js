// src/routes/PrivateRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = sessionStorage.getItem("adminToken");

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;