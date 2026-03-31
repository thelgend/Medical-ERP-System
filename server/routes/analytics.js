const express = require('express');
const Patient = require('../models/Patient');
const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');
const LabReport = require('../models/LabReport');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get Dashboard Stats
router.get('/dashboard', auth, authorize('Admin'), async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Daily Patients count
        const dailyPatients = await Patient.countDocuments({ createdAt: { $gte: startOfDay } });
        
        // Revenue count
        const revenue = await Bill.aggregate([
            { $match: { createdAt: { $gte: startOfDay }, status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$payableAmount' } } }
        ]);

        // Monthly Revenue comparison
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const monthlyRevenue = await Bill.aggregate([
            { $match: { createdAt: { $gte: firstDayOfMonth }, status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$payableAmount' } } }
        ]);

        // Appointment stats
        const pendingAppointments = await Appointment.countDocuments({ status: 'Scheduled' });

        // Lab stats
        const pendingLabCount = await LabReport.countDocuments({ status: 'Pending' });

        // Total patients
        const totalPatients = await Patient.countDocuments({});

        // Today's appointments for report
        const dailyAppointments = await Appointment.find({ date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 86400000) } })
            .populate('patient', 'name age gender')
            .populate('doctor', 'name');

        // Recent Activity (Latest 10)
        const recentActivity = await AuditLog.find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('user', 'name');

        res.send({
            dailyPatients,
            dailyRevenue: revenue[0] ? revenue[0].total : 0,
            monthlyRevenue: monthlyRevenue[0] ? monthlyRevenue[0].total : 0,
            pendingAppointments,
            pendingLabCount,
            totalPatients,
            dailyAppointments,
            recentActivity
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Doctor performance (Billables)
router.get('/doctor-performance', auth, authorize('Admin'), async (req, res) => {
    try {
        const performance = await Bill.aggregate([
            { $lookup: { from: 'users', localField: 'doctor', foreignField: '_id', as: 'doctorInfo' } },
            { $unwind: '$doctorInfo' },
            { $group: { _id: '$doctorInfo.name', totalRevenue: { $sum: '$payableAmount' }, patientCount: { $count: {} } } },
            { $sort: { totalRevenue: -1 } }
        ]);
        res.send(performance);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
