import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);      // { type: 'success' | 'error', text: string }
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous message
    try {
      console.log('Sending login data:', formData);
      const { data } = await API.post('/auth/login', formData);
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user?.role || 'user');
      
      // Log the token content
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        console.log('Token payload after login:', payload);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
      
      // Show success message
      if (data.user?.role === 'admin') {
        setMessage({ type: 'success', text: 'Login successful! Redirecting to admin dashboard...' });
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        setMessage({ type: 'success', text: 'Login successful! Redirecting to homepage...' });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setMessage({ 
        type: 'error', 
        text: `Login failed: ${error.response?.data?.message || 'Invalid credentials'}` 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {/* Message box */}
        {message && (
          <div
            className={`mb-4 p-3 rounded text-center ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-lg"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="mb-2">
            Don't have account? <Link to="/register" className="text-blue-600">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-blue-600">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
