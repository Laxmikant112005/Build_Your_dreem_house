import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, Star, MessageCircle, Download, Share2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import EngineerProfileForm from '../../components/EngineerProfileForm';
import { cn } from '../../utils/cn';

const EngineerProfile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const data = await feedbackService.getByEngineer(user.id);
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    setSaving(true);
    try {
      // Simulate save to backend
      console.log('Saving profile:', updatedProfile);
      // Update auth user
      localStorage.setItem('dream_house_user', JSON.stringify(updatedProfile));
      setEditing(false);
    } catch (error) {
      console.error('Profile save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : user.rating || 4.5;

  const myDesigns = [];

  const stats = [
    { label: 'Projects', value: myDesigns.length, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Bookings', value: 12, icon: Calendar, color: 'text-emerald-600' },
    { label: 'Rating', value: `${averageRating}/5`, icon: Star, color: 'text-gold' },
    { label: 'Feedbacks', value: feedbacks.length, icon: MessageCircle, color: 'text-purple-600' }
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block relative mb-8">
          <div className="w-32 h-32 rounded-full border-8 border-white shadow-2xl mx-auto overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            <img 
              src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} 
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-navy to-slate-800 bg-clip-text text-transparent mb-3">
          {user.name}
        </h1>
        <p className="text-xl text-slate-500 font-bold uppercase tracking-wider mb-2">
          {user.specialization || 'Structural Engineer'}
        </p>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          {user.bio || 'Experienced engineer crafting exceptional residential designs.'}
        </p>
        
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 bg-slate-100 px-6 py-3 rounded-3xl border">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={cn(
                  'w-6 h-6',
                  i < averageRating ? 'text-gold fill-current shadow-sm' : 'text-slate-300'
                )}
              />
            ))}
            <span className="font-bold text-2xl ml-3 text-navy">{averageRating}</span>
            <span className="text-slate-500 font-medium ml-1">({feedbacks.length} reviews)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => setEditing(true)}
            className="btn-gold py-4 px-8 text-lg font-bold shadow-xl hover:shadow-gold/20"
          >
            Edit Profile
          </button>
          <button className="border-2 border-slate-200 text-navy py-4 px-8 rounded-3xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
            Preview Public Profile
          </button>
        </div>
      </div>

      {editing ? (
        <EngineerProfileForm 
          profile={user}
          onSave={handleSaveProfile}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map(({ label, value, icon: Icon, color }, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-slate-200 hover:border-gold/50 hover:shadow-xl transition-all bg-gradient-to-br from-slate-50/50 to-transparent">
                <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-8 h-8 ${color}`} />
                </div>
                <p className="text-3xl font-extrabold text-navy mb-1">{value}</p>
                <p className="text-slate-500 uppercase text-xs font-bold tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="flex items-center gap-4 mb-16 p-8 bg-slate-50 rounded-4xl border border-slate-100">
            <MapPin className="w-8 h-8 text-slate-400 flex-shrink-0" />
            <span className="text-lg font-bold text-navy">{user.location || 'Location TBD'}</span>
          </div>

          {/* Recent Feedback */}
          <div>
            <h3 className="text-3xl font-bold text-navy mb-8 flex items-center gap-4">
              Client Feedback
              <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                {feedbacks.length} total
              </span>
            </h3>
            <div className="space-y-6">
              {feedbacks.slice(0, 3).map((feedback) => (
                <div key={feedback.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex gap-4 mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={cn(
                            'w-5 h-5',
                            i < feedback.rating ? 'text-gold fill-current' : 'text-slate-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-2xl text-navy ml-auto">{feedback.rating}</span>
                  </div>
                  <p className="text-slate-700 font-medium text-lg leading-relaxed mb-6">{feedback.comment}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
                    <span>Booking #{feedback.bookingId}</span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {feedbacks.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
                  <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-600 mb-4">No feedback yet</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Your first happy client feedback will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EngineerProfile;

