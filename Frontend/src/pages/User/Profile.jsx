import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Edit3, Save, X, Camera, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
const [preferences, setPreferences] = useState({
    budgetMin: user?.preferences?.budgetMin || '',
    budgetMax: user?.preferences?.budgetMax || '',
    landSize: user?.preferences?.landSize || '',
    preferredStyles: user?.preferences?.preferredStyles || [],
    preferredLocations: user?.preferences?.preferredLocations || [],
    desiredRooms: user?.preferences?.desiredRooms || '',
    facingDirection: user?.preferences?.facingDirection || ''
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile'); // 'profile' | 'preferences'
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userService.updateProfile(profileData);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Update failed');
      toast.error(setError);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userService.updatePreferences(preferences);
      toast.success('Preferences saved! Designs will match your home needs.');
      setEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Update failed');
      toast.error(setError);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  };

  if (!user || !user.name) {
    return <div className="text-center py-20 flex items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      <span className="text-lg font-bold text-navy">Loading profile...</span>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-navy mb-4">My Profile</h1>
        <p className="text-xl text-slate-600">Manage your account information</p>
      </div>

      <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-navy to-slate-800 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(246,199,55,0.3),transparent)]"></div>
          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-center md:space-x-8 md:space-y-0 space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-4xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black text-gold shadow-2xl border-4 border-white/30">
                {getInitials(user.name)}
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <label className="w-16 h-16 bg-gold text-navy rounded-3xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all">
                  <Camera className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-2">{user.name}</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start mb-2">
                <span className="bg-white/20 px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-wide">
                  {user.role}
                </span>
                <div className="flex items-center gap-2 text-sm bg-white/10 px-4 py-2 rounded-2xl">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
              </div>
              <p className="text-white/90 max-w-md mx-auto md:mx-0">{user.bio || 'No bio set.'}</p>
            </div>
          </div>
        </div>

        <div className="p-12">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3 rounded-3xl transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Full Name</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                  disabled={!editing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows="4"
                className="w-full p-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm resize-vertical"
                disabled={!editing}
                placeholder="Tell us about yourself..."
              />
            </div>

            {editing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      phone: user.phone || '',
                      location: user.location || '',
                      bio: user.bio || ''
                    });
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-3xl transition-all shadow-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold hover:bg-gold/90 text-navy font-bold py-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                  <Save className="w-5 h-5" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

