import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Search, Filter, Star, MapPin, Briefcase,
  Award, CheckCircle, ChevronRight, Mail, Phone,
  Calendar, Clock, Shield,
} from 'lucide-react';
import { engineerService } from '../../services/engineerService';
import { cn } from '../../utils/cn';

const SPECIALIZATIONS = [
  'Architectural', 'Structural', 'Civil', 'Mechanical',
  'Electrical', 'Interior', 'Landscape', 'Project Management',
];

const SORT_OPTIONS = [
  { value: '-rating', label: 'Highest Rated' },
  { value: 'rating', label: 'Lowest Rated' },
  { value: '-experience', label: 'Most Experienced' },
  { value: 'experience', label: 'Least Experienced' },
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
];

const EngineersEnhanced = () => {
  const navigate = useNavigate();
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [sortBy, setSortBy] = useState('-rating');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  const fetchEngineers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      const sortField = sortBy.replace('-', '');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortBy.startsWith('-') ? 'desc' : 'asc');
      if (searchTerm) params.set('q', searchTerm);
      if (specialization) params.set('style', specialization);
      if (minRating) params.set('minRating', minRating);
      if (minExperience) params.set('minExperience', minExperience);

      const res = await engineerService.getAllEngineers(params.toString());
      const data = res.data?.data || res.data?.engineers || [];
      const meta = res.data?.meta || res.data?.pagination || {};

      setEngineers(Array.isArray(data) ? data : []);
      setPagination({ page: meta.page || page, total: meta.total || data.length || 0 });
    } catch (err) {
      console.error('Failed to fetch engineers:', err);
      toast.error('Failed to load engineers');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, specialization, minRating, minExperience, sortBy]);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialization('');
    setMinRating('');
    setMinExperience('');
    setSortBy('-rating');
  };

  const hasFilters = searchTerm || specialization || minRating || minExperience;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRatingStars = (avg) => {
    const stars = [];
    const rating = avg || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn("w-4 h-4", i <= Math.round(rating) ? 'text-gold fill-current' : 'text-slate-300')}
        />
      );
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-navy via-slate-800 to-gold bg-clip-text text-transparent">
          Find Top Engineers
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Connect with verified engineers for your dream home project
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, specialization..."
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-white focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
          >
            <option value="">All Specialties</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-white focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
          >
            <option value="">Min Rating</option>
            {[4.5, 4.0, 3.5, 3.0].map((r) => (
              <option key={r} value={r}>{r}+ Stars</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-4 border border-slate-200 rounded-2xl bg-white focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gold font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
          <p className="text-3xl font-black text-navy">{pagination.total || (engineers.length > 0 ? engineers.length : '...')}</p>
          <p className="text-slate-500 text-sm font-medium">Engineers Found</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-5 h-5 text-emerald-600 fill-current" />
            <span className="text-3xl font-black text-emerald-700">4.8</span>
          </div>
          <p className="text-emerald-600 text-sm font-medium">Avg Rating</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-3xl font-black text-blue-700">100%</span>
          </div>
          <p className="text-blue-600 text-sm font-medium">Verified</p>
        </div>
        <div className="bg-gold/10 p-6 rounded-2xl text-center border border-gold/20">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-5 h-5 text-gold" />
            <span className="text-3xl font-black text-gold">{'<24h'}</span>
          </div>
          <p className="text-gold text-sm font-medium">Avg Response</p>
        </div>
      </div>

      {/* Engineers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : engineers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-3xl flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-navy mb-2">No engineers found</h3>
          <p className="text-slate-500 mb-8">Try adjusting your search or filter criteria</p>
          <button onClick={clearFilters} className="btn-gold px-8 py-3 font-bold">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.map((engineer) => {
            const profile = engineer.engineerProfile || {};
            const rating = profile.rating || {};
            return (
              <div
                key={engineer._id}
                onClick={() => navigate(`/user/engineers/${engineer._id}`)}
                className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-2xl font-black text-navy">
                      {getInitials(`${engineer.firstName} ${engineer.lastName}`)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-navy group-hover:text-gold transition-colors">
                        {engineer.firstName} {engineer.lastName}
                      </h3>
                      {profile.title && (
                        <p className="text-sm text-slate-500">{profile.title}</p>
                      )}
                      {profile.isVerified && (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium mt-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified Professional
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold",
                    profile.verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    profile.verificationStatus === 'pending' ? 'bg-gold/10 text-gold' :
                    'bg-slate-100 text-slate-500'
                  )}>
                    {profile.verificationStatus === 'approved' ? 'Verified' : profile.verificationStatus || 'Pending'}
                  </div>
                </div>

                {/* Rating & Experience */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    {getRatingStars(rating.average)}
                    <span className="ml-1 font-bold text-navy">{rating.average?.toFixed(1) || '—'}</span>
                    <span className="text-slate-400">({rating.count || 0})</span>
                  </div>
                  {profile.yearsOfExperience > 0 && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.yearsOfExperience} yrs</span>
                    </div>
                  )}
                </div>

                {/* Specializations */}
                {profile.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.specializations.slice(0, 3).map((spec, i) => (
                      <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-xl text-xs font-medium">
                        {spec}
                      </span>
                    ))}
                    {profile.specializations.length > 3 && (
                      <span className="text-xs text-slate-400">+{profile.specializations.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Service Areas */}
                {profile.serviceAreas?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">
                      {profile.serviceAreas.map(a => a.city || a.location?.coordinates?.join(', ')).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-gold" />
                    {profile.rating?.count > 0 ? (
                      <span className="text-slate-600">{profile.rating.count} reviews</span>
                    ) : (
                      <span className="text-slate-400">No reviews yet</span>
                    )}
                  </div>
                  <button className="flex items-center gap-1 text-gold font-bold text-sm group-hover:gap-2 transition-all">
                    View Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 20 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: Math.ceil(pagination.total / 20) }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchEngineers(i + 1)}
              className={cn(
                "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                pagination.page === i + 1
                  ? 'bg-gold text-navy shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-gold'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngineersEnhanced;

