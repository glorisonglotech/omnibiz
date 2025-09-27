const Appointment = require("../models/appointment");

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      userId: req.user._id // Inject userId from authenticated user
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all appointments for the logged-in user
exports.getAllAppointments = async (req, res) => {
  try {
    const query = { userId: req.user._id };

    // Optional date filtering
    if (req.query.date) {
      const start = new Date(req.query.date);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      query.time = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query).populate("userId");
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single appointment by ID (only if owned by user)
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate("userId");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update an appointment (only if owned by user)
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate("userId");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete an appointment (only if owned by user)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: error.message });
  }
};
