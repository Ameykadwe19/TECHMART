const { Order, OrderItem, Cart, Product, sequelize } = require('../models');

// Create payment intent for Stripe
exports.createPaymentIntent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { amount, orderId } = req.body;
    const userId = req.user.id;

    // For demo - create mock order if not exists
    let order = await Order.findOne({
      where: { id: orderId, userId },
      transaction
    });

    if (!order) {
      // Create mock order for demo
      order = await Order.create({
        id: orderId,
        userId: userId,
        totalAmount: amount,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: 'Demo Address'
      }, { transaction });
    }

    // Update order status to processing
    await Order.update(
      { status: 'processing', paymentStatus: 'pending' },
      { where: { id: orderId }, transaction }
    );

    // Basic payment intent creation
    const paymentIntent = {
      id: 'pi_' + Date.now(),
      amount: amount * 100, // Convert to paise (INR smallest unit)
      currency: 'inr',
      status: 'requires_payment_method',
      client_secret: 'pi_' + Date.now() + '_secret',
      metadata: { orderId, userId }
    };

    await transaction.commit();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntent
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { type, data } = req.body;

    if (type === 'payment_intent.succeeded') {
      const orderId = data.object.metadata?.orderId;
      const userId = data.object.metadata?.userId;
      
      if (orderId) {
        // Update order status to paid
        await Order.update(
          { status: 'paid', paymentStatus: 'completed' },
          { where: { id: orderId }, transaction }
        );

        // Clear user's cart after successful payment
        if (userId) {
          await Cart.destroy({
            where: { userId },
            transaction
          });
        }

        await transaction.commit();
      }
    } else if (type === 'payment_intent.payment_failed') {
      const orderId = data.object.metadata?.orderId;
      
      if (orderId) {
        // Rollback order status to pending
        await Order.update(
          { status: 'pending', paymentStatus: 'failed' },
          { where: { id: orderId }, transaction }
        );
        
        await transaction.commit();
      }
    }

    res.json({ received: true });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: 'Webhook error', error: error.message });
  }
};

// Process Cash on Delivery payment
exports.processCodPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    
    // Find the order
    const order = await Order.findOne({
      where: { id: orderId, userId }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({
        success: false,
        message: 'This order is not a Cash on Delivery order'
      });
    }
    
    // Update order status
    await Order.update(
      { status: 'processing', paymentStatus: 'pending' },
      { where: { id: orderId } }
    );
    
    res.json({
      success: true,
      message: 'Cash on Delivery order confirmed',
      orderId
    });
  } catch (error) {
    console.error('COD processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Cash on Delivery order',
      error: error.message
    });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findByPk(orderId, { transaction });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'paid') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Order is not paid' });
    }

    // Update order status
    await Order.update(
      { 
        status: 'refunded', 
        paymentStatus: 'refunded',
        refundReason: reason 
      },
      { where: { id: orderId }, transaction }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error processing refund', error: error.message });
  }
};