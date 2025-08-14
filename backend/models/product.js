// File: models/product.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            // Definisikan relasi di sini
            // Satu Produk milik satu Kategori
            Product.belongsTo(models.Category, {
                foreignKey: 'categoryId',
                as: 'category',
            });
        }
    }
    Product.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        shopName: {
            type: DataTypes.STRING,
            allowNull: true, // Opsional
        },
        rating: {
            type: DataTypes.FLOAT, // Sequelize akan menggunakan DOUBLE PRECISION
            allowNull: false,
            defaultValue: 0.0,
        },
        reviewsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        // Kolom 'createdAt' dan 'updatedAt' akan dibuat dan dikelola
        // secara otomatis oleh Sequelize jika tidak di-disable.
        categoryId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'Product',
    });
    return Product;
};