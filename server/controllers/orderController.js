const { Order, OrderItem, Product, User, Cart } = require('../models');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      attributes: [   // ✅ Add this block to include totalAmount
        'id',
        'totalAmount',     // ✅ This is what was missing in your response
        'status',
        'paymentMethod',
        'paymentStatus',
        'shippingAddress',
        'mobileNumber',
        'pincode',
        'createdAt'
      ],
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['name', 'price', 'image']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};



// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod = 'cod', mobileNumber, pincode } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No items in order' 
      });
    }
    
    // Get all products with stock information
    const productIds = items.map(item => item.productId);
    const existingProducts = await Product.findAll({
      where: { id: productIds },
      attributes: ['id', 'name', 'price', 'stock']
    });
    
    // Check if any products are missing
    const foundProductIds = existingProducts.map(p => p.id);
    const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
    
    if (missingProductIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Products not found: ${missingProductIds.join(', ')}`
      });
    }
    
    // Check if any products are out of stock
    const outOfStockProducts = [];
    const productsMap = {};
    
    existingProducts.forEach(product => {
      productsMap[product.id] = product;
    });
    
    for (const item of items) {
      const product = productsMap[item.productId];
      if (product.stock < item.quantity) {
        outOfStockProducts.push({
          id: product.id,
          name: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }
    
    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products are out of stock',
        outOfStockProducts
      });
    }

    // Create order with correct total amount
    let calculatedTotal = 0;
    for (const item of items) {
      const product = productsMap[item.productId];
      calculatedTotal += parseFloat(product.price) * item.quantity;
    }
    
    // Set initial status based on payment method
    let initialStatus = 'processing';
    let paymentStatus = 'pending';
    
    if (paymentMethod === 'cod') {
      initialStatus = 'processing';
      paymentStatus = 'pending';
    } else if (paymentMethod === 'online') {
      initialStatus = 'pending';
      paymentStatus = 'pending';
    }
    
    // Get user name for order
    const user = await User.findByPk(userId, { attributes: ['name'] });
    
    const order = await Order.create({
      userId,
      name: user.name,
      totalAmount: calculatedTotal.toFixed(2),
      shippingAddress,
      mobileNumber,
      pincode,
      status: initialStatus,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod
    });

    // Create order items with correct prices from database
    const orderItems = items.map(item => {
      const product = productsMap[item.productId];
      return {
        orderId: order.id,
        productId: parseInt(item.productId, 10),
        quantity: item.quantity,
        price: parseFloat(product.price)
      };
    });

    await OrderItem.bulkCreate(orderItems);
    
    // Update product stock
    for (const item of items) {
      const product = productsMap[item.productId];
      await Product.update(
        { stock: product.stock - item.quantity },
        { where: { id: item.productId } }
      );
    }

    // Clear user's cart after successful order
    await Cart.destroy({
      where: { userId }
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.id,
      totalAmount: calculatedTotal.toFixed(2)
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error placing order', 
      error: error.message 
    });
  }
};
