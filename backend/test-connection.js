// File: test-connection.js
const { sequelize } = require('./models'); // Impor dari file index.js yang dibuat otomatis

async function testConnection() {
  console.log('Mencoba menghubungkan ke database...');
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke database berhasil dibuat!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
  } finally {
    // Tutup koneksi setelah selesai
    await sequelize.close();
  }
}

testConnection();