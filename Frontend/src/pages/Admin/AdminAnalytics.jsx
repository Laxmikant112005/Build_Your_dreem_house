import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { designService } from '../../services/designService';

const AdminAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    (async () => {
      setUsers(await userService.getAll());
      setDesigns(await designService.getAll());
    })();
  }, []);

  const totalUsers = users.length;
  const activeEngineers = users.filter(u => u.role === 'engineer').length;
  const revenue = 0; // stub

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-navy">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border">Total Users<p className="text-2xl font-bold">{totalUsers}</p></div>
        <div className="bg-white p-6 rounded-2xl border">Active Engineers<p className="text-2xl font-bold">{activeEngineers}</p></div>
        <div className="bg-white p-6 rounded-2xl border">Revenue<p className="text-2xl font-bold">₹{revenue}</p></div>
      </div>
      <div className="bg-white p-6 rounded-2xl border">Most popular design: {designs[0]?.title || '—'}</div>
    </div>
  );
};

export default AdminAnalytics;
