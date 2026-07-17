import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';

const AdminProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setItems(await productService.list()); setLoading(false); })(); }, []);

  const remove = async (id) => {
    await productService.remove(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6">Product Management</h1>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-sm text-slate-600">Vendor: {p.vendor} • Stock: {p.stock}</p>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded">Edit</button>
                <button onClick={() => remove(p.id)} className="px-4 py-2 bg-red-50 text-red-700 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
