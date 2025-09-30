import React from 'react';
import { useAuth } from '@/context/AuthContext';

// Component to conditionally render content based on user role
const RoleBasedAccess = ({ 
  allowedRoles = [], 
  requiredPermissions = [], 
  children, 
  fallback = null,
  requireAll = false // If true, user must have ALL permissions; if false, ANY permission
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    if (!hasRole) {
      return fallback;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const userPermissions = user.permissions || {};
    
    const hasPermissions = requireAll
      ? requiredPermissions.every(permission => userPermissions[permission] === true)
      : requiredPermissions.some(permission => userPermissions[permission] === true);
    
    if (!hasPermissions) {
      return fallback;
    }
  }

  return children;
};

// Higher-order component for role-based access
export const withRoleAccess = (allowedRoles = [], requiredPermissions = []) => {
  return (WrappedComponent) => {
    return (props) => (
      <RoleBasedAccess 
        allowedRoles={allowedRoles} 
        requiredPermissions={requiredPermissions}
        fallback={<div className="text-center p-4 text-gray-500">Access Denied</div>}
      >
        <WrappedComponent {...props} />
      </RoleBasedAccess>
    );
  };
};

// Specific role components
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess 
    allowedRoles={['admin', 'super_admin']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

export const SuperAdminOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess 
    allowedRoles={['super_admin']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

export const ClientOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess 
    allowedRoles={['client']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

// Permission-based components
export const CanManageOrders = ({ children, fallback = null }) => (
  <RoleBasedAccess 
    requiredPermissions={['canViewAllOrders', 'canApproveOrders']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

export const CanManageUsers = ({ children, fallback = null }) => (
  <RoleBasedAccess 
    requiredPermissions={['canManageUsers']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

export const CanManageServices = ({ children, fallback = null }) => (
  <RoleBasedAccess 
    requiredPermissions={['canManageServices']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasRole = (roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions[permission] === true;
  };

  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions[permission] === true);
  };

  const hasAllPermissions = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions[permission] === true);
  };

  const isAdmin = () => hasRole(['admin', 'super_admin']);
  const isSuperAdmin = () => hasRole(['super_admin']);
  const isClient = () => hasRole(['client']);

  return {
    user,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    isClient,
    permissions: user?.permissions || {}
  };
};

export default RoleBasedAccess;
