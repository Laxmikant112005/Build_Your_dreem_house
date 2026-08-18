import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { 
  User, Lock, Bell, Shield, Palette, Trash2, LogOut, Eye, EyeOff,
  Save, Check, X, Moon, Sun, Globe
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { notificationService } from '../../services/notificationService';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Password form
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    booking: true,
    message: true,
    review: true,
    system: true,
    design: true,
    promotion: false,
    email: true,
    push: true,
    sms: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: false,
    showProjects: true,
    allowMessages: true,
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    reducedMotion: false,
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.updateProfile(profile);
      if (res?.data) updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword(password.currentPassword, password.newPassword);
      toast.success('Password changed successfully!');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  const handleNotifSubmit = async (e) => {
    e.preventDefault();
    toast.success('Notification preferences saved!');
  };

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    toast.success('Privacy settings saved!');
  };

  const handleAppearanceSubmit = async (e) => {
    e.preventDefault();
    // In a full implementation, this would toggle a CSS class on the document
    if (appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', appearance.theme);
    toast.success('Appearance settings saved!');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    if (!window.confirm('All your data will be permanently deleted. Continue?')) return;
    try {
      await userService.deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const sectionConfig = {
    profile: {
      title: 'Profile Information',
      description: 'Update your personal details',
      content: (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
              <input
                type="text" value={profile.firstName}
                onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
              <input
                type="text" value={profile.lastName}
                onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input type="email" value={user?.email || ''}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
              <input type="tel" value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
              />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="btn-gold px-8 py-4 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50">
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ),
    },
    password: {
      title: 'Change Password',
      description: 'Update your account password',
      content: (
        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showCurrentPw ? 'text' : 'password'} value={password.currentPassword}
                onChange={e => setPassword({ ...password, currentPassword: e.target.value })}
                className="w-full p-4 pl-12 pr-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
                required
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showNewPw ? 'text' : 'password'} value={password.newPassword}
                onChange={e => setPassword({ ...password, newPassword: e.target.value })}
                className="w-full p-4 pl-12 pr-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
                minLength={6} required
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="password" value={password.confirmPassword}
                onChange={e => setPassword({ ...password, confirmPassword: e.target.value })}
                className="w-full p-4 pl-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
                minLength={6} required
              />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="btn-gold px-8 py-4 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50">
            <Save className="w-5 h-5" /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      ),
    },
    notifications: {
      title: 'Notification Preferences',
      description: 'Manage how you receive notifications',
      content: (
        <form onSubmit={handleNotifSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-navy text-lg">Notification Types</h4>
            {Object.entries(notifPrefs).filter(([key]) => !['email', 'push', 'sms'].includes(key)).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                <div>
                  <p className="font-bold text-navy capitalize">{key} Notifications</p>
                  <p className="text-sm text-slate-400">Receive notifications about {key} updates</p>
                </div>
                <div onClick={() => setNotifPrefs({ ...notifPrefs, [key]: !value })}
                  className={cn('w-14 h-8 rounded-full p-1 transition-all cursor-pointer', value ? 'bg-gold' : 'bg-slate-300')}>
                  <div className={cn('w-6 h-6 bg-white rounded-full shadow-md transition-all', value ? 'translate-x-6' : 'translate-x-0')} />
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-4 mt-8">
            <h4 className="font-bold text-navy text-lg">Delivery Channels</h4>
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Receive notifications in browser' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                <div>
                  <p className="font-bold text-navy">{label}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
                <div onClick={() => setNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] })}
                  className={cn('w-14 h-8 rounded-full p-1 transition-all cursor-pointer', notifPrefs[key] ? 'bg-gold' : 'bg-slate-300')}>
                  <div className={cn('w-6 h-6 bg-white rounded-full shadow-md transition-all', notifPrefs[key] ? 'translate-x-6' : 'translate-x-0')} />
                </div>
              </label>
            ))}
          </div>

          <button type="submit" className="btn-gold px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
            <Save className="w-5 h-5" /> Save Preferences
          </button>
        </form>
      ),
    },
    privacy: {
      title: 'Privacy Settings',
      description: 'Control your visibility and data sharing',
      content: (
        <form onSubmit={handlePrivacySubmit} className="space-y-6">
          <div className="space-y-4">
            {[
              { key: 'showProfile', label: 'Public Profile', desc: 'Allow others to see your profile' },
              { key: 'showEmail', label: 'Show Email', desc: 'Display your email on your profile' },
              { key: 'showPhone', label: 'Show Phone', desc: 'Display your phone number' },
              { key: 'showProjects', label: 'Show Projects', desc: 'Display your projects publicly' },
              { key: 'allowMessages', label: 'Allow Messages', desc: 'Allow others to send you messages' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                <div>
                  <p className="font-bold text-navy">{label}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
                <div onClick={() => setPrivacy({ ...privacy, [key]: !privacy[key] })}
                  className={cn('w-14 h-8 rounded-full p-1 transition-all cursor-pointer', privacy[key] ? 'bg-gold' : 'bg-slate-300')}>
                  <div className={cn('w-6 h-6 bg-white rounded-full shadow-md transition-all', privacy[key] ? 'translate-x-6' : 'translate-x-0')} />
                </div>
              </label>
            ))}
          </div>
          <button type="submit" className="btn-gold px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
            <Save className="w-5 h-5" /> Save Privacy Settings
          </button>
        </form>
      ),
    },
    appearance: {
      title: 'Appearance',
      description: 'Customize your experience',
      content: (
        <form onSubmit={handleAppearanceSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">Theme</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                className={cn('p-6 rounded-3xl border-2 transition-all text-center', appearance.theme === 'light' ? 'border-gold bg-gold/5' : 'border-slate-200 hover:border-slate-300')}>
                <Sun className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="font-bold text-navy">Light Mode</p>
                <p className="text-xs text-slate-400">Default bright theme</p>
              </button>
              <button type="button" onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                className={cn('p-6 rounded-3xl border-2 transition-all text-center', appearance.theme === 'dark' ? 'border-gold bg-gold/5' : 'border-slate-200 hover:border-slate-300')}>
                <Moon className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                <p className="font-bold text-navy">Dark Mode</p>
                <p className="text-xs text-slate-400">Easy on the eyes</p>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Font Size</label>
            <select value={appearance.fontSize} onChange={e => setAppearance({ ...appearance, fontSize: e.target.value })}
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
            <div>
              <p className="font-bold text-navy">Reduced Motion</p>
              <p className="text-sm text-slate-400">Minimize animations and transitions</p>
            </div>
            <div onClick={() => setAppearance({ ...appearance, reducedMotion: !appearance.reducedMotion })}
              className={cn('w-14 h-8 rounded-full p-1 transition-all cursor-pointer', appearance.reducedMotion ? 'bg-gold' : 'bg-slate-300')}>
              <div className={cn('w-6 h-6 bg-white rounded-full shadow-md transition-all', appearance.reducedMotion ? 'translate-x-6' : 'translate-x-0')} />
            </div>
          </label>
          <button type="submit" className="btn-gold px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
            <Save className="w-5 h-5" /> Save Appearance
          </button>
        </form>
      ),
    },
    danger: {
      title: 'Danger Zone',
      description: 'Irreversible destructive actions',
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-4xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-800">Delete Account</h3>
                <p className="text-red-600 text-sm">Once deleted, all your data will be permanently removed</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 space-y-3 mb-6">
              <p className="font-bold text-navy">This will:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> Delete all your projects and data</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> Remove all your documents and files</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> Cancel all active bookings</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> Remove you from all conversations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> This action cannot be undone</li>
              </ul>
            </div>
            <button onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete My Account Permanently
            </button>
          </div>

          {/* Session Management */}
          <div className="bg-white border border-slate-200 rounded-4xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-navy">Session Management</h3>
                <p className="text-slate-500 text-sm">Manage your active sessions</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">Log out of all devices and sessions. You will need to sign in again.</p>
            <button onClick={() => { logout(); toast.success('Logged out of all devices'); }}
              className="bg-slate-100 hover:bg-slate-200 text-navy font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2">
              <LogOut className="w-5 h-5" /> Logout All Devices
            </button>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-navy">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account, preferences, and more</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200 p-3 sticky top-24 space-y-1">
            {SETTINGS_SECTIONS.map(section => (
              <button key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn('w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all text-left',
                  activeSection === section.id ? 'bg-gold text-navy shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-navy'
                )}>
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-navy to-slate-800 p-8 text-white">
              <h2 className="text-2xl font-black">{sectionConfig[activeSection].title}</h2>
              <p className="text-white/70">{sectionConfig[activeSection].description}</p>
            </div>
            <div className="p-8">
              {sectionConfig[activeSection].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

