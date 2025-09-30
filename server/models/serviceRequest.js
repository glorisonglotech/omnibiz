const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    // Request Identification
    requestId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Client Information
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Assigned Admin
    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Service Details
    serviceType: {
      type: String,
      required: true,
      enum: [
        'consultation',
        'product_inquiry',
        'technical_support',
        'custom_order',
        'bulk_order',
        'installation',
        'maintenance',
        'training',
        'other'
      ]
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    // Status Tracking
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'pending_client',
        'completed',
        'cancelled',
        'rejected'
      ],
      default: 'submitted'
    },

    // Timeline
    requestedDate: {
      type: Date,
      default: Date.now
    },

    expectedCompletionDate: {
      type: Date
    },

    actualCompletionDate: {
      type: Date
    },

    // Service Requirements
    requirements: {
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'KES' }
      },
      timeline: {
        type: String, // e.g., "2 weeks", "1 month"
      },
      location: {
        type: String // Service location if applicable
      },
      specifications: [String] // Specific requirements or specifications
    },

    // Attachments
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],

    // Communication Log
    communications: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['message', 'status_update', 'system_note'],
        default: 'message'
      },
      attachments: [{
        filename: String,
        url: String
      }]
    }],

    // Admin Response
    adminResponse: {
      estimatedCost: {
        amount: Number,
        currency: { type: String, default: 'KES' },
        breakdown: [String] // Cost breakdown items
      },
      estimatedTimeline: String,
      proposedSolution: String,
      terms: String,
      responseDate: Date
    },

    // Client Feedback
    clientFeedback: {
      approved: { type: Boolean },
      comments: String,
      requestedChanges: String,
      feedbackDate: Date
    },

    // Service Delivery
    deliveryDetails: {
      method: {
        type: String,
        enum: ['on_site', 'remote', 'pickup', 'delivery', 'digital'],
        default: 'on_site'
      },
      address: String,
      contactPerson: String,
      contactPhone: String,
      specialInstructions: String
    },

    // Rating and Review (after completion)
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
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

    // Billing Information
    billing: {
      finalCost: {
        amount: Number,
        currency: { type: String, default: 'KES' }
      },
      invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice"
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'overdue', 'cancelled'],
        default: 'pending'
      }
    },

    // Metadata
    tags: [String], // For categorization and search
    isUrgent: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: false },
    parentRequestId: { // For recurring or follow-up requests
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
serviceRequestSchema.index({ clientId: 1, status: 1 });
serviceRequestSchema.index({ assignedAdminId: 1, status: 1 });
serviceRequestSchema.index({ serviceType: 1, priority: 1 });
serviceRequestSchema.index({ requestedDate: -1 });
serviceRequestSchema.index({ status: 1, priority: 1 });

// Virtual for request age in days
serviceRequestSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.requestedDate) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
serviceRequestSchema.virtual('isOverdue').get(function() {
  if (!this.expectedCompletionDate) return false;
  return Date.now() > this.expectedCompletionDate && !['completed', 'cancelled'].includes(this.status);
});

// Pre-save middleware to generate request ID
serviceRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestId) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.requestId = `SR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
