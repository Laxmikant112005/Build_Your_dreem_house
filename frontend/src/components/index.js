/**
 * Components Index
 * 
 * This folder contains reusable UI components that can be used across multiple pages.
 * Each component should be self-contained and focus on a single responsibility.
 * 
 * Component Types:
 * - Layout components (Navbar, Sidebar, Footer)
 * - Form components (Input, Button, Form)
 * - Display components (Card, Modal, Badge)
 * - Utility components (Loader, ErrorMessage)
 * 
 * Usage: Import components directly from their respective files
 * Example: import Navbar from './components/Navbar';
 */

// Export all reusable components
// Add new component exports here as needed

export { default as Navbar } from './Navbar';
export { default as DesignCard } from './DesignCard';
export { default as BookingForm } from './BookingForm';
export { default as BookingCard } from './BookingCard';
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminStats } from './AdminStats';
export { default as AdminTable } from './AdminTable';
export { default as AdminDesignForm } from './AdminDesignForm';
export { default as StatCard } from './StatCard';
export { default as ErrorMessage } from './ErrorMessage';
export { default as Loading, PageLoading, CardSkeleton } from './Loading';

