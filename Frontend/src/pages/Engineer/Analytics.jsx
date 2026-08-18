import React, { useState, useEffect } from 'react';
import {
  BarChart3, Eye, Star, Users, Calendar, FileText,
  TrendingUp, AlertCircle, HardHat, Bookmark, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { engineerService } from '../../services/engineerService';
import { reviewService } from '../../services/reviewService';

const Analytics = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const dash = await engineerService.getDashboard().then((r) => r.data).catch(() => null);
        const reviews = await reviewService.getStats(user.id).then((r) => r.data).catch(() => null);
        setDashboard({ ...(dash || {}), reviewsAgg: reviews || {} });
      } catch (e) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  const d = dashboard || {};

  const cards = [
    { label: 'Profile Views', value: d.profileViews ?? 0, icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: 'Portfolio Views', value: d.portfolio?.views ?? d.portfolioViews ?? 0, icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: 'Followers', value: d.followers ?? 0, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Favorites', value: d.portfolio?.favorites ?? d.favorites ?? 0, icon: Bookmark, color: 'bg-amber-50 text-amber-600' },
    { label: 'Average Rating', value: d.reviews?.average ?? (d.reviewsAgg?.average || 0), icon: Star, color: 'bg-gold/10 text-gold', decimals: 1 },
    { label: 'Total Reviews', value: d.reviews?.total ?? (d.reviewsAgg?.count || 0), icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Projects', value: d.projects?.active ?? d.activeProjects ?? 0, icon: HardHat, color: 'bg-orange-50 text-orange-600' },
    { label: 'Completed Projects', value: d.projects?.completed ?? d.completedProjects ?? 0, icon: TrendingUp, color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <BarChart3 className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Analytics</h1>
          <p className="text-slate-600 font-medium">Track your professional performance</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-4xl border border-slate-200 p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-3xl flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-navy">
              {typeof card.value === 'number' ? (card.decimals ? card.value.toFixed(1) : card.value.toLocaleString()) : card.value}
            </p>
            <p className="text-slate-500 uppercase text-xs font-bold tracking-wide mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Bookings / requests breakdown */}
      <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-gold" /> Requests & Bookings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MiniStat label="Pending Requests" value={d.requests?.pending ?? d.pendingRequests ?? 0} color="text-amber-600" />
          <MiniStat label="Accepted" value={d.requests?.accepted ?? d.acceptedRequests ?? 0} color="text-emerald-600" />
          <MiniStat label="Rejected" value={d.requests?.rejected ?? d.rejectedRequests ?? 0} color="text-red-600" />
          <MiniStat label="Completed" value={d.bookings?.completed ?? d.completedBookings ?? 0} color="text-blue-600" />
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-gold" /> Portfolio Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MiniStat label="Published Blueprints" value={d.portfolio?.published ?? d.publishedBlueprints ?? 0} color="text-emerald-600" />
          <MiniStat label="Drafts" value={d.portfolio?.drafts ?? d.draftBlueprints ?? 0} color="text-slate-600" />
          <MiniStat label="Total Blueprints" value={d.portfolio?.total ?? d.totalBlueprints ?? 0} color="text-navy" />
          <MiniStat label="Portfolio Saves" value={d.portfolio?.saves ?? d.portfolioSaves ?? 0} color="text-purple-600" />
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color }) => (
  <div className="text-center p-4 bg-slate-50 rounded-3xl">
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{label}</p>
  </div>
);

export default Analytics;
