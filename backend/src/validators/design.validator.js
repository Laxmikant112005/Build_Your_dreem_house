/**
 * BuildMyHome - Design Validators
 * Request validation for design endpoints
 */

const { body, param, query } = require('express-validator');
const { DESIGN_STATUS, HOUSE_STYLES, CONSTRUCTION_TYPES } = require('../constants/enums');

/**
 * Validation rules for creating a design
 */
const createDesign = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('houseStyle')
    .optional()
    .isIn(HOUSE_STYLES)
    .withMessage(`Invalid house style. Must be one of: ${HOUSE_STYLES.join(', ')}`),
  
  body('constructionType')
    .optional()
    .isIn(CONSTRUCTION_TYPES)
    .withMessage(`Invalid construction type. Must be one of: ${CONSTRUCTION_TYPES.join(', ')}`),
  
  body('numberOfFloors')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of floors must be between 1 and 10'),
  
  body('numberOfBedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of bedrooms must be between 0 and 20'),
  
  body('numberOfBathrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of bathrooms must be between 0 and 20'),
  
  body('totalArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total area must be a positive number'),
  
  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a positive number'),
  
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Location must not exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(DESIGN_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(DESIGN_STATUS).join(', ')}`),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

/**
 * Validation rules for updating a design
 */
const updateDesign = [
  param('id')
    .notEmpty()
    .withMessage('Design ID is required')
    .isMongoId()
    .withMessage('Invalid design ID'),
  
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('houseStyle')
    .optional()
    .isIn(HOUSE_STYLES)
    .withMessage(`Invalid house style. Must be one of: ${HOUSE_STYLES.join(', ')}`),
  
  body('constructionType')
    .optional()
    .isIn(CONSTRUCTION_TYPES)
    .withMessage(`Invalid construction type. Must be one of: ${CONSTRUCTION_TYPES.join(', ')}`),
  
  body('numberOfFloors')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of floors must be between 1 and 10'),
  
  body('numberOfBedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of bedrooms must be between 0 and 20'),
  
  body('numberOfBathrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of bathrooms must be between 0 and 20'),
  
  body('totalArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total area must be a positive number'),
  
  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a positive number'),
  
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Location must not exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(DESIGN_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(DESIGN_STATUS).join(', ')}`),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

/**
 * Validation rules for getting designs (query params)
 */
const getDesigns = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(Object.values(DESIGN_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(DESIGN_STATUS).join(', ')}`),
  
  query('houseStyle')
    .optional()
    .isIn(HOUSE_STYLES)
    .withMessage(`Invalid house style. Must be one of: ${HOUSE_STYLES.join(', ')}`),
  
  query('constructionType')
    .optional()
    .isIn(CONSTRUCTION_TYPES)
    .withMessage(`Invalid construction type. Must be one of: ${CONSTRUCTION_TYPES.join(', ')}`),
  
  query('minArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum area must be a positive number'),
  
  query('maxArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum area must be a positive number'),
  
  query('minCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum cost must be a positive number'),
  
  query('maxCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum cost must be a positive number'),
  
  query('minBedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum bedrooms must be a non-negative integer'),
  
  query('maxBedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum bedrooms must be a non-negative integer'),
  
  query('engineerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid engineer ID'),
  
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'totalArea', 'estimatedCost', 'averageRating'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Validation rules for design ID parameter
 */
const designId = [
  param('id')
    .notEmpty()
    .withMessage('Design ID is required')
    .isMongoId()
    .withMessage('Invalid design ID'),
];

/**
 * Validation rules for updating design status
 */
const updateStatus = [
  param('id')
    .notEmpty()
    .withMessage('Design ID is required')
    .isMongoId()
    .withMessage('Invalid design ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(DESIGN_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(DESIGN_STATUS).join(', ')}`),
  
  body('rejectionReason')
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === DESIGN_STATUS.REJECTED && !value) {
        throw new Error('Rejection reason is required when rejecting a design');
      }
      return true;
    }),
];

/**
 * Validation rules for adding design images
 */
const addImages = [
  param('id')
    .notEmpty()
    .withMessage('Design ID is required')
    .isMongoId()
    .withMessage('Invalid design ID'),
  
  body('images')
    .notEmpty()
    .withMessage('Images are required')
    .isArray({ min: 1, max: 10 })
    .withMessage('Images must be an array with 1-10 items'),
  
  body('images.*.url')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  
  body('images.*.type')
    .optional()
    .isIn(['primary', 'gallery', 'thumbnail', 'floor_plan'])
    .withMessage('Invalid image type'),
  
  body('images.*.caption')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Caption must not exceed 200 characters'),
];

/**
 * Validation rules for toggling like
 */
const toggleLike = [
  param('id')
    .notEmpty()
    .withMessage('Design ID is required')
    .isMongoId()
    .withMessage('Invalid design ID'),
];

module.exports = {
  createDesign,
  updateDesign,
  getDesigns,
  designId,
  updateStatus,
  addImages,
  toggleLike,
};

