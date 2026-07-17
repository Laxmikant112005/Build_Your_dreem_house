import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Star } from 'lucide-react';
import FeedbackForm from '../../components/FeedbackForm';
import { feedbackService } from '../../services/feedbackService';
import { engineerService } from '../../services/engineerService';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const Feedback = () => {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [allEngineers, setAllEngineers] = useState([]); 

useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchEngineersForFeedback = async () => {
      if (eligibleBookings.length > 0 && allEngineers.length === 0) {
        try {
          const data = await engineerService.getAllEngineers();
          setAllEngineers(data);
        } catch (err) {
          toast.error('Failed to load engineers');
        }
      }
    };
    fetchEngineersForFeedback();
  }, [eligibleBookings.length]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getByUser(user.id);
      setFeedbacks(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmitted = () => {
    fetchFeedbacks();
    setShowForm(false);
    setSelectedBooking(null);
    setSelectedEngineer(null);
  };

  const eligibleBookings = bookings.filter(b => b.status === 'completed' && !feedbacks.some(f => f.bookingId === b.id));

  const handleSelectBooking = async (booking) => {
    try {
      let engineer = allEngineers.find(e => e.id === booking.engineerId);
      if (!engineer) {
        engineer = await engineerService.getEngineerById(booking.engineerId);
      }
      setSelectedBooking(booking);
      setSelectedEngineer(engineer);
      setShowForm(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load engineer");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-64 bg-slate-100 rounded-3xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-100 rounded-3xl"></div>
            <div className="h-48 bg-slate-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 p-6 lg:p-0">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-4xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <ThumbsUp className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-navy via-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">
          Your Feedback Matters
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Help us improve by rating your experience with engineers. Your feedback shapes better home design services.
        </p>
      </div>

      {/* Recent Feedback */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-navy flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Recent Feedback
          </h2>
          <span className="text-sm text-slate-400 font-medium">
            {feedbacks.length} submitted
          </span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-600 mb-4">No feedback yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Submit feedback after your booking is completed to help other users.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.slice(0, 4).map((feedback) => (
              <div key={feedback.id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < feedback.rating ? 'text-gold fill-current' : 'text-slate-300'
                      )} 
                    />
                  ))}
                  <span className="font-bold text-2xl text-navy ml-auto">{feedback.rating}</span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed mb-6">{feedback.comment}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Booking #{feedback.bookingId}</div>
                  <div>{new Date(feedback.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submit New Feedback */}
      <section>
        <h2 className="text-3xl font-bold text-navy mb-8">Submit New Feedback</h2>
        
        {showForm ? (
          <FeedbackForm
            bookingId={selectedBooking.id}
            engineerId={selectedEngineer.id}
            engineerName={selectedEngineer.name}
            onSuccess={handleFeedbackSubmitted}
          />
        ) : eligibleBookings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-navy mb-4">No completed bookings</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Submit feedback after your booking reaches "Completed" status.
            </p>
            <button className="btn-gold px-12 py-4 text-lg font-bold">View Bookings</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{eligibleBookings.slice(0, 6).map((booking) => {
              const engineer = allEngineers.find(e => e.id === booking.engineerId) || {name: `Engineer ID: ${booking.engineerId}`, avatar: '/public/images/placeholder.jpg'};
              return (
                <div 
                  key={booking.id}
                  className="group cursor-pointer bg-white border-2 border-slate-200 rounded-3xl p-8 hover:border-gold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                  onClick={() => handleSelectBooking(booking)}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={engineer.avatar} 
                        alt={engineer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-navy text-xl mb-1 truncate">{engineer.name}</h4>
                      <p className="text-slate-500 text-sm mb-1">{booking.details}</p>
                      <div className="flex items-center gap-2 text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                        <Check className="w-3 h-3" />
                        Completed
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/0 via-gold/0 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Feedback;

