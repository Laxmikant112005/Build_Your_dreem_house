import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Plus, Eye, Archive, Trash2, Send, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { blueprintService } from '../../services/blueprintService';
import { cn } from '../../utils/cn';

const MyDesigns = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchBlueprints = async () => {
    setLoading(true);
    try {
      const res = await blueprintService.getMyBlueprints({ limit: 100 });
      const list = res?.data?.blueprints || res?.data || res?.data?.data || [];
      setBlueprints(list);
    } catch (e) {
      setError('Failed to load your blueprints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const handleAction = async (action, id) => {
    try {
      if (action === 'submit') {
        await blueprintService.submitForApproval(id);
        toast.success('Submitted for approval');
      } else if (action === 'archive') {
        await blueprintService.update(id, { status: 'archived' });
        toast.success('Blueprint archived');
      } else if (action === 'delete') {
        await blueprintService.remove(id);
        toast.success('Blueprint deleted');
      }
      fetchBlueprints();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const filtered = filter === 'all'
    ? blueprints
    : blueprints.filter((b) => (b.status || '').toLowerCase() === filter);

  const statusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'bg-emerald-100 text-emerald-800';
    if (s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'draft') return 'bg-slate-100 text-slate-600';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    if (s === 'archived') return 'bg-purple-100 text-purple-700';
    return 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
            <Grid className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-navy">My Blueprints</h1>
            <p className="text-slate-600 font-medium">Manage your blueprint portfolio</p>
          </div>
        </div>
        <Link to="/engineer/blueprints/new" className="btn-gold px-6 py-3 rounded-3xl font-bold inline-flex items-center gap-2">
          <Plus className="w-5 h-5" /> Upload Blueprint
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'draft', 'pending', 'approved', 'rejected', 'archived'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors',
              filter === f ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-gold'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No blueprints yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Upload your first blueprint to build your portfolio and attract clients.
          </p>
          <Link to="/engineer/blueprints/new" className="btn-gold px-6 py-3 rounded-3xl font-bold inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> Upload Blueprint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bp) => (
            <div key={bp.id || bp._id} className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
              <div className="h-48 bg-slate-100 relative">
                {bp.files?.images?.[0]?.url ? (
                  <img src={bp.files.images[0].url} alt={bp.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <span className={cn('absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase', statusStyle(bp.status))}>
                  {bp.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-navy text-lg mb-1 line-clamp-1">{bp.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{bp.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {bp.specs?.style && <Tag>{bp.specs.style}</Tag>}
                  {bp.specs?.bedrooms ? <Tag>{bp.specs.bedrooms} BHK</Tag> : null}
                  {bp.specs?.builtUpArea ? <Tag>{bp.specs.builtUpArea} sqft</Tag> : null}
                </div>

                <div className="flex gap-2">
                  {(bp.status === 'draft') && (
                    <ActionButton icon={Send} label="Submit" onClick={() => handleAction('submit', bp.id)} color="bg-gold text-navy" />
                  )}
                  {(bp.status === 'pending' || bp.status === 'approved') && (
                    <ActionButton icon={Archive} label="Archive" onClick={() => handleAction('archive', bp.id)} color="bg-purple-50 text-purple-700" />
                  )}
                  <ActionButton icon={Trash2} label="Delete" onClick={() => handleAction('delete', bp.id)} color="bg-red-50 text-red-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Tag = ({ children }) => (
  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">{children}</span>
);

const ActionButton = ({ icon: Icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className={cn('inline-flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold hover:opacity-80', color)}
  >
    <Icon className="w-4 h-4" /> {label}
  </button>
);

export default MyDesigns;
