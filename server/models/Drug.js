const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String }, // e.g., Antibiotic, Analgesic
    genericName: { type: String },
    strength: { type: String },  // e.g., 500mg
    defaultDosage: { type: String }, // e.g., 1x3
    instructions: { type: String }, // e.g., After meals
    sideEffects: { type: String },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Drug', drugSchema);
