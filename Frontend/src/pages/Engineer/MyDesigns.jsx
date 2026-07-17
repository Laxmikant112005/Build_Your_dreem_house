import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { designService } from '../../services/designService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const MyDesigns = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await designService.getByEngineer(user.id);
        setDesigns(res || []);
      } catch (err) {
        console.error(err);
        setDesigns([]); // no fallback, empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const handleEdit = (design) => {
    // navigate to upload page with state for editing
    navigate('/engineer/upload', { state: { design } });
  };

  const handleDelete = (id) => {
    setDesigns(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-navy">My Designs</h1>
        <button onClick={() => navigate('/engineer/upload')} className="btn-gold py-2 px-4 rounded">Upload New</button>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-slate-500">You haven't uploaded any designs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {designs.map((d) => (
            <div key={d.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex gap-4">
                <img src={d.image} className="w-36 h-24 object-cover rounded" alt={d.title} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-navy">{d.title}</h3>
                  <p className="text-sm text-slate-500">{d.description}</p>
                  <div className="text-sm text-slate-600 mt-2">Cost: <span className="font-bold">{d.costEstimation || d.price || 'N/A'}</span></div>
                  <div className="text-sm text-slate-600">Materials: {d.requiredMaterials || 'N/A'}</div>
                  <div className="text-sm text-slate-600">Time: {d.timeToComplete || 'N/A'}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => handleEdit(d)} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded">Edit</button>
                <button onClick={() => handleDelete(d.id)} className="px-4 py-2 bg-red-50 text-red-700 rounded">Delete</button>
                <button onClick={() => navigate(`/designs/${d.id}`)} className="ml-auto px-4 py-2 bg-slate-50 rounded">View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDesigns;
