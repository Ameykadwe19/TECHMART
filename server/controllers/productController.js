const { Product, Review, User } = require('../models');
const { Op } = require('sequelize');
const { searchUtils, debouncedSearch } = require('../utils/searchUtils');
const { invalidateCache } = require('../middlewares/cacheMiddleware');

// Get all products with advanced search
exports.getAllProducts = async (req, res) => {
  try {
    console.log('Getting products...');
    
    const products = await Product.findAndCountAll({
      order: [['createdAt', 'DESC']]
    });

    // Add stock status to each product
   const productsWithStockStatus = products.rows.map(product => {
  const rawProduct = product.toJSON();
  rawProduct.stockStatus = rawProduct.stock > 0 ? 'In Stock' : 'Out of Stock';
 rawProduct.image = rawProduct.image
  ? (rawProduct.image.startsWith('http') 
      ? rawProduct.image 
      : `${req.protocol}://${req.get('host')}${rawProduct.image.startsWith('/') ? rawProduct.image : '/' + rawProduct.image}`
    )
  : '';
    return rawProduct;
});

    console.log('Products found:', products.count);

    res.json({
      success: true,
      products: productsWithStockStatus,
      count: products.count,
      message: products.count === 0 ? 'No products found. Add some products first.' : 'Products fetched successfully'
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Simple search endpoint
exports.searchProducts = async (req, res) => {
  try {
    console.log('Search query:', req.query);
    const { search = '', category = '', minPrice = '', maxPrice = '', ram = '', processor = '', storage = '', brand = '' } = req.query;
    console.log('Extracted filters:', { search, category, minPrice, maxPrice, ram, processor, storage, brand });
    
    let whereClause = {};
    
    // Search by name
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }
    
    // Filter by category (case-insensitive)
    if (category) {
      whereClause.category = {
        [Op.iLike]: category
      };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // RAM filter
    if (ram) {
      whereClause.ram = {
        [Op.iLike]: `%${ram}%`
      };
    }
    
    // Processor filter
    if (processor) {
      whereClause.processor = {
        [Op.iLike]: `%${processor}%`
      };
    }
    
    // Storage filter
    if (storage) {
      whereClause.storage = {
        [Op.iLike]: `%${storage}%`
      };
    }
    
    // Brand filter
    if (brand) {
      whereClause.brand = {
        [Op.iLike]: `%${brand}%`
      };
    }
    
    console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));
    
    const products = await Product.findAndCountAll({
      where: whereClause,
      limit: 100,
      order: [['createdAt', 'DESC']]
    });
    
    // Add stock status to each product
  const productsWithStockStatus = products.rows.map(product => {
  const rawProduct = product.toJSON();
  rawProduct.stockStatus = rawProduct.stock > 0 ? 'In Stock' : 'Out of Stock';
rawProduct.image = rawProduct.image
  ? (rawProduct.image.startsWith('http') 
      ? rawProduct.image 
      : `${req.protocol}://${req.get('host')}${rawProduct.image.startsWith('/') ? rawProduct.image : '/' + rawProduct.image}`
    )
  : '';
    return rawProduct;
});
    
    console.log('Search results:', products.count);
    
    res.json({
      success: true,
      products: productsWithStockStatus,
      count: products.count,
      searchQuery: { search, category, minPrice, maxPrice, ram, processor, storage, brand }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Search error', 
      error: error.message 
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);

   const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Review,
        as: 'reviews',   
        include: [{
          model: User,
          as: 'user',     
          attributes: ['name']
        }]
      }]
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productData = product.toJSON();
    productData.stockStatus = productData.stock > 0 ? 'In Stock' : 'Out of Stock';
    productData.availableStock = productData.stock;
    productData.price = productData.price ? parseFloat(productData.price).toFixed(2) : '0.00';

    console.log('Product reviews:', productData.Reviews ? productData.Reviews.length : 0);

    res.json({
      success: true,
      product: productData
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: error.message 
    });
  }
};


// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    const { name, description, price, category, stock, image, images } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
      images
    });
    
    console.log('Product created:', product.toJSON());

    // Clear cache after creating product
    await invalidateCache.products();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updated] = await Product.update(updates, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByPk(id);
    
    // Clear cache after updating product
    await invalidateCache.products();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Clear cache after deleting product
    await invalidateCache.products();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Add review to product
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;
    
    console.log('Adding review:', { productId, userId, rating, comment });
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { productId, userId }
    });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      
      res.json({
        success: true,
        message: 'Review updated successfully',
        review: existingReview
      });
    } else {
      // Create new review
      const review = await Review.create({
        productId,
        userId,
        rating,
        comment
      });

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        review
      });
    }
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding review', 
      error: error.message 
    });
  }
};
