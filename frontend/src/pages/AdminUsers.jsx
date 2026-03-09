import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import AdminTable from '../components/AdminTable';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await adminAPI.updateUser(user._id || user.id, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(user._id || user.id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const columns = [
    {
      header: 'User',
      key: 'username',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {(row.username || row.email)?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.username || 'N/A'}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (row) => {
        const roleColors = {
          admin: 'bg-red-100 text-red-800',
          engineer: 'bg-blue-100 text-blue-800',
          user: 'bg-green-100 text-green-800',
        };
        return (
          <select
            value={row.role || 'user'}
            onChange={(e) => handleRoleChange(row, e.target.value)}
            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${roleColors[row.role] || roleColors.user}`}
          >
            <option value="user">User</option>
            <option value="engineer">Engineer</option>
            <option value="admin">Admin</option>
          </select>
        );
      },
    },
    {
      header: 'Status',
      key: 'isActive',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isActive !== false 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Joined',
      key: 'createdAt',
      render: (row) => row.createdAt 
        ? new Date(row.createdAt).toLocaleDateString() 
        : 'N/A',
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600">View and manage all users</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading users...</div>
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={users}
            onDelete={handleDelete}
            actionLabel="Delete"
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

