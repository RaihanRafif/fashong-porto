// File: models/category.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, {
        foreignKey: 'categoryId',
        as: 'products',
      });
    }
  }
  Category.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Category',
    // TAMBAHKAN BARIS INI UNTUK MENONAKTIFKAN TIMESTAMP OTOMATIS
    timestamps: false,
  });
  return Category;
};