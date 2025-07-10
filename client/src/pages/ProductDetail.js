import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState({ text: '', type: '' }); // { text: '', type: 'success' | 'error' }
  const { incrementCart, fetchCart } = useCart();
  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      setReviews(data.product.reviews || []);
    } catch (error) {
      console.error('Error fetching product:', error.response?.data || error.message);
      setMessage({ text: 'Failed to load product details.', type: 'error' });
    }
  };

  const addToCart = async () => {
    if (product.stock <= 0) {
      setMessage({ text: 'Sorry, this product is out of stock', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Please login first', type: 'error' });
      return;
    }

    try {
      const response = await API.post('/cart', { productId: id, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.stockLimit) {
        setMessage({ text: `Added to cart! Limited to ${product.stock} items.`, type: 'success' });
      } else {
        setMessage({ text: 'Added to cart successfully!', type: 'success' });
      }
      incrementCart();      // ✅ Immediate cart count update
    fetchProduct(); 
    } catch (error) {
      if (error.response?.data?.message === 'Product is out of stock') {
        setMessage({ text: 'Sorry, this product is now out of stock', type: 'error' });
        fetchProduct();
      } else {
        setMessage({ text: 'Please login first', type: 'error' });
      }
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.comment.trim()) {
      setMessage({ text: 'Please enter a comment for your review', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Please login to add a review', type: 'error' });
      return;
    }

    try {
      const response = await API.post(`/products/${id}/review`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage({ text: response.data.message || 'Review added successfully!', type: 'success' });
        setReviewForm({ rating: 5, comment: '' });
        fetchProduct();
      } else {
        setMessage({ text: 'Error: ' + response.data.message, type: 'error' });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage({ text: 'Please login to add a review', type: 'error' });
      } else {
        setMessage({ text: 'Error adding review: ' + (error.response?.data?.message || error.message), type: 'error' });
      }
    }
  };

  if (!product) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 relative">

      {/* Fixed Toast Notifications */}
      {message.text && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-white z-50 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image || '/api/placeholder/400/400'}
            alt={product.name}
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description || 'No description available'}</p>
          <p className="text-2xl font-bold text-green-600 mb-4">
            ₹{parseFloat(product.price || 0).toFixed(2)}
          </p>
          <p className="text-gray-600 mb-4">Category: {product.category}</p>
          <p className="text-gray-600 mb-2">Stock: {product.stock}</p>
          <p className={`mb-6 font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stockStatus || (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
          </p>
          <button
            onClick={addToCart}
            disabled={product.stock <= 0}
            className={`px-6 py-3 rounded-lg ${
              product.stock > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        <form onSubmit={submitReview} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Review</h3>
          <div className="mb-4">
            <label className="block mb-2">Rating:</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="p-2 border rounded"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Comment:</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Submit Review
          </button>
        </form>

        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                  <span className="text-yellow-500">{'★'.repeat(parseInt(review.rating) || 0)}</span>
                </div>
                <p className="text-gray-600">{review.comment || 'No comment'}</p>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
