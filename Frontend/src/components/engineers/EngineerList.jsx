import React from 'react';
import { Search, Filter } from 'lucide-react';
import EngineerCard from './EngineerCard';
import { cn } from '../../utils/cn';

const EngineerList = ({ engineers, onEdit, onDelete, loading, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const filteredEngineers = engineers?.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || engineer.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center p-6 bg-slate-50 rounded-3xl">
        <div className="flex bg-white p-4 rounded-2xl border shadow-sm flex-1 min-w-[300px]">
          <Search className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search engineers by name, specialty or email..."
            className="bg-transparent ml-3 outline-none placeholder-slate-400 text-navy w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white p-4 rounded-2xl border shadow-sm text-sm font-bold min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active ({engineers?.filter(e => e.status === 'active').length || 0})</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-navy">{engineers?.length || 0}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Engineers</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-extrabold text-emerald-600">{engineers?.filter(e => e.status === 'active').length || 0}</div>
          <div className="text-sm font-bold text-emerald-600 uppercase tracking-wide">Active</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-extrabold text-amber-600">{engineers?.filter(e => e.status === 'pending').length || 0}</div>
          <div className="text-sm font-bold text-amber-600 uppercase tracking-wide">Pending Review</div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEngineers.length > 0 ? (
          filteredEngineers.map(engineer => (
            <EngineerCard 
              key={engineer.id}
              engineer={engineer}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-24">
            <Users className="w-24 h-24 text-slate-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-slate-600 mb-4">No engineers found</h3>
            <p className="text-xl text-slate-500 mb-8 max-w-md mx-auto">
              Try adjusting your search or filter settings. No engineers match your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineerList;
