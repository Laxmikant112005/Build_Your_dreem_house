import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Clock as ClockIcon, XCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { engineerService } from '../../services/engineerService';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import ReviewModal from '../../components/ReviewModal';
import { cn } from '../../utils/cn';

const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return { color: 'bg-amber-100 text-amber-800', icon: ClockIcon, label: 'Pending' };
    case 'confirmed':
      return { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Confirmed' };
    case 'completed':
      return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed' };
    case 'cancelled':
      return { color: 'bg-slate-100 text-slate-800', icon: XCircle, label: 'Cancelled' };
    default:
      return { color: 'bg-slate-100 text-slate-800', icon: ClockIcon, label: 'Pending' };
  }
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, loading } = useBookings();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [engineer, setEngineer] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [design, setDesign] = useState(null);
  const [engineerLoading, setEngineerLoading] = useState(true);

  useEffect(() => {
    const foundBooking = bookings.find(b => b.id === parseInt(id));
    if (foundBooking) {
      setBooking(foundBooking);
      const fetchEngineer = async () => {
        try {
          setEngineerLoading(true);
          const eng = await engineerService.getEngineerById(foundBooking.engineerId);
          setEngineer(eng);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to load engineer');
        } finally {
          setEngineerLoading(false);
        }
      };
      fetchEngineer();
    }
  }, [id, bookings]);

  if (loading || !booking || engineerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/user/bookings')}
        className="flex items-center gap-2 mb-12 text-slate-500 hover:text-navy font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Bookings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Booking Info */}
        <div className="bg-white rounded-4xl p-10 border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-2xl font-bold text-sm ${statusConfig.color}`}>
              <statusConfig.icon className="w-4 h-4 inline mr-2" />
              {statusConfig.label}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-navy mb-2">Consultation #{booking.id}</h1>
            <p className="text-2xl font-bold text-slate-600 mb-1">{booking.date}</p>
            <p className="text-lg text-slate-500">Created {new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Engineer */}
          {engineer && (
            <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-xl font-bold text-gold">
                  {engineer.name.charAt(0)}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-navy">{engineer.name}</h3>
                  <p className="text-slate-600">{engineer.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="font-bold text-slate-700">4.8</span>
                    <span className="text-sm text-slate-500 ml-4">{engineer.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-3xl">
              <div className="w-8 h-8 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Request Sent</p>
                <p className="text-sm text-slate-500">{new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {booking.confirmedAt && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-3xl">
                <div className="w-8 h-8 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Confirmed</p>
                  <p className="text-sm text-slate-500">{new Date(booking.confirmedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8 lg:sticky lg:top-32 lg:self-start">
          {/* Actions */}
          <div className="bg-white rounded-4xl p-8 border border-slate-200 shadow-xl">
            <h3 className="text-xl font-bold text-navy mb-6">Actions</h3>
            <div className="space-y-4">
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-3xl transition-all shadow-lg">
                Reschedule
              </button>
              {booking.status === 'completed' && (
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="w-full bg-gold text-navy font-bold py-4 rounded-3xl transition-all shadow-lg hover:shadow-2xl hover:bg-gold/90 flex items-center justify-center gap-2"
                >
                  Leave Review
                </button>
              )}
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2">
                Download Contract
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-4xl p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-slate-400" />
              <h3 className="text-xl font-bold text-navy">Notes</h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl min-h-[120px] border-2 border-dashed border-slate-200 border-dotted">
              {booking.notes || 'No additional notes for this booking.'}
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        booking={booking}
        engineer={engineer}
        onSuccess={() => {
          // Refetch or update state
        }}
      />
    </div>
  );
};

export default BookingDetails;

