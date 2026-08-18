import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  ClipboardList,
  Star,
  Users,
  Eye,
  HardHat,
  Bell,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { engineerService } from '../../services/engineerService';
import { cn } from '../../utils/cn';

const DashboardSkeleton = () => (
  <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-8">
    <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-slate-200 rounded-4xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 h-80 bg-slate-200 rounded-4xl" />
      <div className="h-80 bg-slate-200 rounded-4xl" />
    </div>
  </div>
);

const EngineerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await engineerService.getDashboard();
        if (active) setData(res.data);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-4xl p-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">Could not load dashboard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-navy text-white rounded-3xl font-bold hover:bg-navy/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const p = data?.profile || {};
  const w = data?.work || {};
  const pf = data?.portfolio || {};
  const r = data?.reviews || {};

  const firstName = user?.firstName || (p.name?.split(' ')[0]) || 'there';

  const stats = [
    { label: 'Active Projects', value: w.activeProjects ?? 0, icon: HardHat, color: 'bg-navy text-gold' },
    { label: 'Pending Requests', value: w.pendingBookings ?? 0, icon: ClipboardList, color: 'bg-amber-500 text-white' },
    { label: 'Approved Blueprints', value: pf.publishedBlueprints ?? 0, icon: FileText, color: 'bg-emerald-500 text-white' },
    { label: 'Average Rating', value: (r.average ?? 0).toFixed(1), icon: Star, color: 'bg-gold text-navy' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-navy">Engineer Dashboard</h1>
            <p className="text-slate-600 font-medium">Welcome back, {firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold',
            p.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
            p.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-800'
          )}>
            <CheckCircle2 className="w-4 h-4" />
            {p.verificationStatus === 'approved' ? 'Verified' : `Verification ${p.verificationStatus || 'pending'}`}
          </span>
          <Link
            to="/engineer/verification"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy text-white text-sm font-bold hover:bg-navy/90"
          >
            Profile completion {p.completion ?? 0}%
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {data?.alerts?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {data.alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-3xl px-5 py-4">
              <Bell className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm font-semibold text-blue-800">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-4xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-3xl flex items-center justify-center shrink-0', color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-600 font-medium text-sm">{label}</p>
                <p className="text-3xl font-black text-navy">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-navy flex items-center gap-3">
                <Clock className="w-6 h-6 text-gold" />
                Pending Requests
              </h3>
              <Link to="/engineer/requests" className="text-sm text-gold font-bold hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {data?.activity?.recentBookings?.length > 0 || data?.activity?.recentAppointments?.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {data?.activity?.recentBookings?.map((b) => (
                  <div key={b.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{b.userId?.firstName || 'Client'} {b.userId?.lastName || ''}</p>
                        <p className="text-sm text-slate-500">{b.type} • {new Date(b.startAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                      {b.status}
                    </span>
                  </div>
                ))}
                {data?.activity?.recentAppointments?.map((a) => (
                  <div key={a.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{a.clientId?.firstName || 'Client'} {a.clientId?.lastName || ''}</p>
                        <p className="text-sm text-slate-500">{a.type} • {new Date(a.startAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase">
                      appointment
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No pending requests"
                description="When users request a consultation or booking, their requests will appear here."
              />
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-gold" />
              Recent Activity
            </h3>
            {data?.activity?.recentNotifications?.length > 0 ? (
              <div className="space-y-4">
                {data?.activity?.recentNotifications?.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Bell className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-navy text-sm">{n.title}</p>
                      <p className="text-sm text-slate-500">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent activity" description="Your latest activity and notifications will appear here." />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Reviews */}
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-navy text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-gold" /> Reviews
              </h4>
              <Link to="/engineer/reviews" className="text-sm text-gold font-bold hover:underline">View</Link>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-black text-navy">{(r.average ?? 0).toFixed(1)}</span>
              <span className="text-slate-500 font-medium mb-2">/ 5 · {r.total ?? 0} reviews</span>
            </div>
            {r.recent?.length > 0 ? (
              <div className="space-y-3">
                {r.recent.slice(0, 2).map((rev) => (
                  <div key={rev.id} className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn('w-3 h-3', i < rev.rating ? 'text-gold fill-current' : 'text-slate-300')} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-500 pl-1">{rev.rating}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{rev.comment || rev.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No reviews yet.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
            <h4 className="font-bold text-navy mb-6 text-lg">Quick Actions</h4>
            <div className="space-y-4">
              <Link to="/engineer/blueprints/new" className="flex items-center gap-3 p-4 bg-gradient-to-r from-gold to-gold/80 text-navy rounded-3xl font-bold hover:shadow-xl transition-all">
                <FileText className="w-5 h-5" />
                Upload Blueprint
              </Link>
              <Link to="/engineer/availability" className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-3xl font-semibold hover:border-gold hover:text-gold transition-all">
                <Calendar className="w-5 h-5" />
                Set Availability
              </Link>
              <Link to="/engineer/messages" className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-3xl font-semibold hover:bg-blue-100 transition-all">
                <MessageSquare className="w-5 h-5" />
                Check Messages
              </Link>
            </div>
          </div>

          {/* Small stats */}
          <div className="grid grid-cols-2 gap-4">
            <MiniStat icon={Eye} label="Profile Views" value={p.profileViews ?? 0} />
            <MiniStat icon={Users} label="Followers" value={p.followers ?? 0} />
            <MiniStat icon={FileText} label="Portfolio Views" value={pf.views ?? 0} />
            <MiniStat icon={Calendar} label="Upcoming Appts" value={w.upcomingAppointments ?? 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, description }) => (
  <div className="text-center py-10">
    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
    <h4 className="font-bold text-slate-600 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
  </div>
);

const MiniStat = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-4xl border border-slate-200 p-5 shadow-sm">
    <Icon className="w-6 h-6 text-gold mb-2" />
    <p className="text-2xl font-black text-navy">{value}</p>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</p>
  </div>
);

export default EngineerDashboard;
