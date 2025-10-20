const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    customerName: { type: String, required: true },
    customerEmail: String,
    customerPhone: String,
    service: { type: String, required: true },
    time: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    price: Number,
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'], 
        default: 'Pending' 
    },
    notes: String,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: Date,
    rejectionReason: String,
    completedAt: Date,
    rating: {
        score: { type: Number, min: 1, max: 5 },
        review: String,
        ratedAt: Date
    },
    reminders: {
        sent: { type: Boolean, default: false },
        sentAt: Date
    }
}, { timestamps: true });

// Indexes for better query performance
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ customerEmail: 1 });
appointmentSchema.index({ time: 1 });
appointmentSchema.index({ serviceId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
