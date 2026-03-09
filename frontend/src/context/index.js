/**
 * Context Index
 * 
 * This folder contains React Context providers for global state management.
 * Context provides a way to pass data through the component tree without
 * passing props manually at every level.
 * 
 * Available Contexts:
 * - AuthContext: User authentication state and methods
 * 
 * Best Practices:
 * - Create separate contexts for unrelated state
 * - Use useReducer for complex state logic
 * - Keep context focused and granular
 * - Document context API in each file
 * 
 * Usage: Import context and provider from their respective files
 * Example: import { AuthProvider, useAuth } from './context/AuthContext';
 */

// Export all context providers and hooks
export { default as AuthContext, AuthProvider, useAuth } from './AuthContext';

// Add new context exports here as needed

