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
    role: { type: String, enum: ['admin', 'manager', 'user'], default: 'admin' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
