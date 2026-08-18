/**
 * Planova - Appointment Service
 * Business logic for engineer-client appointment scheduling
 */

const mongoose = require('mongoose');
const Appointment = require('./appointment.model');
const ApiError = require('../../utils/ApiError');
const { APPOINTMENT_STATUS } = require('../../constants/enums');
const notificationService = require('../notification/notification.service');

class AppointmentService {
  /**
   * Create a new appointment
   */
  async createAppointment(clientId, appointmentData) {
    const { engineerId, startAt, endAt, duration = null } = appointmentData;

    if (!engineerId || !startAt) {
      throw new ApiError(400, 'engineerId and startAt are required');
    }

    const start = new Date(startAt);
    if (isNaN(start.getTime())) throw new ApiError(400, 'Invalid startAt');

    let end;
    if (endAt) {
      end = new Date(endAt);
      if (isNaN(end.getTime())) throw new ApiError(400, 'Invalid endAt');
    } else if (duration && Number(duration) > 0) {
      end = new Date(start.getTime() + Number(duration) * 60000);
    } else {
      throw new ApiError(400, 'Either endAt or positive duration (minutes) is required');
    }

    if (end <= start) throw new ApiError(400, 'endAt must be after startAt');

    // Check for scheduling conflicts
    const conflicts = await Appointment.findConflicts(engineerId, start, end);
    if (conflicts.length > 0) {
      throw new ApiError(409, `Selected time conflicts with existing appointment ${conflicts[0].appointmentId}`);
    }

    const appointment = await Appointment.create({
      ...appointmentData,
      clientId,
      startAt: start,
      endAt: end,
      duration: duration || Math.round((end.getTime() - start.getTime()) / 60000),
    });

    // Notify engineer about new appointment
    try {
      await notificationService.createNotification(
        engineerId,
        'appointment',
        'New Appointment Request',
        `You have a new ${appointment.type.replace('_', ' ')} appointment request`,
        { appointmentId: appointment._id, clientId }
      );
    } catch (err) {
      // Non-blocking
    }

    return appointment;
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, 'Invalid appointment ID format');
    }
    const appointment = await Appointment.findById(appointmentId)
      .populate('clientId', 'firstName lastName email phone avatar')
      .populate('engineerId', 'firstName lastName email phone avatar engineerProfile.title engineerProfile.rating')
      .populate('blueprintId', 'title slug specs.builtUpArea specs.estimatedCost files.images');
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    return appointment;
  }

  /**
   * Get appointments for client
   */
  async getClientAppointments(clientId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const query = { clientId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .sort({ startAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('engineerId', 'firstName lastName avatar engineerProfile.title engineerProfile.rating')
        .populate('blueprintId', 'title slug specs.builtUpArea'),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get appointments for engineer
   */
  async getEngineerAppointments(engineerId, options = {}) {
    const { page = 1, limit = 20, status, startDate, endDate } = options;
    const query = { engineerId };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.startAt = {};
      if (startDate) query.startAt.$gte = new Date(startDate);
      if (endDate) query.startAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .sort({ startAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('clientId', 'firstName lastName avatar phone')
        .populate('blueprintId', 'title slug'),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Check availability for engineer
   */
  async checkAvailability(engineerId, date, durationMinutes = 60) {
    if (!mongoose.Types.ObjectId.isValid(engineerId)) {
      throw new ApiError(400, 'Invalid engineer ID');
    }
    return Appointment.getAvailableSlots(engineerId, new Date(date), durationMinutes);
  }

  /**
   * Accept appointment (engineer)
   */
  async acceptAppointment(appointmentId, engineerId, meetingLink) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId) || !mongoose.Types.ObjectId.isValid(engineerId)) {
      throw new ApiError(400, 'Invalid ID format');
    }
    const appointment = await Appointment.findOne({ _id: appointmentId, engineerId });
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      throw new ApiError(400, 'Appointment cannot be accepted');
    }
    appointment.status = APPOINTMENT_STATUS.ACCEPTED;
    if (meetingLink) appointment.meetingLink = meetingLink;
    await appointment.save();

    try {
      await notificationService.createNotification(
        appointment.clientId,
        'appointment',
        'Appointment Accepted',
        `Your ${appointment.type.replace('_', ' ')} appointment has been accepted`,
        { appointmentId: appointment._id }
      );
    } catch (err) { /* non-blocking */ }

    return appointment;
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId, userId, startAt, endAt, reason) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, 'Invalid appointment ID');
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (appointment.clientId.toString() !== userId.toString() &&
        appointment.engineerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized to reschedule this appointment');
    }
    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.ACCEPTED].includes(appointment.status)) {
      throw new ApiError(400, 'Appointment cannot be rescheduled');
    }

    const newStart = new Date(startAt);
    const newEnd = endAt ? new Date(endAt) : new Date(newStart.getTime() + appointment.duration * 60000);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }

    // Check conflicts excluding current appointment
    const conflicts = await Appointment.findConflicts(appointment.engineerId, newStart, newEnd, appointmentId);
    if (conflicts.length > 0) {
      throw new ApiError(409, 'Selected time conflicts with another appointment');
    }

    appointment.startAt = newStart;
    appointment.endAt = newEnd;
    appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
    appointment.timeline.rescheduledAt = new Date();
    appointment.timeline.rescheduleReason = reason || '';
    await appointment.save();

    return appointment;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, userId, reason) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, 'Invalid appointment ID');
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (!appointment.canCancel(userId)) {
      throw new ApiError(400, 'Appointment cannot be cancelled');
    }

    const isClient = appointment.clientId.toString() === userId.toString();
    const isEngineer = appointment.engineerId.toString() === userId.toString();
    if (!isClient && !isEngineer) {
      throw new ApiError(403, 'Unauthorized to cancel this appointment');
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    appointment.timeline.cancelledAt = new Date();
    appointment.timeline.cancelledBy = isClient ? 'client' : 'engineer';
    appointment.timeline.cancellationReason = reason || '';
    await appointment.save();

    // Notify the other party
    const notifyUserId = isClient ? appointment.engineerId : appointment.clientId;
    try {
      await notificationService.createNotification(
        notifyUserId,
        'appointment',
        'Appointment Cancelled',
        `An appointment has been cancelled${reason ? ': ' + reason : ''}`,
        { appointmentId: appointment._id }
      );
    } catch (err) { /* non-blocking */ }

    return appointment;
  }

  /**
   * Complete appointment
   */
  async completeAppointment(appointmentId, userId) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, 'Invalid appointment ID');
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (appointment.engineerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only the engineer can mark appointment as completed');
    }
    if (appointment.status !== APPOINTMENT_STATUS.IN_PROGRESS &&
        appointment.status !== APPOINTMENT_STATUS.ACCEPTED) {
      throw new ApiError(400, 'Appointment cannot be completed');
    }
    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save();
    return appointment;
  }

  /**
   * Add feedback to completed appointment
   */
  async addFeedback(appointmentId, userId, rating, comment) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, 'Invalid appointment ID');
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (appointment.clientId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only the client can provide feedback');
    }
    if (appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
      throw new ApiError(400, 'Can only provide feedback for completed appointments');
    }
    if (appointment.feedback && appointment.feedback.submittedAt) {
      throw new ApiError(400, 'Feedback already provided');
    }
    appointment.feedback = { rating, comment, submittedAt: new Date() };
    await appointment.save();
    return appointment;
  }

  /**
   * Get appointment statistics
   */
  async getStatistics(engineerId, startDate, endDate) {
    const query = { engineerId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    return Appointment.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$pricing.totalAmount' } } },
    ]);
  }
}

module.exports = new AppointmentService();

