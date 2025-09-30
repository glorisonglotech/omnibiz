const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary (if credentials are provided)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'omnibiz',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
    ]
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
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
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
  }
};

// Create multer instances
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

const upload = multer({
  storage: useCloudinary ? cloudinaryStorage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Upload configurations for different use cases
const uploadConfigs = {
  // Single file upload
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple files upload
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  
  // Mixed fields upload
  fields: (fields) => upload.fields(fields),
  
  // Order attachments
  orderAttachments: upload.array('attachments', 5),
  
  // Service request attachments
  serviceAttachments: upload.array('attachments', 5),
  
  // Profile picture
  profilePicture: upload.single('profilePicture'),
  
  // Business documents
  businessDocuments: upload.array('documents', 10)
};

// Helper function to get file URL
const getFileUrl = (file) => {
  if (useCloudinary) {
    return file.path; // Cloudinary provides the full URL
  } else {
    // For local storage, construct the URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${file.filename}`;
  }
};

// Helper function to delete file
const deleteFile = async (filePath) => {
  try {
    if (useCloudinary) {
      // Extract public_id from Cloudinary URL
      const publicId = filePath.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`omnibiz/${publicId}`);
    } else {
      // Delete local file
      const fullPath = path.join(__dirname, '../uploads', path.basename(filePath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 10MB.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum is 5 files per request.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected field name for file upload.' 
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      message: error.message 
    });
  }
  
  next(error);
};

// File validation helper
const validateFiles = (files) => {
  const errors = [];
  
  if (!files || files.length === 0) {
    return { valid: false, errors: ['No files provided'] };
  }
  
  files.forEach((file, index) => {
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`File ${index + 1}: Size exceeds 10MB limit`);
    }
    
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File ${index + 1}: Invalid file type`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Process uploaded files for database storage
const processUploadedFiles = (files) => {
  if (!files) return [];
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  return fileArray.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: getFileUrl(file),
    uploadedAt: new Date()
  }));
};

module.exports = {
  upload,
  uploadConfigs,
  getFileUrl,
  deleteFile,
  handleUploadError,
  validateFiles,
  processUploadedFiles,
  cloudinary: useCloudinary ? cloudinary : null
};
