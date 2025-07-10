const { User, Order, Product } = require('../models');
const { Op } = require('sequelize');

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: User,
        attributes: ['id', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get analytics data (simplified)
exports.getAnalytics = async (req, res) => {
  try {
    console.log('Getting analytics...');
    
    // Basic counts only - exclude admin users
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    
    console.log('Analytics data:', { totalUsers, totalOrders, totalProducts });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalOrders,
        totalRevenue: 0, // Mock for demo
        totalProducts,
        message: 'Analytics data fetched successfully'
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Export orders to CSV
exports.exportOrdersToCSV = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: User,
        attributes: ['email']
      }]
    });
    
    // Create CSV header
    let csv = 'Order ID,User Email,Total Amount,Status,Date\n';
    
    // Add order data
    orders.forEach(order => {
      csv += `${order.id},${order.User?.email || 'N/A'},${order.totalAmount},${order.status},${order.createdAt}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting orders', error: error.message });
  }
};