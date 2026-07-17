import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, CheckCircle, Shield, Briefcase, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { Key, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: searchParams.get('role') || 'user'
  });
  const [otp, setOtp] = useState('');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Use login for final otpLogin
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const buildRegistrationPayload = () => {
    const payload = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role || 'user',
    };

    if (!payload.phone?.trim()) {
      delete payload.phone;
    } else {
      payload.phone = payload.phone.trim();
    }

    return payload;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = buildRegistrationPayload();
      await userService.register(payload);
      toast.success('Account created! Check OTP.');
      setCredential(payload.email);
      setStep('otp');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await userService.otpLogin(credential, otp);
      localStorage.setItem('token', result.accessToken);
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      toast.success('Welcome aboard!');
      navigate('/user');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid OTP';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2">Create Account</h2>
        <p className="text-slate-400">Join the premium home design community.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => handleRoleSelect('user')}
          className={cn(
            "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
            formData.role === 'user' 
              ? "bg-gold border-gold text-navy font-bold shadow-lg shadow-gold/20" 
              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-xs uppercase tracking-wider font-bold">I'm a Client</span>
        </button>
        <button 
          onClick={() => handleRoleSelect('engineer')}
          className={cn(
            "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
            formData.role === 'engineer' 
              ? "bg-gold border-gold text-navy font-bold shadow-lg shadow-gold/20" 
              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
          )}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-xs uppercase tracking-wider font-bold">I'm an Engineer</span>
        </button>
      </div>

{step === 'form' ? (
  <form onSubmit={handleRegister} className="space-y-5">
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300 ml-1">First Name</label>
      <div className="relative group">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="text" 
          autoComplete="given-name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          placeholder="John"
          required
        />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300 ml-1">Last Name</label>
      <div className="relative group">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="text" 
          autoComplete="family-name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          placeholder="Doe"
          required
        />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
      <div className="relative group">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="email" 
          autoComplete="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          placeholder="name@example.com"
          required
        />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300 ml-1">Phone Number</label>
      <div className="relative group">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="tel" 
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          placeholder="+1 555 0000"
        />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="password" 
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          placeholder="••••••••"
          required
        />
      </div>
    </div>
    <button 
      type="submit" 
      disabled={loading}
      className="w-full bg-white text-navy font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl hover:bg-gold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          Create Account <UserPlus className="w-5 h-5" />
        </>
      )}
    </button>
  </form>
) : (
  <form onSubmit={handleOtpSubmit} className="space-y-5">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-3xl flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-gold" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Verify OTP</h3>
      <p className="text-slate-400 mb-2">Sent to {credential}</p>
      <button type="button" onClick={() => setStep('form')} className="text-gold underline text-sm hover:no-underline">Edit Details</button>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-300 ml-1">Enter 6-digit OTP</label>
      <div className="relative group">
        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
        <input 
          type="text" 
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
          maxLength={6}
          className="w-full bg-white/5 border border-white/10 rounded-1.5xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-center text-2xl tracking-widest font-mono"
          placeholder="123456"
          required
        />
      </div>
      <p className="text-xs text-slate-500 text-center">Didn't receive? <button type="button" onClick={() => userService.otpSend(credential).then(() => toast('OTP resent'))} className="text-gold font-bold hover:underline">Resend</button></p>
    </div>
    <button 
      type="submit" 
      disabled={loading || otp.length !== 6}
      className="w-full bg-white text-navy font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl hover:bg-gold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          Verify & Login <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  </form>
)}

      <div className="mt-10 pt-8 border-t border-white/10 text-center">
        <p className="text-slate-400">Already a member?</p>
        <Link to="/login" className="inline-flex items-center gap-2 text-gold font-bold mt-2">
          Sign In to Your Dashboard
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          <Shield className="w-4 h-4 text-gold/50" /> Secure Encryption
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          <CheckCircle className="w-4 h-4 text-gold/50" /> Expert Verified
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default Register;

