const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    specialization: { type: String },
    role: { type: String, enum: ['Admin', 'Doctor', 'Receptionist'], default: 'Receptionist' },
    notificationPrefs: {
        appointments: { type: Boolean, default: true },
        inventory: { type: Boolean, default: true },
        lab: { type: Boolean, default: true },
        billing: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
