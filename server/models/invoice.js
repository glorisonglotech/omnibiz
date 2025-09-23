// models/Invoice.js
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: String,
    clientEmail:String,
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Pending"],
      default: "Pending",
    },
    issuedDate: { type: Date, default: Date.now },
    dueDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
