const Appointment = require("../models/appointment");
const Service = require("../models/service");
const User = require("../models/user");
const { getIO } = require('../config/socket');
const { notificationService } = require('../services/notificationService');

// Create a public appointment (for client storefront bookings)
exports.createPublicAppointment = async (req, res) => {
  try {
    const {
      inviteCode,
      customerName,
      customerEmail,
      customerPhone,
      service,
      serviceId,
      time,
      durationMinutes,
      notes,
      price
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !service || !time) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide customerName, customerEmail, customerPhone, service, and time' 
      });
    }

    // Find the business owner by invite code if provided
    let businessOwnerId = null;
    if (inviteCode) {
      const owner = await User.findOne({ inviteCode });
      if (owner) {
        businessOwnerId = owner._id;
      }
    }

    // Create appointment
    const appointment = new Appointment({
      userId: businessOwnerId, // Link to business owner
      customerName,
      customerEmail,
      customerPhone,
      service,
      serviceId,
      time: new Date(time),
      durationMinutes: durationMinutes || 60,
      notes: notes || '',
      price: price || 0,
      status: 'pending',
      createdViaStorefront: true
    });

    await appointment.save();
    
    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('appointment_created', {
        appointment,
        customerName,
        timestamp: new Date()
      });
      
      // Notify business owner/admins
      if (businessOwnerId) {
        io.to(`user_${businessOwnerId}`).emit('new_booking', {
          appointment,
          timestamp: new Date()
        });
      }
      io.to('admins').emit('new_booking', {
        appointment,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
      bookingNumber: `BOOK-${appointment._id.toString().slice(-8).toUpperCase()}`
    });
  } catch (error) {
    console.error("Error creating public appointment:", error);
    res.status(400).json({ 
      error: error.message,
      message: 'Failed to create appointment' 
    });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      userId: req.user._id // Inject userId from authenticated user
    });

    await appointment.save();
    
    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('appointment_created', {
        appointment,
        userId: req.user._id,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }
    
    res.status(201).json(appointment);
    // Notify admins about new appointment
    io.to('admins').emit('appointment_created', {
      appointment,
      userId: req.user._id,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all appointments for the logged-in user
exports.getAllAppointments = async (req, res) => {
  try {
    const query = { userId: req.user._id };

    // Optional status filtering
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Optional date filtering
    if (req.query.date) {
      const start = new Date(req.query.date);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      query.time = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate("userId")
      .populate("serviceId")
      .populate("confirmedBy", "name email")
      .sort({ time: -1 });
    
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

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('appointment_updated', {
        appointment,
        userId: req.user._id,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
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

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.to(`user_${req.user._id}`).emit('appointment_deleted', {
        appointmentId: req.params.id,
        userId: req.user._id,
        timestamp: new Date()
      });
      io.to('admins').emit('appointment_deleted', {
        appointmentId: req.params.id,
        userId: req.user._id,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm appointment (Admin only)
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('serviceId')
      .populate('userId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status !== 'Pending') {
      return res.status(400).json({ error: "Only pending appointments can be confirmed" });
    }

    appointment.status = 'Confirmed';
    appointment.confirmedBy = req.user._id;
    appointment.confirmedAt = new Date();
    await appointment.save();

    // Emit real-time event
    const io = getIO();
    io.to(`user_${appointment.userId._id}`).emit('appointment_confirmed', {
      appointment,
      timestamp: new Date()
    });
    io.to('admins').emit('appointment_confirmed', {
      appointment,
      timestamp: new Date()
    });

    // Send notification to customer
    if (appointment.customerEmail) {
      try {
        await notificationService.sendEmail({
          to: appointment.customerEmail,
          subject: 'Appointment Confirmed - OmniBiz',
          html: `
            <h2>Your Appointment Has Been Confirmed!</h2>
            <p>Hi ${appointment.customerName},</p>
            <p>Good news! Your appointment has been confirmed.</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date & Time:</strong> ${new Date(appointment.time).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${appointment.durationMinutes} minutes</p>
            <p>We look forward to seeing you!</p>
          `
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    res.json({ message: 'Appointment confirmed successfully', appointment });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Reject appointment (Admin only)
exports.rejectAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('serviceId')
      .populate('userId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status !== 'Pending') {
      return res.status(400).json({ error: "Only pending appointments can be rejected" });
    }

    appointment.status = 'Rejected';
    appointment.rejectionReason = reason || 'Time slot unavailable';
    await appointment.save();

    // Emit real-time event
    const io = getIO();
    io.to(`user_${appointment.userId._id}`).emit('appointment_rejected', {
      appointment,
      timestamp: new Date()
    });
    io.to('admins').emit('appointment_rejected', {
      appointment,
      timestamp: new Date()
    });

    // Send notification to customer
    if (appointment.customerEmail) {
      try {
        await notificationService.sendEmail({
          to: appointment.customerEmail,
          subject: 'Appointment Update - OmniBiz',
          html: `
            <h2>Appointment Update</h2>
            <p>Hi ${appointment.customerName},</p>
            <p>We regret to inform you that your appointment request could not be confirmed.</p>
            <p><strong>Reason:</strong> ${appointment.rejectionReason}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Requested Time:</strong> ${new Date(appointment.time).toLocaleString()}</p>
            <p>Please book another time slot or contact us for assistance.</p>
          `
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    res.json({ message: 'Appointment rejected', appointment });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete appointment (Admin only)
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status !== 'Confirmed') {
      return res.status(400).json({ error: "Only confirmed appointments can be marked as completed" });
    }

    appointment.status = 'Completed';
    appointment.completedAt = new Date();
    await appointment.save();

    // Update service bookings count
    if (appointment.serviceId) {
      await Service.findByIdAndUpdate(appointment.serviceId, {
        $inc: { bookings: 1 }
      });
    }

    // Emit real-time event
    const io = getIO();
    io.to(`user_${appointment.userId}`).emit('appointment_completed', {
      appointment,
      timestamp: new Date()
    });
    io.to('admins').emit('appointment_completed', {
      appointment,
      timestamp: new Date()
    });

    res.json({ message: 'Appointment marked as completed', appointment });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments({ userId }),
      Appointment.countDocuments({ userId, status: 'Pending' }),
      Appointment.countDocuments({ userId, status: 'Confirmed' }),
      Appointment.countDocuments({ userId, status: 'Completed' }),
      Appointment.countDocuments({ userId, status: { $in: ['Cancelled', 'Rejected'] } })
    ]);

    // Get upcoming appointments
    const upcoming = await Appointment.find({
      userId,
      status: { $in: ['Pending', 'Confirmed'] },
      time: { $gte: new Date() }
    }).sort({ time: 1 }).limit(5);

    res.json({
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      upcoming
    });
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    res.status(500).json({ error: error.message });
  }
};
