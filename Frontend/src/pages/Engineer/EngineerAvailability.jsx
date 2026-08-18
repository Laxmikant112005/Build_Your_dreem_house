import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { engineerService } from '../../services/engineerService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EngineerAvailability = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const existing = user?.engineerProfile?.availability || [];
    setSlots(existing.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })));
    setLoading(false);
  }, [user]);

  const addSlot = () => {
    setSlots((prev) => [...prev, { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }]);
  };

  const updateSlot = (index, key, value) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  };

  const removeSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const normalized = slots.map((s) => ({
        dayOfWeek: Number(s.dayOfWeek),
        startTime: s.startTime,
        endTime: s.endTime,
      }));
      const res = await engineerService.updateAvailability(normalized);
      const saved = res.data?.engineerProfile?.availability || normalized;
      setSlots(saved.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })));
      toast.success('Availability updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save availability');
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="animate-pulse h-40 bg-slate-200 rounded-4xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <Clock className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Availability</h1>
          <p className="text-slate-600 font-medium">Set your weekly working hours for consultations</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-navy">Weekly Schedule</h3>
          <button onClick={addSlot} className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-3xl text-sm font-bold hover:bg-navy/90">
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-4xl">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="font-bold text-slate-600 mb-1">No availability slots set</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Add your working hours so clients can book consultations with you.
            </p>
            <button onClick={addSlot} className="btn-gold px-6 py-3 rounded-3xl font-bold">
              Add Your First Slot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-3xl">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Day</label>
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSlot(index, 'dayOfWeek', e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                  >
                    {DAYS.map((day, i) => (
                      <option key={i} value={i}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Start</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">End</label>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <button
                  onClick={() => removeSlot(index)}
                  className="mt-4 sm:mt-6 p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                  aria-label="Remove slot"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {slots.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 btn-gold px-8 py-4 text-lg font-bold shadow-xl hover:shadow-gold/20 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? <span>Saving...</span> : <><Save className="w-5 h-5" /> Save Availability</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default EngineerAvailability;
