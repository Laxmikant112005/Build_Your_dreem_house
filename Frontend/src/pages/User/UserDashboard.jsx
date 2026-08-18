import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, Calendar, Bell, Users, Heart, User, ShoppingBag, 
  MapPin, Grid, Clock, Building2, ChevronRight, MessageSquare, 
  CheckCircle2, AlertCircle, TrendingUp, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../utils/cn';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getDashboard();
        setDashboardData(response.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
        // Fallback to empty state silently
        setDashboardData({
          stats: {
            totalProperties: 0,
            activeProperties: 0,
            totalBookings: 0,
            completedBookings: 0,
            favoritesCount: 0,
            unreadNotifications: 0,
            unreadChats: 0,
          },
          recentBookings: [],
          upcomingAppointments: [],
          recentNotifications: [],
          quickActions: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-bold text-navy">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, recentBookings, upcomingAppointments, recentNotifications, quickActions } = dashboardData || {};

  const statCards = [
    {
      title: 'My Properties',
      value: stats?.totalProperties || 0,
      icon: Building2,
      href: '/user/properties',
      gradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      accent: 'text-emerald-700',
    },
    {
      title: 'Active Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      href: '/user/bookings',
      gradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      accent: 'text-blue-700',
    },
    {
      title: 'Saved Favorites',
      value: stats?.favoritesCount || 0,
      icon: Heart,
      href: '/user/favorites',
      gradient: 'from-pink-50 to-pink-100',
      iconBg: 'bg-pink-500',
      accent: 'text-pink-700',
    },
    {
      title: 'Notifications',
      value: stats?.unreadNotifications || 0,
      icon: Bell,
      href: '/user/notifications',
      gradient: 'from-amber-50 to-amber-100',
      iconBg: 'bg-amber-500',
      accent: 'text-amber-700',
    },
  ];

  const actionCards = [
    {
      title: 'Browse Designs',
      description: 'Discover premium house designs',
      icon: Grid,
      href: '/user/designs',
      color: 'from-violet-50 to-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      title: 'Find Engineers',
      description: 'Connect with top professionals',
      icon: Users,
      href: '/user/engineers',
      color: 'from-cyan-50 to-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Register Property',
      description: 'Add your land for planning',
      icon: MapPin,
      href: '/user/properties/add',
      color: 'from-teal-50 to-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      title: 'My Profile',
      description: 'Manage your account',
      icon: User,
      href: '/user/profile',
      color: 'from-slate-50 to-slate-100',
      iconColor: 'text-slate-600',
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
    };
    return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-8 py-8 px-4 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-navy via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(246,199,55,0.15),transparent)]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="w-6 h-6 text-gold" />
            <span className="text-gold font-bold uppercase text-sm tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Welcome back, <span className="text-gold">{user?.firstName || 'User'}</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Track your dream home journey. Monitor properties, bookings, and stay updated with the latest from your project team.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const hasValue = stat.value > 0;
          return (
            <Link
              key={stat.title}
              to={stat.href}
              className={cn(
                "relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                `bg-gradient-to-br ${stat.gradient}`,
                "border-slate-200/50"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-2xl shadow-lg", stat.iconBg)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={cn(
                  "text-3xl md:text-4xl font-black",
                  stat.accent
                )}>
                  {stat.value}
                </div>
              </div>
              <p className={cn("font-bold text-sm uppercase tracking-wide", stat.accent)}>
                {stat.title}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gold" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className={cn(
                    "group rounded-2xl p-6 border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                    `bg-gradient-to-br ${card.color}`
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                      <Icon className={cn("w-6 h-6", card.iconColor)} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-2">{card.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{card.description}</p>
                  <div className="flex items-center gap-1 text-sm font-bold text-gold group-hover:gap-2 transition-all">
                    Go now <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Recent Bookings */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                <Calendar className="w-6 h-6 text-gold" />
                Recent Bookings
              </h2>
              <Link to="/user/bookings" className="text-sm font-bold text-gold hover:underline">
                View All
              </Link>
            </div>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.slice(0, 3).map((booking) => (
                  <Link
                    key={booking._id}
                    to={`/user/bookings/${booking._id}`}
                    className="block bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-gold/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-navy">
                            {booking.type?.replace('_', ' ') || 'Consultation'}
                          </p>
                          <p className="text-sm text-slate-500">
                            with {booking.engineerId?.firstName} {booking.engineerId?.lastName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDate(booking.startAt)} at {formatTime(booking.startAt)}
                          </p>
                        </div>
                      </div>
                      <span className={cn("px-3 py-1 rounded-xl text-xs font-bold uppercase", getStatusColor(booking.status))}>
                        {booking.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No bookings yet</p>
                <Link to="/user/engineers" className="mt-4 inline-flex items-center gap-2 text-gold font-bold hover:underline">
                  Find an engineer to get started
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Notifications & Activity */}
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-gold" />
              Upcoming
            </h2>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div key={appt._id} className="bg-white rounded-2xl p-5 border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {formatDate(appt.startAt)}
                      </span>
                    </div>
                    <p className="font-bold text-navy mb-1">
                      {appt.type?.replace(/_/g, ' ') || 'Meeting'}
                    </p>
                    <p className="text-sm text-slate-500">
                      with {appt.engineerId?.firstName} {appt.engineerId?.lastName}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatTime(appt.startAt)} - {formatTime(appt.endAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No upcoming appointments</p>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                <Bell className="w-6 h-6 text-gold" />
                Activity
              </h2>
              {stats?.unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stats.unreadNotifications}
                </span>
              )}
            </div>
            {recentNotifications && recentNotifications.length > 0 ? (
              <div className="space-y-2">
                {recentNotifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif._id}
                    className={cn(
                      "bg-white rounded-xl p-4 border transition-all",
                      notif.isRead ? 'border-slate-100' : 'border-gold/30 bg-gold/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notif.isRead ? 'bg-slate-300' : 'bg-gold'
                      )}></div>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-sm",
                          notif.isRead ? 'text-slate-600' : 'text-navy font-bold'
                        )}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No recent activity</p>
              </div>
            )}
            <Link
              to="/user/notifications"
              className="mt-4 block text-center text-sm font-bold text-gold hover:underline"
            >
              View all notifications
            </Link>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-navy to-slate-800 rounded-2xl p-6 text-white">
            <BarChart3 className="w-8 h-8 text-gold mb-4" />
            <h3 className="text-lg font-bold mb-2">Project Summary</h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Properties</span>
                <span className="font-bold">{stats?.totalProperties || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Bookings</span>
                <span className="font-bold">{stats?.totalBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Favorites Saved</span>
                <span className="font-bold">{stats?.favoritesCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Unread Messages</span>
                <span className="font-bold">{stats?.unreadChats || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

