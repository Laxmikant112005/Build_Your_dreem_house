import React from 'react';
import { Home, MapPin, BedDouble, Layers, Star, Heart } from 'lucide-react';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoriteContext';

const convertToINR = (usd) => `₹${(usd * 82).toLocaleString("en-IN")}`;

const DesignCard = ({ design, className, onToggleFavorite }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!design) return null;

  return (
<Link to={`/designs/${design.id}`} className={cn(
      "group block relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500",
      className
    )}>
      <button 
        className="absolute top-4 right-4 z-20 p-2 bg-white/95 hover:bg-white rounded-xl shadow-lg border border-slate-200 hover:border-gold transition-all opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(design.id);
        }}
        title="Save Design"
      >
        <Heart className={`w-5 h-5 transition-colors ${isFavorite(design.id) ? 'text-red-500 fill-red-500' : 'text-slate-400 hover:text-red-500'}`} />
      </button>
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={design?.image || '/images/placeholder-design.jpg'} 
          alt={design?.title || "House Design"} 
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
          onError={(e) => {
            e.target.src = "/images/placeholder-design.jpg";
            e.target.onerror = null;
          }}
        />
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-xs font-bold text-navy">{design?.rating || "4.9"}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-navy group-hover:text-gold transition-colors line-clamp-1">{design?.title || "Untitled Design"}</h3>
          <span className="text-gold font-bold text-lg whitespace-nowrap">
            {design?.budget ? convertToINR(design.budget) : "Price on request"}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <MapPin className="w-4 h-4 text-gold" />
          <span className="line-clamp-1">{design?.location || "Global"}</span>
        </div>
        
        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <BedDouble className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{design?.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Layers className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{design?.floors || 0} Floors</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DesignCard;

