import { AuthContext } from "./AuthProvider.jsx";
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { authData } = useContext(AuthContext);

  if (authData.loading) {
    return <div>Loading...</div>;
  }

  if (!authData.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && authData.role !== requiredRole) {
    return <div>Access Denied. You do not have the required role.</div>;
  }

  return children;
};

export default ProtectedRoute;
