import React, { useState, useEffect } from 'react';
import { adminAPI, designAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import AdminTable from '../components/AdminTable';

const AdminDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDesigns();
      setDesigns(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (design) => {
    if (!window.confirm(`Are you sure you want to delete "${design.title}"?`)) {
      return;
    }

    try {
      await designAPI.deleteDesign(design._id || design.id);
      fetchDesigns();
    } catch (err) {
      alert('Failed to delete design');
    }
  };

  const handleStatusUpdate = async (design, status) => {
    try {
      if (status === 'approved') {
        await adminAPI.approveDesign(design._id || design.id);
      } else if (status === 'rejected') {
        await adminAPI.rejectDesign(design._id || design.id, 'Rejected by admin');
      }
      fetchDesigns();
    } catch (err) {
      alert('Failed to update design status');
    }
  };

  const columns = [
    {
      header: 'Design',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || 'https://via.placeholder.com/50'}
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <span className="font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      header: 'Style',
      key: 'style',
    },
    {
      header: 'Price',
      key: 'price',
      render: (row) => row.price || '₹30,00,000',
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const statusColors = {
          approved: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          rejected: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status || 'pending'}
          </span>
        );
      },
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Designs</h1>
            <p className="text-gray-600">View, edit, and manage all designs</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add New Design
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading designs...</div>
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={designs}
            onDelete={handleDelete}
            onAction={(row) => {
              if (row.status === 'pending') {
                handleStatusUpdate(row, 'approved');
              }
            }}
            actionLabel="Actions"
          />
        )}

        {/* Simple Modal for Adding Design */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Design</h2>
              <p className="text-gray-600 mb-4">
                Design creation form would go here. For now, this is a placeholder.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    alert('This feature requires backend implementation');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDesigns;

