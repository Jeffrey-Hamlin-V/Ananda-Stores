const db = require('./db');

const products = [
  { id: 'sugar-50', category: 'sugar', brand: '', weight: '50kg', price: 'xxx.xx', nameEn: 'Sugar', nameTa: 'சீனி' },
  { id: 'maida-lion-50', category: 'flours', brand: 'Lion', weight: '50kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { id: 'maida-lion-30', category: 'flours', brand: 'Lion', weight: '30kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { id: 'maida-lion-10', category: 'flours', brand: 'Lion', weight: '10kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { id: 'maida-cycle-50', category: 'flours', brand: 'Cycle', weight: '50kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { id: 'maida-cycle-30', category: 'flours', brand: 'Cycle', weight: '30kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { id: 'maida-cycle-10', category: 'flours', brand: 'Cycle', weight: '10kg', price: 'xxx.xx', nameEn: 'Maida', nameTa: 'மைதா' },
  { id: 'sooji-lion-30', category: 'flours', brand: 'Lion', weight: '30kg', price: 'xxx.xx', nameEn: 'Sooji', nameTa: 'ரவை' },
  { id: 'atta-lion-5', category: 'flours', brand: 'Lion', weight: '5kg', price: 'xxx.xx', nameEn: 'Whole Wheat Atta', nameTa: 'கோதுமை ஆட்டா' },
  { id: 'atta-lion-30', category: 'flours', brand: 'Lion', weight: '30kg', price: 'xxx.xx', nameEn: 'Whole Wheat Atta', nameTa: 'கோதுமை ஆட்டா' },
  { id: 'dhall-orid-30', category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Orid Dhall', nameTa: 'உளுந்து பருப்பு' },
  { id: 'dhall-toor-30', category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Toor Dhall', nameTa: 'துவரம் பருப்பு' },
  { id: 'dhall-gram-30', category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Gram Dhall', nameTa: 'கொண்டை கடலை' },
  { id: 'dhall-moong-30', category: 'dhalls', brand: '', weight: '30kg', price: 'xxx.xx', nameEn: 'Moong Dhall', nameTa: 'பாசிப்பருப்பு' },
  { id: 'dhall-peas-50', category: 'dhalls', brand: '', weight: '50kg', price: 'xxx.xx', nameEn: 'Peas Dhall', nameTa: 'பட்டாணி பருப்பு' },
  { id: 'oil-ruchi', category: 'oils', brand: 'Ruchi Gold', weight: '', price: 'xxx.xx', nameEn: 'Palm Oil', nameTa: 'பாமா எண்ணெய்' },
  { id: 'oil-sunrich', category: 'oils', brand: 'Sun Rich', weight: '', price: 'xxx.xx', nameEn: 'Sunflower Refined Oil', nameTa: 'சூரியகாந்தி எண்ணெய்' },
  { id: 'salt-25', category: 'other', brand: '', weight: '25kg', price: 'xxx.xx', nameEn: 'Salt', nameTa: 'உப்பு' },
  { id: 'jaggery-25', category: 'other', brand: '', weight: '25kg', price: 'xxx.xx', nameEn: 'Jaggery Powder', nameTa: 'வெல்லப் பொடி' },
];

db.serialize(() => {
  db.run('DELETE FROM products');
  const stmt = db.prepare('INSERT INTO products (id, category, brand, weight, price, nameEn, nameTa) VALUES (?, ?, ?, ?, ?, ?, ?)');
  products.forEach((p) => {
    stmt.run(p.id, p.category, p.brand, p.weight, p.price, p.nameEn, p.nameTa);
  });
  stmt.finalize(() => {
    console.log('Seeding completed.');
    db.close();
  });
});
