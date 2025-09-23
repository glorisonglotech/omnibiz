const TeamMember = require("../models/team");

// Create a new team member
exports.createTeamMember = async (req, res) => {
  try {
    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    res.status(201).json(teamMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all team members
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().populate("userId");
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single team member by ID
exports.getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id).populate("userId");
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a team member
exports.updateTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};