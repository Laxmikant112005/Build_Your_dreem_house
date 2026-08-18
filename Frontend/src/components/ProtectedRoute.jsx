import React, { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeRole = (role) => {
  if (role === null || role === undefined) {
    return '';
  }

  return String(role).trim().toUpperCase();
};

const ProtectedRoute = ({
  allowedRoles = [],
  children,
}) => {
  const {
    user,
    loading,
    authState,
    authError,
  } = useAuth();

  const location = useLocation();

  // ============================================================
  // NORMALIZE USER ROLE
  // ============================================================

  const normalizedUserRole = useMemo(() => {
    return normalizeRole(user?.role);
  }, [user?.role]);

  // ============================================================
  // NORMALIZE ALLOWED ROLES
  // ============================================================

  const normalizedAllowedRoles = useMemo(() => {
    return allowedRoles
      .map(normalizeRole)
      .filter(Boolean);
  }, [allowedRoles]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    if (loading) {
      return;
    }

    console.groupCollapsed(
      `%c[ProtectedRoute] ${location.pathname}`,
      'color:#d4af37;font-weight:bold;'
    );

    console.log('Authentication state:', authState);
    console.log('User:', user);
    console.log('Raw user role:', user?.role);
    console.log('Normalized user role:', normalizedUserRole);
    console.log('Allowed roles:', allowedRoles);
    console.log(
      'Normalized allowed roles:',
      normalizedAllowedRoles
    );

    const hasRoleAccess =
      normalizedAllowedRoles.length === 0 ||
      normalizedAllowedRoles.includes(normalizedUserRole);

    console.log('Role access:', hasRoleAccess);
    console.log('Auth error:', authError);

    console.groupEnd();
  }, [
    loading,
    authState,
    authError,
    user,
    allowedRoles,
    normalizedUserRole,
    normalizedAllowedRoles,
    location.pathname,
  ]);

  // ============================================================
  // AUTHENTICATION LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-navy flex items-center justify-center px-6">
        <div className="flex flex-col items-center">

          {/* Animated loader */}
          <div className="relative h-16 w-16">

            <div className="absolute inset-0 rounded-full border-4 border-white/10" />

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold animate-spin" />

            <div className="absolute inset-2 rounded-full bg-white/5 backdrop-blur-sm" />
          </div>

          <p className="mt-6 text-sm font-semibold tracking-wide text-white/70">
            Restoring your session...
          </p>

          <p className="mt-2 text-xs text-white/40">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // AUTH ERROR WITHOUT USER
  // ============================================================

  if (!user && authState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <span className="text-2xl font-black text-red-500">
              !
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-navy">
            Session Issue
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {authError ||
              'We could not restore your session. Please sign in again.'}
          </p>

          <a
            href="/login"
            className="mt-7 inline-flex items-center justify-center rounded-2xl bg-navy px-6 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // ============================================================
  // NOT AUTHENTICATED
  // ============================================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ============================================================
  // USER HAS NO ROLE
  // ============================================================

  if (!normalizedUserRole) {
    if (import.meta.env.DEV) {
      console.error(
        '[ProtectedRoute] User is authenticated but has no role.',
        user
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <span className="text-2xl font-black text-amber-600">
              !
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-navy">
            Account Role Missing
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Your account is authenticated, but no valid account
            role was returned. Please sign in again.
          </p>

          <a
            href="/login"
            className="mt-7 inline-flex items-center justify-center rounded-2xl bg-navy px-6 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign In Again
          </a>
        </div>
      </div>
    );
  }

  // ============================================================
  // ROLE AUTHORIZATION
  // ============================================================

  const roleRequired =
    normalizedAllowedRoles.length > 0;

  const hasRoleAccess =
    !roleRequired ||
    normalizedAllowedRoles.includes(normalizedUserRole);

  // ============================================================
  // ACCESS DENIED
  // ============================================================

  if (!hasRoleAccess) {
    if (import.meta.env.DEV) {
      console.error(
        '[ProtectedRoute] ACCESS DENIED',
        {
          path: location.pathname,
          userRole: user?.role,
          normalizedUserRole,
          allowedRoles,
          normalizedAllowedRoles,
          user,
        }
      );
    }

    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location.pathname,
          requiredRoles: normalizedAllowedRoles,
          userRole: normalizedUserRole,
        }}
      />
    );
  }

  // ============================================================
  // AUTHORIZED
  // ============================================================

  return children ? children : <Outlet />;
};

export default ProtectedRoute;