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

    // Add inviteCode field
    inviteCode: { 
      type: String, 
      unique: true, 
      sparse: true 
    },

    // ... (rest of your existing fields remain unchanged)
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    jobTitle: String,
    department: String,
    bio: String,
    avatar: String,
    timezone: { type: String, default: 'Africa/Nairobi' },
    currency: { type: String, default: 'KES' },
    language: { type: String, default: 'en' },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    passwordExpiry: { type: Number, default: 90 },
    lastPasswordChange: { type: Date, default: Date.now },
    dataSharing: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,

    // Theme and Appearance Settings
    themePreferences: {
      theme: { type: String, default: 'light' },
      sidebarCollapsed: { type: Boolean, default: false },
      compactMode: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false },
      customAccentColor: { type: String, default: '#3b82f6' },
      animations: { type: Boolean, default: true },
      fontSize: { type: String, default: 'medium' },
      borderRadius: { type: String, default: 'medium' },
      soundEnabled: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: true }
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager', 'staff', 'client'],
      default: 'client'
    },
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
    clientType: {
      type: String,
      enum: ['individual', 'business', 'wholesale', 'retail'],
      default: 'individual'
    },
    creditLimit: { type: Number, default: 0 },
    paymentTerms: { type: String, default: 'immediate' },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    servicePreferences: {
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'sms', 'app'],
        default: 'email'
      },
      serviceCategories: [String],
      maxOrderValue: { type: Number, default: 0 },
      autoApproveOrders: { type: Boolean, default: false }
    },
    adminCapabilities: {
      maxClientsManaged: { type: Number, default: 0 },
      serviceAreas: [String],
      specializations: [String],
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        timezone: { type: String, default: 'Africa/Nairobi' }
      }
    },
    managedClients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
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