import { useAuth } from '@/context/AuthContext';

/**
 * Role-Based Access Control Hook
 * Manages permissions for different user roles
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // Define permissions for each role
  const rolePermissions = {
    admin: [
      '*', // Admin has all permissions
    ],
    manager: [
      'team:read', 'team:write', 'team:delete',
      'products:read', 'products:write', 'products:delete',
      'orders:read', 'orders:write',
      'customers:read',
      'reports:read',
      'locations:read', 'locations:write',
      'inventory:read', 'inventory:write',
      'finances:read',
      'analytics:read',
      'appointments:read', 'appointments:write',
    ],
    employee: [
      'team:read',
      'products:read',
      'orders:read', 'orders:write',
      'customers:read',
      'appointments:read', 'appointments:write',
      'inventory:read',
    ],
    staff: [
      'products:read',
      'orders:read',
      'customers:read',
      'appointments:read',
    ],
    customer: [
      'orders:read',
      'profile:read', 'profile:write',
      'appointments:read', 'appointments:write',
    ],
  };

  /**
   * Check if user has permission to perform an action on a resource
   * @param {string} resource - The resource (e.g., 'team', 'products')
   * @param {string} action - The action (e.g., 'read', 'write', 'delete')
   * @returns {boolean}
   */
  const canAccess = (resource, action) => {
    if (!user || !user.role) {
      return false;
    }

    const permissions = rolePermissions[user.role.toLowerCase()] || [];
    
    // Check for wildcard permission (admin)
    if (permissions.includes('*')) {
      return true;
    }

    // Check for specific permission
    const permission = `${resource}:${action}`;
    return permissions.includes(permission);
  };

  /**
   * Check if user can read a resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canRead = (resource) => canAccess(resource, 'read');

  /**
   * Check if user can write/create/update a resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canWrite = (resource) => canAccess(resource, 'write');

  /**
   * Check if user can delete a resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canDelete = (resource) => canAccess(resource, 'delete');

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user || !user.role) {
      return false;
    }
    return roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase());
  };

  /**
   * Check if user is an admin
   * @returns {boolean}
   */
  const isAdmin = () => hasRole(['admin']);

  /**
   * Check if user is a manager
   * @returns {boolean}
   */
  const isManager = () => hasRole(['manager', 'admin']);

  /**
   * Get all permissions for current user
   * @returns {string[]}
   */
  const getPermissions = () => {
    if (!user || !user.role) {
      return [];
    }
    return rolePermissions[user.role.toLowerCase()] || [];
  };

  return {
    canAccess,
    canRead,
    canWrite,
    canDelete,
    hasRole,
    isAdmin,
    isManager,
    getPermissions,
    user,
  };
};

export default usePermissions;
