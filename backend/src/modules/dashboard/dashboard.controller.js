/**
 * Planova - Dashboard Controller
 * Aggregated data for User Panel dashboard
 */

const mongoose = require('mongoose');
const Plot = require('../plot/plot.model');
const Booking = require('../booking/booking.model');
const Appointment = require('../appointment/appointment.model');
const Notification = require('../notification/notification.model');
const Favorite = require('../favorite/favorite.model');
const { Chat } = require('../chat/chat.model');
const Design = require('../design/design.model');
const Blueprint = require('../blueprint/blueprint.model');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get user dashboard data
 * Aggregates: stats, recent activities, upcoming appointments, notifications
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.userId;

// Run all queries in parallel
  const [
    totalProperties,
    activeProperties,
    recentBookings,
    totalBookings,
    completedBookings,
    upcomingAppointments,
    unreadNotifications,
    recentNotifications,
    favoritesCount,
    unreadChats,
  ] = await Promise.all([
    // Properties
    Plot.countDocuments({ userId }),
    Plot.countDocuments({ userId, status: 'active' }),

    // Bookings
    Booking.find({ userId }).sort({ createdAt: -1 }).limit(5)
      .populate('engineerId', 'firstName lastName avatar')
      .lean(),
    Booking.countDocuments({ userId }),
    Booking.countDocuments({ userId, status: 'completed' }),

    // Appointments (upcoming)
    Appointment.find({ clientId: userId, startAt: { $gte: new Date() }, status: { $in: ['pending', 'accepted'] } })
      .sort({ startAt: 1 })
      .limit(5)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.title')
      .lean(),

    // Notifications
    Notification.countDocuments({ userId, isRead: false }),
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    // Favorites count
    Favorite.countDocuments({ userId }),

    // Unread chat messages
    Chat.countDocuments({ participants: userId, isActive: true }),
  ]);

const data = {
    stats: {
      totalProperties: totalProperties || 0,
      activeProperties: activeProperties || 0,
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      totalAppointments: (Array.isArray(upcomingAppointments) ? upcomingAppointments.length : 0) || 0,
      unreadNotifications: unreadNotifications || 0,
      favoritesCount: favoritesCount || 0,
      unreadChats: unreadChats || 0,
    },
    recentBookings: recentBookings || [],
    upcomingAppointments: upcomingAppointments || [],
    recentNotifications: recentNotifications || [],
    quickActions: [
      { label: 'Register Property', path: '/user/properties/add', icon: 'MapPin' },
      { label: 'Browse Designs', path: '/user/designs', icon: 'Grid' },
      { label: 'Find Engineers', path: '/user/engineers', icon: 'Users' },
      { label: 'Book Consultation', path: '/user/engineers', icon: 'Calendar' },
    ],
  };

  ApiResponse.ok(res, 'Dashboard data retrieved successfully', data);
});

module.exports = {
  getDashboard,
};

