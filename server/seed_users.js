const db = require('./db');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  const superPassword = await bcrypt.hash('12345678', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  db.serialize(() => {
    db.run('DELETE FROM users');
    
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    stmt.run('SuperAdmin', superPassword, 'super_admin');
    stmt.run('Admin', adminPassword, 'admin');
    
    stmt.finalize(() => {
      console.log('User seeding completed.');
      db.close();
    });
  });
};

seedUsers();
