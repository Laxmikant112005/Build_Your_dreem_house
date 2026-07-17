import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare, 
  Phone,
  Bell,
  Search
} from 'lucide-react';
import { useBookings } from '../../context/BookingContext';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const BookingRequests = () => {
  const { user } = useAuth();
  const { updateBookingStatus, refetch } = useBookings();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await bookingService.getByEngineer(user.id);
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, [user.id]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      // refresh bookings to reflect change
      refetch();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-50 text-green-600 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filter === 'all' || r.status === filter;
    const matchesSearch = r.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-6 md:flex md:justify-between md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-2">Booking Requests</h1>
          <p className="text-slate-400 font-medium tracking-tight">Review and manage your incoming consultation invitations.</p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-slate-100 p-3 rounded-2xl border">
            <Search className="w-5 h-5 text-slate-400 mt-0.5" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="bg-transparent ml-3 outline-none text-navy placeholder-slate-400 w-52"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-100 p-3 rounded-2xl border text-sm font-bold text-navy focus:ring-gold"
          >
            <option value="all">All ({requests.length})</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
          
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 font-bold text-emerald-800 text-sm shadow-sm">
            <Bell className="w-5 h-5" /> 
            {requests.filter(r => r.status === 'pending').length} Pending
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-gold transition-all duration-500">
              {/* User Avatar */}
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 flex-shrink-0 group-hover:bg-gold/5 transition-colors">
                <img src={`https://i.pravatar.cc/150?u=${request.userId}`} className="w-full h-full rounded-2.5xl object-cover" />
              </div>

              {/* Info Column */}
              <div className="flex-grow space-y-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h3 className="text-xl font-extrabold text-navy">Premium Consultation Request</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border",
                    getStatusStyle(request.status)
                  )}>
                    {request.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-slate-400 font-bold text-xs uppercase tracking-tight">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gold" /> <span>Request by User #{request.userId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold" /> <span>{request.date} • {request.time}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 text-sm font-medium italic border border-slate-100">
                  "{request.details}"
                </div>
              </div>

              {/* Action Column */}
              {request.status === 'pending' ? (
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button 
                    onClick={() => handleStatusUpdate(request.id, 'accepted')}
                    className="w-full bg-navy text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gold" /> Accept Request
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                    className="w-full bg-white border-2 border-slate-100 text-slate-400 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                  >
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                </div>
              ) : (
                <div className="min-w-[200px] flex flex-col items-center gap-3">
                  <button className="w-full btn-outline border-slate-100 text-navy py-3 px-6 hover:bg-slate-50 flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Send Message
                  </button>
                  <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Marked {request.status}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4 col-span-full">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-navy">No Matching Requests</h3>
            <p className="text-slate-400 max-w-sm">
              {`No ${filter} requests found${searchTerm ? ' for "' + searchTerm + '"' : ''}. Try adjusting your filters.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRequests;

