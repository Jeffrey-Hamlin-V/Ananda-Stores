const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Migrating database at:', dbPath);
db.serialize(() => {
  db.run("ALTER TABLE products ADD COLUMN image TEXT", (err) => {
    if (err) {
      console.error('Migration failed:', err.message);
    } else {
      console.log('Migration successful: "image" column added.');
    }
    db.close();
  });
});
