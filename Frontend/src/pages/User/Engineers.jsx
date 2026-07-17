import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, Star, Clock, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { engineerService } from '../../services/engineerService';
import EngineerCard from '../../components/engineers/EngineerCard';

const Engineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpec, setFilterSpec] = useState('all');
  const [budgetRange, setBudgetRange] = useState([40000, 70000]);
  const [bedrooms, setBedrooms] = useState('all');
  const [floors, setFloors] = useState('all');
  const [location, setLocation] = useState('all');
  const [filteredEngineers, setFilteredEngineers] = useState([]);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const data = await engineerService.getAllEngineers();
        const withPrice = data.map(e => ({ ...e, price: 45000 + Math.floor(Math.random() * 20000) }));
        setEngineers(withPrice);
        setFilteredEngineers(withPrice);
        toast.success(`Loaded ${data.length} engineers`);
      } catch (err) {
        toast.error('Failed to load engineers');
      } finally {
        setLoading(false);
      }
    };
    fetchEngineers();
  }, []);

  useEffect(() => {
    let result = engineers;
    if (searchTerm) {
      result = result.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterSpec !== 'all') {
      result = result.filter(e => e.specialization.includes(filterSpec));
    }
    // Budget filter
    result = result.filter(e => e.price >= budgetRange[0] && e.price <= budgetRange[1]);
    // Bedrooms filter
    if (bedrooms !== 'all') {
      result = result.filter(e => e.preferredBedrooms === bedrooms);
    }
    // Floors filter
    if (floors !== 'all') {
      result = result.filter(e => e.preferredFloors === floors);
    }
    // Location filter
    if (location !== 'all') {
      result = result.filter(e => e.location === location);
    }
    setFilteredEngineers(result);
  }, [searchTerm, filterSpec, budgetRange, bedrooms, floors, location, engineers]);

  const specializations = ['Structural', 'Civil', 'Architectural', 'Mechanical'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-navy via-slate-800 to-gold bg-clip-text text-transparent mb-6">
          Find Top Engineers
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Connect with verified structural engineers for your dream house. 
          Filter by expertise and book consultations instantly.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search engineers by name or specialty..."
            className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="flex-1 px-4 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white shadow-sm appearance-none bg-no-repeat bg-right"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")` }}
          >
            <option value="all">All Specialties</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec} Engineering</option>
            ))}
          </select>
          <button className="p-4 border border-slate-200 rounded-3xl hover:border-gold hover:text-gold transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 text-center">
        <div className="p-6 bg-slate-50 rounded-3xl">
          <div className="text-3xl font-black text-navy mb-2">{filteredEngineers.length}</div>
          <div className="text-slate-500 font-medium">Available Now</div>
        </div>
        <div className="p-6 bg-emerald-50 rounded-3xl">
          <div className="text-3xl font-black text-emerald-700 mb-2">4.8</div>
          <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4" />
          </div>
          <div className="text-slate-600 text-sm">Average Rating</div>
        </div>
        <div className="p-6 bg-gold/10 rounded-3xl">
          <div className="text-3xl font-black text-gold mb-2">₹45K - 65K</div>
          <div className="text-slate-600 text-sm">Consultation Range</div>
        </div>
        <div className="p-6 bg-blue-50 rounded-3xl">
          <div className="text-3xl font-black text-blue-700 mb-2">24h</div>
          <div className="text-slate-600 text-sm">Avg Response</div>
        </div>
      </div>

      {/* Engineers Grid */}
      {filteredEngineers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEngineers.map((engineer) => (
            <EngineerCard 
              key={engineer.id} 
              engineer={engineer} 
              isAdmin={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-100 rounded-3xl flex items-center justify-center">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-navy mb-4">No engineers found</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Try adjusting your search or filter criteria. We have hundreds of verified engineers ready to help.
          </p>
          <button 
            className="btn-gold px-12 py-4 text-lg font-bold rounded-3xl"
            onClick={() => {
              setSearchTerm('');
              setFilterSpec('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="text-center mt-20">
        <p className="text-slate-500 mb-4">Not finding what you need?</p>
        <Link 
          to="/designs" 
          className="inline-flex items-center gap-2 bg-navy text-white px-8 py-4 rounded-3xl font-bold hover:bg-slate-800 transition-all shadow-xl"
        >
          Browse Designs First
          <MapPin className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default Engineers;

