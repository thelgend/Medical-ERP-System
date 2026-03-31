const express = require('express');
const Queue = require('../models/Queue');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const router = express.Router();

// New Queue Entry
router.post('/', auth, authorize('Admin', 'Receptionist'), logAction('ADD_TO_QUEUE', 'Queue'), async (req, res) => {
    try {
        const { doctor } = req.body;
        
        // Get last ticket number for this doctor today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const lastEntry = await Queue.findOne({ doctor, date: { $gte: startOfDay } }).sort({ ticketNumber: -1 });
        const nextTicket = lastEntry ? lastEntry.ticketNumber + 1 : 1;
        
        const queueEntry = new Queue({
            ...req.body,
            ticketNumber: nextTicket
        });
        
        await queueEntry.save();
        
        // Emit Socket.io update (handled in index.js or a separate utility)
        req.app.get('io').emit('queueUpdate', { doctor, action: 'ADD', ticket: nextTicket });
        
        res.status(201).send(queueEntry);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Call Next Patient
router.patch('/next', auth, authorize('Doctor'), logAction('CALL_NEXT', 'Queue'), async (req, res) => {
    try {
        const { doctor } = req.body;
        
        // Set current patient as 'Completed'
        await Queue.updateMany({ doctor, status: 'In-Progress' }, { status: 'Completed' });

        // Find next patient
        const nextInQueue = await Queue.findOne({ doctor, status: 'Waiting' }).sort({ ticketNumber: 1 });
        if (!nextInQueue) return res.status(404).send({ error: 'No more patients in queue' });

        nextInQueue.status = 'In-Progress';
        await nextInQueue.save();

        const populatedNext = await nextInQueue.populate('patient doctor', 'name');
        
        req.app.get('io').emit('queueUpdate', { 
            doctor: doctor, 
            doctorName: populatedNext.doctor?.name,
            patientName: populatedNext.patient?.name,
            action: 'CALL', 
            ticket: nextInQueue.ticketNumber 
        });
        
        res.send(nextInQueue);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Current Queue for Display
router.get('/display', async (req, res) => {
    try {
        const { doctor } = req.query;
        const currentInQueue = await Queue.findOne({ doctor, status: 'In-Progress' }).populate('patient', 'name');
        const waitingCount = await Queue.countDocuments({ doctor, status: 'Waiting' });
        res.send({ current: currentInQueue, waiting: waitingCount });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
