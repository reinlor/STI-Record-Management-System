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
  
  if (Array.isArray(requiredRole)) {
    // if (!requiredRole.includes(authData.role)) {
    //   return <Navigate to="/error401" replace />;
    // }
  } else if (requiredRole) { 
    if (authData.role !== requiredRole) {
      return <Navigate to="/error401" replace />;
    }
  }
  

  return children;
};

export default ProtectedRoute;