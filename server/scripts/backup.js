const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const backupData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        const backupDir = path.join(__dirname, '../backups', `backup-${Date.now()}`);
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        for (const collection of collections) {
            const data = await mongoose.connection.db.collection(collection.name).find({}).toArray();
            fs.writeFileSync(
                path.join(backupDir, `${collection.name}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`Backed up ${collection.name}`);
        }

        console.log(`Backup completed successfully in ${backupDir}`);
        process.exit(0);
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
};

backupData();
