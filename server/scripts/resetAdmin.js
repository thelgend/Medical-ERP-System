const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for admin reset...');

    const email = 'admin@erp.com';
    const password = 'password123';

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
        user.password = password;
        user.role = 'Admin'; // Ensure role is correct
        await user.save();
        console.log(`Admin user UPDATED: ${email} / ${password}`);
    } else {
        user = new User({
            name: 'المدير العام',
            email: email,
            password: password,
            role: 'Admin'
        });
        await user.save();
        console.log(`NEW Admin user created: ${email} / ${password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error);
    process.exit(1);
  }
};

resetAdmin();
