import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await API.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('No account found with this email address. Please check your email or register.');
      } else {
        setError(error.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        
        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-4 text-green-600">
              Password reset link has been sent to your email.
            </div>
            <p className="mb-4">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-600">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
            <p className="mb-4 text-gray-500 text-sm">
              Note: Reset link will only be sent to email addresses that are already registered with us.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 mb-4 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;