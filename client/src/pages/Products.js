import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useCart } from '../context/CartContext';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get('category') || '';   // ✅ Read category from URL
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categoryFromURL);   // ✅ Initialize state from URL
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    ram: '',
    processor: '',
    ssd: '',
    brand: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // { text: 'Added to cart', type: 'success' }
 useEffect(() => {
    setCategory(categoryFromURL);
  }, [categoryFromURL]);

  useEffect(() => {
    fetchProducts();
  }, [search, category, filters]);

  const fetchProducts = async () => {
    try {
      let url = '/products';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.ram) params.append('ram', filters.ram);
      if (filters.processor) params.append('processor', filters.processor);
      if (filters.ssd) params.append('storage', filters.ssd);
      if (filters.brand) params.append('brand', filters.brand);
      
      if (params.toString()) {
        url = `/products/search?${params}`;
      }

      const { data } = await API.get(url);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products');
      setMessage({ text: 'Failed to fetch products.', type: 'error' });
    }
  };
const { fetchCart } = useCart();
  const addToCart = async (productId) => {
    const product = products.find(p => p.id === productId);

    if (!product || product.stock <= 0) {
      setMessage({ text: 'Sorry, this product is out of stock', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Please login first', type: 'error' });
      return;
    }

    try {
      const response = await API.post(
        '/cart',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
      if (response.data.stockLimit) {
        setMessage({ text: `Added to cart! Limited to ${product.stock} items.`, type: 'success' });
      } else {
        setMessage({ text: 'Added to cart!', type: 'success' });
      }

      fetchProducts();
    } catch (error) {
      const msg = error.response?.data?.message || '';
      if (msg === 'Product is out of stock') {
        setMessage({ text: 'Sorry, this product is now out of stock', type: 'error' });
        fetchProducts();
      } else if (msg === 'Please login first') {
        setMessage({ text: 'Please login first', type: 'error' });
      } else {
        setMessage({ text: 'An error occurred. Please try again later.', type: 'error' });
      }
    }
  };
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container mx-auto p-2 sm:p-4">
      {message.text && (
  <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-white z-50 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
    {message.text}
  </div>
)}

      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 focus:outline-none transition-all mb-6 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
          <button
            onClick={() => setCategory('')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              category === '' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setCategory('mobile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              category === 'mobile' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Mobile
          </button>
          <button
            onClick={() => setCategory('tablet')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              category === 'tablet' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Tablet
          </button>
          <button
            onClick={() => setCategory('laptop')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              category === 'laptop' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Laptop
          </button>
        </div>
        
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Min Price</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                >
                  <option value="">Any Min</option>
                  <option value="6000">₹6,000</option>
                  <option value="10000">₹10,000</option>
                  <option value="15000">₹15,000</option>
                  <option value="20000">₹20,000</option>
                  <option value="25000">₹25,000</option>
                  <option value="30000">₹30,000</option>
                  <option value="40000">₹40,000</option>
                  <option value="50000">₹50,000</option>
                  <option value="75000">₹75,000</option>
                  <option value="100000">₹1,00,000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Price</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                >
                  <option value="">Any Max</option>
                  <option value="10000">₹10,000</option>
                  <option value="15000">₹15,000</option>
                  <option value="20000">₹20,000</option>
                  <option value="25000">₹25,000</option>
                  <option value="30000">₹30,000</option>
                  <option value="40000">₹40,000</option>
                  <option value="50000">₹50,000</option>
                  <option value="75000">₹75,000</option>
                  <option value="100000">₹1,00,000</option>
                  <option value="150000">₹1,50,000</option>
                  <option value="200000">₹2,00,000</option>
                </select>
              </div>
              {/* Mobile Filters */}
              {category === 'mobile' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">RAM</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ram} onChange={(e) => setFilters({...filters, ram: e.target.value})}>
                      <option value="">Any RAM</option>
                      <option value="4GB">4GB</option>
                      <option value="6GB">6GB</option>
                      <option value="8GB">8GB</option>
                      <option value="12GB">12GB</option>
                      <option value="16GB">16GB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Processor</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.processor} onChange={(e) => setFilters({...filters, processor: e.target.value})}>
                      <option value="">Any Processor</option>
                      <option value="Snapdragon">Snapdragon</option>
                      <option value="MediaTek">MediaTek</option>
                      <option value="Apple A">Apple A-Series</option>
                      <option value="Exynos">Exynos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ssd} onChange={(e) => setFilters({...filters, ssd: e.target.value})}>
                      <option value="">Any Storage</option>
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                      <option value="">Any Brand</option>
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Oppo">Oppo</option>
                      <option value="Vivo">Vivo</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* Tablet Filters */}
              {category === 'tablet' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">RAM</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ram} onChange={(e) => setFilters({...filters, ram: e.target.value})}>
                      <option value="">Any RAM</option>
                      <option value="4GB">4GB</option>
                      <option value="6GB">6GB</option>
                      <option value="8GB">8GB</option>
                      <option value="12GB">12GB</option>
                      <option value="16GB">16GB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Processor</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.processor} onChange={(e) => setFilters({...filters, processor: e.target.value})}>
                      <option value="">Any Processor</option>
                      <option value="Apple M">Apple M-Series</option>
                      <option value="Snapdragon">Snapdragon</option>
                      <option value="MediaTek">MediaTek</option>
                      <option value="Unisoc">Unisoc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ssd} onChange={(e) => setFilters({...filters, ssd: e.target.value})}>
                      <option value="">Any Storage</option>
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                      <option value="">Any Brand</option>
                      <option value="Apple">Apple iPad</option>
                      <option value="Samsung">Samsung Galaxy Tab</option>
                      <option value="Lenovo">Lenovo Tab</option>
                      <option value="Xiaomi">Xiaomi Pad</option>
                      <option value="Realme">Realme Pad</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* Laptop Filters */}
              {category === 'laptop' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">RAM</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ram} onChange={(e) => setFilters({...filters, ram: e.target.value})}>
                      <option value="">Any RAM</option>
                      <option value="8GB">8GB</option>
                      <option value="16GB">16GB</option>
                      <option value="32GB">32GB</option>
                      <option value="64GB">64GB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Processor</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.processor} onChange={(e) => setFilters({...filters, processor: e.target.value})}>
                      <option value="">Any Processor</option>
                      <option value="Intel Core i3">Intel Core i3</option>
                      <option value="Intel Core i5">Intel Core i5</option>
                      <option value="Intel Core i7">Intel Core i7</option>
                      <option value="Intel Core i9">Intel Core i9</option>
                      <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                      <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                      <option value="Apple M1">Apple M1</option>
                      <option value="Apple M2">Apple M2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ssd} onChange={(e) => setFilters({...filters, ssd: e.target.value})}>
                      <option value="">Any Storage</option>
                      <option value="256GB SSD">256GB SSD</option>
                      <option value="512GB SSD">512GB SSD</option>
                      <option value="1TB SSD">1TB SSD</option>
                      <option value="2TB SSD">2TB SSD</option>
                      <option value="1TB HDD">1TB HDD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                      <option value="">Any Brand</option>
                      <option value="Apple">Apple MacBook</option>
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Lenovo">Lenovo</option>
                      <option value="Asus">Asus</option>
                      <option value="Acer">Acer</option>
                      <option value="MSI">MSI</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* All Products - Show all filters */}
              {category === '' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">RAM</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.ram} onChange={(e) => setFilters({...filters, ram: e.target.value})}>
                      <option value="">Any RAM</option>
                      <option value="4GB">4GB</option>
                      <option value="6GB">6GB</option>
                      <option value="8GB">8GB</option>
                      <option value="16GB">16GB</option>
                      <option value="32GB">32GB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <select className="w-full p-2 border rounded text-sm" value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                      <option value="">Any Brand</option>
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Lenovo">Lenovo</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setFilters({ minPrice: '', maxPrice: '', ram: '', processor: '', ssd: '', brand: '' })}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <img src={product.image || '/api/placeholder/300/200'} alt={product.name} className="w-full h-40 sm:h-48 lg:h-56 object-cover mb-3 sm:mb-4 rounded" />
            <Link to={`/product/${product.id}`} className="text-lg sm:text-xl font-semibold mb-2 hover:text-blue-600 block">{product.name}</Link>
            <p className="text-gray-600 mb-2 text-sm sm:text-base line-clamp-2">{product.description}</p>
            <p className="text-lg sm:text-xl font-bold text-green-600 mb-2">₹{parseFloat(product.price || 0).toFixed(2)}</p>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm">Stock: {product.stock || 0}</p>
              <p className={`text-xs sm:text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockStatus || (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
              </p>
            </div>
            <button 
              onClick={() => addToCart(product.id)}
              disabled={!product.stock || product.stock <= 0}
              className={`w-full p-2 sm:p-3 rounded text-sm sm:text-base ${product.stock > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
