const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Manager", "Stylist", "Receptionist", "Staff"],
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    notifyBySMS: {
      type: Boolean,
      default: false,
    },
    notifyByEmail: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
