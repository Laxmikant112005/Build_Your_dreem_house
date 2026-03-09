/**
 * BuildMyHome - Booking Validators
 * Request validation for booking endpoints
 */

const { body, param, query } = require('express-validator');
const { BOOKING_TYPE, BOOKING_STATUS, MEETING_TYPE } = require('../constants/enums');

/**
 * Validation rules for creating a booking
 */
const createBooking = [
  body('bookingType')
    .notEmpty()
    .withMessage('Booking type is required')
    .isIn(Object.values(BOOKING_TYPE))
    .withMessage(`Invalid booking type. Must be one of: ${Object.values(BOOKING_TYPE).join(', ')}`),
  
  body('meetingType')
    .notEmpty()
    .withMessage('Meeting type is required')
    .isIn(Object.values(MEETING_TYPE))
    .withMessage(`Invalid meeting type. Must be one of: ${Object.values(MEETING_TYPE).join(', ')}`),
  
  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  
  body('engineerId')
    .notEmpty()
    .withMessage('Engineer ID is required')
    .isMongoId()
    .withMessage('Invalid engineer ID'),
  
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

/**
 * Validation rules for updating a booking
 */
const updateBooking = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('bookingType')
    .optional()
    .isIn(Object.values(BOOKING_TYPE))
    .withMessage(`Invalid booking type. Must be one of: ${Object.values(BOOKING_TYPE).join(', ')}`),
  
  body('meetingType')
    .optional()
    .isIn(Object.values(MEETING_TYPE))
    .withMessage(`Invalid meeting type. Must be one of: ${Object.values(MEETING_TYPE).join(', ')}`),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('scheduledTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  
  body('status')
    .optional()
    .isIn(Object.values(BOOKING_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(BOOKING_STATUS).join(', ')}`),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

/**
 * Validation rules for getting bookings (query params)
 */
const getBookings = [
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
    .isIn(Object.values(BOOKING_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(BOOKING_STATUS).join(', ')}`),
  
  query('bookingType')
    .optional()
    .isIn(Object.values(BOOKING_TYPE))
    .withMessage(`Invalid booking type. Must be one of: ${Object.values(BOOKING_TYPE).join(', ')}`),
  
  query('engineerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid engineer ID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
];

/**
 * Validation rules for booking ID parameter
 */
const bookingId = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
];

/**
 * Validation rules for updating booking status
 */
const updateStatus = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(BOOKING_STATUS))
    .withMessage(`Invalid status. Must be one of: ${Object.values(BOOKING_STATUS).join(', ')}`),
  
  body('cancellationReason')
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === BOOKING_STATUS.CANCELLED && !value) {
        throw new Error('Cancellation reason is required when cancelling a booking');
      }
      return true;
    }),
];

/**
 * Validation rules for booking feedback
 */
const addFeedback = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
];

module.exports = {
  createBooking,
  updateBooking,
  getBookings,
  bookingId,
  updateStatus,
  addFeedback,
};

