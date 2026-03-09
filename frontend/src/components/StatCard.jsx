import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatCard Component
 * 
 * A reusable stat card component for displaying dashboard statistics.
 * Features:
 * - Animated entrance with Framer Motion
 * - Hover effects
 * - Customizable icon and color
 * - Responsive design
 * 
 * @param {string} title - The label for the stat
 * @param {number|string} value - The numeric or string value to display
 * @param {React.ReactNode} icon - The icon component to display
 * @param {string} color - The background color class for the icon
 * @param {string} trend - Optional trend indicator (e.g., "+12%")
 * @param {boolean} loading - Whether the card is in loading state
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'bg-blue-500', 
  trend,
  loading = false 
}) => {
  // Animation variants for entrance
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  // Format large numbers with commas
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className={`${color} p-3 rounded-xl w-14 h-14 animate-pulse`} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -4,
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)'
      }}
      className="bg-white rounded-2xl shadow-md p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        {/* Text Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {formatValue(value)}
            </p>
            {trend && (
              <span className="text-sm font-medium text-green-600">
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* Icon Container */}
        <div className={`${color} p-3 rounded-xl shadow-sm`}>
          <span className="text-2xl block">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;

