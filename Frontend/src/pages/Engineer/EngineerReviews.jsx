import React from 'react';
import { Link } from 'react-router-dom';
import { Star, User, Quote, ThumbsUp, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const mockReviews = [
  {
    id: 1,
    user: 'Rajesh Kumar',
    rating: 5,
    comment: 'Excellent structural engineer! Delivered blueprints ahead of schedule with perfect accuracy.',
    date: 'Jan 15, 2024'
  },
  {
    id: 2,
    user: 'Priya Sharma',
    rating: 4,
    comment: 'Very professional. Good communication, minor delays but quality was excellent.',
    date: 'Jan 10, 2024'
  },
  {
    id: 3,
    user: 'Amit Patel',
    rating: 5,
    comment: 'Highly recommended! Creative solutions and great value for money.',
    date: 'Dec 28, 2023'
  },
  {
    id: 4,
    user: 'Neha Gupta',
    rating: 5,
    comment: 'Perfect modern villa design. Exactly what we wanted. 10/10!',
    date: 'Dec 20, 2023'
  },
  {
    id: 5,
    user: 'Vikram Singh',
    rating: 4,
    comment: 'Good work, responsive, slightly over budget but worth it.',
    date: 'Dec 15, 2023'
  }
];

const EngineerReviews = () => {
  const { user } = useAuth();

  const averageRating = 4.7;
  const totalReviews = mockReviews.length;

  const Stars = ({ rating }) => (
    <div className="flex items-center gap-1">
      {Array(5).fill(0).map((_, i) => (
        <Star 
          key={i}
          className={cn('w-5 h-5 transition-colors', 
            i < rating ? 'text-gold fill-gold' : 'text-slate-300'
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <Award className="w-12 h-12 text-gold bg-gold/10 p-3 rounded-3xl" />
          <div>
            <h1 className="text-4xl font-black text-navy">Client Reviews</h1>
            <p className="text-slate-600 font-medium mt-2">{user?.name || 'Your'} Reputation</p>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-center mb-8">
          <Stars rating={averageRating} />
          <div className="text-4xl font-black text-navy">{averageRating}</div>
          <div className="text-sm text-slate-500">({totalReviews} reviews)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Stats Overview */}
        <div className="bg-white rounded-4xl shadow-xl border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-navy mb-6">Rating Breakdown</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="w-8 text-right font-bold text-slate-600">{rating}</div>
                <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gold to-amber-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(90, rating * 20)}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-slate-600">{mockReviews.filter(r => r.rating === rating).length}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-4xl p-6 border border-emerald-200 shadow-lg text-center">
            <div className="text-3xl font-black text-emerald-700 mb-1">98%</div>
            <div className="text-sm text-emerald-800 font-medium">Client Satisfaction</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-4xl p-6 border border-blue-200 shadow-lg text-center">
            <div className="text-3xl font-black text-blue-700 mb-1">4.8⭐</div>
            <div className="text-sm text-blue-800 font-medium">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-200">
          <h3 className="text-2xl font-bold text-navy mb-2">Recent Reviews</h3>
          <p className="text-slate-600">What our clients are saying</p>
        </div>
        
        <div className="divide-y divide-slate-200">
          {mockReviews.slice(0, 6).map((review) => (
            <div key={review.id} className="p-8 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={review.rating} />
                    <span className="font-bold text-navy">{review.user}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Quote className="w-4 h-4" />
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <Link to="/engineer/profile" className="inline-flex items-center gap-3 bg-gold text-navy font-bold py-4 px-12 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
          <ThumbsUp className="w-5 h-5" />
          Manage Profile
        </Link>
      </div>
    </div>
  );
};

const Stars = ({ rating }) => (
  <div className="flex items-center gap-1">
    {Array(5).fill(0).map((_, i) => (
      <Star 
        key={i}
        className={cn('w-5 h-5 transition-colors', 
          i < rating ? 'text-gold fill-gold' : 'text-slate-300'
        )}
      />
    ))}
  </div>
);

export default EngineerReviews;

