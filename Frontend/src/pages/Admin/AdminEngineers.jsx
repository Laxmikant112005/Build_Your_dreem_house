import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Download } from 'lucide-react';
import { engineerService } from '../../services/engineerService';
import EngineerList from '../../components/engineers/EngineerList';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const AdminEngineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      const data = await engineerService.getAllEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this engineer? This action cannot be undone.')) return;

    setDeletingId(id);
    try {
      await engineerService.deleteEngineer(id);
      setEngineers(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete engineer');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEngineers();
    setRefreshing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-3 flex items-center gap-4">
            <svg className="w-14 h-14 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1-8H5.5a1.5 1.5 0 00-1.5 1.5v9a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-9a1.5 1.5 0 00-1.5-1.5H13" />
            </svg>
            Manage Engineers
          </h1>
          <p className="text-xl text-slate-500">Professional accreditation and performance management</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link 
            to="/admin/engineers/new" 
            className="btn-gold px-8 py-4 text-lg font-bold shadow-xl flex items-center gap-3 hover:shadow-2xl"
          >
            <Plus className="w-5 h-5" />
            Add New Engineer
          </Link>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-2 font-bold shadow-sm disabled:opacity-50"
          >
            {refreshing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Refresh
          </button>

          <button className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-2 font-bold shadow-sm">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* List */}
      <EngineerList
        engineers={engineers}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onEdit={(engineer) => {
          // Navigate to edit
          window.location.href = `/admin/engineers/edit/${engineer.id}`;
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminEngineers;

