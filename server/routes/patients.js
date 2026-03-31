const express = require('express');
const fs = require('fs');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const LabReport = require('../models/LabReport');
const { auth, authorize } = require('../middleware/auth');
const logAction = require('../middleware/auditLog');
const { generateArabicRegex } = require('../utils/stringUtils');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/patients');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Add Patient
router.post('/', auth, authorize('Admin', 'Receptionist'), logAction('CREATE', 'Patient'), async (req, res) => {
    try {
        const body = { ...req.body };
        console.log('Patient Create Request Body:', body);
        if (!body.patientID) {
            body.patientID = `P-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        const patient = new Patient(body);
        await patient.save();
        res.status(201).send(patient);
    } catch (error) {
        console.error('[Patient Create Error Detailed]:', error);
        
        // Write to local file for debug
        try {
            const logEntry = `[${new Date().toISOString()}] 400 ERROR\nError: ${error.message}\nStack: ${error.stack}\nBody: ${JSON.stringify(req.body, null, 2)}\n-------------------\n`;
            fs.appendFileSync('debug_error.log', logEntry);
        } catch (fsErr) {
            console.error('Failed to write debug log:', fsErr);
        }

        // Extract validation errors for clarity
        const validationError = error.errors ? Object.values(error.errors).map(e => e.message).join(', ') : error.message;
        res.status(400).send({ error: validationError, details: error.errors });
    }
});

// Smart Search / List Patients
router.get('/', auth, async (req, res) => {
    try {
        const search = req.query.search;
        let query = {};
        if (search) {
            const arabicRegex = generateArabicRegex(search);
            console.log(`[Search] Query: "${search}" | Regex: ${arabicRegex.source}`);
            query = {
                $or: [
                    { name: { $regex: arabicRegex.source, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { patientID: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const patients = await Patient.find(query).sort({ createdAt: -1 });
        res.send(patients);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Excel Export
router.get('/export', auth, authorize('Admin'), logAction('EXPORT_EXCEL', 'Patient'), async (req, res) => {
    try {
        const patients = await Patient.find({});
        const worksheet = xlsx.utils.json_to_sheet(patients.map(p => ({
            ID: p.patientID,
            Name: p.name,
            Age: p.age,
            Gender: p.gender,
            Phone: p.phone,
            Address: p.address
        })));
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Patients');
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=patients.xlsx');
        res.send(buffer);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update Patient
router.patch('/:id', auth, authorize('Admin', 'Receptionist'), logAction('UPDATE', 'Patient'), async (req, res) => {
    try {
         const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!patient) return res.status(404).send({ error: 'Patient not found' });
        res.send(patient);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete Patient
router.delete('/:id', auth, authorize('Admin'), logAction('DELETE', 'Patient'), async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) return res.status(404).send({ error: 'Patient not found' });
        
        await Appointment.deleteMany({ patient: req.params.id });
        await Visit.deleteMany({ patient: req.params.id });

        res.send({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Single Patient
router.get('/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).send({ error: 'Patient not found' });
        res.send(patient);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// File Upload (X-ray, MRI, etc.)
router.post('/:id/upload', auth, authorize('Admin', 'Doctor'), upload.single('medicalFile'), logAction('UPLOAD_FILE', 'Patient'), async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).send({ error: 'Patient not found' });

        const fileData = {
            fileName: req.file.originalname,
            fileType: req.body.fileType || 'Other',
            filePath: req.file.path
        };

        patient.medicalFiles.push(fileData);
        await patient.save();
        res.send(patient);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Excel Import
router.post('/import', auth, authorize('Admin'), upload.single('excelFile'), logAction('IMPORT_EXCEL', 'Patient'), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const patients = data.map(item => ({
            patientID: item.ID || `P-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.Name,
            age: item.Age,
            gender: item.Gender,
            phone: item.Phone,
            address: item.Address
        }));

        await Patient.insertMany(patients);
        res.send({ message: 'Patients imported successfully', count: patients.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Patient History (Timeline)
router.get('/:id/history', auth, async (req, res) => {
    try {
        const patientId = req.params.id;
        
        // Fetch all related data
        const [visits, labReports, bills] = await Promise.all([
            Visit.find({ patient: patientId }).sort({ date: -1 }).populate('doctor', 'name'),
            LabReport.find({ patient: patientId }).sort({ createdAt: -1 }).populate('doctor', 'name'),
            Bill.find({ patient: patientId }).sort({ createdAt: -1 }).populate('doctor', 'name')
        ]);

        // Combine and format for timeline
        const timeline = [
            ...visits.map(v => ({
                id: v._id,
                type: 'visit',
                date: v.date,
                title: 'Medical Visit',
                subtitle: `Dr. ${v.doctor?.name || 'Unknown'}`,
                content: v.chiefComplaint,
                diagnosis: v.diagnosis,
                prescription: v.prescription,
                vitals: v.vitals,
                status: v.status
            })),
            ...labReports.map(l => ({
                id: l._id,
                type: 'lab',
                date: l.createdAt,
                title: 'Laboratory Test',
                subtitle: l.testName,
                content: `Status: ${l.status}`,
                result: l.result,
                filePath: l.filePath
            })),
            ...bills.map(b => ({
                id: b._id,
                type: 'billing',
                date: b.createdAt,
                title: 'Financial Invoice',
                subtitle: `${b.payableAmount} EGP`,
                content: `Status: ${b.status}`,
                total: b.totalAmount,
                items: b.items
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.send(timeline);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
