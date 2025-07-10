import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        if (payload.role === 'admin') {
          fetchOrders();
          fetchAnalytics();
          return;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    
    // If we get here, user is not admin
    navigate('/');
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.get('/admin/orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.get('/admin/analytics');
      setAnalytics(data.analytics || {});
    } catch (error) {
      console.error('Error fetching analytics');
    }
  };

  const exportOrders = async () => {
    try {
      const response = await API.get('/admin/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error exporting orders');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Orders</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-bold">Total Users</h3>
          <p className="text-2xl">{analytics.totalUsers}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">Total Orders</h3>
          <p className="text-2xl">{analytics.totalOrders}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Total Products</h3>
          <p className="text-2xl">{analytics.totalProducts}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-bold">Revenue</h3>
          <p className="text-2xl">₹{analytics.totalRevenue}</p>
        </div>
      </div>

      <button 
        onClick={exportOrders}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        Export Orders CSV
      </button>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b">
                <td className="p-3">#{order.id}</td>
                <td className="p-3">{order.User?.email}</td>
                <td className="p-3">₹{order.totalAmount}</td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {order.status}
                  </span>
                </td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
