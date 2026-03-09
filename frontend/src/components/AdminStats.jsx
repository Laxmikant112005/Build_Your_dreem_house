import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaHome, 
  FaCalendarAlt, 
  FaClock 
} from 'react-icons/fa';
import StatCard from './StatCard';

/**
 * AdminStats Component
 * 
 * Displays dashboard statistics using reusable StatCard components.
 * Shows: Total Users, Total Designs, Total Bookings, Pending Bookings
 * 
 * @param {Object} stats - Statistics object containing:
 *   - totalUsers: Total number of users
 *   - totalDesigns: Total number of designs
 *   - totalBookings: Total number of bookings
 *   - pendingBookings: Number of pending bookings
 */
const AdminStats = ({ stats }) => {
  // Define stat card configurations
  const statCards = [
    {
      id: 'users',
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <FaUsers className="text-xl" />,
      color: 'bg-blue-500',
    },
    {
      id: 'designs',
      title: 'Total Designs',
      value: stats.totalDesigns || 0,
      icon: <FaHome className="text-xl" />,
      color: 'bg-green-500',
    },
    {
      id: 'bookings',
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: <FaCalendarAlt className="text-xl" />,
      color: 'bg-purple-500',
    },
    {
      id: 'pending',
      title: 'Pending Bookings',
      value: stats.pendingBookings || 0,
      icon: <FaClock className="text-xl" />,
      color: 'bg-amber-500',
    },
  ];

  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statCards.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </motion.div>
  );
};

export default AdminStats;

