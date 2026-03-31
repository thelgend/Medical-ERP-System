const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String },
    status: { type: String, default: 'نشط', trim: true },
    bloodType: { type: String, trim: true },
    chronicDiseases: [{ type: String }],
    allergies: [{ type: String }],
    medicalFiles: [{
        fileName: { type: String },
        fileType: { type: String, enum: ['X-ray', 'MRI', 'LabResult', 'Other'] },
        filePath: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for Smart Search
patientSchema.index({ name: 'text', patientID: 'text', phone: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
