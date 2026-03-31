const express = require('express');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get Audit Logs (Admin Only)
router.get('/', auth, authorize('Admin'), async (req, res) => {
    try {
        const { limit = 50, skip = 0, action, target } = req.query;
        
        const query = {};
        if (action) query.action = action;
        if (target) query.target = target;

        const logs = await AuditLog.find(query)
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await AuditLog.countDocuments(query);

        res.send({ logs, total });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
