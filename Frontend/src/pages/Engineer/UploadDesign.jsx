import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  DollarSign, 
  MapPin, 
  Plus, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { designService } from '../../services/designService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const UploadDesign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    bedrooms: 3,
    floors: 1,
    kitchen: 1,
    parking: 1,
    costEstimation: '',
    requiredMaterials: '',
    timeToComplete: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.design) {
      const d = location.state.design;
      setFormData({
        ...formData,
        title: d.title || formData.title,
        description: d.description || formData.description,
        budget: d.budget || formData.budget,
        location: d.location || formData.location,
        bedrooms: d.bedrooms || formData.bedrooms,
        floors: d.floors || formData.floors,
        kitchen: d.kitchen || formData.kitchen,
        parking: d.parking || formData.parking,
        costEstimation: d.costEstimation || formData.costEstimation,
        requiredMaterials: d.requiredMaterials || formData.requiredMaterials,
        timeToComplete: d.timeToComplete || formData.timeToComplete,
        tags: d.tags || formData.tags
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await designService.create({
        ...formData,
        engineerId: user.id,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" // Mock image
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        <h2 className="text-4xl font-extrabold text-navy">Design Published!</h2>
        <p className="text-slate-500 max-w-sm">Your masterpiece is now visible to thousands of potential homeowners.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-gold px-10">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-2">Publish New Design</h1>
          <p className="text-slate-400 font-medium">Upload your architectural blueprints and render for our global community.</p>
        </div>
        <div className="bg-gold/10 px-4 py-2 rounded-xl flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest border border-gold/20">
          <Info className="w-4 h-4" /> Drafting Phase
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Details */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-navy flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" /> Basic Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Ultra Modern Eco-Villa" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  placeholder="Share the inspiration and technical highlights..." 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-navy min-h-[120px] focus:ring-2 focus:ring-gold/20 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cost Estimation (₹)</label>
                <input 
                  type="text" 
                  placeholder="e.g., ₹12.5 Lakhs - ₹18 Lakhs" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                  value={formData.costEstimation}
                  onChange={(e) => setFormData({...formData, costEstimation: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Required Materials</label>
                <input 
                  type="text" 
                  placeholder="e.g., Steel, Cement, Glass" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                  value={formData.requiredMaterials}
                  onChange={(e) => setFormData({...formData, requiredMaterials: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Time to Complete</label>
                <input 
                  type="text" 
                  placeholder="e.g., 8-12 weeks" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                  value={formData.timeToComplete}
                  onChange={(e) => setFormData({...formData, timeToComplete: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-navy flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" /> Specifications
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { id: 'bedrooms', label: 'Bedrooms' },
                { id: 'floors', label: 'Floors' },
                { id: 'kitchen', label: 'Kitchen' },
                { id: 'parking', label: 'Parking' }
              ].map(spec => (
                <div key={spec.id} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{spec.label}</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                    value={formData[spec.id]}
                    onChange={(e) => setFormData({...formData, [spec.id]: parseInt(e.target.value)})}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Media & Pricing */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-navy flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold" /> Visual Assets
            </h3>
            <div className="border-4 border-dashed border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-gold/30 transition-colors group cursor-pointer">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-gold" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Drag & drop your main render</p>
                <p className="text-xs text-slate-400 mt-1">High resolution (min 1920x1080) recommended.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-navy flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold" /> Pricing & Location
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Proposed Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="e.g., 500,000" 
                    className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Location Style</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="e.g., Coastal, Mountainous" 
                    className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 rounded-2xl font-bold text-navy focus:ring-2 focus:ring-gold/20 outline-none"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-gold py-5 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 shadow-2xl hover:shadow-gold/20 disabled:opacity-50"
            >
              {loading ? <div className="w-7 h-7 border-4 border-navy border-t-transparent rounded-full animate-spin"></div> : (
                <>
                  Ready to Publish <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadDesign;
