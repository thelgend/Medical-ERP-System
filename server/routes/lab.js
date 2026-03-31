const express = require('express');
const LabReport = require('../models/LabReport');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const multer = require('multer');
const router = express.Router();

// Configure Multer for lab results
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/lab');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Create Lab Order
router.post('/', auth, authorize('Admin', 'Doctor'), logAction('CREATE_LAB_ORDER', 'LabReport'), async (req, res) => {
    try {
        const report = new LabReport(req.body);
        await report.save();
        res.status(201).send(report);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Upload Lab Result
router.post('/:id/upload', auth, authorize('Admin', 'Doctor'), upload.single('labResult'), logAction('UPLOAD_LAB_RESULT', 'LabReport'), async (req, res) => {
    try {
        const report = await LabReport.findById(req.params.id);
        if (!report) return res.status(404).send({ error: 'Report not found' });

        report.filePath = req.file.path;
        report.status = 'Completed';
        await report.save();
        res.send(report);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
// Get All Lab Reports (Dashboard)
router.get('/', auth, async (req, res) => {
    try {
        const { status, patient } = req.query;
        let query = {};
        if (status) query.status = status;
        if (patient) query.patient = patient;

        const reports = await LabReport.find(query)
            .populate('patient', 'name phone')
            .populate('doctor', 'name')
            .sort({ createdAt: -1 });
        res.send(reports);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update Lab Report Status
router.patch('/:id/status', auth, authorize('Admin', 'Doctor'), logAction('UPDATE_LAB_STATUS', 'LabReport'), async (req, res) => {
    try {
        const { status } = req.body;
        const report = await LabReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!report) return res.status(404).send({ error: 'Report not found' });
        res.send(report);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Lab Reports for Patient
router.get('/patient/:id', auth, async (req, res) => {
    try {
        const reports = await LabReport.find({ patient: req.params.id }).sort({ createdAt: -1 });
        res.send(reports);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
