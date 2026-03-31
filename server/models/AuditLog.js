const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    target: { type: String, required: true }, // e.g., 'Patient', 'Appointment'
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
