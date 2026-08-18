import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid as GridIcon, List, ArrowUpDown, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { designService } from '../../services/designService';
import DesignCard from '../../components/DesignCard';
import FiltersSidebar from '../../components/FiltersSidebar';
import { cn } from '../../utils/cn';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const data = await designService.getAll() || [];
        setDesigns(Array.isArray(data) ? data : []);
        setFilteredDesigns(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('Failed to load designs');
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  useEffect(() => {
    let result = designs;

    if (search) {
      result = result.filter(d => 
        d.title?.toLowerCase().includes(search.toLowerCase()) || 
        d.location?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (filters.floors) {
      result = result.filter(d => d.floors == filters.floors);
    }

    if (filters.bedrooms) {
      result = result.filter(d => d.bedrooms == filters.bedrooms);
    }

    if (filters.budget) {
      const [min, max] = filters.budget.split('-').map(Number);
      result = result.filter(d => d.budget >= min && (!max || d.budget <= max));
    }

    if (filters.style) {
      result = result.filter(d => d.style === filters.style);
    }

    setFilteredDesigns(result);
  }, [search, filters, designs]);

  return (
    <div className="flex gap-8 max-w-screen-2xl mx-auto px-4 py-12">
      {/* Filters Sidebar */}
      <FiltersSidebar filters={filters} setFilters={setFilters} />

      {/* Main Content */}
      <div className="flex-grow space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-navy mb-2">House Designs</h1>
              <p className="text-xl text-slate-500 font-medium">Discover premium house designs from top engineers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search designs by style, location, or features..." 
                  className="pl-12 pr-4 py-4 w-80 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                />
              </div>
              <button className="p-4 border border-slate-200 rounded-3xl hover:border-gold hover:text-gold transition-all shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results & View Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-slate-400 font-medium tracking-tight">Showing</span>
              <span className="text-navy font-black text-3xl mx-3">{filteredDesigns.length}</span>
              <span className="text-slate-400 font-medium uppercase text-xs">designs</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? 'bg-slate-100 text-navy shadow-md' : 'hover:bg-slate-50')}
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="w-5 h-5" />
              </button>
              <button 
                className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? 'bg-slate-100 text-navy shadow-md' : 'hover:bg-slate-50')}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <button className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-sm font-bold">
                <ArrowUpDown className="w-4 h-4" /> Latest
              </button>
            </div>
          </div>
        </div>

        {/* Designs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-96 bg-slate-200 rounded-3xl animate-pulse shadow-lg"></div>
            ))}
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 mx-auto mb-8 bg-slate-100 rounded-3xl flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-4">No designs found</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search terms to discover amazing designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => { setSearch(''); setFilters({}); }}
                className="btn-gold px-8 py-3 font-bold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            {filteredDesigns.map((design) => (
              <div key={design.id} className="break-inside-avoid mb-8">
                <DesignCard design={design} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDesigns.map((design) => (
              <Link key={design.id} to={`/designs/${design.id}`} className="block group">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:border-gold transition-all group-hover:-translate-y-1">
                  {/* List card layout */}
                  <div className="flex gap-6">
                    <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                      <img src={design.image} alt={design.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-bold text-navy mb-2 line-clamp-2">{design.title}</h3>
                      <p className="text-slate-600 mb-4 line-clamp-2">{design.description}</p>
                      <div className="flex flex-wrap gap-4 mb-4 text-sm">
                        <span className="bg-slate-100 px-3 py-1 rounded-xl font-bold">₹{design.budget?.toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {design.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <BedDouble className="w-4 h-4" />
                          {design.bedrooms} Beds
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Layers className="w-4 h-4" />
                          {design.floors} Floors
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Designs;
