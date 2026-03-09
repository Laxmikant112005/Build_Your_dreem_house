import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendar, FaFilter, FaRedo } from 'react-icons/fa';
import { bookingAPI } from '../services/api';
import BookingCard from '../components/BookingCard';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

// Status filter tabs
const STATUS_TABS = [
  { key: 'all', label: 'All', color: 'bg-gray-100' },
  { key: 'pending', label: 'Pending', color: 'bg-yellow-100' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-green-100' },
  { key: 'completed', label: 'Completed', color: 'bg-blue-100' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100' },
];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings when tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(
        booking => booking.status?.toLowerCase() === activeTab
      ));
    }
  }, [activeTab, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.data || []);
      setFilteredBookings(response.data.data || []);
    } catch (err) {
      setError('Failed to load bookings');
      // Use sample data if API fails
      const sampleBookings = [
        {
          _id: '1',
          designName: 'Modern Villa Design',
          status: 'confirmed',
          preferredDate: '2024-03-15',
          contactNumber: '+91 98765 43210',
          designPrice: '₹25,00,000',
        },
        {
          _id: '2',
          designName: 'Traditional Home',
          status: 'pending',
          preferredDate: '2024-04-01',
          contactNumber: '+91 98765 43210',
          designPrice: '₹30,00,000',
        },
        {
          _id: '3',
          designName: 'Minimalist Apartment',
          status: 'completed',
          preferredDate: '2024-01-10',
          contactNumber: '+91 98765 43210',
          designPrice: '₹18,00,000',
        },
      ];
      setBookings(sampleBookings);
      setFilteredBookings(sampleBookings);
    } finally {
      setLoading(false);
    }
  };

  // Get status counts for badges
  const getStatusCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  // Helper function for status colors (kept for backward compatibility)
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-xl text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Header */}
      <div className="bg-blue-600 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-blue-100">View and manage your design bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Status Filter Tabs */}
        {bookings.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FaFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {statusCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div 
                key={booking._id || booking.id} 
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.designName || 'Design Booking'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Booking ID</p>
                          <p className="font-medium">#{booking._id?.slice(-8) || booking.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Preferred Date</p>
                          <p className="font-medium">
                            {booking.preferredDate 
                              ? new Date(booking.preferredDate).toLocaleDateString() 
                              : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contact</p>
                          <p className="font-medium">{booking.contactNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium text-blue-600">
                            {booking.designPrice || '₹30,00,000'}
                          </p>
                        </div>
                      </div>
                      
                      {booking.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Message:</span> {booking.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {booking.designId && (
                        <Link
                          to={`/designs/${booking.designId}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center font-medium"
                        >
                          View Design
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="mt-2 text-gray-500">Start by exploring our design collection!</p>
            <Link
              to="/designs"
              className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Designs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

