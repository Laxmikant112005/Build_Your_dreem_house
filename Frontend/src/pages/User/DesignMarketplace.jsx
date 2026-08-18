import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Search, SlidersHorizontal, Grid as GridIcon, List, ArrowUpDown,
  Heart, BedDouble, Bath, Square, MapPin, Star, Eye,
  Layers, Filter, X
} from 'lucide-react';
import { blueprintService } from '../../services/blueprintService';
import { cn } from '../../utils/cn';

const HOUSE_STYLES = [
  'modern', 'traditional', 'villa', 'duplex', 'contemporary',
  'minimalist', 'colonial', 'mediterranean', 'industrial',
  'farmhouse', 'cottage', 'craftsman',
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-metrics.views', label: 'Most Viewed' },
  { value: '-metrics.likes', label: 'Most Liked' },
  { value: '-specs.estimatedCost', label: 'Price: High to Low' },
  { value: 'specs.estimatedCost', label: 'Price: Low to High' },
  { value: '-specs.builtUpArea', label: 'Area: Largest' },
  { value: 'specs.builtUpArea', label: 'Area: Smallest' },
];

const DesignMarketplace = () => {
  const navigate = useNavigate();
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    style: '',
    minCost: '',
    maxCost: '',
    minArea: '',
    maxArea: '',
    minBedrooms: '',
    floors: '',
    sortBy: '-createdAt',
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filterOptions, setFilterOptions] = useState(null);

  const fetchBlueprints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy: filters.sortBy.replace('-', ''), sortOrder: filters.sortBy.startsWith('-') ? 'desc' : 'asc' };
      if (filters.search) params.search = filters.search;
      if (filters.style) params.style = filters.style;
      if (filters.minCost) params.minCost = filters.minCost;
      if (filters.maxCost) params.maxCost = filters.maxCost;
      if (filters.minArea) params.minArea = filters.minArea;
      if (filters.maxArea) params.maxArea = filters.maxArea;
      if (filters.minBedrooms) params.minBedrooms = filters.minBedrooms;
      if (filters.floors) params.floors = filters.floors;

      const response = await blueprintService.getAll(params);
      setBlueprints(response.data || []);
      setPagination(response.meta?.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Failed to load blueprints:', err);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBlueprints();
  }, [fetchBlueprints]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await blueprintService.getFilterOptions();
        setFilterOptions(response.data);
      } catch (err) { /* silently fail */ }
    };
    fetchFilterOptions();
  }, []);

  const clearFilters = () => {
    setFilters({
      search: '', style: '', minCost: '', maxCost: '',
      minArea: '', maxArea: '', minBedrooms: '', floors: '', sortBy: '-createdAt',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '-createdAt');

  const formatCurrency = (val) => {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  const getPrimaryImage = (blueprint) => {
    const images = blueprint.files?.images;
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.isPrimary);
    return primary?.thumbnailUrl || primary?.url || images[0]?.thumbnailUrl || images[0]?.url;
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sortBy').length;

  const FilterPanel = () => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy">Filters</h3>
        <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Search</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search designs..."
            className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold"
          />
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Style</label>
        <select
          value={filters.style}
          onChange={(e) => setFilters({ ...filters, style: e.target.value })}
          className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white"
        >
          <option value="">All Styles</option>
          {(filterOptions?.styles || HOUSE_STYLES).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Budget Range */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Budget Range (₹)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minCost}
            onChange={(e) => setFilters({ ...filters, minCost: e.target.value })}
            placeholder="Min"
            className="w-full p-3 border border-slate-200 rounded-xl text-sm"
          />
          <input
            type="number"
            value={filters.maxCost}
            onChange={(e) => setFilters({ ...filters, maxCost: e.target.value })}
            placeholder="Max"
            className="w-full p-3 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Area Range */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Area (sq.ft)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minArea}
            onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
            placeholder="Min"
            className="w-full p-3 border border-slate-200 rounded-xl text-sm"
          />
          <input
            type="number"
            value={filters.maxArea}
            onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
            placeholder="Max"
            className="w-full p-3 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Bedrooms</label>
        <select
          value={filters.minBedrooms}
          onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value })}
          className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}+ Bedrooms</option>
          ))}
        </select>
      </div>

      {/* Floors */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Floors</label>
        <select
          value={filters.floors}
          onChange={(e) => setFilters({ ...filters, floors: e.target.value })}
          className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} Floor{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <button
        onClick={clearFilters}
        className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="flex gap-8 max-w-screen-2xl mx-auto px-4 py-8">
      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-28">
          <FilterPanel />
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto p-6 shadow-2xl">
            <FilterPanel />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow min-w-0 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-navy">House Designs</h1>
              <p className="text-slate-500 mt-1">
                Browse {pagination.total || 0} premium designs from top engineers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search designs..."
                  className="pl-12 pr-4 py-3 w-72 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-3 border border-slate-200 rounded-2xl hover:border-gold transition-all relative"
              >
                <Filter className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-navy text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
              <button
                className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50')}
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50')}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className={cn("gap-6", viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4')}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : blueprints.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-3xl flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-2">No designs found</h3>
            <p className="text-slate-500 mb-8">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-gold px-8 py-3 font-bold">Clear Filters</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((bp) => (
              <div
                key={bp._id}
                onClick={() => navigate(`/blueprints/${bp._id}`)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  {getPrimaryImage(bp) ? (
                    <img
                      src={getPrimaryImage(bp)}
                      alt={bp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  {/* Labels */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {bp.accessTier && bp.accessTier !== 'free' && (
                      <span className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-lg uppercase">
                        {bp.accessTier}
                      </span>
                    )}
                    {bp.vastu?.compliant && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                        Vastu
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); blueprintService.toggleLike(bp._id).catch(() => {}); }}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all"
                  >
                    <Heart className="w-4 h-4 text-slate-500 hover:text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-navy text-lg mb-2 line-clamp-1 group-hover:text-gold transition-colors">
                    {bp.title}
                  </h3>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                      <Square className="w-3 h-3" />
                      {bp.specs?.builtUpArea?.toLocaleString() || '—'} sq.ft
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                      <BedDouble className="w-3 h-3" />
                      {bp.specs?.bedrooms || 0} Beds
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                      <Layers className="w-3 h-3" />
                      {bp.specs?.floors || 0} Floors
                    </span>
                  </div>

                  {/* Price & Engineer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-lg font-black text-navy">
                        {formatCurrency(bp.specs?.estimatedCost)}
                      </p>
                      {bp.specs?.costPerSqft > 0 && (
                        <p className="text-xs text-slate-400">₹{bp.specs.costPerSqft}/sq.ft</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">by</p>
                      <p className="text-sm font-bold text-navy">
                        {bp.engineerId?.firstName || 'Engineer'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {blueprints.map((bp) => (
              <div
                key={bp._id}
                onClick={() => navigate(`/blueprints/${bp._id}`)}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-gold/30 transition-all cursor-pointer"
              >
                <div className="flex gap-6">
                  <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                    {getPrimaryImage(bp) ? (
                      <img src={getPrimaryImage(bp)} alt={bp.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Eye className="w-8 h-8 text-slate-300" /></div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-navy">{bp.title}</h3>
                      <p className="text-lg font-black text-navy whitespace-nowrap ml-4">
                        {formatCurrency(bp.specs?.estimatedCost)}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{bp.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Square className="w-4 h-4" />{bp.specs?.builtUpArea?.toLocaleString() || '—'} sq.ft</span>
                      <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" />{bp.specs?.bedrooms || 0} Beds</span>
                      <span className="flex items-center gap-1"><Layers className="w-4 h-4" />{bp.specs?.floors || 0} Floors</span>
                      <span className="flex items-center gap-1 capitalize">{bp.specs?.style || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {bp.engineerId && (
                        <span className="text-xs text-slate-400">
                          by <strong>{bp.engineerId.firstName} {bp.engineerId.lastName}</strong>
                        </span>
                      )}
                      {bp.specs?.costPerSqft > 0 && (
                        <span className="text-xs text-slate-400">· ₹{bp.specs.costPerSqft}/sq.ft</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-8">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchBlueprints(pageNum)}
                  className={cn(
                    "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                    pagination.page === pageNum
                      ? 'bg-gold text-navy shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-gold'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignMarketplace;

