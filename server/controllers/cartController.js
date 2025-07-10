const { Cart, Product, User } = require('../models');

// Get user's cart
exports.getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'image']
      }]
    });
    
    res.json({
      success: true,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    
    // Check if product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    if (product.stock <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Product is out of stock',
        stockStatus: 'Out of Stock'
      });
    }

    const existingItem = await Cart.findOne({
      where: { userId, productId }
    });

    let newQuantity;
    
    if (existingItem) {
      // Calculate new quantity
      newQuantity = existingItem.quantity + quantity;
      
      // Limit to available stock
      if (newQuantity > product.stock) {
        newQuantity = product.stock;
      }
      
      existingItem.quantity = newQuantity;
      await existingItem.save();
      
      res.json({ 
        success: true, 
        message: 'Cart updated', 
        item: existingItem,
        stockLimit: newQuantity === product.stock
      });
    } else {
      // Limit new item quantity to available stock
      const newItemQuantity = Math.min(quantity, product.stock);
      
      const newItem = await Cart.create({ 
        userId, 
        productId, 
        quantity: newItemQuantity 
      });
      
      res.json({ 
        success: true, 
        message: 'Item added to cart', 
        item: newItem,
        stockLimit: newItemQuantity === product.stock
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding to cart', 
      error: error.message 
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    let { quantity } = req.body;
    const userId = req.user.id;

    // Ensure quantity is positive
    quantity = Math.max(1, parseInt(quantity, 10));

    const cartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Check product stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Limit quantity to available stock
    if (quantity > product.stock) {
      quantity = product.stock;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: 'Cart item updated',
      item: cartItem,
      stockLimit: quantity === product.stock
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    console.log(`Removing item: Product ID ${productId} for User ID ${userId}`);
    
    // First check if the item exists
    const cartItem = await Cart.findOne({
      where: { 
        userId: userId,
        productId: productId 
      }
    });
    
    if (!cartItem) {
      // Item not found, but return success anyway to keep UI in sync
      return res.json({ 
        success: true,
        message: 'Item not in cart' 
      });
    }
    
    // Delete the item
    await cartItem.destroy();
    
    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    // Return success even on error to prevent UI issues
    res.json({ 
      success: true,
      message: 'Cart updated' 
    });
  }
};