import React, { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Normalize role values coming from the backend.
 *
 * Examples:
 *   "engineer"  -> "ENGINEER"
 *   "ENGINEER"  -> "ENGINEER"
 *   " Engineer " -> "ENGINEER"
 */
const normalizeRole = (role) => {
  if (role === null || role === undefined) {
    return '';
  }

  return String(role).trim().toUpperCase();
};

/**
 * Return the correct landing page for each authenticated role.
 *
 * These paths MUST match App.jsx.
 *
 * USER     -> /user
 * ENGINEER -> /engineer
 * ADMIN    -> /admin
 */
const getAuthenticatedRedirect = (role) => {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case 'ENGINEER':
      return '/engineer';

    case 'ADMIN':
      return '/admin';

    case 'USER':
      return '/user';

    default:
      return null;
  }
};

/**
 * Premium loading screen.
 */
const SessionLoadingScreen = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy flex items-center justify-center px-6">

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl animate-pulse" />

        <div
          className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-gold/5 blur-3xl animate-pulse"
          style={{
            animationDelay: '700ms',
          }}
        />

        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl" />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Logo / spinner */}
        <div className="relative h-20 w-20">

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-white/10" />

          {/* Spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-gold/30 animate-spin" />

          {/* Inner glow */}
          <div className="absolute inset-3 rounded-full bg-gold/10 blur-md animate-pulse" />

          {/* Center */}
          <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-black tracking-wider text-gold">
              P
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="mt-7 text-center">

          <h1 className="text-xl font-extrabold tracking-wide text-white">
            Planova
          </h1>

          <p className="mt-2 text-sm text-white/50 animate-pulse">
            Restoring your session...
          </p>

          <div className="mt-5 flex items-center justify-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce" />

            <span
              className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce"
              style={{ animationDelay: '150ms' }}
            />

            <span
              className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Authentication error screen.
 */
const SessionErrorScreen = ({ message }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy flex items-center justify-center px-6">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl opacity-60" />

        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-red-500/5 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl backdrop-blur-xl">

        {/* Error icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">

          <span className="text-2xl font-black text-red-400">
            !
          </span>

        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-white">
          Session Verification Failed
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-white/60">
          We couldn't verify your current session.
          Please sign in again.
        </p>

        {message && (
          <div className="mt-5 rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-3">
            <p className="break-words text-xs leading-relaxed text-red-300/80">
              {message}
            </p>
          </div>
        )}

        <a
          href="/login"
          className="mt-7 inline-flex items-center justify-center rounded-2xl bg-gold px-6 py-3 font-bold text-navy shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold/20"
        >
          Sign In Again
        </a>
      </div>
    </div>
  );
};

/**
 * Unknown / invalid role screen.
 */
const InvalidRoleScreen = ({ role }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy flex items-center justify-center px-6">

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl backdrop-blur-xl">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/20">
          <span className="text-2xl font-black text-amber-400">
            !
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-white">
          Account Role Not Recognized
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Your account was authenticated, but Planova could not
          determine which panel you should access.
        </p>

        {role && (
          <div className="mt-5 rounded-xl bg-white/5 px-4 py-3">
            <p className="text-xs text-white/40">
              Account role
            </p>

            <p className="mt-1 font-mono text-sm font-bold text-gold">
              {String(role)}
            </p>
          </div>
        )}

        <a
          href="/login"
          className="mt-7 inline-flex items-center justify-center rounded-2xl bg-gold px-6 py-3 font-bold text-navy transition-all duration-300 hover:-translate-y-0.5"
        >
          Return to Login
        </a>
      </div>
    </div>
  );
};

/**
 * Authentication layout.
 *
 * Responsibilities:
 *
 * - Display authentication pages.
 * - Wait for AuthContext session restoration.
 * - Redirect authenticated users to the correct panel.
 * - Never redirect while authentication is still loading.
 */
const AuthLayout = () => {
  const {
    user,
    loading,
    authState,
    authError,
  } = useAuth();

  const location = useLocation();

  /**
   * Calculate redirect only when role changes.
   */
  const redirectPath = useMemo(
    () => getAuthenticatedRedirect(user?.role),
    [user?.role]
  );

  /**
   * ==========================================================
   * DEVELOPMENT DEBUGGING
   * ==========================================================
   *
   * This makes authentication problems much easier to identify.
   */
  if (import.meta.env.DEV) {
    console.log('[AuthLayout]', {
      pathname: location.pathname,
      loading,
      authState,
      user,
      role: user?.role,
      redirectPath,
      authError,
    });
  }

  /**
   * ==========================================================
   * SESSION RESTORATION
   * ==========================================================
   */
  if (loading || authState === 'loading') {
    return <SessionLoadingScreen />;
  }

  /**
   * ==========================================================
   * AUTHENTICATED USER
   * ==========================================================
   *
   * Do not render Login/Register if a valid session exists.
   */
  if (user && authState === 'authenticated') {

    /**
     * Valid role → redirect to correct panel.
     */
    if (redirectPath) {
      return (
        <Navigate
          to={redirectPath}
          replace
        />
      );
    }

    /**
     * Authenticated but invalid/missing role.
     */
    return (
      <InvalidRoleScreen
        role={user?.role}
      />
    );
  }

  /**
   * ==========================================================
   * SESSION ERROR
   * ==========================================================
   */
  if (authState === 'error') {
    return (
      <SessionErrorScreen
        message={authError}
      />
    );
  }

  /**
   * ==========================================================
   * LOGIN / REGISTER / FORGOT PASSWORD
   * ==========================================================
   *
   * User is not authenticated.
   */
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy flex items-center justify-center px-4 py-8 sm:px-6">

      {/* ======================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Top-left glow */}
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-3xl opacity-60 animate-pulse" />

        {/* Bottom-right glow */}
        <div
          className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-gold/5 blur-3xl opacity-40 animate-pulse"
          style={{
            animationDelay: '700ms',
          }}
        />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl" />

        {/* Floating dots */}
        <div className="absolute left-[8%] top-[20%] h-2 w-2 rounded-full bg-gold/30 animate-pulse" />

        <div
          className="absolute right-[12%] top-[30%] h-1.5 w-1.5 rounded-full bg-gold/20 animate-pulse"
          style={{
            animationDelay: '800ms',
          }}
        />

        <div
          className="absolute bottom-[20%] left-[15%] h-1.5 w-1.5 rounded-full bg-gold/20 animate-pulse"
          style={{
            animationDelay: '1200ms',
          }}
        />

        <div
          className="absolute bottom-[12%] right-[20%] h-2 w-2 rounded-full bg-gold/20 animate-pulse"
          style={{
            animationDelay: '1600ms',
          }}
        />
      </div>

      {/* ======================================================
          AUTH CONTENT
      ====================================================== */}

      <div className="relative z-10 w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;