import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, ArrowUpDown, Filter, Heart, MapPin, BedDouble, Layers, Bath, Eye, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { blueprintService } from '../../services/blueprintService';
import { collectionService } from '../../services/collectionService';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (amount) => {
  if (!amount) return 'Price TBD';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const BlueprintMarketplace = () => {
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await blueprintService.getAll({ limit: 50 });
        const list = data?.data || data || [];
        setBlueprints(Array.isArray(list) ? list : []);
        setFiltered(Array.isArray(list) ? list : []);
      } catch {
        // Use empty state gracefully
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = blueprints;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.tags?.some(t => t.toLowerCase().includes(q)) ||
        b.specs?.style?.toLowerCase().includes(q)
      );
    }
    if (filters.style) result = result.filter(b => b.specs?.style === filters.style);
    if (filters.bedrooms) result = result.filter(b => b.specs?.bedrooms === Number(filters.bedrooms));
    if (filters.floors) result = result.filter(b => b.specs?.floors === Number(filters.floors));
    if (filters.budget) {
      const [min, max] = filters.budget.split('-').map(Number);
      result = result.filter(b => b.specs?.estimatedCost >= min && (!max || b.specs?.estimatedCost <= max));
    }
    setFiltered(result);
  }, [search, filters, blueprints]);

  const toggleSave = async (blueprintId) => {
    if (!user) { toast.error('Login to save'); return; }
    try {
      const res = await collectionService.toggleItem('blueprints', blueprintId);
      if (res.data?.saved) {
        setSavedIds(prev => new Set([...prev, blueprintId]));
        toast.success('Saved to favorites');
      } else {
        setSavedIds(prev => { const next = new Set(prev); next.delete(blueprintId); return next; });
        toast('Removed from favorites');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const styles = ['modern', 'traditional', 'villa', 'duplex', 'contemporary', 'minimalist', 'colonial', 'farmhouse'];

  return (
    <div className="flex gap-8 max-w-screen-2xl mx-auto px-4 py-12">
      {/* Sidebar Filters */}
      {viewMode === 'grid' && (
        <div className="w-72 flex-shrink-0 hidden lg:block space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 sticky top-28">
            <div>
              <h4 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </h4>
              <button onClick={() => setFilters({})} className="text-sm text-teal-500 hover:underline">Clear all</button>
            </div>

            {/* Style */}
            <div>
              <h5 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Style</h5>
              <div className="space-y-2">
                {styles.map(s => (
                  <button key={s} onClick={() => setFilters(f => ({ ...f, style: f.style === s ? undefined : s }))}
                    className={cn('block w-full text-left px-3 py-2 rounded-xl text-sm transition-all', filters.style === s ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}
                  >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <h5 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Bedrooms</h5>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setFilters(f => ({ ...f, bedrooms: f.bedrooms === n ? undefined : n }))}
                    className={cn('px-4 py-2 rounded-xl text-sm font-bold transition-all', filters.bedrooms === n ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                  >{n}</button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h5 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Budget</h5>
              <div className="space-y-2">
                {[
                  { label: 'Under ₹20L', value: '0-2000000' },
                  { label: '₹20L - ₹50L', value: '2000000-5000000' },
                  { label: '₹50L - ₹1Cr', value: '5000000-10000000' },
                  { label: '₹1Cr - ₹2Cr', value: '10000000-20000000' },
                  { label: '₹2Cr+', value: '20000000-1000000000' },
                ].map(b => (
                  <button key={b.value} onClick={() => setFilters(f => ({ ...f, budget: f.budget === b.value ? undefined : b.value }))}
                    className={cn('block w-full text-left px-3 py-2 rounded-xl text-sm transition-all', filters.budget === b.value ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}
                  >{b.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-navy mb-2">House Blueprints</h1>
              <p className="text-lg text-slate-500 font-medium">Discover professional blueprints from top engineers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by style, feature, or tag..."
                  className="pl-12 pr-4 py-4 w-80 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-teal-400/20 focus:border-teal-400 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Results & View Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-slate-400 font-medium">Showing </span>
              <span className="text-navy font-black text-3xl">{filtered.length}</span>
              <span className="text-slate-400 font-medium uppercase text-xs ml-2">blueprints</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <button className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? 'bg-slate-100 text-navy shadow-md' : 'hover:bg-slate-50')} onClick={() => setViewMode('grid')}><Grid className="w-5 h-5" /></button>
              <button className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? 'bg-slate-100 text-navy shadow-md' : 'hover:bg-slate-50')} onClick={() => setViewMode('list')}><List className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-3xl animate-pulse shadow-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 mx-auto mb-8 bg-slate-100 rounded-3xl flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-4">No blueprints found</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearch(''); setFilters({}); }} className="bg-gradient-to-r from-teal-400 to-emerald-400 text-navy font-bold px-8 py-3 rounded-xl">Clear Filters</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((bp) => (
              <div key={bp._id || bp.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200">
                <Link to={`/blueprints/${bp._id || bp.id}`} className="block">
                  <div className="relative h-56 overflow-hidden">
                    <img src={bp.files?.images?.[0]?.url || bp.image || '/images/placeholder-design.jpg'}
                      alt={bp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-navy/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                      {bp.specs?.style || 'Modern'}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); toggleSave(bp._id || bp.id); }}
                      className={cn("absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-sm transition-all", savedIds.has(bp._id || bp.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-red-50 hover:text-red-500')}>
                      <Heart className={cn("w-4 h-4", savedIds.has(bp._id || bp.id) && 'fill-current')} />
                    </button>
                    {bp.specs?.builtUpArea > 0 && (
                      <div className="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                        {bp.specs.builtUpArea} sqft
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/blueprints/${bp._id || bp.id}`}>
                    <h3 className="text-lg font-bold text-navy mb-3 line-clamp-1 group-hover:text-teal-600 transition-colors">{bp.title}</h3>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 flex-wrap">
                    {bp.specs?.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{bp.specs.bedrooms}</span>}
                    {bp.specs?.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{bp.specs.bathrooms}</span>}
                    {bp.specs?.floors > 0 && <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{bp.specs.floors}</span>}
                    {bp.metrics?.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{bp.metrics.views}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Estimated Cost</p>
                      <p className="text-xl font-black text-navy">{formatCurrency(bp.specs?.estimatedCost)}</p>
                    </div>
                    {bp.engineerId && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>{bp.engineerId?.engineerProfile?.rating?.average?.toFixed(1) || '4.5'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filtered.map((bp) => (
              <Link key={bp._id || bp.id} to={`/blueprints/${bp._id || bp.id}`} className="block group">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-2xl hover:border-teal-400 transition-all flex gap-6">
                  <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={bp.files?.images?.[0]?.url || bp.image || '/images/placeholder-design.jpg'} alt={bp.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-xl font-bold text-navy mb-2">{bp.title}</h3>
                    <p className="text-slate-600 mb-3 line-clamp-2">{bp.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-xl font-bold">{formatCurrency(bp.specs?.estimatedCost)}</span>
                      <span className="flex items-center gap-1 text-slate-500"><BedDouble className="w-4 h-4" />{bp.specs?.bedrooms || '-'} Beds</span>
                      <span className="flex items-center gap-1 text-slate-500"><Bath className="w-4 h-4" />{bp.specs?.bathrooms || '-'} Baths</span>
                      <span className="flex items-center gap-1 text-slate-500"><Layers className="w-4 h-4" />{bp.specs?.floors || '-'} Floors</span>
                      <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-4 h-4" />{bp.location?.city || 'N/A'}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); toggleSave(bp._id || bp.id); }}
                    className={cn("self-start p-3 rounded-xl transition-all", savedIds.has(bp._id || bp.id) ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500')}>
                    <Heart className={cn("w-5 h-5", savedIds.has(bp._id || bp.id) && 'fill-current')} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueprintMarketplace;

