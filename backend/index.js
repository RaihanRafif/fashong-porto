// Import library yang diperlukan
const express = require('express');
const cors = require('cors');
const router = require('./routes/productRoutes');
require('dotenv').config(); // Memuat semua variabel dari file .env

// Import rute utama aplikasi kita

// Inisialisasi aplikasi Express
const app = express();

// --- Middleware ---
// 1. CORS (Cross-Origin Resource Sharing)
//    Mengizinkan frontend Next.js Anda (yang berjalan di port berbeda) untuk mengakses API ini.
app.use(cors());

// 2. Express JSON Parser
//    Mengizinkan server untuk menerima dan memahami data dalam format JSON dari request body.
app.use(express.json());


console.log("1111");


// --- Rute API ---
// Semua rute yang dimulai dengan /api akan diarahkan ke file productRoutes.js
app.use('/api-fashong', router);

// --- Menjalankan Server ---
// Ambil port dari environment variable, atau gunakan port 8000 sebagai default
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan dengan mulus di http://localhost:${PORT}`);
});