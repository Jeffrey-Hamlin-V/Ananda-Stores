const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const db = require('./db');
const authenticateToken = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ananda_stores',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign(
      { username: user.username, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }
    );
    res.json({ token, role: user.role, username: user.username });
  });
});

// GET all products (Public)
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// CREATE product (Protected: All Admins)
app.post('/api/products', authenticateToken, upload.single('image'), (req, res) => {
  const { id, category, brand, weight, price, nameEn, nameTa, stock } = req.body;
  const image = req.file ? req.file.path : null;
  const sql = 'INSERT INTO products (id, category, brand, weight, price, nameEn, nameTa, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [id, category, brand, weight, price, nameEn, nameTa, image, stock || 0];
  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Product created', id: this.lastID });
  });
});

// UPDATE product (Protected: All Admins)
app.put('/api/products/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { category, brand, weight, price, nameEn, nameTa, stock } = req.body;
  
  let sql, params;
  if (req.file) {
    sql = 'UPDATE products SET category = ?, brand = ?, weight = ?, price = ?, nameEn = ?, nameTa = ?, image = ?, stock = ? WHERE id = ?';
    params = [category, brand, weight, price, nameEn, nameTa, req.file.path, stock || 0, req.params.id];
  } else {
    sql = 'UPDATE products SET category = ?, brand = ?, weight = ?, price = ?, nameEn = ?, nameTa = ?, stock = ? WHERE id = ?';
    params = [category, brand, weight, price, nameEn, nameTa, stock || 0, req.params.id];
  }

  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Product updated', changes: this.changes });
  });
});

// DELETE product (Protected: SUPER ADMIN ONLY)
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admin can delete products' });
  }
  const sql = 'DELETE FROM products WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Product deleted', changes: this.changes });
  });
});

// --- User Management (Protected: SUPER ADMIN ONLY) ---

// --- Categories ---

// Seed categories if empty or missing defaults
const defaultCategories = ['sugar', 'flours', 'dhalls', 'oils', 'rice', 'spices', 'other'];
db.all('SELECT name FROM categories', (err, rows) => {
  if (err) return;
  const existing = new Set(rows.map(r => r.name.toLowerCase()));
  defaultCategories.forEach(cat => {
    if (!existing.has(cat)) {
      db.run('INSERT INTO categories (name) VALUES (?)', [cat]);
    }
  });
});

app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.run('INSERT INTO categories (name) VALUES (?)', [name], (err) => {
    if (err) return res.status(400).json({ error: 'Category already exists' });
    res.json({ message: 'Category added' });
  });
});

app.delete('/api/categories/:name', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  db.run('DELETE FROM categories WHERE name = ?', [req.params.name], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Category deleted' });
  });
});

// List all users
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  db.all('SELECT username, role FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create new user
app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  db.run(sql, [username, hashedPassword, role], (err) => {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.json({ message: 'User created' });
  });
});

// Delete user (Protected: SUPER ADMIN ONLY)
app.get('/api/users/:username', authenticateToken, (req, res) => {
  // Check if user exists (simple check for management)
  db.get('SELECT username FROM users WHERE username = ?', [req.params.username], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

app.delete('/api/users/:username', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  
  const targetUsername = req.params.username;
  
  // Prevent self-deletion
  if (targetUsername === req.user.username) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const sql = 'DELETE FROM users WHERE username = ?';
  db.run(sql, [targetUsername], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'User deleted', changes: this.changes });
  });
});

// --- Contact Form (Nodemailer) ---

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // The client receives the email
    subject: `New Message from ${name} (Ananda Stores)`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email // Clicking reply will go to the customer
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email Error:', error);
      return res.status(500).json({ error: 'Failed to send email. Check credentials.' });
    }
    console.log('Email sent info:', info);
    res.json({ message: 'Email sent successfully!' });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use! Try killing the previous process.`);
  } else {
    console.error('Server error:', err);
  }
});
