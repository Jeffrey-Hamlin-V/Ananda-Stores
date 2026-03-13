const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');
console.log('Targeting database at:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err.message);
      return;
    }
    
    const hasImage = columns.some(c => c.name === 'image');
    if (!hasImage) {
      console.log('Adding "image" column...');
      db.run("ALTER TABLE products ADD COLUMN image TEXT", (alterErr) => {
        if (alterErr) {
          console.error('Error adding column:', alterErr.message);
        } else {
          console.log('Column added successfully.');
        }
        db.close();
      });
    } else {
      console.log('Column "image" already exists.');
      db.close();
    }
  });
});
