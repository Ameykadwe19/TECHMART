const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { uploadSingle, uploadMultiple } = require('../middlewares/uploadMiddleware');
const { uploadImage, uploadMultipleImages, deleteImage } = require('../controllers/uploadController');
const router = express.Router();

// Test endpoint for admin authentication
router.get('/test-auth', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication successful', 
    user: req.user 
  });
});

// Test endpoint for admin authorization
router.get('/test-admin', protect, isAdmin, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin authorization successful', 
    user: req.user 
  });
});

// Single image upload (Admin only)
router.post('/single', protect, isAdmin, ...uploadSingle('image'), uploadImage);

// Multiple images upload (Admin only)
router.post('/multiple', protect, isAdmin, ...uploadMultiple('images', 5), uploadMultipleImages);

// Delete image (Admin only)
router.delete('/:filename', protect, isAdmin, deleteImage);

// Test endpoint to check if an image exists
router.get('/check/:filename', (req, res) => {
  const { filename } = req.params;
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.json({
      success: true,
      message: 'Image exists',
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`,
      fileSize: fs.statSync(filePath).size
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }
});

module.exports = router; 