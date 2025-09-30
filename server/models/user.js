const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },

    // Business Information
    businessName: String,
    businessEmail: String,
    businessPhone: String,
    businessAddress: String,

    // Profile Information
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },

    // Address Information
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,

    // Work Information
    jobTitle: String,
    department: String,
    bio: String,
    avatar: String,

    // Settings
    timezone: { type: String, default: 'Africa/Nairobi' },
    currency: { type: String, default: 'KES' },
    language: { type: String, default: 'en' },

    // Notification Settings
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },

    // Security Settings
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 }, // minutes
    passwordExpiry: { type: Number, default: 90 }, // days
    lastPasswordChange: { type: Date, default: Date.now },

    // Privacy Settings
    dataSharing: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },

    // Account Status
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager', 'staff', 'client'],
      default: 'client'
    },

    // Role-based Permissions
    permissions: {
      canCreateOrders: { type: Boolean, default: true },
      canViewAllOrders: { type: Boolean, default: false },
      canApproveOrders: { type: Boolean, default: false },
      canManageInventory: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManageServices: { type: Boolean, default: false },
      canVerifyOrders: { type: Boolean, default: false },
      canDeleteOrders: { type: Boolean, default: false },
      canManageRoles: { type: Boolean, default: false },
      canViewAllClients: { type: Boolean, default: false },
      canAssignAdmins: { type: Boolean, default: false }
    },

    // Client-specific Information
    clientType: {
      type: String,
      enum: ['individual', 'business', 'wholesale', 'retail'],
      default: 'individual'
    },
    creditLimit: { type: Number, default: 0 },
    paymentTerms: { type: String, default: 'immediate' }, // immediate, net30, net60

    // Admin Assignment (for clients)
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Service Preferences (for clients)
    servicePreferences: {
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'sms', 'app'],
        default: 'email'
      },
      serviceCategories: [String], // Categories of services they're interested in
      maxOrderValue: { type: Number, default: 0 }, // Maximum order value without approval
      autoApproveOrders: { type: Boolean, default: false }
    },

    // Admin Capabilities (for admin users)
    adminCapabilities: {
      maxClientsManaged: { type: Number, default: 0 }, // 0 = unlimited
      serviceAreas: [String], // Geographic or service areas they manage
      specializations: [String], // Areas of expertise
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        timezone: { type: String, default: 'Africa/Nairobi' }
      }
    },

    // Client Management (for tracking client relationships)
    managedClients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Status tracking
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending_verification'],
      default: 'active'
    },
    verificationStatus: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      business: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
