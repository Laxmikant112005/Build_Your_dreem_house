import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Building2, Construction, DollarSign, Calendar } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { plotService } from '../../services/plotService';

const CreateProject = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [plots, setPlots] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plotId: '',
    budget: { estimated: '', currency: 'INR' },
    timeline: { startDate: '', estimatedEndDate: '' },
    construction: { totalArea: '', floors: '1', bedrooms: '0', bathrooms: '0' },
  });

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await plotService.getAll();
        setPlots(res.data?.plots || []);
      } catch (err) {
        // Silently fail - plots are optional
      }
    };
    fetchPlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        plotId: formData.plotId || undefined,
        budget: {
          estimated: formData.budget.estimated ? Number(formData.budget.estimated) : undefined,
        },
        timeline: {
          startDate: formData.timeline.startDate || undefined,
          estimatedEndDate: formData.timeline.estimatedEndDate || undefined,
        },
        construction: {
          totalArea: formData.construction.totalArea ? Number(formData.construction.totalArea) : undefined,
          floors: Number(formData.construction.floors) || 1,
          bedrooms: Number(formData.construction.bedrooms) || 0,
          bathrooms: Number(formData.construction.bathrooms) || 0,
        },
      };

      const response = await projectService.create(payload);
      toast.success('Project created successfully!');
      navigate(`/user/projects/${response.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-navy transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-navy mb-2">New Project</h1>
        <p className="text-slate-500">Create a new construction project workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold" />
            Project Information
          </h2>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder="e.g., My Dream Home Construction"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all resize-vertical"
              placeholder="Brief description of your project..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Linked Property (Optional)</label>
            <select
              value={formData.plotId}
              onChange={(e) => updateField('plotId', e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
            >
              <option value="">Select a property...</option>
              {plots.map((plot) => (
                <option key={plot._id} value={plot._id}>
                  {plot.name} {plot.address?.city ? `- ${plot.address.city}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold" />
            Budget & Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.budget.estimated}
                onChange={(e) => updateNested('budget', 'estimated', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="e.g., 5000000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.timeline.startDate}
                onChange={(e) => updateNested('timeline', 'startDate', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Estimated End Date</label>
              <input
                type="date"
                value={formData.timeline.estimatedEndDate}
                onChange={(e) => updateNested('timeline', 'estimatedEndDate', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Construction Details */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Construction className="w-5 h-5 text-gold" />
            Construction Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Total Area (sq.ft)</label>
              <input
                type="number"
                min="0"
                value={formData.construction.totalArea}
                onChange={(e) => updateNested('construction', 'totalArea', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Floors</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.construction.floors}
                onChange={(e) => updateNested('construction', 'floors', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bedrooms</label>
              <input
                type="number"
                min="0"
                value={formData.construction.bedrooms}
                onChange={(e) => updateNested('construction', 'bedrooms', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bathrooms</label>
              <input
                type="number"
                min="0"
                value={formData.construction.bathrooms}
                onChange={(e) => updateNested('construction', 'bathrooms', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name}
            className="flex-1 bg-gold hover:bg-gold/90 text-navy font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;

