import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { cn } from '../utils/cn';
import { feedbackService } from '../services/feedbackService';

const ReviewModal = ({ isOpen, onClose, booking, engineer }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        bookingId: booking.id,
        engineerId: engineer.id,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Review submission failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-4xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy">Leave Review</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Engineer Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center text-white font-bold text-lg">
              {engineer.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-navy">{engineer.name}</h3>
              <p className="text-sm text-slate-500">{booking.designTitle || 'Consultation'}</p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 block mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[5,4,3,2,1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={cn(
                    "w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center",
                    rating >= star 
                      ? "bg-gold text-navy border-gold shadow-lg shadow-gold/25" 
                      : "border-slate-200 text-slate-300 hover:border-gold hover:text-gold hover:bg-gold/10"
                  )}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Comments (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full p-4 border border-slate-200 rounded-3xl resize-vertical focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all min-h-[120px]"
              rows="4"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-3xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 bg-navy hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-3xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

