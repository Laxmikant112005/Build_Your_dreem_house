import React, { useState } from 'react';
import { Star, Send, X, AlertCircle } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../utils/cn';

const FeedbackForm = ({ bookingId, engineerId, engineerName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const feedbackData = {
        bookingId,
        userId: 1, // From auth context in real app
        engineerId,
        rating,
        comment: comment.trim() || `Rated ${rating}/5 stars`
      };
      
      await feedbackService.submitFeedback(feedbackData);
      addNotification('Feedback submitted successfully!', 'success');
      onSuccess?.();
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
      addNotification('Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-xl max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-gold to-gold-light rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Star className="w-10 h-10 text-navy" />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Rate Your Experience</h2>
        <p className="text-slate-500">Help {engineerName} improve by sharing your feedback</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-bold text-navy mb-3 uppercase tracking-wider">Rating</label>
          <div className="flex gap-1 justify-center">
            {[5,4,3,2,1].map((star) => (
              <button
                key={star}
                type="button"
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center transition-all group',
                  rating >= star 
                    ? 'bg-gold text-navy shadow-md scale-110' 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:scale-105'
                )}
                onClick={() => setRating(star)}
                disabled={submitting}
              >
                <Star className={cn("w-6 h-6", rating >= star ? 'fill-current' : '')} />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2 uppercase tracking-wider">
            Feedback (Optional)
          </label>
          <textarea
            rows="4"
            placeholder="What did you like? Any suggestions for improvement?..."
            className="w-full p-4 border border-slate-200 rounded-3xl resize-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all placeholder-slate-400"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-6 rounded-3xl transition-all flex items-center justify-center gap-2"
            onClick={() => {
              setRating(0);
              setComment('');
              setError('');
              onSuccess?.();
            }}
            disabled={submitting}
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light text-navy font-bold py-4 px-6 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;

