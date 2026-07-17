import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Award, Calendar, Users, ArrowLeft, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { engineerService } from '../../services/engineerService';
import { designService } from '../../services/designService';
import { useBookings } from '../../context/BookingContext';
import { useNotifications } from '../../context/NotificationContext';
import BookingModal from '../../components/BookingModal';
import DesignCard from '../../components/DesignCard';

const convertToINR = (usd) => `₹${(usd * 82).toLocaleString('en-IN')}`;

const EngineerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createBooking } = useBookings();
  const { addNotification } = useNotifications();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Mock data
  const mockAvailability = ['Mon-Fri 9AM-6PM', 'Sat 10AM-4PM', 'Emergency available'];
  const mockReviews = [
    { id: 1, user: 'Rajesh K.', rating: 5, comment: 'Exceptional structural analysis!', date: '2024-01-15' },
    { id: 2, user: 'Priya S.', rating: 4, comment: 'Great communication, quick response.', date: '2024-01-10' },
    { id: 3, user: 'Amit M.', rating: 5, comment: 'Delivered blueprints ahead of schedule.', date: '2024-01-05' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eng = await engineerService.getEngineerById(id);
        if (eng) {
          setEngineer({ ...eng, price: 50000 }); // Mock price per consultation
          // Filter portfolio designs
          const portRes = await designService.getByEngineer(eng.id);
          setPortfolio(portRes.data || portRes || []);
          setAvailability(mockAvailability);
          setReviews(mockReviews);
        }
      } catch (err) {
        addNotification('Failed to load engineer profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-bold text-navy mb-4">Engineer Not Found</h2>
        <Link to="/user/engineers" className="btn-gold px-8 py-3 rounded-2xl font-bold">Browse Engineers</Link>
      </div>
    );
  }

  const avgRating = 4.8; // Mock

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-12 text-slate-500 hover:text-navy font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>All Engineers</span>
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-navy to-slate-900 text-white rounded-4xl p-12 mb-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/placeholder-design.jpg')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
            <div className="w-32 h-32 rounded-3xl border-4 border-white/30 shadow-2xl overflow-hidden mb-6">
              <img src={engineer.avatar} alt={engineer.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-gold text-gold' : 'text-white/50'}`} />
                  ))}
                </div>
                <span className="font-bold text-xl">{avgRating}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-2">{engineer.name}</h1>
              <p className="text-gold/90 font-bold text-xl opacity-90">{engineer.specialization}</p>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="text-3xl font-black text-gold mb-2">{engineer.experience}</div>
              <div className="text-slate-300 uppercase text-sm tracking-wide">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gold mb-2">
                {convertToINR(engineer.price || 50000)}
              </div>
              <div className="text-slate-300 uppercase text-sm tracking-wide">Consultation Fee</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-2">{engineer.location}</div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/20">
          <button
            onClick={() => setIsBookingOpen(true)}
            className="flex-1 bg-gold text-navy py-4 px-8 rounded-3xl font-black text-lg shadow-2xl hover:shadow-gold/50 transition-all flex items-center justify-center gap-3"
          >
            <Calendar className="w-6 h-6" />
            Book Now
          </button>
          <button className="flex-1 border-2 border-white/30 py-4 px-8 rounded-3xl font-bold text-white hover:bg-white hover:text-navy transition-all flex items-center justify-center gap-3">
            <MessageCircle className="w-6 h-6" />
            Send Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Bio & Stats */}
        <div className="lg:col-span-2 space-y-12">
          {/* Bio */}
          <div className="bg-white rounded-4xl p-10 border border-slate-200 shadow-xl">
            <h2 className="text-3xl font-bold text-navy mb-6 flex items-center gap-3">
              <Award className="w-8 h-8 text-gold" />
              About {engineer.name.split(' ')[0]}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {engineer.bio || `${engineer.name} is a highly experienced ${engineer.specialization.toLowerCase()} with a passion for innovative house designs. With ${engineer.experience} years in the field, they have successfully completed numerous residential projects across various styles and budgets.`}
            </p>
          </div>

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className="bg-white rounded-4xl p-10 border border-slate-200 shadow-xl">
              <h2 className="text-3xl font-bold text-navy mb-8">Featured Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.slice(0, 6).map((design) => (
                  <Link key={design.id} to={`/designs/${design.id}`} className="group">
                    <div className="overflow-hidden rounded-3xl border-2 border-slate-200 group-hover:border-gold transition-all aspect-[4/3] bg-slate-50">
                      <img 
                        src={design.image} 
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                        <h3 className="font-bold text-white text-xl mb-2">{design.title}</h3>
                        <div className="flex items-center gap-2 text-gold/90 text-sm">
{convertToINR(design.budget)}
                          <span>{design.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {portfolio.length > 6 && (
                <div className="text-center mt-8">
                  <Link to="/designs" className="text-gold font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                    View All Designs <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Availability & Reviews */}
        <div className="space-y-8">
          {/* Availability */}
          <div className="bg-emerald-50 rounded-4xl p-8 border-2 border-emerald-100 shadow-sm">
            <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
              <Clock className="w-7 h-7" />
              Availability
            </h3>
            <div className="space-y-3">
              {availability.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium text-emerald-800">{slot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-4xl p-8 border border-slate-200 shadow-xl">
            <h3 className="text-2xl font-bold text-navy mb-6">Recent Reviews</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="pt-4 border-t border-slate-100 last:border-t-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-gold text-gold' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-navy">{review.user}</span>
                    <span className="text-slate-400 text-sm ml-auto">{review.date}</span>
                  </div>
                  <p className="text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        engineer={engineer}
        design={null} // No specific design
        onSuccess={async (bookingData) => {
          try {
            await createBooking({ ...bookingData, engineerId: engineer.id });
            addNotification(`Booking with ${engineer.name} created successfully!`, 'success');
            setIsBookingOpen(false);
          } catch (err) {
            addNotification('Booking failed', 'error');
          }
        }}
      />
    </div>
  );
};

export default EngineerProfile;

