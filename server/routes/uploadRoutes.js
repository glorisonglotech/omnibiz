const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  uploadConfigs, 
  handleUploadError, 
  processUploadedFiles,
  deleteFile 
} = require('../config/upload');

// Apply authentication to all upload routes
router.use(protect);

// @desc    Upload order attachments
// @route   POST /api/upload/order-attachments
// @access  Private
router.post('/order-attachments', uploadConfigs.orderAttachments, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const processedFiles = processUploadedFiles(req.files);
    
    res.status(200).json({
      message: 'Files uploaded successfully',
      files: processedFiles,
      count: processedFiles.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// @desc    Upload service request attachments
// @route   POST /api/upload/service-attachments
// @access  Private
router.post('/service-attachments', uploadConfigs.serviceAttachments, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const processedFiles = processUploadedFiles(req.files);
    
    res.status(200).json({
      message: 'Files uploaded successfully',
      files: processedFiles,
      count: processedFiles.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// @desc    Upload profile picture
// @route   POST /api/upload/profile-picture
// @access  Private
router.post('/profile-picture', uploadConfigs.profilePicture, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const processedFile = processUploadedFiles([req.file])[0];
    
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      file: processedFile
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// @desc    Upload business documents
// @route   POST /api/upload/business-documents
// @access  Private
router.post('/business-documents', uploadConfigs.businessDocuments, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const processedFiles = processUploadedFiles(req.files);
    
    res.status(200).json({
      message: 'Business documents uploaded successfully',
      files: processedFiles,
      count: processedFiles.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// @desc    Upload multiple files (generic)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', uploadConfigs.multiple('attachments'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const processedFiles = processUploadedFiles(req.files);
    
    res.status(200).json({
      message: 'Files uploaded successfully',
      files: processedFiles,
      count: processedFiles.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/file
// @access  Private
router.delete('/file', async (req, res) => {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ message: 'File URL is required' });
    }

    await deleteFile(fileUrl);
    
    res.status(200).json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Delete failed', 
      error: error.message 
    });
  }
});

// @desc    Get upload limits and allowed types
// @route   GET /api/upload/info
// @access  Private
router.get('/info', (req, res) => {
  res.status(200).json({
    limits: {
      fileSize: '10MB',
      maxFiles: 5
    },
    allowedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    supportedFormats: [
      'JPEG', 'JPG', 'PNG', 'GIF', 'PDF', 'DOC', 'DOCX', 'TXT', 'XLS', 'XLSX'
    ]
  });
});

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
