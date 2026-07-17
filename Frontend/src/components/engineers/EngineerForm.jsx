import React, { useState, useEffect } from 'react';
import { Save, X, BadgeCheck, Clock, MapPin, Star } from 'lucide-react';
import { cn } from '../../utils/cn';

const EngineerForm = ({ engineer, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    rating: 4.5,
    experience: 0,
    location: '',
    status: 'pending',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (engineer) {
      setFormData(engineer);
    } else {
      // Reset for new engineer
      setFormData({
        name: '',
        specialization: '',
        rating: 4.5,
        experience: 0,
        location: '',
        status: 'pending',
        email: '',
        phone: ''
      });
    }
  }, [engineer]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const ratingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i}
        className={cn(
          'w-6 h-6 transition-colors',
          i < rating ? 'text-gold fill-gold' : 'text-slate-300'
        )}
      />
    ));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-navy to-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy">
                {engineer ? 'Edit Engineer' : 'New Engineer Profile'}
              </h2>
              <p className="text-slate-500 font-medium">
                {engineer ? 'Update professional details' : 'Create new engineer account'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Name & Specialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={cn(
                  "w-full p-4 border rounded-2xl text-lg font-semibold focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all",
                  errors.name ? "border-red-300 ring-red-200" : "border-slate-200"
                )}
                placeholder="Dr. Sarah Johnson"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Specialization *</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className={cn(
                  "w-full p-4 border rounded-2xl text-lg font-semibold focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all",
                  errors.specialization ? "border-red-300 ring-red-200" : "border-slate-200"
                )}
                placeholder="Structural Engineering"
              />
              {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
            </div>
          </div>

          {/* Rating & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4">Rating</label>
              <div className="flex items-center gap-3">
                {ratingStars(formData.rating)}
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy hover:accent-gold"
                />
                <span className="font-mono font-bold text-navy min-w-[30px]">{formData.rating}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Experience (Years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all"
                min="0"
                placeholder="12"
              />
            </div>
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className={cn(
                  "w-full p-4 border rounded-2xl focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all",
                  errors.location ? "border-red-300 ring-red-200" : "border-slate-200"
                )}
                placeholder="New York, NY"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all appearance-none bg-white"
              >
                <option value="pending">Pending Review</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={cn(
                  "w-full p-4 border rounded-2xl focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all",
                  errors.email ? "border-red-300 ring-red-200" : "border-slate-200"
                )}
                placeholder="sarah.johnson@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-navy/10 focus:border-navy transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-navy text-white font-bold py-4 px-8 rounded-3xl hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl flex items-center gap-3 justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {engineer ? 'Update Engineer' : 'Create Engineer'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-4 px-8 rounded-3xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 justify-center"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EngineerForm;
