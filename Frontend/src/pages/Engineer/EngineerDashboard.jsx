import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, Users, Calendar, FileText, MessageCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EngineerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    earnings: 0,
    pendingPayments: 0,
    monthlyBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    // Mock stats
    setStats({
      totalProjects: 12,
      earnings: 285000,
      pendingPayments: 45000,
      monthlyBookings: 4
    });

    // Mock recent bookings
    setRecentBookings([
      { id: 1, client: 'Rajesh Kumar', date: '2024-01-15', status: 'pending', amount: 25000 },
      { id: 2, client: 'Priya Sharma', date: '2024-01-12', status: 'accepted', amount: 35000 },
      { id: 3, client: 'Amit Patel', date: '2024-01-08', status: 'completed', amount: 42000 }
    ]);
  }, []);

  const convertToINR = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <LayoutDashboard className="w-10 h-10 text-gold" />
        <div>
          <h1 className="text-4xl font-black text-navy">Engineer Dashboard</h1>
          <p className="text-slate-600 font-medium">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-4xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-navy rounded-3xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Projects</p>
              <p className="text-3xl font-black text-navy">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-4xl p-8 shadow-xl border border-emerald-200 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-3xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-emerald-700 font-medium">Total Earnings</p>
              <p className="text-3xl font-black text-emerald-800">{convertToINR(stats.earnings)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-4xl p-8 shadow-xl border border-amber-200 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-3xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-amber-700 font-medium">Monthly Bookings</p>
              <p className="text-3xl font-black text-amber-800">{stats.monthlyBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-4xl p-8 shadow-xl border border-blue-200 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-3xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-700 font-medium">Pending Payments</p>
              <p className="text-3xl font-black text-blue-800">{convertToINR(stats.pendingPayments)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              Recent Bookings
              <span className="text-sm font-medium text-slate-500">(Last 7 days)</span>
            </h3>
            <div className="divide-y divide-slate-200">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="py-6 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-navy">{booking.client}</p>
                      <p className="text-sm text-slate-500">{booking.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-600">{convertToINR(booking.amount)}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {recentBookings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8 mb-8">
            <h4 className="font-bold text-navy mb-6 text-lg">Quick Actions</h4>
            <div className="space-y-4">
              <a href="/engineer/upload" className="flex items-center gap-3 p-4 bg-gradient-to-r from-gold to-gold/80 text-navy rounded-3xl font-bold hover:shadow-xl transition-all">
                <PlusCircle className="w-5 h-5" />
                Upload Design
              </a>
              <a href="/engineer/availability" className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-3xl font-semibold hover:border-gold hover:text-gold transition-all">
                <Calendar className="w-5 h-5" />
                Set Availability
              </a>
              <a href="/engineer/messages" className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-3xl font-semibold hover:bg-blue-100 transition-all">
                <MessageCircle className="w-5 h-5" />
                Check Messages
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-4xl p-6 shadow-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-10 h-10 text-purple-600 bg-purple-100 p-2 rounded-2xl" />
              <div>
                <p className="font-bold text-navy text-lg">Growing Fast!</p>
                <p className="text-slate-600 text-sm">Your approval rating: 4.8⭐</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Keep up the great work! 87% of your clients would recommend you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;

