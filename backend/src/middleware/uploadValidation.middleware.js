/**
 * BuildMyHome - Upload Validation Middleware
 * Validates file type, size, and prevents dangerous uploads
 */

const ApiError = require('../utils/ApiError');
const config = require('../config');

// Allowed image extensions and MIME types
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Allowed document extensions and MIME types
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf'];
const ALLOWED_DOCUMENT_MIME_TYPES = ['application/pdf'];

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.sh', '.bat', '.cmd', '.msi', '.dll', '.so', '.dylib',
  '.js', '.mjs', '.cgi', '.pl', '.py', '.rb', '.php', '.asp',
  '.html', '.htm', '.svg', '.xml', '.xss',
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.sql', '.db', '.sqlite', '.mdb',
  '.pem', '.key', '.crt', '.cer',
  '.ps1', '.bat', '.com'
];

/**
 * Get file extension from filename
 */
const getExtension = (filename) => {
  return '.' + filename.split('.').pop().toLowerCase();
};

/**
 * Validate uploaded file
 */
const validateFile = (file) => {
  const fileExtension = getExtension(file.originalname);
  const mimeType = file.mimetype;

  // Check for dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    throw new ApiError(400, `File type not allowed: ${fileExtension}`);
  }

  // Validate image files
  if (ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      throw new ApiError(400, 'Invalid image file type');
    }
  }
  // Validate document files
  else if (ALLOWED_DOCUMENT_EXTENSIONS.includes(fileExtension)) {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType)) {
      throw new ApiError(400, 'Invalid document file type');
    }
  }
  // Unknown extension
  else {
    throw new ApiError(400, `File type not allowed: ${fileExtension}. Allowed types: jpg, jpeg, png, pdf`);
  }

  return true;
};

/**
 * Middleware to validate single image upload
 */
const validateImageUpload = (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    // Validate file size
    if (req.file.size > config.upload.maxFileSize) {
      throw new ApiError(400, `File size exceeds maximum allowed size of ${config.upload.maxFileSize / (1024 * 1024)}MB`);
    }

    // Validate file type
    validateFile(req.file);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate multiple image uploads
 */
const validateMultipleImagesUpload = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'No files uploaded');
    }

    // Check max number of images
    if (req.files.length > config.upload.maxImages) {
      throw new ApiError(400, `Maximum ${config.upload.maxImages} images allowed`);
    }

    // Validate each file
    for (const file of req.files) {
      // Validate file size
      if (file.size > config.upload.maxFileSize) {
        throw new ApiError(400, `File ${file.originalname} exceeds maximum allowed size of ${config.upload.maxFileSize / (1024 * 1024)}MB`);
      }

      // Validate file type
      validateFile(file);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate document upload
 */
const validateDocumentUpload = (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    // Validate file size (max 10MB for documents)
    const maxDocSize = 10 * 1024 * 1024;
    if (req.file.size > maxDocSize) {
      throw new ApiError(400, 'File size exceeds maximum allowed size of 10MB');
    }

    // Validate file type
    validateFile(req.file);

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateImageUpload,
  validateMultipleImagesUpload,
  validateDocumentUpload,
  validateFile,
};

