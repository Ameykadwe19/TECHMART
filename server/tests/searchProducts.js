const { searchProducts } = require('../controllers/productController');
const { Product } = require('../models');

jest.mock('../models', () => ({
  Product: {
    findAndCountAll: jest.fn()
  }
}));

describe('Product Controller - searchProducts', () => {
  let req, res;

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:5000'),
      query: {
        search: 'Phone',
        category: 'Electronics',
        minPrice: '100',
        maxPrice: '1000',
        ram: '8GB',
        processor: 'Intel',
        storage: '256GB',
        brand: 'Samsung'
      }
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  it('should return filtered products with stock status', async () => {
    const mockProducts = {
      count: 1,
      rows: [
        { toJSON: () => ({ id: 1, name: 'Phone', stock: 3, image: '/uploads/phone.jpg' }) }
      ]
    };

    Product.findAndCountAll.mockResolvedValue(mockProducts);

    await searchProducts(req, res);

    expect(Product.findAndCountAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      products: expect.any(Array),
      count: 1
    }));

    const returnedProduct = res.json.mock.calls[0][0].products[0];
    expect(returnedProduct.stockStatus).toBe('In Stock');
  });

  it('should handle errors and return 500', async () => {
    Product.findAndCountAll.mockRejectedValue(new Error('DB error'));

    await searchProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Search error'
    }));
  });
});
