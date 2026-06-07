import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';

const ProtectedRoute = ({ roles, children }) => {
  const { auth } = useAuth();

  if (!auth?.token) {
    return <Navigate to="/signin" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
