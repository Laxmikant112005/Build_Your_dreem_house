/**
 * BuildMyHome - User Validators
 * Request validation for user endpoints
 */

const { body, param, query } = require('express-validator');
const { USER_STATUS } = require('../constants/enums');

/**
 * Validation rules for updating user profile
 */
const updateProfile = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  
  body('pincode')
    .optional()
    .matches(/^\d{5,10}$/)
    .withMessage('Please provide a valid pincode'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Please provide a valid avatar URL'),
];

/**
 * Validation rules for updating engineer profile
 */
const updateEngineerProfile = [
  body('specialization')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Specialization must not exceed 200 characters'),
  
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  
  body('licenseNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('License number must not exceed 50 characters'),
  
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  
  body('availability')
    .optional()
    .isObject()
    .withMessage('Availability must be an object'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  
  body('portfolio')
    .optional()
    .isArray()
    .withMessage('Portfolio must be an array'),
];

/**
 * Validation rules for user ID parameter
 */
const userId = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

/**
 * Validation rules for getting users (query params)
 */
const getUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('role')
    .optional()
    .isIn(['user', 'engineer', 'admin'])
    .withMessage('Invalid role'),
  
  query('status')
    .optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(USER_STATUS).join(', ')}`),
  
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
];

/**
 * Validation rules for updating user status (admin)
 */
const updateUserStatus = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(USER_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(USER_STATUS).join(', ')}`),
  
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

/**
 * Validation rules for avatar upload
 */
const uploadAvatar = [
  body('avatar')
    .notEmpty()
    .withMessage('Avatar file is required')
    .isURL()
    .withMessage('Please provide a valid avatar URL or base64 string'),
];

/**
 * Validation rules for engineer registration
 */
const registerEngineer = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .trim(),
  
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('specialization')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Specialization must not exceed 200 characters'),
  
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  
  body('licenseNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('License number must not exceed 50 characters'),
];

module.exports = {
  updateProfile,
  updateEngineerProfile,
  userId,
  getUsers,
  updateUserStatus,
  uploadAvatar,
  registerEngineer,
};

