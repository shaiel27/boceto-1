import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // Array of role IDs that can access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [1] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect based on user's role
    if (user.role === 2) {
      return <Navigate to="/technician" replace />;
    } else if (user.role === 3) {
      return <Navigate to="/requester" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
