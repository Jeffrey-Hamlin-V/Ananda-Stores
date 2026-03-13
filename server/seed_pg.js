const db = require('./db');

const products = [
  { category: 'sugar', brand: '', weight: '50kg', price: 'xxx.xx', nameEn: 'Sugar', nameTa: 'சீனி' },
  { category: 'flours', brand: 'Lion', weight: '50kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { category: 'flours', brand: 'Lion', weight: '30kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { category: 'flours', brand: 'Lion', weight: '10kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { category: 'flours', brand: 'Cycle', weight: '50kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { category: 'flours', brand: 'Cycle', weight: '30kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { category: 'flours', brand: 'Cycle', weight: '10kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { category: 'flours', brand: 'Lion', weight: '30kg', price: 'xxx.xx', nameEn: 'Sooji', nameTa: 'ரவை' },
  { category: 'flours', brand: 'Lion', weight: '5kg', price: 'xxx.xx', nameEn: 'Whole Wheat Atta', nameTa: 'கோதுமை ஆட்டா' },
  { category: 'flours', brand: 'Lion', weight: '30kg', price: 'xxx.xx', nameEn: 'Whole Wheat Atta', nameTa: 'கோதுமை ஆட்டா' },
  { category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Orid Dhall', nameTa: 'உளுந்து பருப்பு' },
  { category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Toor Dhall', nameTa: 'துவரம் பருப்பு' },
  { category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Gram Dhall', nameTa: 'கொண்டை கடலை' },
  { category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Moong Dhall', nameTa: 'பாசிப்பருப்பு' },
  { category: 'dhalls', brand: '', weight: '50kg', price: 'xxx.xx', nameEn: 'Peas Dhall', nameTa: 'பட்டாணி பருப்பு' },
  { category: 'oils', brand: 'Ruchi Gold', weight: '', price: 'xxx.xx', nameEn: 'Palm Oil', nameTa: 'பாமா எண்ணெய்' },
  { category: 'oils', brand: 'Sun Rich', weight: '', price: 'xxx.xx', nameEn: 'Sunflower Refined Oil', nameTa: 'சூரியகாந்தி எண்ணெய்' },
  { category: 'other', brand: '', weight: '25kg', price: 'xxx.xx', nameEn: 'Salt', nameTa: 'உப்பு' },
  { category: 'other', brand: '', weight: '25kg', price: 'xxx.xx', nameEn: 'Jaggery Powder', nameTa: 'வெல்லப் பொடி' },
];

function generateShortcode(name, brand) {
  const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
  const base = `${clean(name)}-${clean(brand)}`.replace(/^-|-$/, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base || 'prod'}-${rand}`;
}

async function seed() {
  try {
    for (const p of products) {
      const id = generateShortcode(p.nameEn, p.brand);
      const sql = 'INSERT INTO products (id, category, brand, weight, price, nameEn, nameTa, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING';
      const params = [id, p.category, p.brand, p.weight, p.price, p.nameEn, p.nameTa, 0];
      await db.query(sql, params);

      // Seed categories table too
      await db.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING', [p.category]);
    }
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    process.exit();
  }
}

seed();
