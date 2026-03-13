const db = require('./db');

async function test() {
  try {
    const id = 'test-' + Date.now();
    const sql = 'INSERT INTO products (id, category, brand, weight, price, nameEn, nameTa, image, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    const params = [id, 'Test Category', 'Test Brand', '1kg', '100', 'Test En', 'Test Ta', null, 10];
    await db.query(sql, params);
    console.log('Insert successful!');
    
    const res = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    console.log('Select successful:', res.rows[0]);
    
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    console.log('Delete successful!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit();
  }
}

test();
