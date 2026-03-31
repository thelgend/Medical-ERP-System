const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const router = express.Router();

// Book Appointment with Conflict Detection
router.post('/', auth, authorize('Admin', 'Receptionist'), logAction('CREATE', 'Appointment'), async (req, res) => {
    try {
        const { doctor, date, slot } = req.body;
        
        // Check for collision
        const existingAppointment = await Appointment.findOne({
            doctor,
            date: new Date(date),
            slot,
            status: { $ne: 'Cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).send({ error: 'This time slot is already booked for this doctor.' });
        }

        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).send(appointment);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// List Appointments (Filter by date/doctor/patient)
router.get('/', auth, async (req, res) => {
    try {
        const { date, doctor, patient } = req.query;
        let query = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }
        if (doctor) query.doctor = doctor;
        if (patient) query.patient = patient;

        const appointments = await Appointment.find(query)
            .populate('patient', 'name phone')
            .populate('doctor', 'name specialization')
            .sort({ date: 1, slot: 1 });
        res.send(appointments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update Appointment Status (In Progress, Confirmed, etc.)
router.patch('/:id/status', auth, authorize('Admin', 'Receptionist', 'Doctor'), logAction('UPDATE_STATUS', 'Appointment'), async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!appointment) return res.status(404).send({ error: 'Appointment not found' });
        res.send(appointment);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Cancel Appointment
router.patch('/:id/cancel', auth, authorize('Admin', 'Receptionist'), logAction('CANCEL', 'Appointment'), async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
        if (!appointment) return res.status(404).send({ error: 'Appointment not found' });
        res.send(appointment);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Delete Appointment (Admin Only)
router.delete('/:id', auth, authorize('Admin'), logAction('DELETE', 'Appointment'), async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) return res.status(404).send({ error: 'Appointment not found' });
        res.send({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
