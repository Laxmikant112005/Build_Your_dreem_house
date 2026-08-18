import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';

// ============================================================
// LAYOUTS
// ============================================================

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import UserLayout from './layouts/UserLayout';

// ============================================================
// COMMON / AUTH PAGES
// ============================================================

import Home from './pages/Common/Home';
import Login from './pages/Common/Login';
import Register from './pages/Common/Register';
import ForgotPassword from './pages/Common/ForgotPassword';
import ResetPassword from './pages/Common/ResetPassword';
import VerifyEmail from './pages/Common/VerifyEmail';

// ============================================================
// USER PAGES
// ============================================================

import BlueprintMarketplace from './pages/User/BlueprintMarketplace';
import BlueprintDetail from './pages/User/BlueprintDetail';
import DesignDetails from './pages/User/DesignDetails';
import DesignMarketplace from './pages/User/DesignMarketplace';
import DesignDetailEnhanced from './pages/User/DesignDetailEnhanced';

import UserDashboard from './pages/User/UserDashboard';
import Bookings from './pages/User/Bookings';
import BookingDetails from './pages/User/BookingDetails';

import Notifications from './pages/User/Notifications';
import UserFeedback from './pages/User/Feedback';

import EngineersEnhanced from './pages/User/EngineersEnhanced';
import EngineerProfile from './pages/User/EngineerProfile';

import Favorites from './pages/User/Favorites';
import UserProfile from './pages/User/Profile';

import FieldMapping from './pages/User/FieldMapping';
import MapField from './pages/User/MapField';

import Marketplace from './pages/User/Marketplace';
import Cart from './pages/User/Cart';

import Properties from './pages/User/Properties';
import AddProperty from './pages/User/AddProperty';

import Projects from './pages/User/Projects';
import CreateProject from './pages/User/CreateProject';
import ProjectDetail from './pages/User/ProjectDetail';

import BudgetDashboard from './pages/User/BudgetDashboard';
import Documents from './pages/User/Documents';
import ConstructionMonitoring from './pages/User/ConstructionMonitoring';

import ChatList from './pages/User/ChatList';
import ChatWindow from './pages/User/ChatWindow';

import Settings from './pages/User/Settings';

// ============================================================
// ENGINEER PAGES
// ============================================================

import EngineerDashboard from './pages/Engineer/EngineerDashboard';
import UploadDesign from './pages/Engineer/UploadDesign';
import BookingRequests from './pages/Engineer/BookingRequests';
import EngineerAvailability from './pages/Engineer/EngineerAvailability';
import MyDesigns from './pages/Engineer/MyDesigns';
import EngineerReviews from './pages/Engineer/EngineerReviews';
import EngineerMessages from './pages/Engineer/EngineerMessages';
import EngineerProfilePage from './pages/Engineer/Profile';
import Verification from './pages/Engineer/Verification';
import NewBlueprint from './pages/Engineer/NewBlueprint';
import Consultations from './pages/Engineer/Consultations';
import EngineerNotifications from './pages/Engineer/Notifications';
import EngineerProjects from './pages/Engineer/Projects';
import EngineerProjectDetail from './pages/Engineer/ProjectDetail';
import EngineerAnalytics from './pages/Engineer/Analytics';

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminFeedback from './pages/Admin/Feedback';
import AdminUsers from './pages/Admin/Users';
import AdminEngineersPage from './pages/Admin/AdminEngineers';
import EngineerDetails from './pages/Admin/EngineerDetails';
import EditEngineer from './pages/Admin/EditEngineer';

import AdminDesigns from './pages/Admin/AdminDesigns';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminTransactions from './pages/Admin/AdminTransactions';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminSecurity from './pages/Admin/AdminSecurity';

// ============================================================
// ROLE CONSTANTS
// ============================================================
//
// ProtectedRoute should ideally normalize these internally.
// Keeping them in one place prevents role spelling mistakes.
//
// Backend may return:
//   USER / user
//   ENGINEER / engineer
//   ADMIN / admin
//
// ProtectedRoute should handle the case normalization.
// ============================================================

const ROLES = {
  USER: 'user',
  ENGINEER: 'engineer',
  ADMIN: 'admin',
};

// ============================================================
// ACCESS DENIED PAGE
// ============================================================

const Unauthorized = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">

        {/* 403 Badge */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20">
          <span className="text-3xl font-black text-red-500">
            403
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy">
          Access Denied
        </h1>

        {/* Decorative line */}
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold" />

        {/* Description */}
        <p className="mt-6 text-slate-500 leading-relaxed">
          You do not have permission to access this resource.
          Please sign in with an account that has the required
          access level.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">

          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign In
          </a>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-gold"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
        }}
      />

      <Routes>

        {/* ====================================================
            PUBLIC ROUTES
        ==================================================== */}

        <Route element={<MainLayout />}>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Blueprint marketplace */}
          <Route
            path="/blueprints"
            element={<BlueprintMarketplace />}
          />

          <Route
            path="/blueprints/:id"
            element={<BlueprintDetail />}
          />

          {/* Public design details */}
          <Route
            path="/designs/:id"
            element={<DesignDetails />}
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

        </Route>

        {/* ====================================================
            AUTHENTICATION ROUTES
        ==================================================== */}

        <Route element={<AuthLayout />}>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

        </Route>

        {/* ====================================================
            USER PANEL
        ==================================================== */}

        <Route
          path="/user/*"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.USER]}
            >
              <UserLayout />
            </ProtectedRoute>
          }
        >

          {/* Default User Dashboard */}
          <Route
            index
            element={<UserDashboard />}
          />

          {/* Field / Property */}
          <Route
            path="field-mapping"
            element={<FieldMapping />}
          />

          <Route
            path="map-field"
            element={<MapField />}
          />

          <Route
            path="properties"
            element={<Properties />}
          />

          <Route
            path="properties/add"
            element={<AddProperty />}
          />

          {/* Designs */}
          <Route
            path="designs"
            element={<DesignMarketplace />}
          />

          <Route
            path="designs/:id"
            element={<DesignDetailEnhanced />}
          />

          {/* Bookings */}
          <Route
            path="bookings"
            element={<Bookings />}
          />

          <Route
            path="bookings/:id"
            element={<BookingDetails />}
          />

          {/* Engineers */}
          <Route
            path="engineers"
            element={<EngineersEnhanced />}
          />

          <Route
            path="engineers/:id"
            element={<EngineerProfile />}
          />

          {/* Marketplace */}
          <Route
            path="marketplace"
            element={<Marketplace />}
          />

          <Route
            path="cart"
            element={<Cart />}
          />

          <Route
            path="favorites"
            element={<Favorites />}
          />

          {/* Projects */}
          <Route
            path="projects"
            element={<Projects />}
          />

          <Route
            path="projects/new"
            element={<CreateProject />}
          />

          <Route
            path="projects/:id"
            element={<ProjectDetail />}
          />

          {/* Finance */}
          <Route
            path="budgets"
            element={<BudgetDashboard />}
          />

          {/* Documents */}
          <Route
            path="documents"
            element={<Documents />}
          />

          {/* Construction */}
          <Route
            path="construction"
            element={<ConstructionMonitoring />}
          />

          {/* Communication */}
          <Route
            path="chat"
            element={<ChatList />}
          />

          <Route
            path="chat/:id"
            element={<ChatWindow />}
          />

          {/* Notifications */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* Feedback */}
          <Route
            path="feedback"
            element={<UserFeedback />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<UserProfile />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

        {/* ====================================================
            ENGINEER PANEL
        ==================================================== */}

        <Route
          path="/engineer/*"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ENGINEER]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* Default Engineer Dashboard */}
          <Route
            index
            element={<EngineerDashboard />}
          />

          {/* Explicit Dashboard URL */}
          <Route
            path="dashboard"
            element={<EngineerDashboard />}
          />

          {/* Designs */}
          <Route
            path="designs"
            element={<MyDesigns />}
          />

          <Route
            path="upload"
            element={<UploadDesign />}
          />

          {/* Blueprints */}
          <Route
            path="blueprints/new"
            element={<NewBlueprint />}
          />

          {/* Booking / Requests */}
          <Route
            path="requests"
            element={<BookingRequests />}
          />

          <Route
            path="consultations"
            element={<Consultations />}
          />

          {/* Availability */}
          <Route
            path="availability"
            element={<EngineerAvailability />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<EngineerProfilePage />}
          />

          {/* Verification */}
          <Route
            path="verification"
            element={<Verification />}
          />

          {/* Reviews */}
          <Route
            path="reviews"
            element={<EngineerReviews />}
          />

          {/* Messages */}
          <Route
            path="messages"
            element={<EngineerMessages />}
          />

          {/* Notifications */}
          <Route
            path="notifications"
            element={<EngineerNotifications />}
          />

          {/* Projects */}
          <Route
            path="projects"
            element={<EngineerProjects />}
          />

          <Route
            path="projects/:id"
            element={<EngineerProjectDetail />}
          />

          {/* Analytics */}
          <Route
            path="analytics"
            element={<EngineerAnalytics />}
          />

        </Route>

        {/* ====================================================
            ADMIN PANEL
        ==================================================== */}

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* Default Admin Dashboard */}
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* Feedback */}
          <Route
            path="feedback"
            element={<AdminFeedback />}
          />

          {/* Users */}
          <Route
            path="users"
            element={<AdminUsers />}
          />

          {/* Engineers */}
          <Route
            path="engineers"
            element={<AdminEngineersPage />}
          />

          <Route
            path="engineers/:id"
            element={<EngineerDetails />}
          />

          <Route
            path="engineers/edit/:id"
            element={<EditEngineer />}
          />

          {/* Designs */}
          <Route
            path="designs"
            element={<AdminDesigns />}
          />

          {/* Products */}
          <Route
            path="products"
            element={<AdminProducts />}
          />

          {/* Transactions */}
          <Route
            path="transactions"
            element={<AdminTransactions />}
          />

          {/* Analytics */}
          <Route
            path="analytics"
            element={<AdminAnalytics />}
          />

          {/* Security */}
          <Route
            path="security"
            element={<AdminSecurity />}
          />

        </Route>

        {/* ====================================================
            CATCH-ALL
        ==================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}

export default App;