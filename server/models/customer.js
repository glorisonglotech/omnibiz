const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { 
      type: String, 
      required: [true, 'Name is required'] 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { 
      type: String,
      trim: true
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'] 
    },

    // Referral Information - Links customer to the user who invited them
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer must be linked to a referring user'],
      index: true
    },
    
    // Store the invite code used during registration
    usedInviteCode: {
      type: String,
      required: true
    },

    // Customer Profile
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },

    // Preferences
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true }
    },

    // Account Status
    isActive: { 
      type: Boolean, 
      default: true 
    },
    
    isEmailVerified: { 
      type: Boolean, 
      default: false 
    },

    lastLogin: Date,

    // Shopping History (for future use)
    totalOrders: { 
      type: Number, 
      default: 0 
    },
    
    totalSpent: { 
      type: Number, 
      default: 0 
    },

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Email Verification
    emailVerificationToken: String,
    emailVerificationExpires: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
customerSchema.index({ invitedBy: 1, email: 1 });
customerSchema.index({ usedInviteCode: 1 });

// Virtual for orders
customerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'customer'
});

module.exports = mongoose.model("Customer", customerSchema);
