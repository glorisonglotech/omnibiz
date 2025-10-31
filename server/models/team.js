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
    profilePhoto: {
      type: String,
      default: "",
    },
    assignedLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    skills: [{
      type: String,
    }],
    availability: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "On-call"],
      default: "Full-time",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
teamMemberSchema.index({ userId: 1 });
teamMemberSchema.index({ assignedLocation: 1 });
teamMemberSchema.index({ status: 1 });

module.exports = mongoose.model("TeamMember", teamMemberSchema);
