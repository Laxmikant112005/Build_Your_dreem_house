import React, { useState, useEffect } from 'react';
import { ClipboardList, User, Calendar, Check, X, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bookingService } from '../../services/bookingService';
import { cn } from '../../utils/cn';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-indigo-100 text-indigo-700',
};

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getByEngineer({ limit: 50 });
      const list = res?.data || res?.bookings || [];
      setBookings(list);
    } catch (e) {
      setError('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (e) {
      toast.error('Failed to update booking');
    }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => (b.status || '').toLowerCase() === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <ClipboardList className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Booking Requests</h1>
          <p className="text-slate-600 font-medium">Review and manage client booking requests</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors',
              filter === f ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-gold'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No booking requests yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            When users request a consultation, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((booking) => (
            <div key={booking.id || booking._id} className="bg-white rounded-4xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-navy">
                      {booking.userId?.firstName || 'Client'} {booking.userId?.lastName || ''}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(booking.startAt).toLocaleDateString()}</span>
                      <span>{booking.type}</span>
                    </div>
                  </div>
                </div>
                <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase self-start', STATUS_STYLES[(booking.status || '').toLowerCase()] || 'bg-slate-100 text-slate-600')}>
                  {booking.status}
                </span>
              </div>

              {booking.notes && <p className="text-sm text-slate-600 mt-4 bg-slate-50 rounded-2xl p-3">{booking.notes}</p>}

              {['pending', 'confirmed'].includes((booking.status || '').toLowerCase()) && (
                <div className="flex gap-3 mt-5">
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(booking.id, 'confirmed')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-3xl font-bold hover:bg-emerald-600">
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleStatus(booking.id, 'rejected')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-3xl font-bold hover:bg-red-100">
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button onClick={() => handleStatus(booking.id, 'completed')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-3xl font-bold hover:bg-navy/90">
                      <Clock className="w-4 h-4" /> Mark Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
