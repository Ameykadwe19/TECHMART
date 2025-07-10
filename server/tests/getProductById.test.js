const { getProductById } = require('../controllers/productController');
const { Product } = require('../models');

jest.mock('../models', () => ({
  Product: {
    findByPk: jest.fn()
  }
}));

describe('Product Controller - getProductById', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '1' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return product details when product exists', async () => {
    const mockProduct = {
      toJSON: () => ({
        id: 1,
        name: 'Laptop',
        stock: 5,
        price: 999.99,
        Reviews: []
      })
    };

    Product.findByPk.mockResolvedValue(mockProduct);

    await getProductById(req, res);

    expect(Product.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      product: expect.objectContaining({
        id: 1,
        stockStatus: 'In Stock',
        availableStock: 5,
        price: '999.99'
      })
    }));
  });

  it('should return 404 when product not found', async () => {
    Product.findByPk.mockResolvedValue(null);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Product not found'
    });
  });

  it('should handle errors and return 500', async () => {
    Product.findByPk.mockRejectedValue(new Error('Database failure'));

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Error fetching product'
    }));
  });
});
