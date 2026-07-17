import React, { useState, useEffect } from 'react';
import { Star, User, MessageCircle, Trash2, Eye, Search } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { cn } from '../../utils/cn';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getAll();
      setFeedbacks(data);
      calcStats(data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcStats = (data) => {
    const ratings = data.map(f => f.rating);
    setStats({
      total: data.length,
      avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0,
      feedbackByRating: {
        5: data.filter(f => f.rating === 5).length,
        4: data.filter(f => f.rating === 4).length,
        3: data.filter(f => f.rating === 3).length,
        1: data.filter(f => f.rating <= 2).length
      }
    });
  };

  const filteredFeedback = feedbacks.filter(f => {
    const matchesFilter = filter === 'all' || f.rating.toString() === filter;
    const matchesSearch = f.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id) => {
    if (confirm('Delete this feedback?')) {
      try {
        setFeedbacks(f => f.filter(item => item.id !== id));
        calcStats(feedbacks.filter(item => item.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-12 w-96 bg-slate-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-navy mb-4">Feedback Management</h1>
        <p className="text-xl text-slate-500 mb-8">Monitor client satisfaction and platform quality metrics</p>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-slate-100 p-4 rounded-3xl border">
            <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text"
              placeholder="Search feedback..."
              className="bg-transparent ml-3 outline-none placeholder-slate-400 flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-100 p-3 rounded-2xl border text-sm font-bold"
          >
            <option value="all">All ({feedbacks.length})</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="1">1-2 Stars</option>
          </select>
          
          <button onClick={fetchFeedback} className="px-8 py-3 bg-navy text-white font-bold rounded-2xl hover:bg-navy/90 transition-all">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-navy">{stats.total}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Total Feedback</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-8 rounded-3xl border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-800">{stats.avgRating}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-navy">{stats.feedbackByRating?.['5'] || 0}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400">5 Star</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-8 rounded-3xl border border-red-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-red-800">{stats.feedbackByRating?.['1'] || 0}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">Low Ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-2xl font-bold text-navy mb-4">All Feedback ({filteredFeedback.length})</h3>
          <p className="text-slate-500">Detailed client reviews and ratings</p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFeedback.map((feedback) => (
            <div key={feedback.id} className="p-8 hover:bg-slate-50 transition-colors">
              <div className="flex gap-6 items-start">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={cn(
                        'w-6 h-6',
                        i < feedback.rating ? 'text-gold fill-current shadow-sm' : 'text-slate-300'
                      )}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <p className="text-lg font-semibold text-navy leading-relaxed mb-3">{feedback.comment}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>User #{feedback.userId}</span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                    <span>Booking #{feedback.bookingId}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl transition-all">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(feedback.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete feedback"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-600 mb-4">No feedback to review</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Client feedback will appear here once they complete their bookings with engineers.
            </p>
            <button className="btn-gold px-12 py-4 text-lg font-bold shadow-xl">View Analytics</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;

