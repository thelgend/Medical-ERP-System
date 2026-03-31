const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    medicineName: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Tablet', 'Syrup', 'Injection', 'Other'] },
    quantity: { type: Number, required: true, default: 0 },
    minThreshold: { type: Number, default: 10 }, // For alerts
    expiryDate: { type: Date },
    pricePerUnit: { type: Number, required: true },
    supplier: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

inventorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
