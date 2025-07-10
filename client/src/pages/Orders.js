import React, { useState, useEffect } from 'react';
import API from '../utils/api';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await API.get('/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setOrders(data.orders || []);
  } catch (error) {
    console.error('Error fetching orders', error.response?.data || error.message);
  }
};


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-white p-4 mb-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Order #{order.id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-gray-600 mb-2">Total: ₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
            <p className="text-gray-600 mb-2">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-600 mb-2">
              Payment: <span className="font-medium">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                 order.paymentMethod === 'online' ? 'Online Payment' : 
                 order.paymentMethod || 'Not specified'}
              </span> 
              ({order.paymentStatus})
            </p>
            <div className="text-gray-600 mb-2">
              <p>Contact: {order.mobileNumber || 'Not provided'}</p>
              <p>Pincode: {order.pincode || 'Not provided'}</p>
              <p className="mb-4">Address: {order.shippingAddress}</p>
            </div>
            
       {order.OrderItems?.length > 0 && (
  <div>
    <h4 className="font-semibold mb-2">Items:</h4>
    
    {order.OrderItems.map(item => (
      <div key={item.id} className="flex justify-between items-center py-2 border-b">
        <div>
          <span className="font-medium">{item.Product?.name || 'Product'}</span><br />
          <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
        </div>
        <div>
          <span className="text-sm">₹{parseFloat(item.price || 0).toFixed(2)} each</span><br />
          <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
    ))}

    {/* Total Price of Entire Order */}
    <div className="flex justify-between items-center mt-4 pt-2 border-t font-bold text-lg">
      <span>Total Amount:</span>
      <span>₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
    </div>
  </div>
)}
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
