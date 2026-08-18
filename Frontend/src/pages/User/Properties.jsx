import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MapPin, Plus, Home, Ruler, Trash2, Star, Edit3, Search, Loader2 } from 'lucide-react';
import { plotService } from '../../services/plotService';
import { cn } from '../../utils/cn';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const result = await plotService.getUserPlots();
      const plots = result?.data?.plots || result?.plots || [];
      setProperties(Array.isArray(plots) ? plots : []);
    } catch (err) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await plotService.deletePlot(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await plotService.setPrimaryPlot(id);
      toast.success('Primary property updated');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const formatArea = (plot) => {
    if (!plot?.dimensions?.area) return '—';
    const area = plot.dimensions.area;
    const unit = plot.dimensions.areaUnit || 'sqft';
    return `${area.toLocaleString()} ${unit}`;
  };

  const filtered = properties.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <span className="ml-4 text-lg font-bold text-navy">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy mb-2">My Properties</h1>
          <p className="text-slate-500 text-lg">Manage your registered land and plots</p>
        </div>
        <Link
          to="/user/properties/add"
          className="bg-gold hover:bg-gold/90 text-navy font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Property
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search properties..."
          className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
        />
      </div>

      {/* Property Grid / Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-4xl border border-slate-200 shadow-xl">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-100 rounded-3xl flex items-center justify-center">
            <Home className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-navy mb-4">
            {searchTerm ? 'No matching properties' : 'No properties registered'}
          </h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {searchTerm
              ? 'Try a different search term.'
              : 'Register your land to get personalized design recommendations and start your construction journey.'}
          </p>
          {!searchTerm && (
            <Link
              to="/user/properties/add"
              className="btn-gold px-10 py-4 text-lg font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Register Your Land
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((plot) => (
            <div
              key={plot._id || plot.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all overflow-hidden group"
            >
              {/* Map Preview */}
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-slate-400" />
                </div>
                {plot.isPrimary && (
                  <div className="absolute top-4 left-4 bg-gold text-navy px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Primary
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-navy/80 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                  {formatArea(plot)}
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy mb-2 group-hover:text-gold transition-colors">
                  {plot.name}
                </h3>
                {plot.address?.city && (
                  <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {plot.address.city}
                    {plot.address.state ? `, ${plot.address.state}` : ''}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  {plot.dimensions?.width && (
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" /> {plot.dimensions.width}m
                    </span>
                  )}
                  {plot.terrainType && (
                    <span className="capitalize">{plot.terrainType.replace('_', ' ')}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <Link
                    to={`/user/properties/${plot._id || plot.id}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </Link>
                  {!plot.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(plot._id || plot.id)}
                      className="px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-2.5 rounded-xl text-sm transition-all"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(plot._id || plot.id, plot.name)}
                    className="px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;

