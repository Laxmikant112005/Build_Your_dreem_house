import React from 'react';
import { Eye, Edit3, Trash2, BadgeCheck, Clock, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

const EngineerCard = ({ engineer, onEdit, onDelete, isAdmin = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'inactive': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-gold">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-slate-100/50 group-hover:ring-gold/50">
            <img 
              src={engineer.avatar} 
              alt={engineer.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-bold text-navy group-hover:text-gold transition-colors">
                {engineer.name}
              </h3>
              <p className="text-slate-600 font-semibold text-lg mt-1">{engineer.specialization}</p>
            </div>
            <span className={cn(
              "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ml-4 mt-1",
              getStatusColor(engineer.status)
            )}>
              {engineer.status}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <span>{engineer.rating}</span>
            </div>
          <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{engineer.experience} yrs</span>
            </div>
            <div className="text-slate-500">
              {engineer.location}
            </div>
            <div className="text-gold font-bold text-lg mt-2">
              {engineer.price ? `₹${engineer.price.toLocaleString('en-IN')}` : '₹50,000+ / consult'}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
            <span>{engineer.email}</span>
            <span className="text-slate-400">•</span>
            <span>{engineer.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 ml-auto">
          {isAdmin ? (
            <>
              <Link 
                to={`/admin/engineers/${engineer.id}`}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-navy transition-all"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => onEdit(engineer)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-navy transition-all"
                title="Edit"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(engineer.id)}
                className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link 
              to={`/user/engineers/${engineer.id}`}
              className="p-4 bg-gold text-navy rounded-2xl font-bold hover:bg-gold/90 shadow-lg transition-all w-full text-center"
              title="View Profile"
            >
              View Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineerCard;
