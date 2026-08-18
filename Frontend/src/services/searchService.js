import api from './axios';

export const searchService = {
  /**
   * Global search across all entities
   */
  search: async (query, params = {}) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.types && params.types.length > 0) searchParams.set('types', params.types.join(','));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const qs = searchParams.toString();
    const res = await api.get(`/search${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /**
   * Get search suggestions
   */
  getSuggestions: async (query) => {
    if (!query || query.trim().length < 2) return [];
    const res = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return res.data?.data || [];
  },
};

