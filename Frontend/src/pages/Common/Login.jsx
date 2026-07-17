import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (step === 'login') {
      try {
        const result = await userService.login(email, password);
        localStorage.setItem('token', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        toast.success('Welcome back!');
        navigate('/user');
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Login failed';
        if (msg.includes('verify OTP') || msg.includes('Please verify')) {
          await userService.otpSend(email);
          toast('OTP sent - enter below');
          setStep('otp');
          return;
        }
        toast.error(msg);
        setError(msg);
        if (msg.includes('429')) setBlocked(true);
      }
    } else {
      try {
        const result = await userService.otpLogin(email, otp);
        localStorage.setItem('token', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        toast.success('Login successful');
        navigate('/user');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invalid OTP');
        setError('Invalid OTP');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative">
      <div className="absolute -top-4 -right-4 bg-gold px-4 py-2 rounded-xl text-navy font-bold text-sm shadow-xl animate-bounce">
        Welcome Back!
      </div>
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2">{step === 'login' ? 'Member Login' : 'Verify OTP'}</h2>
        <p className="text-slate-400">{step === 'login' ? 'Access your personalized home dashboard.' : `OTP sent to ${email}`}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

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

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-bold text-slate-300">Password</label>
            <Link to="#" className="text-xs font-semibold text-gold hover:underline">Forgot password?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || blocked}
          className="w-full btn-gold py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl hover:shadow-gold/20 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Sign In <LogIn className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-white/10 text-center">
        <p className="text-slate-400">Don't have an account?</p>
        <Link to="/register" className="inline-flex items-center gap-2 text-gold font-bold mt-2 hover:gap-4 transition-all">
          Create Free Account <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest font-bold">Demo Accounts</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => { setEmail('user@test.com'); setPassword('password'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-gold transition-all">User</button>
          <button onClick={() => { setEmail('engineer@test.com'); setPassword('password'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-gold transition-all">Engineer</button>
          <button onClick={() => { setEmail('admin@test.com'); setPassword('password'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-gold transition-all">Admin</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
