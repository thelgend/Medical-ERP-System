const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    slot: { type: String, required: true }, // e.g., "10:00 AM"
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending'], default: 'Scheduled' },
    reason: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
