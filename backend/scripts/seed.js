const { PrismaClient } = require('../generated/prisma');
const fs = require('fs');
const { parse } = require('csv-parse');

const prisma = new PrismaClient();

async function main() {
    console.log('Memulai proses seeding dengan strategi batching dan timeout...');

    const productsData = [];

    const parser = fs
        .createReadStream(`${__dirname}/data-seeder.csv`)
        .pipe(parse({
            columns: true,
            skip_empty_lines: true
        }));


    for await (const row of parser) {
        productsData.push(row);
    }

    const chunkSize = 20;
    console.log(`Total data: ${productsData.length}. Ukuran batch: ${chunkSize}.`);

    for (let i = 0; i < productsData.length; i += chunkSize) {
        const chunk = productsData.slice(i, i + chunkSize);
        const batchNumber = Math.floor(i / chunkSize) + 1;
        console.log(`--- Memproses Batch ${batchNumber} ---`);

        await prisma.$transaction(async (tx) => {
            for (const product of chunk) {
                const categoryName = product.category;

                const category = await tx.category.upsert({
                    where: { name: categoryName },
                    update: {},
                    create: { name: categoryName },
                });

                await tx.product.create({
                    data: {
                        name: product.product_name,
                        description: product.description,
                        price: parseFloat(product.price),
                        imageUrl: product.image_url,
                        stock: parseInt(product.stock, 10),
                        shopName: product.shop_name,
                        rating: parseFloat(product.rating),
                        reviewsCount: parseInt(product.reviews_count, 10),
                        categoryId: category.id,
                    },
                });
            }
        }, {
            // SOLUSI: Menggunakan batas MAKSIMAL yang diizinkan Accelerate.
            timeout: 15000,
        });
        console.log(`--- Batch ${batchNumber} selesai ---`);
    }

    console.log('Proses seeding dengan strategi batching dan timeout selesai.');
}



main()
    .catch((e) => {
        console.error('Terjadi error saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });