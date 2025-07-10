import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const ImageUpload = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to check role (simple client-side check)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setTokenInfo(payload);
        setIsAdmin(payload.role === 'admin');
        console.log('Token payload:', payload); // Debug token info
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    // Get token directly before request
    const token = localStorage.getItem('token');
    console.log('Token before upload:', token ? 'Present' : 'Missing');
    
    setUploading(true);
    try {
      // Include token explicitly in this request
      const { data } = await API.post('/upload/single', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      console.log('Upload response:', data);
      const imageUrl = data.file?.url || data.file?.relativePath;
      if (imageUrl) {
        // Use the complete URL returned from server instead of constructing it
        onImageUploaded(data.file.url);
        alert('Image uploaded!');
      } else {
        alert('Upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      if (error.response?.status === 403) {
        alert('Admin access required for image uploads. Please log in as an admin.');
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else {
        alert(`Upload failed: ${error.response?.data?.message || error.message}`);
      }
    }
    setUploading(false);
  };

  const testAuth = async () => {
    try {
      const { data } = await API.get('/upload/test-auth');
      console.log('Auth test result:', data);
      alert(`Auth test: ${data.message}\nUser: ${JSON.stringify(data.user)}`);
    } catch (error) {
      console.error('Auth test error:', error.response?.data || error.message);
      alert(`Auth test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const testAdmin = async () => {
    try {
      const { data } = await API.get('/upload/test-admin');
      console.log('Admin test result:', data);
      alert(`Admin test: ${data.message}\nUser: ${JSON.stringify(data.user)}`);
    } catch (error) {
      console.error('Admin test error:', error.response?.data || error.message);
      alert(`Admin test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2">Upload Image:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="p-2 border rounded"
      />
      {uploading && <p className="text-blue-600">Uploading...</p>}
      {!isAdmin && (
        <p className="text-red-500 text-sm mt-1">
          Note: Image uploads require admin privileges
        </p>
      )}
      {isAdmin && (
        <p className="text-green-500 text-sm mt-1">
          Admin privileges detected
        </p>
      )}
      {tokenInfo && (
        <div className="text-xs text-gray-500 mt-1">
          User ID: {tokenInfo.id}, Role: {tokenInfo.role}
        </div>
      )}
      <div className="mt-2 flex space-x-2">
        <button 
          onClick={testAuth} 
          className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
        >
          Test Auth
        </button>
        <button 
          onClick={testAdmin} 
          className="bg-purple-500 text-white px-2 py-1 text-xs rounded"
        >
          Test Admin
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;