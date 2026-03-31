const express = require('express');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const PDFDocument = require('pdfkit');
const router = express.Router();

// Create a Visit
router.post('/', auth, authorize('Admin', 'Receptionist', 'Doctor'), logAction('CREATE', 'Visit'), async (req, res) => {
    try {
        const visit = new Visit(req.body);
        await visit.save();
        res.status(201).send(visit);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Update Visit (Diagnosis, Prescriptions, Labs)
router.patch('/:id', auth, authorize('Doctor'), logAction('UPDATE', 'Visit'), async (req, res) => {
    const updates = Object.keys(req.body);
    try {
        const visit = await Visit.findById(req.params.id);
        if (!visit) return res.status(404).send({ error: 'Visit not found' });

        updates.forEach((update) => (visit[update] = req.body[update]));
        await visit.save();
        res.send(visit);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Generate Prescription PDF
router.get('/:id/prescription', auth, async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id).populate('patient').populate('doctor', 'name');
        if (!visit || visit.prescription.length === 0) {
            return res.status(404).send({ error: 'Prescription not found' });
        }

        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=prescription_${visit.patient.name}.pdf`,
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        // PDF Content
        doc.fontSize(25).text('Medical Prescription', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Date: ${new Date(visit.date).toLocaleDateString()}`);
        doc.text(`Patient: ${visit.patient.name} (${visit.patient.age} years)`);
        doc.text(`Doctor: Dr. ${visit.doctor.name}`);
        doc.moveDown();
        doc.text('--------------------------------------------------');
        doc.moveDown();
        doc.fontSize(18).text('Rx:', { underline: true });
        doc.moveDown();

        visit.prescription.forEach((m, index) => {
            doc.fontSize(14).text(`${index + 1}. ${m.medicineName}`);
            doc.fontSize(12).text(`   Dosage: ${m.dosage}`);
            doc.text(`   Duration: ${m.duration}`);
            if (m.notes) doc.text(`   Notes: ${m.notes}`);
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(10).text('This is a computer-generated prescription.', { align: 'center', oblique: true });
        doc.end();

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
