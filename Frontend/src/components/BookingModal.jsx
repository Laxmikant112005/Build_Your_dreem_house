import React, { useState } from 'react';
import { X, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import BookingCalendar from './BookingCalendar';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

const BookingModal = ({ design, engineer, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ date: '', time: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      toast.error('Please select date and time');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        engineerId: engineer.id,
        designId: design.id,
        startAt: `${formData.date}T${formData.time.replace(' ', '').replace(':', 'H')}:00Z`,
        endAt: `${formData.date}T${(parseInt(formData.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00:00Z`,
        details: formData.details
      };
      await bookingService.create(bookingData);
      toast.success('Booking created successfully!');
      onClose();
      // Optional: trigger parent refetch
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-4xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel - Info */}
          <div className="md:w-5/12 bg-navy p-10 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="bg-gold/20 w-fit p-3 rounded-2xl">
                <Calendar className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-3xl font-extrabold leading-tight">Consult with <br /><span className="text-gold">{engineer?.name || "Expert"}</span></h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Schedule a premium session to discuss your vision for <span className="text-white font-bold">{design?.title || "this design"}</span>.</p>
            </div>
            
            <div className="pt-10 border-t border-white/10 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-gold/30 p-0.5 overflow-hidden">
                  <img src={engineer?.avatar || "https://i.pravatar.cc/150"} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.1em]">Verified Professional</p>
                  <p className="text-sm font-bold truncate max-w-[120px]">{engineer?.name || "Engineer"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="md:w-7/12 p-10">
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-navy">Select Availability</h3>
                  <BookingCalendar engineerId={engineer?.id} onSelectSlot={(slot) => {
                    setFormData({
                      ...formData, 
                      date: slot.startAt.toISOString().split('T')[0],
                      time: slot.startAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      slot
                    });
                    setStep(2);
                  }} />
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-navy">Refine Inquiry</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Consultation Notes</label>
                    <textarea 
                      placeholder="Share your specific requirements or modifications..." 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-navy min-h-[150px] focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
                      value={formData.details}
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-navy font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">Back</button>
                  <button type="submit" className="flex-[2] btn-gold py-4 rounded-2xl font-bold flex justify-center items-center gap-2 uppercase text-xs tracking-widest">
                    {loading ? <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div> : "Confirm Request"}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-navy">Request Sent!</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                    We've shared your interest with <span className="text-navy font-bold">{engineer?.name || "the engineer"}</span>. You'll receive a notification soon.
                  </p>
                </div>
                <button onClick={onClose} className="w-full btn-gold py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl">Close & Continue</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
