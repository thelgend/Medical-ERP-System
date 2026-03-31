const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    payableAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Insurance', 'Other'], default: 'Cash' },
    status: { type: String, enum: ['Paid', 'Unpaid', 'Partially Paid'], default: 'Unpaid' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
