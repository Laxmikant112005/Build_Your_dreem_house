const multer = require('multer');
const config = require('./index');
const storage = multer.memoryStorage();

const createFileFilter = (allowedTypes, category) => {
  return (req, file, cb) => {
    if (!file || !file.mimetype) {
      return cb(
        new Error(`Invalid ${category}: missing MIME type.`),
        false
      );
    }

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        `Invalid ${category} type: ${file.mimetype}. ` +
        `Allowed types: ${allowedTypes.join(', ')}`
      ),
      false
    );
  };
};
const imageFileFilter = createFileFilter(
  config.upload.allowedImageTypes,
  'image'
);

const documentTypes = [
  ...config.upload.allowedDocumentTypes,
  ...config.upload.allowedCadTypes,
  ...config.upload.allowed3DTypes,
];

const documentFileFilter = createFileFilter(
  documentTypes,
  'document'
);

const singleFileLimits = {
  fileSize: config.upload.maxFileSize,
};

const multipleImageLimits = {
  fileSize: config.upload.maxFileSize,
  files: config.upload.maxImages,
};
const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: singleFileLimits,
});

const imagesUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: multipleImageLimits,
});

const fileUpload = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: singleFileLimits,
});
module.exports = {
  
  uploadImage: imageUpload.single('image'),

  uploadImages: imagesUpload.array(
    'images',
    config.upload.maxImages
  ),
  uploadFile: fileUpload.single('file'),
  uploadDesignFile: fileUpload.single('file'),
};
