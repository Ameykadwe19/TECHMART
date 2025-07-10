const uploadUtils = require('../utils/uploadUtils');
const path = require('path');

// Upload single image
exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    const fileInfo = uploadUtils.getFileInfo(file);
    const fileUrl = uploadUtils.getFileUrl(req, file.filename);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        ...fileInfo,
        url: fileUrl,
        relativePath: `/uploads/${file.filename}`
      }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file) {
      uploadUtils.deleteFile(`uploads/${req.file.filename}`);
    }
    res.status(500).json({ 
      success: false,
      message: 'Error uploading file', 
      error: error.message 
    });
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = files.map(file => ({
      ...uploadUtils.getFileInfo(file),
      url: uploadUtils.getFileUrl(req, file.filename),
      relativePath: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    // Clean up files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        uploadUtils.deleteFile(`uploads/${file.filename}`);
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error uploading files', 
      error: error.message 
    });
  }
};

// Delete uploaded file
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const deleted = uploadUtils.deleteFile(`uploads/${filename}`);

    if (deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting file', 
      error: error.message 
    });
  }
};