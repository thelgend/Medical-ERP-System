const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    visitTypes: { type: [String], default: ['فحص دوري', 'متابعة', 'طوارئ', 'استشارة'] },
    timeSlots: { type: [String], default: [
        '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', 
        '11:00 - 11:30', '12:00 - 12:30', '01:00 - 01:30'
    ]},
    labTestTypes: { type: [String], default: [
        'تحليل دم كامل (CBC)',
        'وظائف كبد (Liver Function)',
        'وظائف كلى (Kidney Function)',
        'سكر تراكمي (HbA1c)',
        'تحليل بول (Urine Analysis)',
        'هرمون الغدة الدرقية (TSH)',
        'صورة دم سرعة ترسيب (ESR)'
    ]},
    clinicInfo: {
        name: { type: String, default: 'عيادة الأمل الطبية' },
        address: { type: String, default: 'القاهرة، مصر' },
        phone: { type: String, default: '+20 123 456 789' },
        logo: { type: String }
    },
    services: [{
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 }
    }],
    backupSchedule: {
        interval: { type: String, enum: ['Daily', 'Weekly', 'Manual'], default: 'Manual' },
        lastBackup: { type: Date }
    },
    defaultSettings: {
        language: { type: String, enum: ['ar', 'en'], default: 'ar' },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
