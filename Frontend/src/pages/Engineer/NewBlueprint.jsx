import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { blueprintService } from '../../services/blueprintService';

const STYLES = ['modern', 'traditional', 'villa', 'duplex', 'contemporary', 'minimalist', 'colonial', 'mediterranean', 'industrial', 'farmhouse', 'cottage', 'craftsman', 'midcentury', 'fusion'];
const CONSTRUCTION_TYPES = ['RCC', 'Steel', 'Wood', 'Mixed', 'Prefab', 'ShippingContainer'];

const NewBlueprint = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    accessTier: 'free',
    price: 0,
    specs: {
      builtUpArea: '',
      plotAreaRequired: '',
      floors: '',
      bedrooms: '',
      bathrooms: '',
      style: 'modern',
      constructionType: 'RCC',
      estimatedCost: '',
      estimatedDuration: '',
    },
    location: { city: '', state: '' },
    tags: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setSpec = (key, val) => setForm((f) => ({ ...f, specs: { ...f.specs, [key]: val } }));

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    accessTier: form.accessTier,
    price: Number(form.price) || 0,
    specs: {
      builtUpArea: Number(form.specs.builtUpArea) || 0,
      plotAreaRequired: form.specs.plotAreaRequired ? Number(form.specs.plotAreaRequired) : undefined,
      floors: Number(form.specs.floors) || 1,
      bedrooms: Number(form.specs.bedrooms) || 0,
      bathrooms: Number(form.specs.bathrooms) || 0,
      style: form.specs.style,
      constructionType: form.specs.constructionType,
      estimatedCost: form.specs.estimatedCost ? Number(form.specs.estimatedCost) : undefined,
      estimatedDuration: form.specs.estimatedDuration ? Number(form.specs.estimatedDuration) : undefined,
    },
    location: {
      city: form.location.city,
      state: form.location.state,
    },
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
  });

  const handleSubmit = async (status) => {
    if (!form.title || !form.description) {
      setError('Title and description are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let payload = buildPayload();
      let res;
      if (status === 'draft') {
        payload.status = 'draft';
        res = await blueprintService.create(payload);
      } else {
        // Create then submit for approval
        res = await blueprintService.create({ ...payload, status: 'draft' });
        const id = res?.data?.id || res?.data?._id;
        if (id) await blueprintService.submitForApproval(id);
      }
      toast.success(status === 'draft' ? 'Draft saved' : 'Blueprint submitted for approval');
      navigate('/engineer/designs');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save blueprint');
      toast.error('Failed to save blueprint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <FileText className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">New Blueprint</h1>
          <p className="text-slate-600 font-medium">Create a draft or submit for approval</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm space-y-8">
        {/* Basic info */}
        <section>
          <h3 className="text-xl font-bold text-navy mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
            <Field label="Access Tier" value={form.accessTier} onChange={(e) => set('accessTier', e.target.value)} type="select" options={['free', 'premium', 'professional', 'enterprise']} />
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <Field label="Price (₹)" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
            <Field label="Tags (comma-separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          </div>
        </section>

        {/* Specifications */}
        <section>
          <h3 className="text-xl font-bold text-navy mb-4">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Built-up Area (sqft) *" type="number" value={form.specs.builtUpArea} onChange={(e) => setSpec('builtUpArea', e.target.value)} required />
            <Field label="Plot Area Required (sqft)" type="number" value={form.specs.plotAreaRequired} onChange={(e) => setSpec('plotAreaRequired', e.target.value)} />
            <Field label="Floors *" type="number" value={form.specs.floors} onChange={(e) => setSpec('floors', e.target.value)} required />
            <Field label="Bedrooms" type="number" value={form.specs.bedrooms} onChange={(e) => setSpec('bedrooms', e.target.value)} />
            <Field label="Bathrooms" type="number" value={form.specs.bathrooms} onChange={(e) => setSpec('bathrooms', e.target.value)} />
            <Field label="Style" type="select" options={STYLES} value={form.specs.style} onChange={(e) => setSpec('style', e.target.value)} />
            <Field label="Construction Type" type="select" options={CONSTRUCTION_TYPES} value={form.specs.constructionType} onChange={(e) => setSpec('constructionType', e.target.value)} />
            <Field label="Estimated Cost (₹)" type="number" value={form.specs.estimatedCost} onChange={(e) => setSpec('estimatedCost', e.target.value)} />
            <Field label="Estimated Duration (days)" type="number" value={form.specs.estimatedDuration} onChange={(e) => setSpec('estimatedDuration', e.target.value)} />
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-xl font-bold text-navy mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="City" value={form.location.city} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, city: e.target.value } }))} />
            <Field label="State" value={form.location.state} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, state: e.target.value } }))} />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
          <button type="button" onClick={() => handleSubmit('draft')} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-3xl font-bold text-navy hover:border-gold disabled:opacity-50">
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={() => handleSubmit('submit')} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 btn-gold rounded-3xl font-bold disabled:opacity-50">
            <Send className="w-5 h-5" /> {saving ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', required, options }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{label}</label>
    {type === 'select' ? (
      <select value={value} onChange={onChange} className="w-full px-4 py-3 border rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/40">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} required={required} className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40" />
    )}
  </div>
);

export default NewBlueprint;
