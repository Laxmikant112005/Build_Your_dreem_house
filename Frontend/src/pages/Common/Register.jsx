import React, { useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Shield,
  Briefcase,
  Phone,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const ALLOWED_REGISTRATION_ROLES = {
  USER: 'user',
  ENGINEER: 'engineer',
};

const ROLE_ROUTES = {
  USER: '/user',
  ENGINEER: '/engineer',
  ADMIN: '/admin',
};

const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return null;
  }

  return role.trim().toUpperCase();
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRole = normalizeRole(
    searchParams.get('role')
  );

  const safeInitialRole =
    initialRole === 'ENGINEER'
      ? ALLOWED_REGISTRATION_ROLES.ENGINEER
      : ALLOWED_REGISTRATION_ROLES.USER;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: safeInitialRole,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const selectedRole = useMemo(
    () => normalizeRole(formData.role),
    [formData.role]
  );

  const handleRoleSelect = (role) => {
    const normalizedRole = normalizeRole(role);

    if (
      normalizedRole !== 'USER' &&
      normalizedRole !== 'ENGINEER'
    ) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      role:
        normalizedRole === 'ENGINEER'
          ? 'engineer'
          : 'user',
    }));

    setError('');
  };

  const buildRegistrationPayload = () => {
    const normalizedRole = normalizeRole(
      formData.role
    );

    const safeRole =
      normalizedRole === 'ENGINEER'
        ? 'engineer'
        : 'user';

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: safeRole,
    };

    const phone = formData.phone.trim();

    if (phone) {
      payload.phone = phone;
    }

    return payload;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const payload = buildRegistrationPayload();

      const registeredUser = await register(payload);

      /**
       * AuthContext normalizes the returned role.
       *
       * Example:
       * engineer -> ENGINEER
       * user     -> USER
       */
      const role = normalizeRole(
        registeredUser?.role
      );

      if (!role) {
        throw new Error(
          'Registration succeeded, but your account role could not be determined.'
        );
      }

      const destination =
        ROLE_ROUTES[role];

      if (!destination) {
        throw new Error(
          `Unsupported account role: ${role}`
        );
      }

      if (import.meta.env?.DEV) {
        console.info(
          '[Register] Registration successful:',
          {
            email: registeredUser?.email,
            role,
            destination,
          }
        );
      }

      toast.success(
        `Account created successfully${
          registeredUser?.firstName
            ? `, ${registeredUser.firstName}`
            : ''
        }!`
      );

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      const responseData =
        err?.response?.data;

      const errorPayload =
        responseData?.error ||
        responseData;

      const backendMessage =
        errorPayload?.message ||
        err?.message ||
        'Registration failed. Please try again.';

      const field =
        errorPayload?.field ||
        errorPayload?.path ||
        null;

      let message = backendMessage;

      if (field) {
        const fieldLabels = {
          email: 'Email address',
          phone: 'Phone number',
          username: 'Username',
          firstName: 'First name',
          lastName: 'Last name',
          password: 'Password',
          role: 'Account type',
        };

        const label =
          fieldLabels[field] ||
          field.charAt(0).toUpperCase() +
            field.slice(1);

        message = `${label}: ${backendMessage}`;
      }

      setError(message);
      toast.error(message);

      if (import.meta.env?.DEV) {
        console.error(
          '[Register] Registration error:',
          err
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-dark p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">

      {/* Decorative background */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <UserPlus className="w-7 h-7 text-gold" />
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2">
          Create Account
        </h2>

        <p className="text-slate-400">
          Join the Planova construction community.
        </p>
      </div>

      {/* Role selection */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">

        {/* Client */}
        <button
          type="button"
          onClick={() =>
            handleRoleSelect('user')
          }
          disabled={loading}
          aria-pressed={
            selectedRole === 'USER'
          }
          className={cn(
            'group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2',
            'hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed',
            selectedRole === 'USER'
              ? 'bg-gold border-gold text-navy font-bold shadow-lg shadow-gold/20'
              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
          )}
        >
          <User
            className={cn(
              'w-6 h-6 transition-transform duration-300',
              selectedRole === 'USER' &&
                'scale-110'
            )}
          />

          <span className="text-xs uppercase tracking-wider font-bold">
            I'm a Client
          </span>
        </button>

        {/* Engineer */}
        <button
          type="button"
          onClick={() =>
            handleRoleSelect('engineer')
          }
          disabled={loading}
          aria-pressed={
            selectedRole === 'ENGINEER'
          }
          className={cn(
            'group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2',
            'hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed',
            selectedRole === 'ENGINEER'
              ? 'bg-gold border-gold text-navy font-bold shadow-lg shadow-gold/20'
              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
          )}
        >
          <Briefcase
            className={cn(
              'w-6 h-6 transition-transform duration-300',
              selectedRole === 'ENGINEER' &&
                'scale-110'
            )}
          />

          <span className="text-xs uppercase tracking-wider font-bold">
            I'm an Engineer
          </span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-300 animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

          <span className="text-sm font-medium leading-relaxed">
            {error}
          </span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleRegister}
        className="space-y-5 relative z-10"
      >

        {/* First name */}
        <div className="space-y-2">
          <label
            htmlFor="register-first-name"
            className="text-sm font-bold text-slate-300 ml-1"
          >
            First Name
          </label>

          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="register-first-name"
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  firstName:
                    event.target.value,
                }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="John"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Last name */}
        <div className="space-y-2">
          <label
            htmlFor="register-last-name"
            className="text-sm font-bold text-slate-300 ml-1"
          >
            Last Name
          </label>

          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="register-last-name"
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  lastName:
                    event.target.value,
                }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="Doe"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="register-email"
            className="text-sm font-bold text-slate-300 ml-1"
          >
            Email Address
          </label>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  email:
                    event.target.value,
                }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="name@example.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor="register-phone"
            className="text-sm font-bold text-slate-300 ml-1"
          >
            Phone Number
          </label>

          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  phone:
                    event.target.value,
                }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="+91 9876543210"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="register-password"
            className="text-sm font-bold text-slate-300 ml-1"
          >
            Password
          </label>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors duration-300" />

            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  password:
                    event.target.value,
                }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-navy font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl hover:bg-gold hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />

              <span>Creating account...</span>
            </>
          ) : (
            <>
              Create Account
              <UserPlus className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Login */}
      <div className="mt-10 pt-8 border-t border-white/10 text-center relative z-10">
        <p className="text-slate-400">
          Already a member?
        </p>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gold font-bold mt-2 hover:gap-3 transition-all duration-300"
        >
          Sign In to Your Dashboard
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
          <Shield className="w-4 h-4 text-gold/50" />
          Secure Encryption
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
          <CheckCircle className="w-4 h-4 text-gold/50" />
          Expert Verified
        </div>
      </div>
    </div>
  );
};

export default Register;