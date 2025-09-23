const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: String,
    service: String,
    time: Date,
    durationMinutes: Number,
    status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
