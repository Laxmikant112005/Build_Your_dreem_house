import React, { useEffect, useState } from 'react';
import { moderationService } from '../../services/moderationService';
import { cn } from '../../utils/cn';

const AdminDesigns = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
  const data = await moderationService.listPending();
    setPending(data);
    setLoading(false);
  };

  const approve = async (id) => {
  await moderationService.approveDesign(id);
    setPending(prev => prev.filter(p => p.id !== id));
  };

  const reject = async (id) => {
    await moderationService.reject(id);
    setPending(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6">Design Moderation</h1>
      {loading ? <div>Loading...</div> : (
        pending.length === 0 ? <div className="text-slate-500">No pending designs</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pending.map(d => (
              <div key={d.id} className="bg-white p-6 rounded-2xl border">
                <img src={d.image} alt={d.title} className="w-full h-40 object-cover rounded mb-4" />
                <h3 className="font-bold text-lg">{d.title}</h3>
                <p className="text-sm text-slate-500">Uploaded by #{d.engineerId}</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => approve(d.id)} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded">Approve</button>
                  <button onClick={() => reject(d.id)} className="bg-red-50 text-red-700 px-4 py-2 rounded">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminDesigns;
