import React, { useEffect, useState } from 'react';

const mockFlags = [
  { id: 1, type: 'suspicious_booking', details: 'Multiple bookings same slot', ref: 'Booking #234' },
  { id: 2, type: 'fake_review', details: 'Repeated text across reviews', ref: 'Review #45' }
];

const AdminSecurity = () => {
  const [flags, setFlags] = useState([]);

  useEffect(() => { setFlags(mockFlags); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6">Security & Fraud</h1>
      <div className="space-y-4">
        {flags.map(f => (
          <div key={f.id} className="bg-white p-4 rounded border flex items-center justify-between">
            <div>
              <div className="font-bold text-navy">{f.type}</div>
              <div className="text-sm text-slate-500">{f.details} — {f.ref}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-amber-50 text-amber-700 rounded">Review</button>
              <button className="px-3 py-2 bg-red-50 text-red-700 rounded">Block</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSecurity;
