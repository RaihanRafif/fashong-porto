const { sequelize, Product, Category } = require('../models'); // Impor dari Sequelize
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

require('dotenv').config(); // Memuat variabel dari .env

// Inisialisasi client OpenAI dan Pinecone (tidak ada perubahan di sini)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Tentukan model embedding dan index Pinecone
const embeddingModel = "text-embedding-3-small";
const pineconeIndexName = "fashong"; // PASTIKAN NAMA INI SAMA DENGAN DI DASHBOARD PINECONE

async function main() {
    console.log("Memulai proses indexing...");

    // 1. Ambil semua produk dari database SQL menggunakan Sequelize
    // Ini adalah bagian utama yang diubah dari Prisma
    const allProducts = await Product.findAll({
        include: [{
            model: Category,
            as: 'category', // 'as' harus cocok dengan yang didefinisikan di model Product
            attributes: ['name'] // Hanya ambil kolom nama dari kategori
        }],
        raw: true, // Mengambil data mentah untuk performa lebih baik
        nest: true, // Mengelompokkan hasil relasi (category akan jadi objek)
    });
    console.log(`Ditemukan ${allProducts.length} produk untuk di-index.`);

    // 2. Hubungkan ke index Pinecone
    const index = pinecone.index(pineconeIndexName);

    // 3. Proses dalam batch untuk efisiensi (logika ini tetap sama)
    const batchSize = 50;
    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        console.log(`--- Memproses Batch ${Math.floor(i / batchSize) + 1} ---`);

        // 4. Buat teks yang kaya makna untuk setiap produk
        const textsToEmbed = batch.map(product => {
            // Menggabungkan beberapa field untuk membuat teks yang lebih deskriptif
            // Karena kita menggunakan 'nest: true', category ada di dalam product.category
            return `Nama Produk: ${product.name}. Kategori: ${product.category.name}. Deskripsi: ${product.description}. Toko: ${product.shopName}.`;
        });

        // 5. Buat embeddings menggunakan OpenAI
        console.log("Membuat embeddings dengan OpenAI...");
        const embeddingResponse = await openai.embeddings.create({
            model: embeddingModel,
            input: textsToEmbed,
            dimensions: 1024,
        });

        // 6. Siapkan data vektor untuk Pinecone
        const vectors = batch.map((product, idx) => ({
            id: product.id, // Gunakan ID produk sebagai ID di Pinecone
            values: embeddingResponse.data[idx].embedding,
            metadata: {
                name: product.name,
                category: product.category.name,
            }
        }));

        // 7. Simpan (upsert) vektor ke Pinecone
        console.log("Menyimpan vektor ke Pinecone...");
        await index.upsert(vectors);
    }

    console.log("✅ Proses indexing selesai.");
}

main()
    .catch((e) => {
        console.error("Terjadi error saat indexing:", e);
        process.exit(1);
    })
    .finally(async () => {
        // Tutup koneksi Sequelize setelah selesai
        await sequelize.close();
    });
