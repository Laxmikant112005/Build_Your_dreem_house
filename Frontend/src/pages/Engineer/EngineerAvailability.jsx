import React, { useState } from 'react';
import { Calendar, Check, X, Clock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const EngineerAvailability = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState({
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: []
  });
  const [saving, setSaving] = useState(false);

  const days = [
    { name: 'Monday', short: 'mon' },
    { name: 'Tuesday', short: 'tue' },
    { name: 'Wednesday', short: 'wed' },
    { name: 'Thursday', short: 'thu' },
    { name: 'Friday', short: 'fri' },
    { name: 'Saturday', short: 'sat' },
    { name: 'Sunday', short: 'sun' }
  ];

  const addSlot = (day, start, end) => {
    if (!start || !end) return;
    setAvailability(prev => ({ ...prev, [day]: [...prev[day], { start, end }] }));
  };

  const removeSlot = (day, idx) => {
    setAvailability(prev => ({ ...prev, [day]: prev[day].filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Availability updated!');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Calendar className="w-12 h-12 text-gold" />
        <div>
          <h1 className="text-4xl font-black text-navy">Availability Settings</h1>
          <p className="text-slate-600 font-medium">Set your weekly working hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Availability Toggle */}
        <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
          <h3 className="text-2xl font-bold text-navy mb-8">Weekly Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {days.map((day) => (
              <div key={day.short} className="bg-white p-4 rounded-2xl border">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-navy">{day.name}</div>
                  <div className="text-sm text-slate-500">{(availability[day.short] || []).length} slots</div>
                </div>
                <div className="space-y-2">
                  {(availability[day.short] || []).map((slot, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">{slot.start} - {slot.end}</div>
                      <button onClick={() => removeSlot(day.short, i)} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input type="time" id={`start-${day.short}`} className="p-2 border rounded" />
                  <input type="time" id={`end-${day.short}`} className="p-2 border rounded" />
                  <button onClick={() => {
                    const start = document.getElementById(`start-${day.short}`).value;
                    const end = document.getElementById(`end-${day.short}`).value;
                    addSlot(day.short, start, end);
                    document.getElementById(`start-${day.short}`).value = '';
                    document.getElementById(`end-${day.short}`).value = '';
                  }} className="col-span-2 bg-gold text-navy py-2 rounded">Add Slot</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status & Time Slots */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-4xl p-8 shadow-xl border border-blue-200">
            <h4 className="text-xl font-bold text-navy mb-4 flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-600" />
              Current Availability
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border shadow-sm text-center">
                <div className="font-black text-2xl text-emerald-600">{Object.values(availability).filter(Boolean).length}/7</div>
                <div className="text-sm text-slate-600">Days Available</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm text-center">
                <div className="font-black text-2xl text-slate-600">40h</div>
                <div className="text-sm text-slate-600">Weekly Hours</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-navy to-slate-900 text-white py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {saving ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Availability
                </>
              )}
            </button>
            <p className="text-center text-slate-500 text-sm mt-4">
              Changes will be visible to clients immediately
            </p>
          </div>

          {/* Blocked Dates Mock */}
          <div className="bg-orange-50 rounded-4xl p-6 shadow-lg border-2 border-orange-200">
            <h5 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
              Upcoming Booked Dates
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {['Jan 20', 'Jan 25', 'Feb 2'].map((date) => (
                <div key={date} className="bg-orange-100 p-2 rounded-xl text-xs font-medium text-orange-800 text-center border border-orange-200">
                  {date}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerAvailability;

