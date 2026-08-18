import axios from 'axios';

/**
 * ============================================================
 * PLANOVA API CLIENT
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Attach access token to API requests.
 * 2. Handle expired access tokens.
 * 3. Refresh the access token only once when multiple requests
 *    receive 401 simultaneously.
 * 4. Retry the original request exactly once.
 * 5. Never refresh authentication endpoints recursively.
 * 6. Clear invalid sessions safely.
 * 7. Normalize backend errors.
 */

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// STORAGE HELPERS
// ============================================================

const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ============================================================
// AUTH ENDPOINT DETECTION
// ============================================================

const isAuthEndpoint = (url = '') => {
  const normalizedUrl = String(url);

  return (
    normalizedUrl.includes('/auth/login') ||
    normalizedUrl.includes('/auth/register') ||
    normalizedUrl.includes('/auth/refresh-token') ||
    normalizedUrl.includes('/auth/forgot-password') ||
    normalizedUrl.includes('/auth/reset-password') ||
    normalizedUrl.includes('/auth/verify-email') ||
    normalizedUrl.includes('/auth/resend-verification')
  );
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    /**
     * Do not overwrite an explicitly supplied Authorization header.
     */
    if (
      token &&
      !config.headers?.Authorization
    ) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }

    /**
     * Debug information in development.
     */
    if (import.meta.env.DEV) {
      console.log(
        '[Axios Request]',
        config.method?.toUpperCase(),
        config.url
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// ERROR MESSAGE NORMALIZATION
// ============================================================

const extractErrorMessage = (data) => {
  if (!data) {
    return null;
  }

  /**
   * Standard Planova error:
   *
   * {
   *   success: false,
   *   error: {
   *     code: '...',
   *     message: '...'
   *   }
   * }
   */
  if (
    data.error &&
    typeof data.error === 'object'
  ) {
    if (
      typeof data.error.message === 'string' &&
      data.error.message.trim()
    ) {
      return data.error.message;
    }

    if (
      Array.isArray(data.error.details) &&
      data.error.details.length > 0
    ) {
      const firstError = data.error.details.find(
        (item) =>
          item &&
          typeof item.message === 'string'
      );

      if (firstError) {
        return firstError.message;
      }
    }
  }

  /**
   * Legacy:
   *
   * {
   *   message: '...'
   * }
   */
  if (
    typeof data.message === 'string' &&
    data.message.trim()
  ) {
    return data.message;
  }

  /**
   * Validation:
   *
   * {
   *   errors: [
   *     { message: '...' }
   *   ]
   * }
   */
  if (
    Array.isArray(data.errors) &&
    data.errors.length > 0
  ) {
    const firstError = data.errors.find(
      (item) =>
        item &&
        (
          item.message ||
          item.msg
        )
    );

    if (firstError) {
      return (
        firstError.message ||
        firstError.msg
      );
    }
  }

  return null;
};

const getSafeErrorMessage = (
  status,
  data,
  fallback
) => {
  const backendMessage =
    extractErrorMessage(data);

  if (backendMessage) {
    return backendMessage;
  }

  switch (status) {
    case 400:
      return 'Invalid request. Please check your information.';

    case 401:
      return 'Your session has expired. Please sign in again.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'The requested resource was not found.';

    case 409:
      return 'This request conflicts with existing data.';

    case 422:
      return 'Some of the submitted information is invalid.';

    case 429:
      return 'Too many requests. Please try again later.';

    default:
      if (status >= 500) {
        return 'Something went wrong on the server. Please try again.';
      }

      return fallback || 'Something went wrong.';
  }
};

// ============================================================
// REFRESH TOKEN STATE
// ============================================================

let refreshPromise = null;

/**
 * Refresh the access token.
 *
 * IMPORTANT:
 * Uses the bare axios instance instead of `api`.
 *
 * This prevents:
 *
 * /auth/refresh-token
 *      ↓
 * response interceptor
 *      ↓
 * refresh
 *      ↓
 * refresh
 *      ↓
 * infinite loop
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      'No refresh token available.'
    );
  }

  console.log(
    '[Axios] Refreshing access token...'
  );

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh-token`,
    {
      refreshToken,
    },
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  /**
   * Support multiple backend response formats.
   *
   * Possible:
   *
   * response.data.data.accessToken
   * response.data.accessToken
   * response.data.data.token
   * response.data.token
   */

  const payload =
    response?.data?.data ||
    response?.data ||
    {};

  const newAccessToken =
    payload.accessToken ||
    payload.token ||
    payload.jwt ||
    payload.authToken;

  const newRefreshToken =
    payload.refreshToken ||
    payload.refresh_token ||
    refreshToken;

  if (!newAccessToken) {
    throw new Error(
      'Refresh endpoint did not return an access token.'
    );
  }

  localStorage.setItem(
    'accessToken',
    newAccessToken
  );

  if (newRefreshToken) {
    localStorage.setItem(
      'refreshToken',
      newRefreshToken
    );
  }

  console.log(
    '[Axios] Access token refreshed successfully.'
  );

  return newAccessToken;
};

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(

  /**
   * Successful response
   */
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        '[Axios Response]',
        response.status,
        response.config?.url
      );
    }

    return response;
  },

  /**
   * Failed response
   */
  async (error) => {
    const originalRequest =
      error?.config;

    const status =
      error?.response?.status;

    const requestUrl =
      originalRequest?.url || '';

    /**
     * --------------------------------------------------------
     * Normalize error message
     * --------------------------------------------------------
     */

    if (error.response) {
      const data =
        error.response.data;

      const safeMessage =
        getSafeErrorMessage(
          status,
          data,
          error.message
        );

      /**
       * Keep backend response available.
       */
      if (
        data &&
        typeof data === 'object'
      ) {
        data.message =
          safeMessage;
      }

      error.message =
        safeMessage;

      error.normalizedMessage =
        safeMessage;
    }

    /**
     * --------------------------------------------------------
     * Development logging
     * --------------------------------------------------------
     */

    if (import.meta.env.DEV) {
      console.error(
        '[Axios Error]',
        {
          status,
          url: requestUrl,
          message: error.message,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * No response
     * --------------------------------------------------------
     *
     * Usually:
     *
     * - backend is offline
     * - wrong API URL
     * - network problem
     * - CORS
     * - timeout
     */

    if (!error.response) {
      error.message =
        error.code === 'ECONNABORTED'
          ? 'The server took too long to respond.'
          : 'Unable to connect to the Planova server.';

      return Promise.reject(error);
    }

    /**
     * --------------------------------------------------------
     * Never refresh authentication endpoints
     * --------------------------------------------------------
     */

    if (
      status === 401 &&
      isAuthEndpoint(requestUrl)
    ) {
      clearSession();

      return Promise.reject(error);
    }

    /**
     * --------------------------------------------------------
     * Only refresh normal authenticated requests.
     * --------------------------------------------------------
     *
     * Conditions:
     *
     * 1. 401
     * 2. Request exists
     * 3. Request hasn't already been retried
     * 4. It isn't an authentication endpoint
     */

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(requestUrl)
    ) {
      originalRequest._retry = true;

      try {
        /**
         * ----------------------------------------------------
         * Queue simultaneous refresh requests.
         * ----------------------------------------------------
         *
         * If 5 requests receive 401 simultaneously:
         *
         * Request 1 → refresh
         * Request 2 → waits
         * Request 3 → waits
         * Request 4 → waits
         * Request 5 → waits
         *
         * Only ONE refresh request is sent.
         */

        if (!refreshPromise) {
          refreshPromise =
            refreshAccessToken().finally(
              () => {
                refreshPromise = null;
              }
            );
        }

        const newAccessToken =
          await refreshPromise;

        /**
         * ----------------------------------------------------
         * Retry original request.
         * ----------------------------------------------------
         */

        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization:
            `Bearer ${newAccessToken}`,
        };

        return api(
          originalRequest
        );

      } catch (refreshError) {

        console.error(
          '[Axios] Token refresh failed:',
          refreshError
        );

        clearSession();

        /**
         * Preserve a useful error.
         */
        refreshError.message =
          'Your session has expired. Please sign in again.';

        return Promise.reject(
          refreshError
        );
      }
    }

    /**
     * --------------------------------------------------------
     * 403
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * 403 is NOT automatically a login failure.
     *
     * It normally means:
     *
     * authenticated user
     *        +
     * insufficient permission / role
     *
     * Therefore we DO NOT clear the session here.
     */

    if (status === 403) {
      console.warn(
        '[Axios] Access denied:',
        requestUrl
      );

      return Promise.reject(error);
    }

    /**
     * --------------------------------------------------------
     * Everything else
     * --------------------------------------------------------
     */

    return Promise.reject(error);
  }
);

export default api;