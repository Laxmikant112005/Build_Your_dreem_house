import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Star, Camera, Save, Upload, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const EngineerProfileForm = ({ profile, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    bio: '',
    location: '',
    rating: 0,
    avatar: '',
    experienceYears: '',
    licenseDetails: '',
    portfolio: [],
    pricing: '',
    availability: {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        specialization: profile.specialization || '',
        bio: profile.bio || '',
        location: profile.location || '',
        rating: profile.rating || 4.5,
        avatar: profile.avatar || '',
        experienceYears: profile.experienceYears || profile.experience || '',
        licenseDetails: profile.licenseDetails || '',
        portfolio: profile.portfolio || [],
        pricing: profile.pricing || '',
        availability: profile.availability || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
      });
      setAvatarPreview(profile.avatar || '');
    }
  }, [profile, user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required (at least 20 characters)';
    if (formData.bio.length < 20) newErrors.bio = 'Bio must be at least 20 characters';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.licenseDetails.trim()) newErrors.licenseDetails = 'License details required';
    if (formData.experienceYears && isNaN(parseInt(formData.experienceYears))) newErrors.experienceYears = 'Invalid number';
    if (formData.pricing && isNaN(Number(formData.pricing))) newErrors.pricing = 'Pricing must be numeric';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API save
      const updatedProfile = { 
        ...formData, 
        id: user.id,
        role: 'engineer'
      };
      
      // In real app: save to backend + upload avatar
      onSave(updatedProfile);
      
      // Update local user
      localStorage.setItem('dream_house_user', JSON.stringify(updatedProfile));
      
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size / 1024 / 1024 > 2) {
      return; // 2MB limit
    }
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, portfolio: [...prev.portfolio, { name: file.name, type: file.type, data: reader.result }] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addTimeSlot = (day, start, end) => {
    if (!start || !end) return;
    setFormData(prev => ({
      ...prev,
      availability: { ...prev.availability, [day]: [...prev.availability[day], { start, end }] }
    }));
  };

  const removeTimeSlot = (day, idx) => {
    setFormData(prev => ({
      ...prev,
      availability: { ...prev.availability, [day]: prev.availability[day].filter((_, i) => i !== idx) }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-4xl shadow-2xl border border-slate-200 p-10">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-extrabold text-navy">Edit Profile</h2>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all flex items-center gap-2 font-bold text-sm uppercase tracking-wide"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="p-3 px-6 rounded-2xl bg-gradient-to-r from-gold to-gold-light hover:from-gold-light text-navy transition-all font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Avatar */}
        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Profile Photo</label>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-gold transition-all group-hover:scale-105"
                  onClick={() => document.getElementById('avatar-upload').click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full rounded-full object-cover shadow-lg" />
                  ) : (
                    <Camera className="w-12 h-12 text-slate-400 group-hover:text-navy transition-colors" />
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="absolute inset-0 bg-gold/80 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all duration-300">
                  <span className="text-navy font-bold text-sm uppercase tracking-wider px-4 py-2 bg-white rounded-full shadow-lg">Change Photo</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">JPG/PNG up to 2MB. Square images work best.</p>
            </div>
            
            <div className="flex-grow">
              {avatarFile && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  New photo selected ({(avatarFile.size / 1024).toFixed(0)} KB)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Experience, License & Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Experience (years)</label>
            <input
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
              className={cn(
                "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-semibold text-lg placeholder-slate-400",
                errors.experienceYears && "border-red-300 ring-2 ring-red-200 bg-red-50"
              )}
              placeholder="e.g., 8"
            />
            {errors.experienceYears && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.experienceYears}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">License / Certification</label>
            <input
              type="text"
              value={formData.licenseDetails}
              onChange={(e) => setFormData({...formData, licenseDetails: e.target.value})}
              className={cn(
                "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-semibold text-lg placeholder-slate-400",
                errors.licenseDetails && "border-red-300 ring-2 ring-red-200 bg-red-50"
              )}
              placeholder="License #, Issuing body"
            />
            {errors.licenseDetails && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.licenseDetails}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pricing (hourly)</label>
            <div className="relative">
              <input
                type="text"
                value={formData.pricing}
                onChange={(e) => setFormData({...formData, pricing: e.target.value})}
                className={cn(
                  "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-semibold text-lg placeholder-slate-400",
                  errors.pricing && "border-red-300 ring-2 ring-red-200 bg-red-50"
                )}
                placeholder="e.g., 50"
              />
            </div>
            {errors.pricing && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.pricing}</p>}
          </div>
        </div>

        {/* Portfolio Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Portfolio (2D / 3D previews)</label>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="border-4 border-dashed border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <Upload className="w-8 h-8 text-slate-400 mb-3" />
                <p className="text-sm font-bold text-navy">Upload images or preview files</p>
                <p className="text-xs text-slate-400 mt-1">PNG/JPG, PDF, OBJ/GLB (3D). Max 10MB each.</p>
                <input type="file" multiple accept="image/*,application/pdf,model/gltf-binary,model/obj,application/octet-stream" className="mt-4" onChange={handlePortfolioChange} />
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                {formData.portfolio && formData.portfolio.length > 0 ? (
                  formData.portfolio.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-sm text-slate-600">
                      {item.type.startsWith('image/') ? (
                        <img src={item.data} alt={item.name} className="w-full h-28 object-cover rounded" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 italic">No portfolio items uploaded.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Availability - Simple per-day time slots */}
        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Availability (add time slots)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['mon','tue','wed','thu','fri','sat','sun'].map((d) => (
              <div key={d} className="bg-white p-4 rounded-2xl border border-slate-100">
                <div className="font-bold text-sm text-navy mb-2 uppercase">{d}</div>
                <div className="space-y-2">
                  {(formData.availability[d] || []).map((slot, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="text-xs text-slate-600">{slot.start} - {slot.end}</div>
                      <button type="button" onClick={() => removeTimeSlot(d, i)} className="text-red-400 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <input type="time" id={`start-${d}`} className="w-full p-2 border rounded" />
                  <input type="time" id={`end-${d}`} className="w-full p-2 border rounded" />
                  <button type="button" onClick={() => {
                    const start = document.getElementById(`start-${d}`).value;
                    const end = document.getElementById(`end-${d}`).value;
                    addTimeSlot(d, start, end);
                    document.getElementById(`start-${d}`).value = '';
                    document.getElementById(`end-${d}`).value = '';
                  }} className="w-full bg-gold text-navy py-2 rounded">Add Slot</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={cn(
                "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-semibold text-lg placeholder-slate-400",
                errors.name && "border-red-300 ring-2 ring-red-200 bg-red-50"
              )}
              placeholder="John Smith"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Specialization</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              className={cn(
                "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-semibold text-lg placeholder-slate-400",
                errors.specialization && "border-red-300 ring-2 ring-red-200 bg-red-50"
              )}
              placeholder="Modern Architecture"
            />
            {errors.specialization && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.specialization}</p>}
          </div>
        </div>

        {/* Location & Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className={cn(
                "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-semibold text-lg placeholder-slate-400",
                errors.location && "border-red-300 ring-2 ring-red-200 bg-red-50"
              )}
              placeholder="California, USA"
            />
            {errors.location && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.location}</p>}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Bio / About</label>
            <textarea
              rows="5"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className={cn(
                "w-full p-5 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all font-medium text-lg placeholder-slate-400 resize-vertical min-h-[120px]",
                errors.bio && "border-red-300 ring-2 ring-red-200 bg-red-50"
              )}
              placeholder="Share your passion for engineering and what makes your designs unique..."
            />
            {errors.bio && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{errors.bio}</p>}
            <p className="text-xs text-slate-400 mt-2">{formData.bio.length}/500 characters</p>
          </div>
        </div>

        {/* Rating Display (read-only) */}
        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Rating</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={cn(
                    "w-7 h-7",
                    i < formData.rating ? 'text-gold fill-current shadow-md' : 'text-slate-300'
                  )}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-navy ml-4">{formData.rating}</span>
            <span className="text-slate-500 text-sm font-medium ml-2">(Based on feedback)</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EngineerProfileForm;

