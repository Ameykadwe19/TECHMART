const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' }
    },
    productId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' }
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  });

  // ✅ Associations
  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'Product' });
  };

  return OrderItem;
};
