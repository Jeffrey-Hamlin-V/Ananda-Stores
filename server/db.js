const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway/Render/etc.
  }
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database.');
    
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        userid TEXT PRIMARY KEY,
        password TEXT,
        role TEXT
      );
    `);

    // Create Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        nameEn TEXT,
        nameTa TEXT,
        brand TEXT,
        weight TEXT,
        category TEXT,
        price TEXT,
        stock INTEGER DEFAULT 0,
        image TEXT
      );
    `);

    // Create Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY
      );
    `);

  } catch (err) {
    console.error('Error initializing PostgreSQL schemas:', err.message);
  } finally {
    client.release();
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
