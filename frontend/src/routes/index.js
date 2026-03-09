/**
 * Routes Index
 * 
 * This folder contains routing-related components and configurations.
 * Handles:
 * - Route definitions and protections
 * - Authentication guards
 * - Route-based code splitting
 * - Navigation logic
 * 
 * Route Types:
 * - Public routes: accessible to all users
 * - Protected routes: require authentication
 * - Admin routes: require admin role
 * 
 * Usage: Import route components directly
 * Example: import ProtectedRoute from './routes/ProtectedRoute';
 */

// Export all route-related components
export { default as ProtectedRoute } from './ProtectedRoute';

// Add new route exports here as needed

