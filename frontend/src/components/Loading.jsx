import React from 'react';

/**
 * Loading Component
 * 
 * A reusable loading spinner with multiple variants:
 * - Spinner: Rotating circle animation
 * - Skeleton: Placeholder loading for content
 * - Page: Full-page loading overlay
 */
const Loading = ({ 
  variant = 'spinner', 
  size = 'md', 
  text = 'Loading...', 
  fullPage = false,
  className = '' 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Spinner variant
  if (variant === 'spinner') {
    const spinner = (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary 
                        rounded-full animate-spin`} />
        {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
      </div>
    );

    if (fullPage) {
      return (
        <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center 
                        justify-center ${className}`}>
          {spinner}
        </div>
      );
    }

    return spinner;
  }

  // Skeleton variant
  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-full w-full" />
      </div>
    );
  }

  // Card skeleton
  if (variant === 'card-skeleton') {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden shadow-md ${className}`}>
        <div className="h-64 bg-gray-200 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="flex gap-4 pt-4">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Page Loading Component
 * Full page loading with spinner
 */
export const PageLoading = ({ text = 'Loading...' }) => (
  <Loading variant="spinner" size="lg" text={text} fullPage />
);

/**
 * Card Skeleton Array
 * For loading multiple cards at once
 */
export const CardSkeleton = ({ count = 3, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <Loading key={i} variant="card-skeleton" />
      ))}
    </div>
  );
};

export default Loading;

