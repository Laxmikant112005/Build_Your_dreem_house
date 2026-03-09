import React, { useState, useEffect, useMemo } from 'react';
import { designAPI } from '../services/api';
import DesignCard from '../components/DesignCard';
import { CardSkeleton } from '../components/Loading';

/**
 * Designs Page
 * 
 * Displays a responsive grid of house designs with filtering options.
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Category filter buttons (client-side)
 * - Advanced filters (style, bedrooms, price)
 * - Loading skeleton states
 * - Empty state handling
 * - Smooth animations
 */
const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    style: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await designAPI.getDesigns();
      setDesigns(response.data.data || []);
    } catch (err) {
      setError('Failed to load designs. Please try again.');
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.style) params.style = filters.style;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      
      const response = await designAPI.getDesigns(params);
      setDesigns(response.data.data || []);
    } catch (err) {
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      style: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: ''
    });
    setSelectedCategory('all');
    fetchDesigns();
  };

  // Category filter options
  const categories = [
    { id: 'all', label: 'All', icon: '🏠' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
    { id: 'living-room', label: 'Living Room', icon: '🛋️' },
    { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
    { id: 'office', label: 'Office', icon: '💼' },
  ];

  // Filter options
  const styleOptions = [
    { value: '', label: 'All Styles' },
    { value: 'Modern', label: 'Modern' },
    { value: 'Contemporary', label: 'Contemporary' },
    { value: 'Traditional', label: 'Traditional' },
    { value: 'Mediterranean', label: 'Mediterranean' },
    { value: 'Minimalist', label: 'Minimalist' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Duplex', label: 'Duplex' },
  ];

  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4 BHK' },
    { value: '5', label: '5+ BHK' },
  ];

  const priceMinOptions = [
    { value: '', label: 'Any' },
    { value: '2000000', label: '₹20 Lakh' },
    { value: '3000000', label: '₹30 Lakh' },
    { value: '5000000', label: '₹50 Lakh' },
    { value: '10000000', label: '₹1 Crore' },
  ];

  const priceMaxOptions = [
    { value: '', label: 'Any' },
    { value: '5000000', label: '₹50 Lakh' },
    { value: '10000000', label: '₹1 Crore' },
    { value: '20000000', label: '₹2 Crore' },
    { value: '50000000', label: '₹5 Crore' },
  ];

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(v => v !== '') || selectedCategory !== 'all';

  // Client-side category filtering
  const filteredDesigns = useMemo(() => {
    if (selectedCategory === 'all') {
      return designs;
    }
    return designs.filter(design => {
      // Check if design has category field, otherwise filter by title/description
      const designCategory = design.category?.toLowerCase() || '';
      const designTitle = design.title?.toLowerCase() || '';
      const designDescription = design.description?.toLowerCase() || '';
      
      // Match category in various ways
      return designCategory === selectedCategory ||
             designTitle.includes(selectedCategory.replace('-', ' ')) ||
             designDescription.includes(selectedCategory.replace('-', ' '));
    });
  }, [designs, selectedCategory]);

  return (
    <div className="min-h-screen bg-light pt-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-primary to-primary-dark py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              House Designs
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Explore our collection of beautiful, modern house designs tailored to your lifestyle
            </p>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" 
               className="w-full h-12 md:h-20">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                  fill="#F8FAFC"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Category Filter Buttons */}
        <div className="mt-8 mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 
                          flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
                }`}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          {/* Filter Toggle (Mobile) */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              {hasActiveFilters ? 'Filtered Results' : 'All Designs'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredDesigns.length} {filteredDesigns.length === 1 ? 'design' : 'designs'})
              </span>
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 
                       rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 
                       transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:block bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Designs</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Style Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Style
                </label>
                <select
                  name="style"
                  value={filters.style}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                           text-gray-700 text-sm focus:outline-none focus:ring-2 
                           focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {styleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                           text-gray-700 text-sm focus:outline-none focus:ring-2 
                           focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {bedroomOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Min Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Min Price
                </label>
                <select
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                           text-gray-700 text-sm focus:outline-none focus:ring-2 
                           focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {priceMinOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Max Price
                </label>
                <select
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                           text-gray-700 text-sm focus:outline-none focus:ring-2 
                           focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {priceMaxOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={applyFilters}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl
                         hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5
                         transition-all duration-300"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl
                           hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filter Modal */}
          {showFilters && (
            <div className="md:hidden bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Style</label>
                  <select
                    name="style"
                    value={filters.style}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {styleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                  <select
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {bedroomOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Price</label>
                  <select
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {priceMinOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Price</label>
                  <select
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {priceMaxOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { applyFilters(); setShowFilters(false); }}
                  className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl
                           hover:bg-primary-dark transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl
                           hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Results Count (Desktop) */}
          <div className="hidden md:flex items-center justify-between mt-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {hasActiveFilters ? 'Filtered Results' : 'All Designs'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredDesigns.length} {filteredDesigns.length === 1 ? 'design' : 'designs'})
              </span>
            </h2>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchDesigns}
                className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <CardSkeleton count={6} />
        )}

        {/* Designs Grid */}
        {!loading && !error && (
          <>
            {filteredDesigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDesigns.map((design, index) => (
                  <div 
                    key={design._id || design.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <DesignCard design={design} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No designs found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or browse all designs</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl
                           hover:bg-primary-dark transition-colors"
                >
                  View All Designs
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Designs;

