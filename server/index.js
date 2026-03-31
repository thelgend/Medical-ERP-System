const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// Import Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const visitRoutes = require('./routes/visits');
const billingRoutes = require('./routes/billing');
const inventoryRoutes = require('./routes/inventory');
const labRoutes = require('./routes/lab');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const configRoutes = require('./routes/config');
const backupRoutes = require('./routes/backup');
const logsRoutes = require('./routes/logs');
const drugRoutes = require('./routes/drugs');
const { initScheduler } = require('./utils/scheduler');


// Attach io to app for use in routes
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A client connected for queue display');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/drugs', drugRoutes);


app.get('/', (req, res) => {
    res.send('Medical ERP API is running...');
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
        initScheduler(); // Start backup scheduler
        http.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
