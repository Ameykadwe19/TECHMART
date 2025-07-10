const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: { model: 'Users', key: 'id' } 
    },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { 
      type: DataTypes.ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'), 
      defaultValue: 'pending' 
    },
    paymentStatus: { 
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), 
      defaultValue: 'pending' 
    },
    paymentMethod: { 
      type: DataTypes.ENUM('cod', 'online', 'wallet'), 
      defaultValue: 'cod' 
    },
    name: { type: DataTypes.STRING, allowNull: false },
    shippingAddress: { type: DataTypes.TEXT, allowNull: false },
    mobileNumber: { type: DataTypes.STRING(15), allowNull: false },
    pincode: { type: DataTypes.STRING(10), allowNull: false },
    refundReason: { type: DataTypes.STRING }
  });

  // ✅ Associations
  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
  };

  return Order;
};
