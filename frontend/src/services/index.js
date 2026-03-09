/**
 * Services Index
 * 
 * This folder contains service modules for external integrations and business logic.
 * Main service: api.js - Axios instance and API method exports
 * 
 * Service Types:
 * - API services (HTTP requests to backend)
 * - Authentication services
 * - Storage services (localStorage, sessionStorage)
 * - Utility services (formatting, validation)
 * 
 * Usage: Import API methods from services/api
 * Example: import { authAPI, designAPI } from './services/api';
 */

// Main API service - exports axios instance and API methods
export { default as api, authAPI, userAPI, engineerAPI, designAPI, bookingAPI, reviewAPI, categoryAPI, recommendationAPI, chatAPI, notificationAPI, uploadAPI, adminAPI } from './api';

// Add new service exports here as needed

