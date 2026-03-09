import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

/**
 * ErrorMessage Component
 * 
 * A reusable component to display error messages with optional dismiss functionality.
 * 
 * @param {string} message - The error message to display
 * @param {string} type - Error type: 'error' | 'warning' | 'info'
 * @param {boolean} dismissible - Whether the error can be dismissed
 * @param {Function} onDismiss - Callback when error is dismissed
 */
const ErrorMessage = ({ 
  message, 
  type = 'error', 
  dismissible = true, 
  onDismiss 
}) => {
  if (!message) return null;

  // Style variants based on type
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500'
    }
  };

  const style = styles[type] || styles.error;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4`}
      >
        <div className="flex items-start gap-3">
          <FaExclamationCircle className={`${style.icon} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <p className={`${style.text} text-sm`}>{message}</p>
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className={`${style.icon} hover:opacity-70 transition-opacity`}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorMessage;

