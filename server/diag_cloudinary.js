const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    const result = await cloudinary.uploader.upload('https://placehold.co/200x200?text=Test', {
      folder: 'ananda_stores_test'
    });
    console.log('Upload successful:', result.secure_url);
    await cloudinary.uploader.destroy(result.public_id);
    console.log('Cleanup successful!');
  } catch (err) {
    console.error('Cloudinary test failed:', err);
  } finally {
    process.exit();
  }
}

testUpload();
