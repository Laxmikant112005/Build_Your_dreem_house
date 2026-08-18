import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing or invalid. Please request a new one.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success('Password reset successful');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired reset link.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-3xl flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-gold" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password reset!</h2>
        <p className="text-slate-400">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2">Reset Password</h2>
        <p className="text-slate-400">Choose a new password for your account.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 ml-1">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 ml-1">Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-gold py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl hover:shadow-gold/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>Reset Password <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-white/10 text-center">
        <Link to="/login" className="text-gold font-bold hover:underline">Back to Sign In</Link>
      </div>
    </div>
  );
};

export default ResetPassword;
