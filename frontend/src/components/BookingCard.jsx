import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendar, FaPhone, FaHome, FaClock } from 'react-icons/fa';

/**
 * BookingCard Component
 * 
 * A reusable component to display booking details consistently.
 * Used in Dashboard, MyBookings, and other booking-related pages.
 * 
 * @param {Object} booking - The booking object containing all booking details
 * @param {string} variant - Display variant: 'default' | 'compact' | 'detailed'
 * @param {Function} onStatusChange - Optional callback for status changes
 */
const BookingCard = ({ booking, variant = 'default', onStatusChange }) => {
  // Get status color based on booking status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Compact variant - smaller card for lists
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {booking.designName || 'Design Booking'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(booking.preferredDate || booking.scheduledDate)}
            </p>
          </div>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {formatStatus(booking.status)}
          </span>
        </div>
      </motion.div>
    );
  }

  // Detailed variant - more information
  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            {/* Title and Status */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.designName || 'Design Booking'}
                </h3>
                <p className="text-sm text-gray-500">
                  Booking ID: #{booking.bookingId || booking._id?.slice(-8) || booking.id}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {formatStatus(booking.status)}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-gray-400" />
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {formatDate(booking.preferredDate || booking.scheduledDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">{booking.scheduledTime || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-gray-400" />
              <div>
                <p className="text-gray-500">Contact</p>
                <p className="font-medium">{booking.contactNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaHome className="text-gray-400" />
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{booking.type || 'consultation'}</p>
              </div>
            </div>
          </div>

          {/* Message/Notes */}
          {(booking.message || booking.notes) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Message:</span> {booking.message || booking.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {booking.designId && (
              <Link
                to={`/designs/${booking.designId}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Design
              </Link>
            )}
            {onStatusChange && booking.status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusChange(booking._id, 'confirmed')}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => onStatusChange(booking._id, 'cancelled')}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant - standard card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {booking.designName || 'Design Booking'}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
            {formatStatus(booking.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Booking ID</p>
            <p className="font-medium">#{booking.bookingId || booking._id?.slice(-8) || booking.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Preferred Date</p>
            <p className="font-medium">{formatDate(booking.preferredDate || booking.scheduledDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Contact</p>
            <p className="font-medium">{booking.contactNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-medium text-blue-600">{booking.designPrice || '₹30,00,000'}</p>
          </div>
        </div>

        {booking.message && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Message:</span> {booking.message}
            </p>
          </div>
        )}

        {booking.designId && (
          <div className="mt-4">
            <Link
              to={`/designs/${booking.designId}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Design
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BookingCard;

