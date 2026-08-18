import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  MoreVertical, 
  Mail, 
  BadgeCheck, 
  UserPlus,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { userService } from '../../services/userService';
import { cn } from '../../utils/cn';

const AdminDashboard = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await userService.getEngineers();
      setEngineers(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Users', value: '1,284', trend: '+15%', icon: Users },
    { label: 'Verified Engineers', value: '156', trend: '+8%', icon: ShieldCheck },
    { label: 'Active Designs', value: '842', trend: '+22%', icon: BarChart3 },
    { label: 'Site Traffic', value: '45.2k', trend: '+35%', icon: Activity }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-2">Admin Console</h1>
          <p className="text-slate-400 font-medium tracking-tight">System management and community health overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white border-2 border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <Search className="w-5 h-5 text-slate-400" />
          </button>
          <button className="btn-gold px-8 py-3 rounded-xl flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Member
          </button>
        </div>
      </div>

      {/* Admin Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.label} className="bg-navy p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-navy to-navy opacity-50"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-500">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-green-500 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" /> {item.trend}
                </div>
              </div>
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">{item.label}</h3>
              <p className="text-4xl font-extrabold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Engineer Verification Queue */}
      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-extrabold text-navy">Engineer Accreditation</h2>
            <p className="text-slate-400 font-medium text-sm">Reviewing status of professional members.</p>
          </div>
          <button className="text-gold font-bold text-sm tracking-tight hover:underline">View Full Registry</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-extrabold text-navy/40 border-b border-slate-100">
                <th className="px-8 py-5">Professional Profile</th>
                <th className="px-8 py-5">Accreditation</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Performance</th>
                <th className="px-8 py-5">System Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {loading ? (
                  [...Array(3)].map((_, i) => (
                   <tr key={`admin-skeleton-${i}`} className="animate-pulse">
                     <td colSpan="5" className="px-8 py-10"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                   </tr>
                 ))
              ) : engineers.map((eng) => (
                <tr key={eng.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl border-2 border-gold/20 p-0.5">
                        <img src={eng.avatar} className="w-full h-full rounded-1.5xl object-cover" />
                      </div>
                      <div>
                        <p className="font-extrabold text-navy group-hover:text-gold transition-colors">{eng.name}</p>
                        <p className="text-slate-400 text-xs font-medium">{eng.specialization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-navy font-bold text-xs uppercase tracking-tight">
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                      Licensed Engineer
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">{eng.location}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-navy font-extrabold">
                      <Star className="w-4 h-4 text-gold fill-gold" /> {eng.rating}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                       <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-gold transition-all"><Mail className="w-4 h-4" /></button>
                       <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-gold transition-all"><ShieldCheck className="w-4 h-4" /></button>
                       <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 transition-all"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function Star({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
  );
}

export default AdminDashboard;
