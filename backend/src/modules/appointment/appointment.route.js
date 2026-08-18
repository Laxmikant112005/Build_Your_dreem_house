/**
 * Planova - Appointment Routes
 * API routes for engineer-client appointment scheduling
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { param, query } = require('express-validator');
const appointmentValidator = require('./appointment.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Public routes
router.get('/engineer/:engineerId/availability',
  param('engineerId').isMongoId(),
  query('date').optional().isISO8601(),
  validate,
  appointmentController.checkAvailability
);

// Protected routes - Client
router.get('/my-appointments', authenticate, appointmentController.getMyAppointments);
router.post('/', authenticate, validateJoi(appointmentValidator.createAppointment, 'body'), appointmentController.createAppointment);
router.post('/:id/cancel', authenticate, param('id').isMongoId(), validateJoi(appointmentValidator.cancelAppointment, 'body'), validate, appointmentController.cancelAppointment);
router.post('/:id/feedback', authenticate, param('id').isMongoId(), validateJoi(appointmentValidator.addFeedback, 'body'), validate, appointmentController.addFeedback);

// Protected routes - Engineer
router.get('/engineer/my-appointments', authenticate, authorize('engineer', 'admin'), appointmentController.getEngineerAppointments);
router.post('/:id/accept', authenticate, authorize('engineer'), param('id').isMongoId(), validate, appointmentController.acceptAppointment);
router.post('/:id/complete', authenticate, authorize('engineer'), param('id').isMongoId(), validate, appointmentController.completeAppointment);

// Protected routes - All authenticated
router.get('/:id', authenticate, appointmentController.getAppointmentById);
router.post('/:id/reschedule', authenticate, param('id').isMongoId(), validateJoi(appointmentValidator.rescheduleAppointment, 'body'), validate, appointmentController.rescheduleAppointment);
router.get('/engineer/stats', authenticate, authorize('engineer', 'admin'), appointmentController.getStatistics);

module.exports = router;

