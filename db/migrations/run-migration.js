const pool = require('../pool');
const fs = require('fs');
const path = require('path');


const sqlToMigrate = "/001_init.sql"
const migrationFilePath = path.join(__dirname, sqlToMigrate)

const runMigration = async () => {
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync(migrationFilePath, { encoding: 'utf-8' });
        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Error running migration:', error);
    } finally {
        client.release();
    }
};


runMigration();