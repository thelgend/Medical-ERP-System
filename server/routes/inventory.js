const express = require('express');
const Inventory = require('../models/Inventory');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const router = express.Router();

// Add Item to Inventory
router.post('/', auth, authorize('Admin'), logAction('ADD_INVENTORY_ITEM', 'Inventory'), async (req, res) => {
    try {
        const item = new Inventory(req.body);
        await item.save();
        res.status(201).send(item);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get All Inventory Items
router.get('/', auth, async (req, res) => {
    try {
        const items = await Inventory.find({});
        res.send(items);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Low Stock Alerts
router.get('/alerts', auth, async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({ $expr: { $lte: ['$quantity', '$minThreshold'] } });
        res.send(lowStockItems);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update Inventory Quantity
router.patch('/:id/quantity', auth, authorize('Admin', 'Receptionist'), logAction('UPDATE_INVENTORY_QTY', 'Inventory'), async (req, res) => {
    try {
        const { change } = req.body; // Positive for add, negative for reduce
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).send({ error: 'Item not found' });

        item.quantity += change;
        await item.save();
        res.send(item);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Update Entire Inventory Item
router.put('/:id', auth, authorize('Admin'), logAction('UPDATE_INVENTORY_ITEM', 'Inventory'), async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).send({ error: 'Item not found' });
        res.send(item);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
