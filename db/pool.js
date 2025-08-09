const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });





module.exports = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});