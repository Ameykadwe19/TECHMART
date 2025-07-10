import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', stock: '', image: '', storage: '', ram: '', processor: '', brand: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        if (payload.role === 'admin') {
          setIsAdmin(true);
          fetchProducts();
          return;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    navigate('/');
  }, [navigate, token]);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get(`/products?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched products:', data);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editProduct) {
        const { data } = await API.put(`/products/${editProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product updated!');
        console.log('Update response:', data);
      } else {
        const { data } = await API.post('/products', productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product created!');
        console.log('Create response:', data);
      }

      setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '', storage: '', ram: '', processor: '', brand: '' });
      setShowForm(false);
      setEditProduct(null);
      setTimeout(() => fetchProducts(), 500);
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || 'Failed to save product'}`);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        const { data } = await API.delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product deleted!');
        console.log('Delete response:', data);
        setTimeout(() => fetchProducts(), 500);
      } catch (error) {
        console.error('Error deleting product:', error.response?.data || error.message);
        alert(`Error: ${error.response?.data?.message || 'Failed to delete product'}`);
      }
    }
  };

  const startEdit = (product) => {
    setEditProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Admin Dashboard</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        {showForm ? 'Cancel' : 'Add Product'}
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">{editProduct ? 'Edit' : 'Add'} Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Product Name" className="p-2 border rounded" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input type="number" placeholder="Price" className="p-2 border rounded" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <input type="text" placeholder="Category" className="p-2 border rounded" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
            <input type="number" placeholder="Stock" className="p-2 border rounded" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
            <input type="text" placeholder="Brand" className="p-2 border rounded" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
            <input type="text" placeholder="RAM" className="p-2 border rounded" value={formData.ram} onChange={(e) => setFormData({ ...formData, ram: e.target.value })} />
            <input type="text" placeholder="Processor" className="p-2 border rounded col-span-2" value={formData.processor} onChange={(e) => setFormData({ ...formData, processor: e.target.value })} />
            <input type="text" placeholder="Storage" className="p-2 border rounded col-span-2" value={formData.storage} onChange={(e) => setFormData({ ...formData, storage: e.target.value })} />
            <textarea placeholder="Description" className="p-2 border rounded col-span-2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <input type="url" placeholder="Image URL" className="p-2 border rounded col-span-2" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
            <div className="col-span-2">
              <ImageUpload onImageUploaded={(url) => setFormData({ ...formData, image: url })} />
            </div>
            <button type="submit" className="bg-green-600 text-white p-2 rounded col-span-2">
              {editProduct ? 'Update' : 'Create'} Product
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            <img src={product.image || '/api/placeholder/200/150'} alt={product.name} className="w-full h-40 object-cover mb-2 rounded" />
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-gray-600">₹{product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            <div className="mt-2 space-x-2">
              <button onClick={() => startEdit(product)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
              <button onClick={() => deleteProduct(product.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
