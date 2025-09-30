const User = require('../models/user');

// Role hierarchy for permission checking
const roleHierarchy = {
  'super_admin': 5,
  'admin': 4,
  'manager': 3,
  'staff': 2,
  'client': 1
};

// Default permissions for each role
const defaultPermissions = {
  super_admin: {
    canCreateOrders: true,
    canViewAllOrders: true,
    canApproveOrders: true,
    canManageInventory: true,
    canManageUsers: true,
    canViewReports: true,
    canManageSettings: true,
    canManageServices: true,
    canVerifyOrders: true,
    canDeleteOrders: true,
    canManageRoles: true,
    canViewAllClients: true,
    canAssignAdmins: true
  },
  admin: {
    canCreateOrders: true,
    canViewAllOrders: true,
    canApproveOrders: true,
    canManageInventory: true,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
    canManageServices: true,
    canVerifyOrders: true,
    canDeleteOrders: true,
    canManageRoles: false,
    canViewAllClients: true,
    canAssignAdmins: false
  },
  manager: {
    canCreateOrders: true,
    canViewAllOrders: true,
    canApproveOrders: true,
    canManageInventory: true,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
    canManageServices: false,
    canVerifyOrders: false,
    canDeleteOrders: false,
    canManageRoles: false,
    canViewAllClients: false,
    canAssignAdmins: false
  },
  staff: {
    canCreateOrders: true,
    canViewAllOrders: false,
    canApproveOrders: false,
    canManageInventory: true,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
    canManageServices: false,
    canVerifyOrders: false,
    canDeleteOrders: false,
    canManageRoles: false,
    canViewAllClients: false,
    canAssignAdmins: false
  },
  client: {
    canCreateOrders: true,
    canViewAllOrders: false,
    canApproveOrders: false,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
    canManageServices: false,
    canVerifyOrders: false,
    canDeleteOrders: false,
    canManageRoles: false,
    canViewAllClients: false,
    canAssignAdmins: false
  }
};

// Middleware to check if user has required role
const requireRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRole = req.user.role;
      
      // If requiredRoles is a string, convert to array
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // Check if user has any of the required roles
      const hasRequiredRole = rolesArray.includes(userRole);
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: rolesArray,
          current: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

// Middleware to check specific permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has the specific permission
      const hasPermission = user.permissions && user.permissions[permission];
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Permission denied: ${permission}`,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

// Middleware to check role hierarchy (user must be at least the specified level)
const requireMinRole = (minRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRoleLevel = roleHierarchy[req.user.role] || 0;
      const requiredLevel = roleHierarchy[minRole] || 0;
      
      if (userRoleLevel < requiredLevel) {
        return res.status(403).json({ 
          message: 'Insufficient role level',
          required: minRole,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role hierarchy middleware error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};



// Function to check if user can access resource
const canAccessResource = (userRole, resourceOwner, userId) => {
  // Super admin and admin can access everything
  if (['super_admin', 'admin'].includes(userRole)) {
    return true;
  }
  
  // Users can access their own resources
  if (resourceOwner && resourceOwner.toString() === userId.toString()) {
    return true;
  }
  
  return false;
};

// Middleware to check if user can access resource (own resources or admin access)
const requireOwnershipOrRole = (roles, resourceUserField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user has required role
      if (allowedRoles.includes(req.user.role)) {
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = req.params.userId || req.body[resourceUserField] || req.query.userId;
      if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        message: 'Access denied - insufficient permissions or not resource owner'
      });
    } catch (error) {
      console.error('Ownership middleware error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

// Helper function to get user permissions
const getUserPermissions = (user) => {
  const defaultPerms = defaultPermissions[user.role] || {};
  const userPerms = user.permissions || {};

  // Merge default permissions with user-specific permissions
  return { ...defaultPerms, ...userPerms };
};

// Helper function to check if user has permission
const hasPermission = (user, permission) => {
  const permissions = getUserPermissions(user);
  return permissions[permission] === true;
};

// Middleware to add user permissions to request
const addPermissions = (req, res, next) => {
  if (req.user) {
    req.userPermissions = getUserPermissions(req.user);
  }
  next();
};

// Function to set default permissions based on role
const setDefaultPermissions = (role) => {
  const basePermissions = {
    canCreateOrders: true,
    canViewAllOrders: false,
    canApproveOrders: false,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
    canManageServices: false,
    canVerifyOrders: false,
    canDeleteOrders: false,
    canManageRoles: false,
    canViewAllClients: false,
    canAssignAdmins: false
  };

  return { ...basePermissions, ...(defaultPermissions[role] || {}) };
};

// Specific role middleware shortcuts
const requireAdmin = requireRole(['super_admin', 'admin']);
const requireSuperAdmin = requireRole(['super_admin']);
const requireUserManagement = requirePermission('canManageUsers');
const requireOrderApproval = requirePermission('canApproveOrders');
const requireOrderVerification = requirePermission('canVerifyOrders');
const requireServiceManagement = requirePermission('canManageServices');
const requireViewAllOrders = requirePermission('canViewAllOrders');
const requireInventoryManagement = requirePermission('canManageInventory');

module.exports = {
  requireRole,
  requirePermission,
  requireMinRole,
  requireOwnershipOrRole,
  setDefaultPermissions,
  canAccessResource,
  getUserPermissions,
  hasPermission,
  addPermissions,
  requireAdmin,
  requireSuperAdmin,
  requireUserManagement,
  requireOrderApproval,
  requireOrderVerification,
  requireServiceManagement,
  requireViewAllOrders,
  requireInventoryManagement,
  roleHierarchy,
  defaultPermissions
};
