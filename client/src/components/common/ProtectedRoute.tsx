import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agro-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'FARMER' || user.role === 'FARMER_STAFF') {
      return <Navigate to="/farmer" replace />;
    }
    if (user.role === 'LOGISTICS_PROVIDER' || user.role === 'LOGISTICS_STAFF') {
      return <Navigate to="/logistics" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
