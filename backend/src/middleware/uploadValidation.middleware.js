const path = require('path');

const ApiError = require('../utils/ApiError');
const config = require('../config');

// ===================================================================
// FILE TYPE DEFINITIONS
// ===================================================================

const IMAGE_TYPES = Object.freeze({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
});

const DOCUMENT_TYPES = Object.freeze({
  '.pdf': 'application/pdf',
});

// ===================================================================
// DANGEROUS EXTENSIONS
// ===================================================================

const DANGEROUS_EXTENSIONS = new Set([
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.msi',
  '.dll',
  '.so',
  '.dylib',
  '.js',
  '.mjs',
  '.cjs',
  '.cgi',
  '.pl',
  '.py',
  '.rb',
  '.php',
  '.asp',
  '.aspx',
  '.html',
  '.htm',
  '.svg',
  '.xml',
  '.xss',
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.bz2',
  '.sql',
  '.db',
  '.sqlite',
  '.sqlite3',
  '.mdb',
  '.pem',
  '.key',
  '.crt',
  '.cer',
  '.ps1',
  '.com',
]);


const getExtension = (filename = '') => {
  if (
    typeof filename !== 'string' ||
    !filename.trim()
  ) {
    return '';
  }

  return path
    .extname(filename)
    .toLowerCase();
};

/**
 * Get maximum configured upload size.
 */
const getMaxFileSize = () => {
  const configuredSize =
    Number(config.upload?.maxFileSize);

  // Default: 10MB
  if (
    !Number.isFinite(configuredSize) ||
    configuredSize <= 0
  ) {
    return 10 * 1024 * 1024;
  }

  return configuredSize;
};

/**
 * Format bytes as MB.
 */
const formatMegabytes = (bytes) => {
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};

/**
 * Validate common file properties.
 */
const validateBasicFile = (file) => {
  if (!file) {
    throw new ApiError(
      400,
      'No file uploaded'
    );
  }

  if (
    typeof file.originalname !== 'string' ||
    !file.originalname.trim()
  ) {
    throw new ApiError(
      400,
      'Invalid file name'
    );
  }

  if (
    !file.mimetype ||
    typeof file.mimetype !== 'string'
  ) {
    throw new ApiError(
      400,
      'Invalid file MIME type'
    );
  }

  if (
    typeof file.size !== 'number' ||
    file.size <= 0
  ) {
    throw new ApiError(
      400,
      'Invalid or empty file'
    );
  }
};

/**
 * Validate file extension against MIME type.
 */
const validateExtensionAndMime = (
  file,
  allowedTypes
) => {
  const extension = getExtension(
    file.originalname
  );

  const mimeType =
    String(file.mimetype).toLowerCase();

  if (!extension) {
    throw new ApiError(
      400,
      'File extension is required'
    );
  }

  // Block dangerous extensions first.
  if (DANGEROUS_EXTENSIONS.has(extension)) {
    throw new ApiError(
      400,
      `File type not allowed: ${extension}`
    );
  }

  const expectedMimeType =
    allowedTypes[extension];

  if (!expectedMimeType) {
    const allowedExtensions =
      Object.keys(allowedTypes).join(', ');

    throw new ApiError(
      400,
      `File type not allowed. Allowed types: ${allowedExtensions}`
    );
  }

  // Prevent extension/MIME mismatch.
  if (expectedMimeType !== mimeType) {
    throw new ApiError(
      400,
      'File extension and MIME type do not match'
    );
  }

  return true;
};

const validateFile = (
  file,
  category = 'any'
) => {
  validateBasicFile(file);

  const extension = getExtension(
    file.originalname
  );

  if (DANGEROUS_EXTENSIONS.has(extension)) {
    throw new ApiError(
      400,
      `File type not allowed: ${extension}`
    );
  }

  let allowedTypes;

  switch (category) {
    case 'image':
      allowedTypes = IMAGE_TYPES;
      break;

    case 'document':
      allowedTypes = DOCUMENT_TYPES;
      break;

    case 'any':
      allowedTypes = {
        ...IMAGE_TYPES,
        ...DOCUMENT_TYPES,
      };
      break;

    default:
      throw new ApiError(
        500,
        `Unsupported upload category: ${category}`
      );
  }

  validateExtensionAndMime(
    file,
    allowedTypes
  );

  return true;
};

/**
 * Validate file size.
 */
const validateFileSize = (
  file,
  maxSize
) => {
  const limit =
    Number(maxSize) || getMaxFileSize();

  if (file.size > limit) {
    throw new ApiError(
      400,
      `File ${file.originalname} exceeds the maximum allowed size of ${formatMegabytes(limit)}`
    );
  }

  return true;
};

// ===================================================================
// IMAGE UPLOAD
// ===================================================================

/**
 * Validate a single image upload.
 */
const validateImageUpload = (
  req,
  res,
  next
) => {
  try {
    const file = req.file;

    validateBasicFile(file);

    validateFileSize(
      file,
      getMaxFileSize()
    );

    // IMPORTANT:
    // Only image types are accepted here.
    validateFile(
      file,
      'image'
    );

    next();
  } catch (error) {
    next(error);
  }
};

// ===================================================================
// MULTIPLE IMAGE UPLOAD
// ===================================================================

/**
 * Validate multiple image uploads.
 */
const validateMultipleImagesUpload = (
  req,
  res,
  next
) => {
  try {
    const files = req.files;

    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      throw new ApiError(
        400,
        'No files uploaded'
      );
    }

    const maxImages =
      Number(config.upload?.maxImages) || 10;

    if (files.length > maxImages) {
      throw new ApiError(
        400,
        `Maximum ${maxImages} images allowed`
      );
    }

    for (const file of files) {
      validateBasicFile(file);

      validateFileSize(
        file,
        getMaxFileSize()
      );

      validateFile(
        file,
        'image'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ===================================================================
// DOCUMENT UPLOAD
// ===================================================================

/**
 * Validate a PDF document upload.
 */
const validateDocumentUpload = (
  req,
  res,
  next
) => {
  try {
    const file = req.file;

    validateBasicFile(file);

    // Documents have a fixed 10MB limit.
    const maxDocumentSize =
      10 * 1024 * 1024;

    validateFileSize(
      file,
      maxDocumentSize
    );

    validateFile(
      file,
      'document'
    );

    next();
  } catch (error) {
    next(error);
  }
};

// ===================================================================
// EXPORTS
// ===================================================================

module.exports = {
  validateImageUpload,
  validateMultipleImagesUpload,
  validateDocumentUpload,
  validateFile,
  getExtension,
};