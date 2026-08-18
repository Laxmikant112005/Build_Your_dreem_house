import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoriteContext';
import DesignCard from '../../components/DesignCard';
import { cn } from '../../utils/cn';

const Favorites = () => {
  const { savedDesigns, toggleFavorite, savedCount } = useFavorites();

  if (savedCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-4xl">
        <div className="w-24 h-24 bg-slate-200 rounded-3xl flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-navy mb-4">No Saved Designs</h2>
        <p className="text-xl text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          Save your favorite designs while browsing to keep track of what you love.
        </p>
        <Link 
          to="/designs"
          className="bg-navy text-white px-12 py-4 rounded-3xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3"
        >
          Start Browsing Designs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black text-navy mb-2">Saved Designs</h1>
          <p className="text-xl text-slate-600">{savedCount} designs saved</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Manage List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {savedDesigns.map((design) => (
          <div key={design.id} className="group relative">
            <DesignCard design={design} />
            <button 
              onClick={() => toggleFavorite(design.id)}
              className="absolute top-4 right-4 z-30 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/20"
              title="Remove from favorites"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;

