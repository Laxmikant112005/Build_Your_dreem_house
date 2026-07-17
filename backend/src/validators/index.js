/**
 * BuildMyHome - Validators Index
 * Central export for all validators
 */

const authValidator = require('./auth.validator');
const bookingValidator = require('./booking.validator');
const userValidator = require('./user.validator');
const designValidator = require('./design.validator');

module.exports = {
  authValidator,
  bookingValidator,
  userValidator,
  designValidator,
};

