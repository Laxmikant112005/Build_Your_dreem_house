import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, FileText, User, MessageSquare, MapPin, HardHat, ArrowRight, Clock } from 'lucide-react';
import { cn } from '../utils/cn';
import { searchService } from '../services/searchService';

const TYPE_CONFIG = {
  project: { icon: HardHat, color: 'bg-blue-500', label: 'Project' },
  blueprint: { icon: FileText, color: 'bg-purple-500', label: 'Design' },
  engineer: { icon: User, color: 'bg-emerald-500', label: 'Engineer' },
  document: { icon: FileText, color: 'bg-amber-500', label: 'Document' },
  chat: { icon: MessageSquare, color: 'bg-teal-500', label: 'Chat' },
  default: { icon: Search, color: 'bg-slate-500', label: 'Result' },
};

const GlobalSearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.search(query, {
          types: selectedType ? [selectedType] : [],
          limit: 5,
        });
        setResults(res?.data?.results || []);
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selectedType]);

  const handleSelect = (result) => {
    setShowDropdown(false);
    setQuery('');
    navigate(result.url);
  };

  const handleViewAll = () => {
    if (query.trim().length < 2) return;
    setShowDropdown(false);
    navigate(`/user/search?q=${encodeURIComponent(query)}`);
  };

  const getTypeConfig = (type) => {
    return TYPE_CONFIG[type] || TYPE_CONFIG.default;
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1 max-w-lg mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder="Search projects, designs, engineers... (Ctrl+K)"
          className="w-full pl-12 pr-20 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white/15 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button onClick={clearSearch} className="p-1 hover:bg-white/10 rounded-lg transition-all">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-white/10 text-slate-400 rounded-lg border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Quick Type Filters */}
      {query.length >= 2 && showDropdown && (
        <div className="flex gap-1 mt-2">
          {['', 'project', 'blueprint', 'engineer', 'document'].map(type => (
            <button key={type}
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
              className={cn('px-3 py-1.5 text-xs rounded-full font-medium transition-all',
                selectedType === type ? 'bg-gold text-navy' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              )}>
              {type || 'All'}
            </button>
          ))}
        </div>
      )}

      {/* Search Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef}
          className="absolute top-full mt-2 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-navy">No results for "{query}"</p>
              <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div>
              <div className="p-2">
                {results.map((result, i) => {
                  const { icon: Icon, color, label } = getTypeConfig(result.type);
                  return (
                    <button key={`${result.type}-${result._id}-${i}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left"
                    >
                      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0', color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-navy text-sm truncate">{result.title}</p>
                        <p className="text-xs text-slate-400 truncate">{result.description || result.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium text-slate-500">{label}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleViewAll}
                className="w-full p-4 border-t border-slate-200 text-center text-sm font-bold text-gold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;

