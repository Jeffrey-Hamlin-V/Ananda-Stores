const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category TEXT,
      brand TEXT,
      weight TEXT,
      price TEXT,
      nameEn TEXT,
      nameTa TEXT,
      image TEXT,
      stock INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT,
      role TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    )`);
  }
});

module.exports = db;
