import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Edit3, Save, X, Camera, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { cn } from '../../utils/cn';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'preferences'
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences form
  const [preferences, setPreferences] = useState({
    budgetMin: user?.preferences?.budgetMin || '',
    budgetMax: user?.preferences?.budgetMax || '',
    landSize: user?.preferences?.landSize || '',
    preferredStyles: user?.preferences?.preferredStyles || [],
    desiredRooms: user?.preferences?.desiredRooms || '',
  });

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await userService.updateProfile(profileData);
      if (result?.data) updateUser(result.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Password change failed';
      setError(msg);
      toast.error(msg);
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
      toast.success('Preferences saved!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleStyle = (style) => {
    setPreferences((prev) => ({
      ...prev,
      preferredStyles: prev.preferredStyles.includes(style)
        ? prev.preferredStyles.filter((s) => s !== style)
        : [...prev.preferredStyles, style],
    }));
  };

  const styles = ['Modern', 'Traditional', 'Villa', 'Duplex', 'Contemporary', 'Minimalist', 'Colonial', 'Farmhouse'];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        <span className="ml-4 text-lg font-bold text-navy">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-navy mb-4">My Profile</h1>
        <p className="text-xl text-slate-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cover / Avatar Section */}
        <div className="bg-gradient-to-r from-navy to-slate-800 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(246,199,55,0.3),transparent)]"></div>
          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-4xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-black text-gold shadow-2xl border-4 border-white/30">
                {getInitials()}
              </div>
              {editing && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <label className="w-14 h-14 bg-gold text-navy rounded-3xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start mb-2">
                <span className="bg-white/20 px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-wide">
                  {user.role}
                </span>
                <div className="flex items-center gap-2 text-sm bg-white/10 px-4 py-2 rounded-2xl">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.isEmailVerified ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 text-sm">
                    <XCircle className="w-4 h-4" /> Not verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-8">
          {[
            { key: 'profile', label: 'Personal Info' },
            { key: 'password', label: 'Password' },
            { key: 'preferences', label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              className={cn(
                'px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all border-b-2 -mb-px',
                activeTab === tab.key
                  ? 'text-gold border-gold'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* TAB 1: Personal Info */}
          {activeTab === 'profile' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-navy">Personal Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email || ''}
                      className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                      disabled={!editing}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setProfileData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          phone: user.phone || '',
                        });
                        setError('');
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all"
                      disabled={saving}
                    >
                      <X className="w-4 h-4 inline mr-2" /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gold hover:bg-gold/90 text-navy font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </>
          )}

          {/* TAB 2: Password */}
          {activeTab === 'password' && (
            <>
              <h3 className="text-xl font-bold text-navy mb-8">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full p-4 pl-12 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full p-4 pl-12 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full p-4 pl-12 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gold hover:bg-gold/90 text-navy font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* TAB 3: Preferences */}
          {activeTab === 'preferences' && (
            <>
              <h3 className="text-xl font-bold text-navy mb-2">Design Preferences</h3>
              <p className="text-slate-500 mb-8">Help us recommend the best designs for your needs.</p>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Min Budget (₹)</label>
                    <input
                      type="number"
                      value={preferences.budgetMin}
                      onChange={(e) => setPreferences({ ...preferences, budgetMin: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Budget (₹)</label>
                    <input
                      type="number"
                      value={preferences.budgetMax}
                      onChange={(e) => setPreferences({ ...preferences, budgetMax: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="10000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Land Size (sq.ft)</label>
                  <input
                    type="number"
                    value={preferences.landSize}
                    onChange={(e) => setPreferences({ ...preferences, landSize: e.target.value })}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Styles</label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          'px-4 py-2 rounded-2xl font-bold text-sm transition-all border',
                          preferences.preferredStyles.includes(style)
                            ? 'bg-gold text-navy border-gold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-gold'
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Desired Bedrooms</label>
                  <input
                    type="number"
                    value={preferences.desiredRooms}
                    onChange={(e) => setPreferences({ ...preferences, desiredRooms: e.target.value })}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all"
                    placeholder="3"
                    min="1"
                    max="20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gold hover:bg-gold/90 text-navy font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

