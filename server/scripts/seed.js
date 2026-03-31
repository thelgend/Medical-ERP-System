const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Bill.deleteMany({});

    // 1. Create Admin User
    const admin = new User({
      name: 'د. أحمد محمد',
      email: 'admin@erp.com',
      password: 'password123',
      role: 'Admin'
    });
    await admin.save();
    console.log('Admin user created: admin@erp.com / password123');

    // 2. Create Mock Patients
    const patients = [];
    for (let i = 1; i <= 20; i++) {
      patients.push({
        patientID: `P-${1000 + i}`,
        name: `مريض تجريبي ${i}`,
        age: 20 + i,
        gender: i % 2 === 0 ? 'ذكر' : 'أنثى',
        phone: `010${Math.floor(Math.random() * 90000000 + 10000000)}`,
        address: 'القاهرة، مصر',
        bloodType: 'O+'
      });
    }
    const createdPatients = await Patient.insertMany(patients);
    console.log(`${createdPatients.length} patients created.`);

    // 3. Create Mock Appointments for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const appointments = [];
    for (let i = 0; i < 10; i++) {
      appointments.push({
        patient: createdPatients[i]._id,
        doctor: admin._id,
        date: new Date(),
        slot: '09:00 - 09:30',
        status: i % 3 === 0 ? 'Completed' : 'Scheduled',
        visitType: 'Consultation'
      });
    }
    await Appointment.insertMany(appointments);
    console.log('10 appointments created for today.');

    // 4. Create Mock Bills
    const bills = [];
    for (let i = 0; i < 5; i++) {
        bills.push({
            patient: createdPatients[i]._id,
            doctor: admin._id,
            visit: null,
            items: [{ description: 'كشف طبى', price: 500 }],
            totalAmount: 500,
            discount: 0,
            payableAmount: 500,
            status: 'Paid',
            paymentMethod: 'Cash'
        });
    }
    await Bill.insertMany(bills);
    console.log('5 bills created.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
