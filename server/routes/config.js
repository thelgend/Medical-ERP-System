const express = require('express');
const SystemConfig = require('../models/SystemConfig');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get System Configuration
router.get('/', async (req, res) => {
    try {
        let config = await SystemConfig.findOne({});
        if (!config) {
            config = new SystemConfig();
            await config.save();
        }
        res.send(config);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update System Configuration (Admin Only)
router.post('/', auth, authorize('Admin'), async (req, res) => {
    try {
        const { visitTypes, timeSlots, labTestTypes, clinicInfo, services, backupSchedule, defaultSettings } = req.body;
        let config = await SystemConfig.findOne({});
        
        if (!config) {
            config = new SystemConfig({ visitTypes, timeSlots, labTestTypes, clinicInfo, services, backupSchedule, defaultSettings });
        } else {
            if (visitTypes) config.visitTypes = visitTypes;
            if (timeSlots) config.timeSlots = timeSlots;
            if (labTestTypes) config.labTestTypes = labTestTypes;
            if (clinicInfo) config.clinicInfo = { ...config.clinicInfo, ...clinicInfo };
            if (services) config.services = services;
            if (backupSchedule) config.backupSchedule = { ...config.backupSchedule, ...backupSchedule };
            if (defaultSettings) config.defaultSettings = { ...config.defaultSettings, ...defaultSettings };
            config.updatedAt = Date.now();
        }
        
        await config.save();
        res.send(config);
    } catch (error) {
        console.error('Config update error:', error);
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
