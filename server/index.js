const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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

// Helper: Generate Shortcode
function generateShortcode(name, brand) {
  const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
  const base = `${clean(name)}-${clean(brand)}`.replace(/^-|-$/, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base || 'prod'}-${rand}`;
}

// Helper: Ensure Category Exists
async function ensureCategory(category) {
  if (!category) return;
  const cat = category.trim();
  const res = await db.query('SELECT name FROM categories WHERE LOWER(name) = LOWER($1)', [cat]);
  if (res.rows.length === 0) {
    await db.query('INSERT INTO categories (name) VALUES ($1)', [cat]);
  }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE userid = $1', [username]);
    const user = result.rows[0];
    
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign(
      { username: user.userid, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }
    );
    res.json({ token, role: user.role, username: user.userid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all products (Public)
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products');
    // Map PG lowercase columns to camelCase for frontend
    const mapped = result.rows.map(p => ({
      ...p,
      nameEn: p.nameen,
      nameTa: p.nameta
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE product (Protected: All Admins)
app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
  console.log('POST /api/products request body:', req.body);
  const { category, brand, weight, price, nameEn, nameTa, stock } = req.body;
  const image = req.file ? req.file.path : null;
  const id = generateShortcode(nameEn, brand);

  try {
    await ensureCategory(category);
    const sql = 'INSERT INTO products (id, category, brand, weight, price, nameEn, nameTa, image, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    const params = [id, category, brand, weight, price, nameEn, nameTa, image, parseInt(stock) || 0];
    await db.query(sql, params);
    res.json({ message: 'Product created', id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE product (Protected: All Admins)
app.put('/api/products/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { category, brand, weight, price, nameEn, nameTa, stock } = req.body;
  const id = req.params.id;

  try {
    await ensureCategory(category);
    let sql, params;
    if (req.file) {
      sql = 'UPDATE products SET category = $1, brand = $2, weight = $3, price = $4, nameEn = $5, nameTa = $6, image = $7, stock = $8 WHERE id = $9';
      params = [category, brand, weight, price, nameEn, nameTa, req.file.path, parseInt(stock) || 0, id];
    } else {
      sql = 'UPDATE products SET category = $1, brand = $2, weight = $3, price = $4, nameEn = $5, nameTa = $6, stock = $7 WHERE id = $8';
      params = [category, brand, weight, price, nameEn, nameTa, parseInt(stock) || 0, id];
    }
    await db.query(sql, params);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product (Protected: SUPER ADMIN ONLY)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admin can delete products' });
  }
  try {
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT name FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/categories error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- User Management (Protected: SUPER ADMIN ONLY) ---

app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  try {
    const result = await db.query('SELECT userid as username, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (userid, password, role) VALUES ($1, $2, $3)', [username, hashedPassword, role]);
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists or database error' });
  }
});

app.delete('/api/users/:username', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.sendStatus(403);
  const targetUsername = req.params.username;
  if (targetUsername === req.user.username) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  try {
    await db.query('DELETE FROM users WHERE userid = $1', [targetUsername]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
