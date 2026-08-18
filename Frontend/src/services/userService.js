import axios from './axios';

/**
 * Planova User Service
 *
 * All authentication and user-related API requests live here.
 *
 * IMPORTANT:
 * Authentication headers should normally be handled by the shared
 * Axios instance/interceptor. Do not manually attach accessToken
 * inside individual requests unless absolutely necessary.
 */

const getErrorMessage = (error, fallback = 'Request failed') => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export const userService = {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  /**
   * Login
   */
  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email: email?.trim().toLowerCase(),
        password,
      });

      return response.data;
    } catch (error) {
      console.error('[userService.login]', error);
      throw error;
    }
  },

  /**
   * Register
   */
  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', {
        ...userData,
        email: userData?.email?.trim().toLowerCase(),
        firstName: userData?.firstName?.trim(),
        lastName: userData?.lastName?.trim(),
        phone: userData?.phone?.trim() || undefined,
        role: userData?.role || 'user',
      });

      return response.data;
    } catch (error) {
      console.error('[userService.register]', error);
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      const response = await axios.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.warn(
        '[userService.logout]',
        getErrorMessage(error, 'Logout request failed')
      );

      // Logout should not prevent local session cleanup.
      throw error;
    }
  },

  /**
   * Refresh access token
   *
   * This should normally be called by the Axios response interceptor.
   */
  refreshToken: async (refreshToken) => {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      const response = await axios.post('/auth/refresh-token', {
        refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error('[userService.refreshToken]', error);
      throw error;
    }
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', {
        email: email?.trim().toLowerCase(),
      });

      return response.data;
    } catch (error) {
      console.error('[userService.forgotPassword]', error);
      throw error;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (token, password) => {
    if (!token) {
      throw new Error('Reset token is required');
    }

    try {
      const response = await axios.post('/auth/reset-password', {
        token,
        password,
      });

      return response.data;
    } catch (error) {
      console.error('[userService.resetPassword]', error);
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return response.data;
    } catch (error) {
      console.error('[userService.changePassword]', error);
      throw error;
    }
  },

  /**
   * Verify email
   */
  verifyEmail: async (token) => {
    if (!token) {
      throw new Error('Verification token is required');
    }

    try {
      const response = await axios.get(
        `/auth/verify-email/${encodeURIComponent(token)}`
      );

      return response.data;
    } catch (error) {
      console.error('[userService.verifyEmail]', error);
      throw error;
    }
  },

  /**
   * Resend verification email
   */
  resendVerification: async () => {
    try {
      const response = await axios.post(
        '/auth/resend-verification'
      );

      return response.data;
    } catch (error) {
      console.error('[userService.resendVerification]', error);
      throw error;
    }
  },

  // ============================================================
  // CURRENT USER
  // ============================================================

  /**
   * Get currently authenticated user.
   *
   * IMPORTANT:
   *
   * Do NOT manually add Authorization here.
   *
   * The shared Axios interceptor should read:
   *
   * localStorage.accessToken
   *
   * and attach:
   *
   * Authorization: Bearer <token>
   *
   * This avoids duplicate authentication logic.
   */
  getMe: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        const error = new Error(
          'No access token found. Please sign in again.'
        );

        error.code = 'NO_ACCESS_TOKEN';

        throw error;
      }

      console.log('[userService.getMe] Requesting /auth/me');

      const response = await axios.get('/auth/me');

      console.log(
        '[userService.getMe] Response:',
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        '[userService.getMe]',
        getErrorMessage(error, 'Unable to retrieve current user')
      );

      throw error;
    }
  },

  // ============================================================
  // PROFILE
  // ============================================================

  /**
   * Get current user's profile.
   */
  getProfile: async () => {
    try {
      const response = await axios.get(
        '/users/profile/me'
      );

      return response.data;
    } catch (error) {
      console.error('[userService.getProfile]', error);
      throw error;
    }
  },

  /**
   * Update current user's profile.
   */
  updateProfile: async (data) => {
    try {
      const response = await axios.put(
        '/users/profile/me',
        data
      );

      return response.data;
    } catch (error) {
      console.error('[userService.updateProfile]', error);
      throw error;
    }
  },

  /**
   * Update user preferences.
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await axios.put(
        '/users/preferences/me',
        {
          preferences,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        '[userService.updatePreferences]',
        error
      );

      throw error;
    }
  },

  /**
   * Get all users.
   *
   * Admin endpoint.
   */
  getAll: async () => {
    try {
      const response = await axios.get('/users');

      return response.data;
    } catch (error) {
      console.error('[userService.getAll]', error);
      throw error;
    }
  },
};

export default userService;