const { getAllProducts } = require('../controllers/productController');
const { Product } = require('../models');

jest.mock('../models', () => ({
  Product: {
    findAndCountAll: jest.fn()
  }
}));

describe('Product Controller - getAllProducts', () => {
  let req, res;

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:5000')
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  it('should return products with stock status and success true', async () => {
    const mockProducts = {
      count: 2,
      rows: [
        { toJSON: () => ({ id: 1, name: 'Phone', stock: 5, image: '/uploads/phone.jpg' }) },
        { toJSON: () => ({ id: 2, name: 'Laptop', stock: 0, image: '' }) }
      ]
    };

    Product.findAndCountAll.mockResolvedValue(mockProducts);

    await getAllProducts(req, res);

    expect(Product.findAndCountAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      products: expect.any(Array),
      count: 2
    }));

    const returnedProducts = res.json.mock.calls[0][0].products;
    expect(returnedProducts[0].stockStatus).toBe('In Stock');
    expect(returnedProducts[1].stockStatus).toBe('Out of Stock');
  });

  it('should handle errors and return 500', async () => {
    Product.findAndCountAll.mockRejectedValue(new Error('Database error'));

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Error fetching products'
    }));
  });
});
