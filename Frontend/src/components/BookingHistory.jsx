import React from 'react';
import { Clock, CheckCircle, XCircle, Calendar, MapPin, User } from 'lucide-react';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle }
};

const BookingHistory = ({ className = '', statusFilter = null, limit = 10 }) => {
  const { bookings, loading } = useBookings();
  const { user } = useAuth();

  const filteredBookings = bookings
    .filter(b => statusFilter ? b.status === statusFilter : true)
    .slice(0, limit);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={`skeleton-${i}`} className="p-6 bg-white rounded-3xl border border-slate-200 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-navy mb-2">No Bookings Yet</h3>
          <p className="text-slate-500 mb-6">Your booking history will appear here.</p>
          <Link to="/designs" className="btn-gold px-8 py-3">Browse Designs</Link>
        </div>
      ) : (
        filteredBookings.map((booking) => {
          const statusConfig = STATUS_CONFIG[booking.status];
          const StatusIcon = statusConfig.icon;
          
          return (
            <div key={booking.id} className="group bg-white border border-slate-200 hover:border-gold/50 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <StatusIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1",
                      statusConfig.color
                    )}>
                      {statusConfig.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-navy text-lg leading-tight truncate">{booking.details}</h4>
                  <p className="text-sm text-slate-500 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {booking.date} at {booking.time}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {user.role === 'engineer' && (
                    <select 
                      className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-100 transition-colors"
                      defaultValue={booking.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accept</option>
                      <option value="rejected">Reject</option>
                      <option value="completed">Complete</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>User ID: {booking.userId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Design #{booking.designId}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default BookingHistory;

