const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    date: { type: Date, default: Date.now },
    vitals: {
        bloodPressure: { type: String }, // e.g., "120/80"
        temperature: { type: Number },   // e.g., 37.5
        pulse: { type: Number },         // e.g., 72
        spO2: { type: Number },          // e.g., 98
        weight: { type: Number },        // kg
        height: { type: Number }         // cm
    },
    chiefComplaint: { type: String, required: true },
    diagnosis: { type: String },
    prescription: [{
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String },
        notes: { type: String }
    }],
    labTests: [{
        testName: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        result: { type: String }, // Links to LabReport model later
        notes: { type: String }
    }],
    followUpDate: { type: Date },
    notes: { type: String },
    status: { type: String, enum: ['Completed', 'Draft'], default: 'Draft' },
    billingStatus: { type: String, enum: ['Unbilled', 'Partially Paid', 'Paid'], default: 'Unbilled' }
});

module.exports = mongoose.model('Visit', visitSchema);
