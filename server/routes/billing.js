const express = require('express');
const Bill = require('../models/Bill');
const Visit = require('../models/Visit');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const router = express.Router();

// Create Invoice
router.post('/', auth, authorize('Admin', 'Receptionist'), logAction('CREATE_INVOICE', 'Bill'), async (req, res) => {
    try {
        const { visitId, items, totalAmount, discount, patient, doctor } = req.body;
        
        const payableAmount = totalAmount - discount;
        
        const bill = new Bill({
            ...req.body,
            payableAmount
        });

        await bill.save();

        // Update Visit status if linked
        if (visitId) {
            await Visit.findByIdAndUpdate(visitId, { billingStatus: 'Partially Paid' });
        }

        res.status(201).send(bill);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// List All Bills (Financial History)
router.get('/', auth, async (req, res) => {
    try {
        const { status, patient } = req.query;
        let query = {};
        if (status) query.status = status;
        if (patient) query.patient = patient;

        const bills = await Bill.find(query)
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .sort({ createdAt: -1 });
        res.send(bills);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Bill Totals (Analytics)
router.get('/stats/summary', auth, authorize('Admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const todayBills = await Bill.find({ createdAt: { $gte: today }, status: 'Paid' });
        const totalToday = todayBills.reduce((acc, b) => acc + b.payableAmount, 0);
        
        const allPending = await Bill.find({ status: 'Pending' });
        const totalPending = allPending.reduce((acc, b) => acc+ b.payableAmount, 0);
        
        res.send({ totalToday, totalPending, pendingCount: allPending.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Mark as Paid
router.patch('/:id/pay', auth, authorize('Admin', 'Receptionist'), logAction('PAY_INVOICE', 'Bill'), async (req, res) => {
    try {
        const bill = await Bill.findByIdAndUpdate(req.params.id, { status: 'Paid' }, { new: true });
        if (!bill) return res.status(404).send({ error: 'Bill not found' });

        if (bill.visit) {
            await Visit.findByIdAndUpdate(bill.visit, { billingStatus: 'Paid' });
        }

        res.send(bill);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
