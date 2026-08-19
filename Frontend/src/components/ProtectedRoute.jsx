import React, { useEffect, useMemo } from "react";
import {
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Normalize role values coming from the backend.
 *
 * Supports:
 * USER
 * user
 * User
 * ROLE_USER
 * " ENGINEER "
 */
const normalizeRole = (role) => {
  if (role === null || role === undefined) {
    return "";
  }

  return String(role)
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
};

/**
 * Convert allowedRoles into a safe normalized array.
 *
 * Supports:
 * allowedRoles={["USER", "ENGINEER"]}
 * allowedRoles="ENGINEER"
 */
const normalizeAllowedRoles = (roles) => {
  if (!roles) {
    return [];
  }

  const roleArray = Array.isArray(roles)
    ? roles
    : [roles];

  return roleArray
    .map(normalizeRole)
    .filter(Boolean);
};

/**
 * Safely convert authentication errors into displayable text.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return "We could not restore your session. Please sign in again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return String(error.message);
  }

  return "We could not restore your session. Please sign in again.";
};

/**
 * Generic authentication error screen.
 */
const AuthErrorScreen = ({
  title,
  message,
  buttonText = "Go to Login",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <span className="text-2xl font-black text-red-500">
            !
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-navy">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {message}
        </p>

        <Link
          to="/login"
          replace
          className="mt-7 inline-flex items-center justify-center rounded-2xl bg-navy px-6 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

/**
 * ProtectedRoute
 *
 * Authentication:
 * - User must be logged in.
 *
 * Authorization:
 * - If allowedRoles is provided, user's role must match.
 *
 * Example:
 *
 * <ProtectedRoute allowedRoles={["ENGINEER"]}>
 *   <EngineerDashboard />
 * </ProtectedRoute>
 *
 * Or:
 *
 * <Route
 *   element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
 * >
 *   <Route path="/admin/dashboard" element={<AdminDashboard />} />
 * </Route>
 */
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

  /**
   * Normalize current user's role.
   */
  const normalizedUserRole = useMemo(
    () => normalizeRole(user?.role),
    [user?.role]
  );

  /**
   * Normalize required roles.
   */
  const normalizedAllowedRoles = useMemo(
    () => normalizeAllowedRoles(allowedRoles),
    [allowedRoles]
  );

  /**
   * Preserve the complete requested URL.
   *
   * Example:
   * /engineer/projects?id=123#details
   *
   * instead of only:
   * /engineer/projects
   */
  const currentPath = useMemo(() => {
    return `${location.pathname}${location.search}${location.hash}`;
  }, [
    location.pathname,
    location.search,
    location.hash,
  ]);

  /**
   * Authentication error message.
   */
  const safeAuthError = useMemo(
    () => getErrorMessage(authError),
    [authError]
  );

  /**
   * Determine whether this route requires a specific role.
   *
   * Empty allowedRoles means:
   * any authenticated user may access.
   */
  const roleRequired =
    normalizedAllowedRoles.length > 0;

  /**
   * Role authorization.
   *
   * SECURITY:
   * If a role is required and the user has no role,
   * access is denied.
   */
  const hasRoleAccess =
    !roleRequired
      ? true
      : normalizedAllowedRoles.includes(
          normalizedUserRole
        );

  /**
   * Development diagnostics.
   *
   * This is intentionally kept out of production.
   */
  useEffect(() => {
    if (!import.meta.env.DEV || loading) {
      return;
    }

    console.groupCollapsed(
      `%c[ProtectedRoute] ${location.pathname}`,
      "color:#d4af37;font-weight:bold;"
    );

    console.log("Auth state:", authState);
    console.log("Authenticated:", Boolean(user));
    console.log("User role:", user?.role);
    console.log(
      "Normalized role:",
      normalizedUserRole
    );

    console.log(
      "Required roles:",
      normalizedAllowedRoles
    );

    console.log(
      "Role required:",
      roleRequired
    );

    console.log(
      "Role access:",
      hasRoleAccess
    );

    if (!hasRoleAccess && roleRequired) {
      console.error(
        "ACCESS DENIED: role mismatch",
        {
          currentPath,
          userRole: normalizedUserRole,
          requiredRoles: normalizedAllowedRoles,
        }
      );
    }

    if (authError) {
      console.error(
        "Authentication error:",
        authError
      );
    }

    console.groupEnd();
  }, [
    loading,
    authState,
    authError,
    user?.role,
    normalizedUserRole,
    normalizedAllowedRoles,
    roleRequired,
    hasRoleAccess,
    currentPath,
    location.pathname,
  ]);

  /**
   * ----------------------------------------------------------
   * 1. AUTHENTICATION LOADING
   * ----------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-navy flex items-center justify-center px-6">
        <div className="flex flex-col items-center">
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

  /**
   * ----------------------------------------------------------
   * 2. AUTHENTICATION FAILED
   * ----------------------------------------------------------
   *
   * Only show an authentication error if there is
   * genuinely no authenticated user.
   */
  if (!user && authState === "error") {
    return (
      <AuthErrorScreen
        title="Session Issue"
        message={safeAuthError}
      />
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. NOT AUTHENTICATED
   * ----------------------------------------------------------
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: currentPath,
        }}
      />
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. AUTHENTICATED BUT ROLE IS MISSING
   * ----------------------------------------------------------
   */
  if (!normalizedUserRole) {
    if (import.meta.env.DEV) {
      console.error(
        "[ProtectedRoute] Authenticated user has no valid role.",
        {
          user,
          currentPath,
        }
      );
    }

    return (
      <AuthErrorScreen
        title="Account Role Missing"
        message="Your account is authenticated, but no valid account role was returned. Please sign in again."
        buttonText="Sign In Again"
      />
    );
  }

  /**
   * ----------------------------------------------------------
   * 5. ROLE AUTHORIZATION
   * ----------------------------------------------------------
   */
  if (!hasRoleAccess) {
    if (import.meta.env.DEV) {
      console.error(
        "[ProtectedRoute] ACCESS DENIED",
        {
          path: currentPath,
          userRole: user?.role,
          normalizedUserRole,
          requiredRoles: normalizedAllowedRoles,
        }
      );
    }

    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: currentPath,
          requiredRoles: normalizedAllowedRoles,
          userRole: normalizedUserRole,
        }}
      />
    );
  }

  /**
   * ----------------------------------------------------------
   * 6. AUTHORIZED
   * ----------------------------------------------------------
   */
  return children || <Outlet />;
};

export default ProtectedRoute;