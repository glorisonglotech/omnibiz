const TeamMember = require("../models/team");

// Create a new team member
exports.createTeamMember = async (req, res) => {
  try {
    const teamMember = new TeamMember({
      ...req.body,
      userId: req.user._id 
    });

    await teamMember.save();
    res.status(201).json(teamMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all team members (filtered by current user)
exports.getAllTeamMembers = async (req, res) => {
  try {
    // Only fetch team members that belong to the authenticated user
    const teamMembers = await TeamMember.find({ userId: req.user._id })
      .populate("userId")
      .populate("assignedLocation", "name address city type");
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single team member by ID (only if belongs to current user)
exports.getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate("userId")
      .populate("assignedLocation", "name address city type");
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a team member (only if belongs to current user)
exports.updateTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found or you don't have permission" });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a team member (only if belongs to current user)
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found or you don't have permission" });
    }
    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};