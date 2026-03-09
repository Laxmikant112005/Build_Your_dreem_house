/**
 * Pages Index
 * 
 * This folder contains page-level components that represent complete views/routes.
 * Pages should primarily handle:
 * - Data fetching and state management
 * - Page-specific logic
 * - Layout composition using components
 * - Routing logic (if needed)
 * 
 * Best Practices:
 * - Keep pages thin - delegate logic to custom hooks or services
 * - Use components for UI rendering
 * - Handle loading and error states
 * - Include page-specific styles if needed
 * 
 * Usage: Import pages directly from their respective files
 * Example: import Dashboard from './pages/Dashboard';
 */

// Export all page components
// Add new page exports here as needed

export { default as LandingPage } from './LandingPage';
export { default as Login } from './Login';
export { default as Register } from './Register';
export { default as Dashboard } from './Dashboard';
export { default as Designs } from './Designs';
export { default as DesignDetails } from './DesignDetails';
export { default as MyBookings } from './MyBookings';
export { default as AdminDashboard } from './AdminDashboard';
export { default as AdminDesigns } from './AdminDesigns';
export { default as AdminBookings } from './AdminBookings';
export { default as AdminUsers } from './AdminUsers';

