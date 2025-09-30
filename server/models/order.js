// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Under_Review",
        "Approved",
        "Rejected",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned"
      ],
      default: "Draft",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "Partial"],
      default: "Pending",
    },
    items: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },

    // Approval Workflow
    approvalRequired: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: {
      type: Date
    },
    rejectionReason: {
      type: String
    },

    // Admin Assignment
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    assignedAt: {
      type: Date
    },

    // Order Type
    orderType: {
      type: String,
      enum: ["standard", "bulk", "custom", "urgent", "recurring"],
      default: "standard"
    },

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },

    // Delivery Information
    deliveryInfo: {
      method: {
        type: String,
        enum: ["pickup", "delivery", "shipping"],
        default: "delivery"
      },
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      contactPerson: String,
      contactPhone: String,
      deliveryDate: Date,
      specialInstructions: String
    },

    // Verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    verifiedAt: {
      type: Date
    },
    verificationNotes: {
      type: String
    },

    // Internal Notes (admin only)
    internalNotes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Client Communication
    clientNotes: {
      type: String
    },

    // Discounts and Adjustments
    discounts: [{
      type: {
        type: String,
        enum: ["percentage", "fixed", "bulk", "loyalty"]
      },
      value: Number,
      reason: String,
      appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],

    // Totals
    subtotal: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ assignedAdmin: 1, status: 1 });
orderSchema.index({ status: 1, priority: 1 });
orderSchema.index({ date: -1 });
orderSchema.index({ orderType: 1, status: 1 });

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.date) / (1000 * 60 * 60 * 24));
});

// Virtual for requires approval
orderSchema.virtual('requiresApproval').get(function() {
  return this.total > 10000 || this.orderType === 'bulk' || this.orderType === 'custom';
});

// Pre-save middleware to set approval requirement
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set approval requirement based on order value or type
    this.approvalRequired = this.total > 10000 ||
                           this.orderType === 'bulk' ||
                           this.orderType === 'custom' ||
                           this.priority === 'urgent';

    // Calculate totals
    this.total = this.subtotal + this.taxAmount + this.shippingCost - this.discountAmount;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
