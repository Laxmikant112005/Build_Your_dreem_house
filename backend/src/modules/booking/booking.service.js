/**
 * BuildMyHome - Booking Service
 * Business logic for booking operations
 */

const mongoose = require('mongoose');
const Booking = require('./booking.model');
const ApiError = require('../../utils/ApiError');
const { BOOKING_STATUS } = require('../../constants/enums');
const { cache } = require('../../config/redis');
const notificationService = require('../notification/notification.service');


class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId, bookingData) {
    // Require engineerId and startAt; endAt or duration must be provided
    const { engineerId, startAt, endAt, duration = null } = bookingData;

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

    if (end <= start) {
      throw new ApiError(400, 'endAt must be after startAt');
    }

    // Conflict detection: find any booking for same engineer where time windows overlap
    const overlapQuery = {
      engineerId,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
      $and: [
        { startAt: { $lt: end } },
        { endAt: { $gt: start } },
      ],
    };

    const conflict = await Booking.findOne(overlapQuery).select('startAt endAt bookingId');
    if (conflict) {
      throw new ApiError(409, `Selected time overlaps with existing booking ${conflict.bookingId}`);
    }

    // For high concurrency, consider transactions/locks (TODO)
    const booking = await Booking.create({
      ...bookingData,
      userId,
      startAt: start,
      endAt: end,
      duration: duration || Math.round((end.getTime() - start.getTime()) / 60000),
    });

    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      console.error("BOOKING SERVICE ERROR: Invalid bookingId format", bookingId);
      throw new ApiError(400, 'Invalid booking ID format');
    }
    
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'firstName lastName email phone avatar')
      .populate('engineerId', 'firstName lastName email phone avatar engineerProfile')
      .populate('designId');

    if (!booking) {
      console.error("BOOKING SERVICE ERROR: Booking not found for ID", bookingId);
      throw new ApiError(404, 'Booking not found');
    }

    return booking;
  }


  /**
   * Get bookings for user
   */
  async getUserBookings(userId, filters = {}, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ startAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating')
        .populate('designId', 'title images'),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get bookings for engineer
   */
  async getEngineerBookings(engineerId, filters = {}, options = {}) {
    const { page = 1, limit = 20, status, startDate, endDate } = options;
    const query = { engineerId };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.startAt = {};
      if (startDate) query.startAt.$gte = new Date(startDate);
      if (endDate) query.startAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ startAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName avatar phone')
        .populate('designId', 'title images'),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check availability for engineer
   */
  async checkAvailability(engineerId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      engineerId,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
      // Any booking that overlaps the day
      $and: [
        { startAt: { $lt: endOfDay } },
        { endAt: { $gt: startOfDay } },
      ],
    }).select('startAt endAt duration');

    // Map existing bookings to date ranges
    const bookedRanges = existingBookings.map(b => ({
      start: b.startAt || b.scheduledDate || null,
      end: b.endAt || (b.scheduledDate ? this.addMinutes(b.scheduledTime, b.duration) : null),
    })).filter(r => r.start && r.end);

    const allSlots = [];
    // Generate hourly slots (9:00 - 17:00 -> 1-hour slots)
    for (let hour = 9; hour < 18; hour++) {
      const slotStart = new Date(startOfDay);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60000);

      const isBooked = bookedRanges.some(range => this.isRangeOverlapping(slotStart, slotEnd, range.start, range.end));

      allSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        startAt: slotStart,
        endAt: slotEnd,
        available: !isBooked,
      });
    }

    return allSlots;
  }

  /**
   * Check if two time ranges overlap
   */
  isTimeOverlapping(time, start, end) {
    // legacy string comparison kept for backward compatibility
    const t = this.parseTime(time);
    const s = this.parseTime(start);
    const e = this.parseTime(end);
    return t >= s && t < e;
  }

  /**
   * Check if two date ranges overlap
   */
  isRangeOverlapping(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  /**
   * Parse time string to minutes
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Add minutes to time string
   */
  addMinutes(timeStr, minutes) {
    const totalMinutes = this.parseTime(timeStr) + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId, status, additionalData = {}) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      console.error("BOOKING SERVICE ERROR: Invalid bookingId in updateStatus", bookingId);
      throw new ApiError(400, 'Invalid booking ID format');
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error("BOOKING SERVICE ERROR: Booking not found for update, ID:", bookingId);
      throw new ApiError(404, 'Booking not found');
    }

    booking.status = status;

    // Update timeline based on status
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        booking.timeline.confirmedAt = new Date();
        break;
      case BOOKING_STATUS.IN_PROGRESS:
        booking.timeline.startedAt = new Date();
        break;
      case BOOKING_STATUS.COMPLETED:
        booking.timeline.completedAt = new Date();
        break;
      case BOOKING_STATUS.CANCELLED:
        booking.timeline.cancelledAt = new Date();
        booking.timeline.cancellationReason = additionalData.reason || '';
        break;
    }

    // Update other fields
    if (additionalData.meetingLink) booking.meetingLink = additionalData.meetingLink;
    if (additionalData.notes) booking.notes = additionalData.notes;

    await booking.save();

    try {
      // Send notification
      const notificationType = status === BOOKING_STATUS.CONFIRMED ? 'booking_confirmed' : 
                             status === BOOKING_STATUS.CANCELLED ? 'booking_cancelled' : 
                             'booking_updated';
      
      await notificationService.sendBookingNotification(booking, notificationType);
    } catch (notifError) {
      console.error("BOOKING SERVICE ERROR: Notification failed for booking", bookingId, notifError);
      // Don't fail booking update due to notification
    }

    return booking;
  }


  /**
   * Confirm booking
   */
  async confirmBooking(bookingId, engineerId, meetingLink) {
    if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(engineerId)) {
      console.error("BOOKING SERVICE ERROR: Invalid ID in confirmBooking", {bookingId, engineerId});
      throw new ApiError(400, 'Invalid ID format');
    }
    
    const booking = await Booking.findOne({ _id: bookingId, engineerId });
    if (!booking) {
      console.error("BOOKING SERVICE ERROR: Booking not found for confirm", bookingId, engineerId);
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new ApiError(400, 'Booking cannot be confirmed');
    }

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.timeline.confirmedAt = new Date();
    if (meetingLink) booking.meetingLink = meetingLink;
    await booking.save();

    try {
      // Send notification
      await notificationService.sendBookingNotification(booking, 'booking_confirmed');
    } catch (notifError) {
      console.error("BOOKING SERVICE ERROR: Notification failed", notifError);
    }

    return booking;
  }


  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, reason, userRole) {
    if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("BOOKING SERVICE ERROR: Invalid ID in cancelBooking", {bookingId, userId});
      throw new ApiError(400, 'Invalid ID format');
    }
    
    const query = { _id: bookingId };
    
    // Only allow cancellation by booking owner or assigned engineer
    if (userRole === 'user') {
      query.userId = userId;
    } else if (userRole === 'engineer') {
      query.engineerId = userId;
    }

    const booking = await Booking.findOne(query);
    if (!booking) {
      console.error("BOOKING SERVICE ERROR: Booking not found for cancel", bookingId);
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED) {
      throw new ApiError(400, 'Booking cannot be cancelled');
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.timeline.cancelledAt = new Date();
    booking.timeline.cancellationReason = reason;
    await booking.save();

    try {
      // Send notification
      await notificationService.sendBookingNotification(booking, 'booking_cancelled');
    } catch (notifError) {
      console.error("BOOKING SERVICE ERROR: Notification failed", notifError);
    }

    return booking;
  }


  /**
   * Get booking statistics
   */
  async getStatistics(engineerId, startDate, endDate) {
    const query = { engineerId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const stats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
        },
      },
    ]);

    return stats;
  }
}

module.exports = new BookingService();

