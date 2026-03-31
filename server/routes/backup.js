const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const LabReport = require('../models/LabReport');
const Visit = require('../models/Visit');
const Inventory = require('../models/Inventory');
const Queue = require('../models/Queue');
const AuditLog = require('../models/AuditLog');
const SystemConfig = require('../models/SystemConfig');
const { auth, authorize } = require('../middleware/auth');

router.get('/export', auth, authorize('Admin'), async (req, res) => {
    try {
        const patients = await Patient.find({});
        const appointments = await Appointment.find({});
        const bills = await Bill.find({});
        const labReports = await LabReport.find({});
        const visits = await Visit.find({});
        const items = await Inventory.find({});
        const queue = await Queue.find({});
        const logs = await AuditLog.find({});
        const config = await SystemConfig.findOne({});

        const backupData = {
            exportDate: new Date(),
            patients,
            appointments,
            bills,
            labReports,
            visits,
            inventory: items,
            queue,
            auditLogs: logs,
            config
        };

        res.json(backupData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/restore', auth, authorize('Admin'), async (req, res) => {
    try {
        const data = req.body;
        if (!data || !data.patients) {
            return res.status(400).json({ error: 'بيانات نسخة احتياطية غير صالحة.' });
        }

        // Use a more careful approach in production, but for now we clear and repopulate
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await Bill.deleteMany({});
        await LabReport.deleteMany({});
        await Visit.deleteMany({});
        await Inventory.deleteMany({});
        await Queue.deleteMany({});
        await AuditLog.deleteMany({});
        await SystemConfig.deleteMany({});

        if (data.patients) await Patient.insertMany(data.patients);
        if (data.appointments) await Appointment.insertMany(data.appointments);
        if (data.bills) await Bill.insertMany(data.bills);
        if (data.labReports) await LabReport.insertMany(data.labReports);
        if (data.visits) await Visit.insertMany(data.visits);
        if (data.inventory) await Inventory.insertMany(data.inventory);
        if (data.queue) await Queue.insertMany(data.queue);
        if (data.auditLogs) await AuditLog.insertMany(data.auditLogs);
        if (data.config) {
            delete data.config._id; // Remove ID to avoid conflicts
            const newConfig = new SystemConfig(data.config);
            await newConfig.save();
        }

        res.json({ message: 'تم استعادة البيانات بنجاح.' });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'فشل في استعادة البيانات: ' + error.message });
    }
});

module.exports = router;
