import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Backend never reveals whether the email exists, so any error here
      // is a genuine failure (e.g. network issue) - safe to surface.
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-3xl flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-gold" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
        <p className="text-slate-400 mb-8">
          If an account exists for <span className="text-white font-semibold">{email}</span>, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 text-gold font-bold hover:gap-4 transition-all">
          Back to Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2">Forgot Password</h2>
        <p className="text-slate-400">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              placeholder="name@example.com"
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
            <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-white/10 text-center">
        <Link to="/login" className="text-gold font-bold hover:underline">Back to Sign In</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
