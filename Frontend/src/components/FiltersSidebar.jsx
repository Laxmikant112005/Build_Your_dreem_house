import React from 'react';
import { Filter, ChevronDown, Layers, BedDouble, UtensilsCrossed, Car, DollarSign, Compass, Palette } from 'lucide-react';
import { cn } from '../utils/cn';

const FiltersSidebar = ({ filters, setFilters }) => {
const categories = [
    { id: 'floors', label: 'Floors', icon: Layers, options: [1, 2, 3, 4] },
    { id: 'bedrooms', label: 'Bedrooms', icon: BedDouble, options: [1, 2, 3, 4, 5] },
    { id: 'bhk', label: 'BHK', icon: BedDouble, options: ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'] },
    { id: 'kitchen', label: 'Kitchens', icon: UtensilsCrossed, options: [1, 2] },
    { id: 'parking', label: 'Parking', icon: Car, options: [0, 1, 2, 3] },
  ];

  const orientations = ['North', 'South', 'East', 'West', 'All'];
  const styles = ['Modern', 'Contemporary', 'Traditional', 'Minimalist', 'Villa', 'Apartment'];

  const [budgetMin, setBudgetMin] = React.useState(0);
  const [budgetMax, setBudgetMax] = React.useState(5000000);

  const handleBudgetChange = (min, max) => {
    setFilters({ ...filters, minCost: min, maxCost: max });
  };

  return (
    <div className="w-72 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-28 h-fit hidden xl:block">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
          <Filter className="w-5 h-5 text-gold" /> Filters
        </h3>
        <button 
          onClick={() => setFilters({})} 
          className="text-xs font-bold text-gold hover:text-navy transition-colors uppercase tracking-widest"
        >
          Reset
        </button>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2 text-navy/60 font-bold text-xs uppercase tracking-wider">
              <cat.icon className="w-4 h-4" /> {cat.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilters({ ...filters, [cat.id]: opt })}
                  className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all shadow-sm",
                    filters[cat.id] === opt 
                      ? "bg-navy border-navy text-white shadow-xl scale-110" 
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:border-gold hover:text-gold"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* New Orientation Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-navy/60 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Orientation
          </div>
          <div className="flex flex-wrap gap-2">
            {orientations.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilters({ ...filters, orientation: opt })}
                className={cn(
                  "px-4 py-2 rounded-xl border font-bold text-sm transition-all shadow-sm",
                  filters.orientation === opt 
                    ? "bg-navy border-navy text-white shadow-xl" 
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:border-gold hover:text-gold"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* New Style Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-navy/60 font-bold text-xs uppercase tracking-wider">
            <Palette className="w-4 h-4" /> Style
          </div>
          <div className="flex flex-wrap gap-2">
            {styles.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilters({ ...filters, houseStyle: opt })}
                className={cn(
                  "px-4 py-2 rounded-xl border font-bold text-sm transition-all shadow-sm",
                  filters.houseStyle === opt 
                    ? "bg-navy border-navy text-white shadow-xl" 
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:border-gold hover:text-gold"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-navy/60 font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4" /> Budget Range (₹)
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-center text-sm text-slate-500">
                <span>₹{budgetMin.toLocaleString()}</span>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  value={budgetMin}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setBudgetMin(val);
                    if (val > budgetMax) setBudgetMax(val);
                  }}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span>₹{budgetMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                value={budgetMax}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setBudgetMax(val);
                  if (val < budgetMin) setBudgetMin(val);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold"
              />
              <button
                onClick={() => handleBudgetChange(budgetMin, budgetMax)}
                className="w-full bg-navy text-white py-3 rounded-2xl font-bold hover:bg-navy/90 transition-all"
              >
                Apply Budget Filter
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
