import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Bell, Users, Heart, User, ShoppingBag } from 'lucide-react';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const UserDashboard = () => {
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();

  const stats = [
    {
      title: 'Saved Designs',
      value: '12',
      icon: Heart,
      href: '/user/favorites',
      color: 'from-pink-50 to-pink-100',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-500'
    },
    {
      title: 'Bookings',
      value: bookings.length.toString(),
      icon: Calendar,
      href: '/user/bookings',
      color: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500'
    },
    {
      title: 'Engineers Contacted',
      value: '3',
      icon: Users,
      href: '/user/engineers',
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500'
    }
  ];

  const navCards = [
    {
      title: 'Browse Designs',
      description: 'Discover amazing home designs',
      icon: ShoppingBag,
      href: '/user/designs'
    },
    {
      title: 'My Bookings',
      description: 'Track active projects',
      icon: Calendar,
      href: '/user/bookings'
    },
    {
      title: 'Find Engineers',
      description: 'Connect with experts',
      icon: Users,
      href: '/user/engineers'
    },
    {
      title: 'Profile',
      description: 'Manage account',
      icon: User,
      href: '/user/profile'
    }
  ];

  return (
    <div className="space-y-12 py-12 px-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-4xl p-16 shadow-2xl">
        <div className="bg-navy text-white px-8 py-4 rounded-3xl inline-flex items-center gap-3 font-bold text-2xl">
          <LayoutDashboard className="w-8 h-8" />
          Welcome back, {user?.name?.split(' ')[0]}!
        </div>
        <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-navy via-slate-800 to-gold bg-clip-text text-transparent">
          Your Dream Home Journey
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Track your progress, discover new designs, and connect with top engineers to build the home you've always wanted.
        </p>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-3xl font-bold text-navy mb-10 text-center">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.href} className="group">
                <div className={`p-10 rounded-4xl border border-slate-200 hover:shadow-2xl hover:border-${stat.textColor.split('-')[1]}-400 transition-all hover:-translate-y-2 bg-gradient-to-br ${stat.color}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-3xl bg-white/20 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 text-white`} />
                    </div>
                    <div className={`w-3 h-3 ${stat.bgColor} rounded-full group-hover:scale-110 transition-transform animate-pulse opacity-75 group-hover:opacity-100`} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                    <p className="text-white/90 font-bold uppercase tracking-wide text-sm">{stat.title}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-3xl font-bold text-navy mb-10 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.href} className="group">
                <div className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-4xl p-10 h-full hover:shadow-2xl hover:border-gold transition-all hover:-translate-y-3 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl group-hover:scale-110 transition-all shadow-lg">
                      <Icon className="w-8 h-8 text-navy" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-4 group-hover:text-gold transition-colors">{card.title}</h3>
                  <p className="text-slate-600 font-medium mb-6">{card.description}</p>
                  <div className="flex items-center gap-2 text-gold font-bold uppercase tracking-wider text-sm pt-4 border-t border-slate-200">
                    Go to {card.title.toLowerCase()}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-50 rounded-4xl p-12 text-center border border-slate-200">
        <div className="max-w-2xl mx-auto">
          <Bell className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-700 mb-3">Stay Updated</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Check your notifications for updates from engineers and booking status changes. 
            We'll notify you when your dream home project moves forward.
          </p>
          <Link to="/user/notifications" className="btn-gold px-12 py-4 text-lg font-bold inline-flex items-center gap-2">
            View Notifications
            <Bell className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
