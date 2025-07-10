const uploadUtils = require('../utils/uploadUtils');
const multer = require('multer');

// Handle multer errors
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 5 files allowed'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Single image upload middleware
const uploadSingle = (fieldName = 'image') => {
  return [
    uploadUtils.single(fieldName),
    handleMulterError,
    (req, res, next) => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      next();
    }
  ];
};

// Multiple images upload middleware
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return [
    uploadUtils.multiple(fieldName, maxCount),
    handleMulterError,
    (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      next();
    }
  ];
};

// Optional file upload (no error if no file)
const uploadOptional = (fieldName = 'image') => {
  return [
    uploadUtils.single(fieldName),
    handleMulterError,
    (req, res, next) => {
      // Continue even if no file uploaded
      next();
    }
  ];
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadOptional,
  handleMulterError
};