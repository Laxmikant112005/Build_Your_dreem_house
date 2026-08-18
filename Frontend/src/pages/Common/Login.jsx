import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_ROUTES = {
  ENGINEER: '/engineer',
  ADMIN: '/admin',
  USER: '/user',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(
        email.trim(),
        password
      );

      /**
       * AuthContext normalizes roles to uppercase.
       *
       * ENGINEER
       * ADMIN
       * USER
       */
      const role = String(
        loggedInUser?.role || ''
      )
        .trim()
        .toUpperCase();

      if (!role) {
        throw new Error(
          'Login succeeded, but your account role could not be determined.'
        );
      }

      const destination = ROLE_ROUTES[role];

      if (!destination) {
        throw new Error(
          `Unsupported account role: ${role}`
        );
      }

      if (import.meta.env?.DEV) {
        console.info('[Login] Authentication successful:', {
          email: loggedInUser?.email,
          role,
          destination,
        });
      }

      toast.success(
        `Welcome back${loggedInUser?.firstName
          ? `, ${loggedInUser.firstName}`
          : ''}!`
      );

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.';

      setError(message);
      toast.error(message);

      if (import.meta.env?.DEV) {
        console.error(
          '[Login] Authentication error:',
          err
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-dark p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Welcome badge */}
      <div className="absolute top-4 right-4 bg-gold px-4 py-2 rounded-xl text-navy font-bold text-xs sm:text-sm shadow-xl animate-bounce">
        Welcome Back!
      </div>

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <LogIn className="w-7 h-7 text-gold" />
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2">
          Member Login
        </h2>

        <p className="text-slate-400">
          Access your personalized Planova dashboard.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

          <span className="text-sm font-medium leading-relaxed">
            {error}
          </span>
        </div>
      )}

      {/* Login form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 relative z-10"
      >
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-sm font-bold text-slate-300 ml-1"
          >
            Email Address
          </label>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="name@example.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label
              htmlFor="login-password"
              className="text-sm font-bold text-slate-300"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-gold hover:text-gold/80 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-gold py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl hover:shadow-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />

              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <LogIn className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Register */}
      <div className="mt-10 pt-8 border-t border-white/10 text-center relative z-10">
        <p className="text-slate-400">
          Don't have an account?
        </p>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-gold font-bold mt-2 hover:gap-4 transition-all duration-300"
        >
          Create Free Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Access information */}
      <div className="mt-8 pt-8 border-t border-white/10 text-center relative z-10">
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">
          Account Access
        </p>

        <p className="text-sm text-slate-400 leading-relaxed">
          Sign in with your registered email and password.
          Your account role automatically determines the
          dashboard you can access.
        </p>
      </div>
    </div>
  );
};

export default Login;