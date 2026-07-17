import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search } from 'lucide-react';
import { useBookings } from '../../context/BookingContext';
import { useNotifications } from '../../context/NotificationContext';
import BookingHistory from '../../components/BookingHistory';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    if (!user?.id) {
      toast.error('User not logged in');
      return;
    }
    setLoading(true);
    try {
      const data = await bookingService.getByUser(user.id);
      setBookings(data || []);
      toast.success('Bookings refreshed');
    } catch (err) {
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  const { addNotification } = useNotifications();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, rejected: 0 });

  useEffect(() => {
    refetch();
  }, [user]); 

  useEffect(() => {
    const calcStats = () => {
      const counts = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {});
      setStats({
        pending: counts.pending || 0,
        accepted: counts.accepted || 0,
        completed: counts.completed || 0,
        rejected: counts.rejected || 0
      });
    };
    calcStats();
  }, [bookings]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    addNotification(`Showing ${status} bookings`, 'info');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = b.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getUnreadNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount(user.id);
      return count;
    } catch {
      return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-2">My Bookings</h1>
          <p className="text-slate-500 font-medium">Track all your house design consultations and status updates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-2 rounded-2xl border">
            <button className="p-2 text-slate-500 hover:text-navy">
              <Bell className="w-5 h-5" />
              <span className="sr-only">Notifications</span>
            </button>
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="bg-transparent outline-none text-navy placeholder-slate-400 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'bg-amber-500' },
          { label: 'Accepted', value: stats.accepted, color: 'bg-emerald-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-blue-500' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' }
        ].map(({ label, value, color }, i) => (
          <button
            key={label}
            className={cn(
              "group p-6 rounded-3xl border-2 border-slate-200 hover:shadow-xl transition-all hover:scale-[1.02]",
              statusFilter === label.toLowerCase() ? 'border-gold bg-gold/10 ring-2 ring-gold/20' : 'hover:border-slate-300'
            )}
            onClick={() => handleFilterChange(label.toLowerCase())}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white/50 to-slate-50 group-hover:scale-110 transition-transform">
              <span className={cn("text-2xl font-bold text-white", color)}>{value}</span>
            </div>
            <p className="text-navy/80 font-bold text-sm uppercase tracking-wider">{label}</p>
          </button>
        ))}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-3xl p-2 px-4 shadow-sm">
        <button
          className={cn(
            "px-4 py-2 rounded-2xl font-bold transition-all",
            statusFilter === 'all' ? 'bg-gold text-navy shadow-md' : 'text-slate-500 hover:text-navy'
          )}
          onClick={() => handleFilterChange('all')}
        >
          All ({bookings.length})
        </button>
        <Filter className="w-5 h-5 text-slate-400" />
      </div>

      {/* Bookings List */}
      <div className="border border-slate-200 rounded-4xl overflow-hidden shadow-sm">
        <BookingHistory statusFilter={statusFilter === 'all' ? null : statusFilter} />
      </div>

      <div className="text-center pt-8 pb-12 border-t border-slate-200">
        <button 
          className="btn-gold px-12 py-4 text-lg font-bold"
          onClick={refetch}
        >
          Refresh Bookings
        </button>
      </div>
    </div>
  );
};

export default Bookings;

