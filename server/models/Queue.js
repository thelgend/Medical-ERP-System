const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    ticketNumber: { type: Number, required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Waiting', 'In-Progress', 'Completed', 'Cancelled'], default: 'Waiting' },
    date: { type: Date, default: Date.now },
    estimatedWaitTime: { type: Number, default: 0 } // in minutes
});

module.exports = mongoose.model('Queue', queueSchema);
