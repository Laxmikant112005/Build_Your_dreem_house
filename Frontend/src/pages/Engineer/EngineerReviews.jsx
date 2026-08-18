import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Reply, AlertCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { engineerService } from '../../services/engineerService';
import { cn } from '../../utils/cn';

const EngineerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, breakdown: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const [revRes, statRes, selfStat] = await Promise.all([
        reviewService.getByEngineer(user.id, { limit: 50 }).catch(() => null),
        reviewService.getStats(user.id).catch(() => null),
        engineerService.getDashboard().catch(() => null),
      ]);

      const reviewed = revRes?.data?.reviews || revRes?.data || [];
      setReviews(reviewed);

      const avg = selfStat?.data?.reviews?.average ||
        statRes?.data?.average ||
        statRes?.data?.rating?.average ||
        0;
      const count = selfStat?.data?.reviews?.total ||
        statRes?.data?.count ||
        revRes?.data?.rating?.count ||
        reviewed.length;
      setStats({ average: avg, total: count, breakdown: statRes?.data?.breakdown || {} });
    } catch (e) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await reviewService.respond(reviewId, replyText.trim());
      toast.success('Reply posted');
      setReplyText('');
      setReplyingTo(null);
      fetchReviews();
    } catch (e) {
      toast.error('Failed to post reply');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-4xl" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <Star className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Client Reviews</h1>
          <p className="text-slate-600 font-medium">See what clients say about your work</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm mb-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-6xl font-black text-navy">{(stats.average || 0).toFixed(1)}</p>
          <div className="flex justify-center md:justify-start gap-0.5 my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn('w-5 h-5', i < Math.round(stats.average || 0) ? 'text-gold fill-current' : 'text-slate-300')} />
            ))}
          </div>
          <p className="text-sm text-slate-500 font-medium">{stats.total || 0} reviews</p>
        </div>
        <div className="flex-1">
          <RatingBar label="5" value={breakdownPct(stats.breakdown, 5)} />
          <RatingBar label="4" value={breakdownPct(stats.breakdown, 4)} />
          <RatingBar label="3" value={breakdownPct(stats.breakdown, 3)} />
          <RatingBar label="2" value={breakdownPct(stats.breakdown, 2)} />
          <RatingBar label="1" value={breakdownPct(stats.breakdown, 1)} />
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No reviews yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            When clients leave reviews after a completed consultation or project, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id || review._id} className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {review.userId?.avatar ? (
                      <img src={review.userId.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-navy">{review.userId?.firstName || 'Client'} {review.userId?.lastName || ''}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('w-4 h-4', i < (review.rating || 0) ? 'text-gold fill-current' : 'text-slate-300')} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>

              {review.title && <h4 className="font-bold text-navy mt-4">{review.title}</h4>}
              {review.comment && <p className="text-slate-600 mt-2 leading-relaxed">{review.comment}</p>}

              {review.response && (
                <div className="mt-4 bg-gold/5 border border-gold/20 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gold uppercase tracking-wide mb-1">Your response</p>
                  <p className="text-sm text-navy">{review.response}</p>
                </div>
              )}

              {replyingTo === review.id ? (
                <div className="mt-4 flex flex-col gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/40"
                    placeholder="Write your public response..."
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleReply(review.id)} className="btn-gold px-6 py-2.5 rounded-3xl font-bold inline-flex items-center gap-2">
                      <Reply className="w-4 h-4" /> Post Reply
                    </button>
                    <button onClick={() => setReplyingTo(null)} className="border-2 border-slate-200 px-6 py-2.5 rounded-3xl font-bold text-slate-600">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline"
                >
                  <MessageSquare className="w-4 h-4" /> Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RatingBar = ({ label, value }) => (
  <div className="flex items-center gap-3 mb-2">
    <span className="w-3 text-sm font-bold text-slate-500">{label}</span>
    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
    <span className="w-10 text-xs text-slate-400 text-right">{value}%</span>
  </div>
);

const breakdownPct = (breakdown, star) => {
  if (!breakdown) return 0;
  const counts = Array.isArray(breakdown) ? breakdown : Object.entries(breakdown).map(([k, v]) => ({ _id: Number(k), count: v?.count || v }));
  const entry = counts.find((b) => Number(b?._id) === star);
  const total = counts.reduce((s, b) => s + (b?.count || 0), 0);
  if (!total) return 0;
  return Math.round(((entry?.count || 0) / total) * 100);
};

export default EngineerReviews;
