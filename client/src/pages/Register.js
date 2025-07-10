import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // clear old messages
    try {
      console.log('Sending registration data:', formData);
      const { data } = await API.post('/auth/register', formData);
      console.log('Registration response:', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Log the token content
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          console.log('Token payload after registration:', payload);
        } catch (err) {
          console.error('Error parsing token:', err);
        }
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login page...' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage({ type: 'success', text: 'Registration successful! Please login.' });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      setMessage({ 
        type: 'error', 
        text: 'Registration failed: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

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
            type="text"
            placeholder="Name"
            className="w-full p-3 mb-4 border rounded-lg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-lg"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
