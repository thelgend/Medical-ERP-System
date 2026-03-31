const express = require('express');
const Drug = require('../models/Drug');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get All/Search Drugs
router.get('/', auth, async (req, res) => {
    try {
        const query = req.query.search 
            ? { name: { $regex: req.query.search, $options: 'i' } } 
            : {};
        const drugs = await Drug.find(query).limit(20);
        res.send(drugs);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Add Drug
router.post('/', auth, authorize('Admin', 'Doctor'), async (req, res) => {
    try {
        const drug = new Drug(req.body);
        await drug.save();
        res.status(201).send(drug);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Seed Data (One-off or dev)
router.post('/seed', auth, authorize('Admin'), async (req, res) => {
    const commonDrugs = [
        { name: 'Panadol (Paracetamol)', category: 'Analgesic', strength: '500mg', defaultDosage: '1x3', instructions: 'After meals' },
        { name: 'Amoxicillin', category: 'Antibiotic', strength: '500mg', defaultDosage: '1x2', instructions: 'Every 12 hours' },
        { name: 'Brufen (Ibuprofen)', category: 'Anti-inflammatory', strength: '400mg', defaultDosage: '1x3', instructions: 'After meals' },
        { name: 'Ventolin', category: 'Bronchodilator', strength: '100mcg', defaultDosage: '2 puffs', instructions: 'As needed' },
        { name: 'Augmentin', category: 'Antibiotic', strength: '1g', defaultDosage: '1x2', instructions: 'After breakfast/dinner' },
        { name: 'Cataflam', category: 'Analgesic', strength: '50mg', defaultDosage: '1x2', instructions: 'After meals' },
        { name: 'Gaviscon', category: 'Antacid', strength: '-', defaultDosage: '10ml', instructions: 'Before sleep' },
        { name: 'Flagyl', category: 'Antiprotozoal', strength: '500mg', defaultDosage: '1x3', instructions: 'During meals' }
    ];

    try {
        await Drug.insertMany(commonDrugs, { ordered: false });
        res.send({ message: 'Seeded successfully' });
    } catch (error) {
        res.status(400).send({ error: 'Some drugs already exist or error occurred' });
    }
});

module.exports = router;
