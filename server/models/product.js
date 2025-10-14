const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 5,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    supplierName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);