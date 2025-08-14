// Nama file: seeders/seed-from-csv.js
// (Simpan di dalam direktori 'seeders' yang dibuat oleh Sequelize-CLI)

// Impor model Sequelize yang sudah kita buat
const { sequelize, Category, Product } = require('../models'); 
const fs = require('fs');
const { parse } = require('csv-parse');
const cuid = require('cuid'); // Kita perlu library untuk generate CUID, karena ini tidak bawaan DB

async function main() {
    console.log('Memulai proses seeding dengan Sequelize...');

    const productsData = [];

    // Bagian membaca CSV ini tidak berubah sama sekali
    const parser = fs
        .createReadStream(`${__dirname}/../data/data-seeder.csv`) // Sesuaikan path ke file CSV Anda
        .pipe(parse({
            columns: true,
            skip_empty_lines: true
        }));

    for await (const row of parser) {
        productsData.push(row);
    }

    const chunkSize = 20; // Ukuran batch tetap sama
    console.log(`Total data: ${productsData.length}. Ukuran batch: ${chunkSize}.`);

    for (let i = 0; i < productsData.length; i += chunkSize) {
        const chunk = productsData.slice(i, i + chunkSize);
        const batchNumber = Math.floor(i / chunkSize) + 1;
        console.log(`--- Memproses Batch ${batchNumber} ---`);

        // Menggunakan transaksi Sequelize
        try {
            await sequelize.transaction(async (t) => {
                for (const product of chunk) {
                    const categoryName = product.category;

                    // Terjemahan dari `upsert` Prisma adalah `findOrCreate` di Sequelize
                    // Ini akan mencari kategori, jika tidak ada, ia akan membuatnya.
                    const [category, wasCreated] = await Category.findOrCreate({
                        where: { name: categoryName },
                        defaults: {
                            id: cuid(), // Generate CUID untuk kategori baru
                            name: categoryName
                        },
                        transaction: t // Pastikan operasi ini bagian dari transaksi
                    });

                    // Terjemahan dari `create` Prisma ke `create` Sequelize
                    await Product.create({
                        id: cuid(), // Generate CUID untuk produk baru
                        name: product.product_name,
                        description: product.description,
                        price: parseFloat(product.price),
                        imageUrl: product.image_url,
                        stock: parseInt(product.stock, 10),
                        shopName: product.shop_name,
                        rating: parseFloat(product.rating),
                        reviewsCount: parseInt(product.reviews_count, 10),
                        categoryId: category.id, // Gunakan ID dari kategori yang ditemukan/dibuat
                    }, {
                        transaction: t // Pastikan operasi ini juga bagian dari transaksi
                    });
                }
            });
            console.log(`--- Batch ${batchNumber} selesai ---`);
        } catch (error) {
            console.error(`Error pada Batch ${batchNumber}:`, error);
            // Hentikan proses jika satu batch gagal
            throw error; 
        }
    }

    console.log('✅ Proses seeding dengan Sequelize selesai.');
}

main()
    .catch((e) => {
        console.error('Terjadi error fatal saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        // Tutup koneksi Sequelize
        await sequelize.close();
    });