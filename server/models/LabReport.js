const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true },
    category: { type: String, enum: ['Blood', 'Urine', 'Imaging', 'Other'], default: 'Other' },
    result: { type: String },
    filePath: { type: String }, // For uploaded file results
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LabReport', labReportSchema);
