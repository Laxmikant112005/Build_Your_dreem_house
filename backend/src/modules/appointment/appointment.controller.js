/**
 * Planova - Appointment Controller
 * Request handlers for engineer-client appointment scheduling
 */

const appointmentService = require('./appointment.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Create new appointment
 */
const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.userId, req.body);
  ApiResponse.created(res, 'Appointment created successfully', appointment);
});

/**
 * Get appointment by ID
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await appointmentService.getAppointmentById(id);
  ApiResponse.ok(res, 'Appointment retrieved successfully', appointment);
});

/**
 * Get user's appointments (as client)
 */
const getMyAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await appointmentService.getClientAppointments(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  ApiResponse.paginated(res, 'Appointments retrieved successfully', result.appointments, result.pagination);
});

/**
 * Get engineer's appointments
 */
const getEngineerAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, startDate, endDate } = req.query;
  const result = await appointmentService.getEngineerAppointments(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    startDate,
    endDate,
  });
  ApiResponse.paginated(res, 'Appointments retrieved successfully', result.appointments, result.pagination);
});

/**
 * Check availability for an engineer on a given date
 */
const checkAvailability = asyncHandler(async (req, res) => {
  const { engineerId } = req.params;
  const { date, duration = 60 } = req.query;
  if (!date) {
    return ApiResponse.badRequest(res, 'Date is required (YYYY-MM-DD)');
  }
  const slots = await appointmentService.checkAvailability(engineerId, date, parseInt(duration));
  ApiResponse.ok(res, 'Availability retrieved successfully', slots);
});

/**
 * Accept appointment (engineer)
 */
const acceptAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { meetingLink } = req.body;
  const appointment = await appointmentService.acceptAppointment(id, req.userId, meetingLink);
  ApiResponse.ok(res, 'Appointment accepted successfully', appointment);
});

/**
 * Reschedule appointment
 */
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startAt, endAt, reason } = req.body;
  const appointment = await appointmentService.rescheduleAppointment(id, req.userId, startAt, endAt, reason);
  ApiResponse.ok(res, 'Appointment rescheduled successfully', appointment);
});

/**
 * Cancel appointment
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const appointment = await appointmentService.cancelAppointment(id, req.userId, reason);
  ApiResponse.ok(res, 'Appointment cancelled successfully', appointment);
});

/**
 * Complete appointment
 */
const completeAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await appointmentService.completeAppointment(id, req.userId);
  ApiResponse.ok(res, 'Appointment completed successfully', appointment);
});

/**
 * Get appointment statistics
 */
const getStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await appointmentService.getStatistics(req.userId, startDate, endDate);
  ApiResponse.ok(res, 'Statistics retrieved successfully', stats);
});

/**
 * Add feedback to completed appointment
 */
const addFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const appointment = await appointmentService.addFeedback(id, req.userId, rating, comment);
  ApiResponse.ok(res, 'Feedback added successfully', appointment);
});

module.exports = {
  createAppointment,
  getAppointmentById,
  getMyAppointments,
  getEngineerAppointments,
  checkAvailability,
  acceptAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  getStatistics,
  addFeedback,
};

