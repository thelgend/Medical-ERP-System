const cron = require('node-cron');
const SystemConfig = require('../models/SystemConfig');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const LabReport = require('../models/LabReport');
const Visit = require('../models/Visit');
const Inventory = require('../models/Inventory');
const Queue = require('../models/Queue');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

const performBackup = async () => {
    try {
        console.log('Running scheduled backup...');
        const patients = await Patient.find({});
        const appointments = await Appointment.find({});
        const bills = await Bill.find({});
        const labReports = await LabReport.find({});
        const visits = await Visit.find({});
        const items = await Inventory.find({});
        const queue = await Queue.find({});
        const logs = await AuditLog.find({});
        const config = await SystemConfig.findOne({});

        const backupData = {
            exportDate: new Date(),
            patients,
            appointments,
            bills,
            labReports,
            visits,
            inventory: items,
            queue,
            auditLogs: logs,
            config
        };

        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const fileName = `auto_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(backupData, null, 2));
        
        // Update last backup date
        if (config) {
            config.backupSchedule.lastBackup = new Date();
            await config.save();
        }
        
        console.log(`Backup completed: ${fileName}`);
    } catch (error) {
        console.error('Scheduled backup failed:', error);
    }
};

const initScheduler = async () => {
    // Check config for interval
    const config = await SystemConfig.findOne({});
    const interval = config?.backupSchedule?.interval || 'Manual';

    if (interval === 'Daily') {
        cron.schedule('0 0 * * *', performBackup); // Every day at midnight
        console.log('Daily backup scheduled.');
    } else if (interval === 'Weekly') {
        cron.schedule('0 0 * * 0', performBackup); // Every Sunday at midnight
        console.log('Weekly backup scheduled.');
    }
};

module.exports = { initScheduler, performBackup };
