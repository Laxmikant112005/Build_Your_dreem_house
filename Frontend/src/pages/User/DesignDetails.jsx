import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const convertToINR = (usd) => `₹${(usd * 82).toLocaleString("en-IN")}`;

import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../../context/BookingContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ArrowLeft, 
  MapPin, 
  BedDouble, 
  Layers, 
  UtensilsCrossed, 
  Car, 
  ArrowRight, 
  Star, 
  Calendar,
  ShieldCheck,
  Download,
  Share2,
  AlertCircle,
  Users
} from 'lucide-react';
import { designService } from '../../services/designService';
import { engineerService } from '../../services/engineerService';
import BookingModal from '../../components/BookingModal';
import ThreeDViewer from '../../components/ThreeDViewer';

const DesignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createBooking } = useBookings();
  const { addNotification } = useNotifications();
  const [design, setDesign] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const designData = await designService.getById(id);
        if (designData) {
          setDesign(designData);
          const engineersData = await engineerService.getAllEngineers();
          setEngineers(engineersData);
          toast.success('Design loaded');
        }
      } catch (err) {
        toast.error('Failed to load design details');
        addNotification('Failed to load design details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!design) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-navy mb-4 text-center">Design Not Found</h2>
      <button onClick={() => navigate(-1)} className="btn-gold px-8 py-3">Go Back to Collection</button>
    </div>
  );

  const specs = [
    { label: 'Bedrooms', value: design?.bedrooms || 0, icon: BedDouble },
    { label: 'Floors', value: design?.floors || 0, icon: Layers },
    { label: 'Kitchen', value: design?.kitchen || 0, icon: UtensilsCrossed },
    { label: 'Parking', value: design?.parking || 0, icon: Car },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-gold font-bold mb-8 transition-all group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-navy">
        {/* Left Column - Visuals */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative group">
            <ThreeDViewer 
              modelUrl={design?.portfolio?.find(p => p.name.endsWith('.glb') || p.name.endsWith('.gltf'))?.url || '/public/models/sample-house.glb'} 
              fallbackImage={design?.image || '/images/placeholder-design.jpg'}
            />

            <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
              <div className="flex gap-4">
                <button className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white hover:bg-gold hover:text-navy transition-all">
                  <Download className="w-6 h-6" />
                </button>
                <button className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white hover:bg-gold hover:text-navy transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4xl p-10 border border-slate-200 shadow-sm space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold mb-4">Architectural Vision</h2>
              <p className="text-slate-500 text-lg leading-relaxed">{design?.description || "Experience living in a sanctuary of modern architecture designed for the future."}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {specs.map((spec) => (
                <div key={`${spec.label}-${design?.id}`} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-navy transition-all duration-500">
                  <spec.icon className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-navy font-extrabold text-2xl mb-1 group-hover:text-white transition-colors">{spec.value}</span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest group-hover:text-gold/60 transition-colors">{spec.label}</span>
                </div>
              ))}
            </div>

            {/* Recommended Engineers Section */}
            <div>
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                Recommended Engineers
                <span className="text-sm bg-gold/20 text-gold px-3 py-1 rounded-full font-bold">₹45K-₹65K</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {engineers.slice(0,4).map((eng) => (
                  <div key={eng.id} className="group bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-3xl border border-slate-200 hover:shadow-2xl hover:border-gold transition-all hover:-translate-y-2 cursor-pointer" onClick={() => {
                    setSelectedEngineer(eng);
                    setIsBookingOpen(true);
                  }}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                        <img src={eng.avatar || '/images/placeholder.jpg'} alt={eng.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-xl text-navy mb-1 group-hover:text-gold transition-colors">{eng.name}</h4>
                        <p className="text-slate-600 mb-1 font-medium">{eng.specialization || 'Structural Engineer'}</p>
                        <p className="text-sm text-slate-500 mb-3">{eng.location || 'Bangalore, KA'}</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <span className="font-bold text-slate-700">4.8 (27)</span>
                        </div>
                        <div className="text-2xl font-bold text-gold mb-2">₹{convertToINR((45000 + Math.random() * 20000))}</div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Consultation Fee</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Verified</span>
                      <span className="text-xs text-slate-500 font-medium">{eng.experience || '5+ Years'}</span>
                    </div>
                  </div>
                ))}
              </div>
              {engineers.length > 4 && (
                <div className="text-center mt-8 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-600 mb-4">+{engineers.length - 4} more engineers available</p>
                  <Link to="/user/engineers" className="btn-gold inline-flex items-center gap-2 px-8 py-3 font-bold">
                    View All Engineers
                    <Users className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking & Engineer Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Booking Card */}
          <div className="bg-navy p-10 rounded-4xl text-white border border-white/10 shadow-2xl sticky top-30">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gold font-bold uppercase text-[10px] tracking-[0.2em] mb-1">Estimated Budget</p>
                <h3 className="text-4xl font-extrabold">
                  {design?.budget ? convertToINR(design.budget) : "Price TBD"}
                </h3>

              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-white/20 whitespace-nowrap">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="font-bold text-sm">{design?.rating || "4.9"}</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-sm font-medium">Standard Engineering Blueprint</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-sm font-medium">48h Consultation Window</span>
              </div>
            </div>

            <button 
              onClick={() => setIsBookingOpen(true)}
              className="w-full btn-gold py-5 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-gold/20"
            >
              Book Consultation <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-center text-slate-500 text-[10px] mt-6 font-bold uppercase tracking-widest leading-relaxed">No initial commitment required. Quality Guarantee.</p>
          </div>

          {/* Engineer Profile Card */}
          {engineer && (
            <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <h4 className="text-navy/40 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Designed By</h4>
              <div className="w-24 h-24 rounded-full border-4 border-gold/20 p-1 mb-4 shadow-lg">
                <img src={engineer?.avatar} alt={engineer?.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <h3 className="text-xl font-extrabold text-navy mb-1">{engineer?.name || "Professional Engineer"}</h3>
              <p className="text-slate-400 font-medium text-sm mb-6 uppercase tracking-tight">{engineer?.specialization || "Structural Engineer"}</p>
              
              <div className="flex gap-2 w-full">
                <button className="flex-1 border-2 border-slate-100 p-3 rounded-xl hover:border-gold hover:text-gold transition-all font-bold text-xs uppercase text-navy">Portfolio</button>
                <button className="flex-1 bg-navy text-white p-3 rounded-xl hover:bg-navy/80 transition-all font-bold text-xs uppercase">Message</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        design={design} 
        engineer={selectedEngineer} 
        onSuccess={async (bookingData) => {
          try {
            await createBooking(bookingData);
            addNotification('Booking request sent successfully!', 'success');
            toast.success('Booking requested!');
            setIsBookingOpen(false);
          } catch (err) {
            setBookingError(err.message);
            toast.error('Booking failed');
          }
        }}
      />
    </div>
  );
};

export default DesignDetails;
