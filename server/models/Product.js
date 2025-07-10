const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING
    },
    images: {
      type: DataTypes.TEXT
    },
    storage: {
      type: DataTypes.STRING
    },
    ram: {
      type: DataTypes.STRING
    },
    processor: {
      type: DataTypes.STRING
    },
    brand: {
      type: DataTypes.STRING
    }
  });

  // ✅ Add this association:
  Product.associate = (models) => {
    Product.hasMany(models.Review, { foreignKey: 'productId', as: 'reviews' });
  };

  return Product;
};
