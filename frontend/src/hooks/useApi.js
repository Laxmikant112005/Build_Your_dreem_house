import { useState, useCallback } from 'react';

/**
 * useApi Hook
 * 
 * A custom hook for handling API calls with loading states and error handling.
 * Provides consistent error handling across the application.
 * 
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - { execute, loading, error, data }
 * 
 * Usage:
 * const { execute, loading, error, data } = useApi(apiCall);
 * 
 * // Call the API
 * const result = await execute(param1, param2);
 */
const useApi = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      // Handle different error scenarios
      let errorMessage;
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || 
                       err.response.data?.error || 
                       `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        // Something else went wrong
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    clearError,
    clearData,
    isError: !!error,
    isSuccess: !!data && !error
  };
};

export default useApi;

