import React, { useState, useEffect } from 'react';
import { adminAPI, bookingAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import AdminTable from '../components/AdminTable';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBookings();
      setBookings(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    try {
      await bookingAPI.updateBookingStatus(booking._id || booking.id, { status: newStatus });
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const columns = [
    {
      header: 'Booking ID',
      key: '_id',
      render: (row) => `#${(row._id || row.id)?.slice(-8)}`,
    },
    {
      header: 'User',
      key: 'user',
      render: (row) => row.user?.username || row.userName || 'N/A',
    },
    {
      header: 'Design',
      key: 'designName',
      render: (row) => row.designName || 'N/A',
    },
    {
      header: 'Date',
      key: 'preferredDate',
      render: (row) => row.preferredDate 
        ? new Date(row.preferredDate).toLocaleDateString() 
        : 'Not set',
    },
    {
      header: 'Contact',
      key: 'contactNumber',
      render: (row) => row.contactNumber || 'N/A',
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const statusColors = {
          confirmed: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          cancelled: 'bg-red-100 text-red-800',
          completed: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status || 'pending'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-600">View and manage all bookings</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading bookings...</div>
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={bookings}
            onAction={(row) => {
              if (row.status === 'pending') {
                handleStatusUpdate(row, 'confirmed');
              }
            }}
            actionLabel="Approve"
          />
        )}
      </div>
    </div>
  );
};

export default AdminBookings;

