-- Skema ini adalah terjemahan dari file schema.prisma Anda ke PostgreSQL.
-- Disarankan untuk menjalankan CREATE TABLE "Category" terlebih dahulu karena "Product" memiliki relasi ke sana.

-- 1. Membuat tabel untuk Kategori
CREATE TABLE "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

-- 2. Membuat tabel untuk Produk
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    
    -- Kolom tambahan dari schema Anda
    "stock" INTEGER NOT NULL DEFAULT 0,
    "shopName" TEXT, -- Nullable karena ada tanda tanya (?) di schema
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Kolom untuk Foreign Key
    "categoryId" TEXT NOT NULL,

    -- Mendefinisikan constraint untuk Foreign Key
    CONSTRAINT fk_category
        FOREIGN KEY("categoryId") 
        REFERENCES "Category"("id") 
        ON DELETE RESTRICT -- Mencegah kategori dihapus jika masih ada produk
        ON UPDATE CASCADE  -- Jika ID kategori berubah, ID di produk ikut berubah
);

-- 3. (Best Practice) Membuat Trigger untuk mengupdate kolom "updatedAt" secara otomatis
--    Prisma menangani `@updatedAt` di level aplikasi. Di SQL murni, cara terbaik adalah dengan trigger.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_updated_at
BEFORE UPDATE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- --- SKEMA UNTUK EKSPANSI MASA DEPAN (dari komentar di schema.prisma) ---
-- Anda bisa menjalankan kode di bawah ini nanti jika sudah siap mengimplementasikan fitur User dan Order.

/*

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "password" TEXT NOT NULL, -- Ingat untuk melakukan hashing di level aplikasi!
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Buat trigger untuk User.updatedAt juga
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "status" TEXT NOT NULL, -- Contoh: "PENDING", "PAID", "SHIPPED"
    CONSTRAINT fk_user
        FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE CASCADE
);


CREATE TABLE "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order
        FOREIGN KEY("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    CONSTRAINT fk_product
        FOREIGN KEY("productId") REFERENCES "Product"("id") ON DELETE RESTRICT
);

*/