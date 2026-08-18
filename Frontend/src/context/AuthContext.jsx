import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
};

/**
 * Normalize roles so frontend route protection is consistent.
 *
 * Examples:
 * "engineer"  -> "ENGINEER"
 * "Engineer"  -> "ENGINEER"
 * "ENGINEER"  -> "ENGINEER"
 */
const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return null;
  }

  return role.trim().toUpperCase();
};

/**
 * Normalize user object received from backend.
 */
const normalizeUser = (candidate) => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  // Avoid accidentally storing Axios response objects as users.
  if (
    candidate.data &&
    typeof candidate.data === 'object' &&
    !candidate.email &&
    !candidate.role &&
    !candidate._id &&
    !candidate.id
  ) {
    return normalizeUser(candidate.data);
  }

  const normalized = {
    ...candidate,
  };

  if (normalized.role) {
    normalized.role = normalizeRole(normalized.role);
  }

  return normalized;
};

/**
 * Safely extract user from different possible backend response formats.
 */
const extractUser = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  // Most common format:
  // { user: {...} }
  if (payload.user && typeof payload.user === 'object') {
    return normalizeUser(payload.user);
  }

  // Alternative formats.
  if (payload.profile && typeof payload.profile === 'object') {
    return normalizeUser(payload.profile);
  }

  if (payload.me && typeof payload.me === 'object') {
    return normalizeUser(payload.me);
  }

  if (
    payload.currentUser &&
    typeof payload.currentUser === 'object'
  ) {
    return normalizeUser(payload.currentUser);
  }

  // { data: { user: {...} } }
  if (payload.data && typeof payload.data === 'object') {
    const nestedUser = extractUser(payload.data);

    if (nestedUser) {
      return nestedUser;
    }

    // { data: { id, email, role, ... } }
    if (
      payload.data.email ||
      payload.data.role ||
      payload.data.id ||
      payload.data._id
    ) {
      return normalizeUser(payload.data);
    }
  }

  // Direct user object.
  if (
    payload.email ||
    payload.role ||
    payload.id ||
    payload._id
  ) {
    return normalizeUser(payload);
  }

  return null;
};

/**
 * Extract authentication tokens and user from API response.
 */
const normalizeAuthResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }

  // Axios response usually stores backend response here.
  const data =
    response.data && typeof response.data === 'object'
      ? response.data
      : response;

  const accessToken =
    data.accessToken ||
    data.token ||
    data.jwt ||
    data.authToken ||
    null;

  const refreshToken =
    data.refreshToken ||
    data.refreshTokenValue ||
    data.refresh_token ||
    null;

  const user = extractUser(data);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
  const [authError, setAuthError] = useState(null);

  const restoreStartedRef = useRef(false);

  /**
   * Clear all locally stored authentication information.
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    setUser(null);
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
    setAuthError(null);
  }, []);

  /**
   * Store a valid authenticated session.
   */
  const persistSession = useCallback((response) => {
    const {
      accessToken,
      refreshToken,
      user: authenticatedUser,
    } = normalizeAuthResponse(response);

    if (!accessToken) {
      throw new Error(
        'Authentication succeeded but no access token was returned.'
      );
    }

    if (!authenticatedUser) {
      throw new Error(
        'Authentication succeeded but no user information was returned.'
      );
    }

    const normalizedUser = normalizeUser(authenticatedUser);

    localStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      accessToken
    );

    // Refresh token is optional.
    if (refreshToken) {
      localStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        refreshToken
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(normalizedUser)
    );

    setUser(normalizedUser);
    setAuthState(AUTH_STATES.AUTHENTICATED);
    setAuthError(null);

    // Useful while debugging Engineer authorization.
    if (import.meta.env?.DEV) {
      console.info(
        '[Auth] Session persisted:',
        {
          userId: normalizedUser.id || normalizedUser._id,
          email: normalizedUser.email,
          role: normalizedUser.role,
        }
      );
    }

    return normalizedUser;
  }, []);

  /**
   * Restore an existing session when the application starts.
   */
  useEffect(() => {
    if (restoreStartedRef.current) {
      return;
    }

    restoreStartedRef.current = true;

    let mounted = true;

    const restoreSession = async () => {
      try {
        const savedUser = localStorage.getItem(
          STORAGE_KEYS.USER
        );

        const accessToken = localStorage.getItem(
          STORAGE_KEYS.ACCESS_TOKEN
        );

        if (!savedUser || !accessToken) {
          if (mounted) {
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            setAuthError(null);
          }

          return;
        }

        /**
         * First restore local user so the UI doesn't unnecessarily
         * flash to the login page.
         */
        let parsedUser;

        try {
          parsedUser = JSON.parse(savedUser);
        } catch {
          clearSession();
          return;
        }

        const localUser = normalizeUser(parsedUser);

        if (!localUser) {
          clearSession();
          return;
        }

        if (mounted) {
          setUser(localUser);
          setAuthState(AUTH_STATES.AUTHENTICATED);
          setAuthError(null);
        }

        /**
         * Revalidate the session against the backend.
         */
        try {
          const response = await userService.getMe();

          const serverUser = extractUser(
            response?.data ?? response
          );

          if (!serverUser) {
            throw new Error(
              'Unable to determine the authenticated user.'
            );
          }

          if (mounted) {
            const normalizedServerUser =
              normalizeUser(serverUser);

            setUser(normalizedServerUser);

            localStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(normalizedServerUser)
            );

            setAuthState(AUTH_STATES.AUTHENTICATED);
            setAuthError(null);

            if (import.meta.env?.DEV) {
              console.info(
                '[Auth] Session restored:',
                {
                  userId:
                    normalizedServerUser.id ||
                    normalizedServerUser._id,
                  email: normalizedServerUser.email,
                  role: normalizedServerUser.role,
                }
              );
            }
          }
        } catch (error) {
          if (!mounted) {
            return;
          }

          const status = error?.response?.status;

          /**
           * 401 means the token/session is invalid.
           * Clear authentication completely.
           */
          if (status === 401) {
            clearSession();
            return;
          }

          /**
           * A temporary backend/network error should NOT
           * automatically log the user out.
           */
          setAuthState(AUTH_STATES.ERROR);
          setAuthError(
            error?.response?.data?.message ||
              error?.message ||
              'Unable to verify your session.'
          );
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        clearSession();

        setAuthError(
          error?.message ||
            'Unable to restore your authentication session.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearSession]);

  /**
   * Login.
   */
  const login = useCallback(
    async (email, password) => {
      try {
        setAuthError(null);

        const response = await userService.login(
          email,
          password
        );

        const authenticatedUser =
          persistSession(response);

        toast.success('Login successful');

        return authenticatedUser;
      } catch (error) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Login failed. Please check your credentials.';

        setAuthError(message);

        throw error;
      }
    },
    [persistSession]
  );

  /**
   * Register.
   */
  const register = useCallback(
    async (userData) => {
      try {
        setAuthError(null);

        const response =
          await userService.register(userData);

        const registeredUser =
          persistSession(response);

        toast.success('Account created!');

        return registeredUser;
      } catch (error) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Registration failed.';

        setAuthError(message);

        throw error;
      }
    },
    [persistSession]
  );

  /**
   * Logout.
   */
  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } catch {
      // Local logout must still happen if API logout fails.
    } finally {
      clearSession();
      toast.success('Logged out successfully');
    }
  }, [clearSession]);

  /**
   * Forgot password.
   */
  const forgotPassword = useCallback(async (email) => {
    const response =
      await userService.forgotPassword(email);

    return response?.message;
  }, []);

  /**
   * Reset password.
   */
  const resetPassword = useCallback(
    async (token, password) => {
      const response =
        await userService.resetPassword(
          token,
          password
        );

      return response?.message;
    },
    []
  );

  /**
   * Update currently authenticated user.
   */
  const updateUser = useCallback((updatedData) => {
    setUser((currentUser) => {
      const updatedUser = normalizeUser({
        ...(currentUser || {}),
        ...(updatedData || {}),
      });

      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  }, []);

  /**
   * Convenient role helper.
   *
   * Example:
   * hasRole('ENGINEER')
   */
  const hasRole = useCallback(
    (requiredRole) => {
      if (!user?.role || !requiredRole) {
        return false;
      }

      return (
        normalizeRole(user.role) ===
        normalizeRole(requiredRole)
      );
    },
    [user]
  );

  /**
   * Convenient multi-role helper.
   *
   * Example:
   * hasAnyRole(['ENGINEER', 'ADMIN'])
   */
  const hasAnyRole = useCallback(
    (roles = []) => {
      if (!user?.role || !Array.isArray(roles)) {
        return false;
      }

      const currentRole = normalizeRole(user.role);

      return roles.some(
        (role) => normalizeRole(role) === currentRole
      );
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      authState,
      authError,

      isAuthenticated:
        authState === AUTH_STATES.AUTHENTICATED,

      role: normalizeRole(user?.role),

      hasRole,
      hasAnyRole,

      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateUser,

      clearSession,
    }),
    [
      user,
      loading,
      authState,
      authError,
      hasRole,
      hasAnyRole,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateUser,
      clearSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export {
  AUTH_STATES,
  normalizeRole,
  normalizeUser,
};