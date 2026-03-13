const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.serialize(() => {
  db.run("ALTER TABLE products ADD COLUMN image TEXT", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column already exists.');
      } else {
        console.error('Error adding column:', err.message);
      }
    } else {
      console.log('Column "image" added successfully.');
    }
    db.close();
  });
});
