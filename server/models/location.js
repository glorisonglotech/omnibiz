const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    manager: {
      type: String,
      required: true,
    },
    operatingHours: {
      type: String,
      default: "8:00 AM - 6:00 PM",
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    employees: {
      type: Number,
      default: 0,
    },
    inventory: {
      type: Number,
      default: 0,
    },
    dailyRevenue: {
      type: Number,
      default: 0,
    },
    dailyOrders: {
      type: Number,
      default: 0,
    },
    dailyCustomers: {
      type: Number,
      default: 0,
    },
    performance: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Location", locationSchema);
