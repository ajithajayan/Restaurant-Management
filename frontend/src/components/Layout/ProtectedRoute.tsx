import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const AuthenticatedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/" /> : children;
};

export default ProtectedRoute;
