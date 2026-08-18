import React, { useState, useEffect } from 'react';
import { Users, User, Mail, Shield, Edit3, Trash2, Search, Filter, MapPin, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { userService } from '../../services/userService';
import { engineerService } from '../../services/engineerService';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersRes = await userService.getAll();
        setUsers(usersRes.data || usersRes || []);
        const engRes = await engineerService.getAllEngineers();
        setEngineers(engRes.data || engRes || []);
        toast.success('Users loaded');
      } catch (err) {
        toast.error('Load failed');
        console.error('Load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredEngineers = engineers.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const currentList = activeTab === 'users' ? filteredUsers : filteredEngineers;

  const handleDelete = (id) => {
    if (confirm('Delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
      setEngineers(engineers.filter(e => e.id !== id));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = (updatedUser) => {
    if (activeTab === 'users') {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } else {
      setEngineers(engineers.map(e => e.id === updatedUser.id ? updatedUser : e));
    }
    setEditingUser(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-navy mb-4 flex items-center gap-4">
          <Users className="w-12 h-12" />
          User Management
        </h1>
        <p className="text-xl text-slate-500">Manage platform users and engineers ({users.length + engineers.length} total)</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button 
          className={cn(
            'pb-4 px-1 border-b-2 font-bold text-lg -mb-px',
            activeTab === 'users' ? 'border-navy text-navy' : 'border-transparent text-slate-500 hover:text-navy'
          )}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={cn(
            'pb-4 px-1 border-b-2 font-bold text-lg -mb-px ml-8',
            activeTab === 'engineers' ? 'border-navy text-navy' : 'border-transparent text-slate-500 hover:text-navy'
          )}
          onClick={() => setActiveTab('engineers')}
        >
          Engineers ({engineers.length})
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-8 pb-8 border-b border-slate-200">
        <div className="flex bg-slate-100 p-4 rounded-3xl border flex-1 min-w-[300px]">
          <Search className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="bg-transparent ml-3 outline-none placeholder-slate-400 text-navy w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-slate-100 p-4 rounded-3xl border text-sm font-bold"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="engineer">Engineers</option>
          <option value="admin">Admins</option>
        </select>

        <button className="px-8 py-4 bg-navy text-white font-bold rounded-3xl hover:bg-navy/90 transition-all whitespace-nowrap">
          Export Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-blue-800">{users.length}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-800">{engineers.length}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Verified Engineers</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">{users.length + engineers.length}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-600">Active Accounts</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Edit3 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-purple-800">3</p>
              <p className="text-sm font-bold uppercase tracking-wide text-purple-600">Pending Approvals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-navy flex-1">{activeTab === 'users' ? 'Users' : 'Engineers'} ({currentList.length})</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">Active</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">Inactive</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {currentList.map((account) => (
            <div key={account.id} className="p-8 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-slate-100 group-hover:ring-gold">
                  <img 
                    src={account.avatar || `https://i.pravatar.cc/150?u=${account.id}`}
                    alt={account.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="text-xl font-bold text-navy truncate">{account.name}</h4>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                      account.role === 'engineer' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-200' :
                      account.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                    )}>
                      {account.role}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium truncate mb-1">{account.email}</p>
                  {account.location && (
                    <p className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{account.location}</span>
                    </p>
                  )}
                  {account.specialization && (
                    <p className="text-sm font-medium text-slate-700 italic">{account.specialization}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleEdit(account)}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-navy transition-all group-hover:scale-105"
                    title="Edit"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(account.id)}
                    className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 transition-all group-hover:scale-105"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentList.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-600 mb-4">No users found</h3>
            <p className="text-slate-500 mb-8">Try adjusting your search or filter settings.</p>
          </div>
        )}
      </div>

      {/* Edit Modal (simple inline) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-4xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-navy">Edit {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            {/* Simple form */}
            <div className="space-y-6">
              <input 
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-3xl text-lg font-bold"
                placeholder="Name"
              />
              <input 
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-3xl text-lg"
                placeholder="Email"
              />
              <select 
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-3xl text-lg"
              >
                <option value="user">User</option>
                <option value="engineer">Engineer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleSaveEdit(editingUser)}
                  className="flex-1 bg-navy text-white font-bold py-4 px-8 rounded-3xl hover:bg-navy/90 transition-all"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => handleDelete(editingUser.id)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-4 px-8 rounded-3xl hover:bg-slate-50 transition-all"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

