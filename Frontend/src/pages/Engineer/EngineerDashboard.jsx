import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  ClipboardList,
  Star,
  Users,
  Eye,
  HardHat,
  Bell,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  BriefcaseBusiness,
  UserCheck,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { engineerService } from '../../services/engineerService';
import { cn } from '../../utils/cn';


/* ==========================================================================
   Helpers
   ========================================================================== */

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};


const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


const formatStatus = (value) => {
  if (!value) return 'Pending';

  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();


const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Failed to load dashboard'
  );
};


/* ==========================================================================
   Loading Skeleton
   ========================================================================== */

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-200 rounded-3xl" />

          <div>
            <div className="h-9 w-64 bg-slate-200 rounded-xl mb-2" />
            <div className="h-5 w-44 bg-slate-200 rounded-lg" />
          </div>
        </div>

        <div className="h-10 w-48 bg-slate-200 rounded-full" />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-32 bg-slate-200 rounded-[2rem]"
          />
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-96 bg-slate-200 rounded-[2rem]" />
          <div className="h-72 bg-slate-200 rounded-[2rem]" />
        </div>

        <div className="space-y-8">
          <div className="h-72 bg-slate-200 rounded-[2rem]" />
          <div className="h-80 bg-slate-200 rounded-[2rem]" />
        </div>
      </div>
    </div>
  </div>
);


/* ==========================================================================
   Empty State
   ========================================================================== */

const EmptyState = ({
  title,
  description,
  icon = FileText,
}) => (
  <div className="text-center py-12 px-5">
    <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-slate-100 flex items-center justify-center">
      {React.createElement(icon, { className: 'w-8 h-8 text-slate-300' })}
    </div>

    <h4 className="font-black text-slate-700 mb-2">
      {title}
    </h4>

    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
      {description}
    </p>
  </div>
);


/* ==========================================================================
   Mini Stat
   ========================================================================== */

const MiniStat = ({
  icon,
  label,
  value,
}) => (
  <div className="group bg-white rounded-[1.75rem] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="w-11 h-11 rounded-2xl bg-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
      {React.createElement(icon, { className: 'w-5 h-5 text-gold' })}
    </div>

    <p className="text-2xl font-black text-navy">
      {value}
    </p>

    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">
      {label}
    </p>
  </div>
);


/* ==========================================================================
   Stat Card
   ========================================================================== */

const StatCard = ({
  label,
  value,
  icon,
  color,
}) => (
  <div className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-slate-50 group-hover:scale-150 transition-transform duration-500" />

    <div className="relative flex items-center gap-4">
      <div
        className={cn(
          'w-13 h-13 min-w-[52px] rounded-2xl flex items-center justify-center',
          color
        )}
      >
        {React.createElement(icon, { className: 'w-6 h-6' })}
      </div>

      <div className="min-w-0">
        <p className="text-slate-500 font-semibold text-sm">
          {label}
        </p>

        <p className="text-3xl font-black text-navy mt-1">
          {value}
        </p>
      </div>
    </div>
  </div>
);


/* ==========================================================================
   Notification / Alert
   ========================================================================== */

const DashboardAlert = ({ alert }) => (
  <div className="group flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 hover:bg-blue-100 transition-colors">
    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
      <Bell className="w-5 h-5 text-blue-600" />
    </div>

    <div className="min-w-0">
      <p className="text-sm font-bold text-blue-800">
        {alert?.title || 'Notification'}
      </p>

      <p className="text-sm font-medium text-blue-700 mt-0.5">
        {alert?.message || 'You have a new notification.'}
      </p>
    </div>
  </div>
);


/* ==========================================================================
   Engineer Dashboard
   ========================================================================== */

const EngineerDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);


  /* ------------------------------------------------------------------------
     Fetch Dashboard
     ------------------------------------------------------------------------ */

  const fetchDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await engineerService.getDashboard();

        /*
         * Supports:
         *
         * response.data
         * response.data.data
         *
         * depending on axios/service implementation.
         */

        const payload =
          response?.data?.data &&
          typeof response.data.data === 'object'
            ? response.data.data
            : response?.data;

        setData(
          payload && typeof payload === 'object'
            ? payload
            : {}
        );
      } catch (requestError) {
        console.error(
          'Engineer dashboard error:',
          requestError
        );

        setError(
          getErrorMessage(requestError)
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ------------------------------------------------------------------------
     Initial Load
     ------------------------------------------------------------------------ */

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response =
          await engineerService.getDashboard();

        if (!active) return;

        const payload =
          response?.data?.data &&
          typeof response.data.data === 'object'
            ? response.data.data
            : response?.data;

        setData(
          payload && typeof payload === 'object'
            ? payload
            : {}
        );
      } catch (requestError) {
        if (!active) return;

        console.error(
          'Engineer dashboard error:',
          requestError
        );

        setError(
          getErrorMessage(requestError)
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);


  /* ------------------------------------------------------------------------
     Loading
     ------------------------------------------------------------------------ */

  if (loading) {
    return <DashboardSkeleton />;
  }


  /* ------------------------------------------------------------------------
     Error
     ------------------------------------------------------------------------ */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white border border-red-200 rounded-[2rem] p-8 md:p-12 text-center shadow-xl">

            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-navy mb-3">
              Could not load dashboard
            </h2>

            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
              {error}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  fetchDashboard()
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <Link
                to="/engineer/verification"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition"
              >
                Check Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }


  /* ------------------------------------------------------------------------
     Safe Data
     ------------------------------------------------------------------------ */

  const safeData = data || {};

  const p = safeData.profile || {};
  const w = safeData.work || {};
  const pf = safeData.portfolio || {};
  const r = safeData.reviews || {};
  const activity = safeData.activity || {};

  const alerts = Array.isArray(
    safeData.alerts
  )
    ? safeData.alerts
    : [];

  const recentBookings = Array.isArray(
    activity.recentBookings
  )
    ? activity.recentBookings
    : [];

  const recentAppointments = Array.isArray(
    activity.recentAppointments
  )
    ? activity.recentAppointments
    : [];

  const recentNotifications = Array.isArray(
    activity.recentNotifications
  )
    ? activity.recentNotifications
    : [];

  const recentReviews = Array.isArray(
    r.recent
  )
    ? r.recent
    : [];


  /* ------------------------------------------------------------------------
     Engineer Name
     ------------------------------------------------------------------------ */

  const firstName =
    user?.firstName ||
    p?.firstName ||
    p?.name?.split(' ')?.[0] ||
    user?.name?.split(' ')?.[0] ||
    'there';


  /* ------------------------------------------------------------------------
     Verification
     ------------------------------------------------------------------------ */

  const verificationStatus =
    normalizeStatus(
      p?.verificationStatus ||
      user?.verificationStatus
    ) || 'pending';


  const isVerified =
    verificationStatus === 'approved' ||
    verificationStatus === 'verified';


  const completion = Math.min(
    100,
    Math.max(
      0,
      safeNumber(
        p?.completion ??
        p?.profileCompletion ??
        0
      )
    )
  );


  /* ------------------------------------------------------------------------
     Stats
     ------------------------------------------------------------------------ */

  const stats = [
    {
      label: 'Active Projects',
      value: safeNumber(
        w?.activeProjects
      ),
      icon: HardHat,
      color: 'bg-navy text-gold',
    },
    {
      label: 'Pending Requests',
      value: safeNumber(
        w?.pendingBookings
      ),
      icon: ClipboardList,
      color: 'bg-amber-500 text-white',
    },
    {
      label: 'Approved Blueprints',
      value: safeNumber(
        pf?.publishedBlueprints
      ),
      icon: FileText,
      color: 'bg-emerald-500 text-white',
    },
    {
      label: 'Average Rating',
      value: safeNumber(
        r?.average
      ).toFixed(1),
      icon: Star,
      color: 'bg-gold text-navy',
    },
  ];


  /* ------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />

        <div className="absolute top-[45%] -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ==================================================================
            Header
            ================================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 md:w-16 md:h-16 bg-navy rounded-[1.25rem] flex items-center justify-center shadow-xl shrink-0">
              <LayoutDashboard className="w-7 h-7 md:w-8 md:h-8 text-gold" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight">
                  Engineer Dashboard
                </h1>

                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-slate-500 font-medium mt-1">
                Welcome back,{' '}
                <span className="font-bold text-slate-700">
                  {firstName}
                </span>
              </p>
            </div>
          </div>

          {!isVerified && (
            <div className={cn(
              'mb-8 rounded-[1.75rem] border px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
              verificationStatus === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            )}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-slate-800">
                    {verificationStatus === 'rejected'
                      ? 'Verification needs attention'
                      : 'Pending admin verification'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Your profile, dashboard, drafts, and uploads remain available. Public blueprint publishing unlocks after verification.
                  </p>
                </div>
              </div>
              <Link
                to="/engineer/verification"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition"
              >
                Review verification
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}


          <div className="flex flex-wrap items-center gap-3">

            {/* Verification */}
            <span
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold',
                isVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : verificationStatus ===
                    'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
              )}
            >
              <CheckCircle2 className="w-4 h-4" />

              {isVerified
                ? 'Verified'
                : `Verification ${formatStatus(
                    verificationStatus
                  )}`}
            </span>


            {/* Completion */}
            <Link
              to="/engineer/verification"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy text-white text-sm font-bold hover:bg-navy/90 transition"
            >
              Profile {completion}%
            </Link>


            {/* Refresh */}
            <button
              type="button"
              onClick={() =>
                fetchDashboard({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-gold hover:text-navy transition disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                className={cn(
                  'w-4 h-4',
                  refreshing &&
                    'animate-spin'
                )}
              />
            </button>
          </div>
        </div>


        {/* ==================================================================
            Alerts
            ================================================================== */}

        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {alerts
              .slice(0, 4)
              .map((alert, index) => (
                <DashboardAlert
                  key={
                    alert?.id ||
                    alert?._id ||
                    index
                  }
                  alert={alert}
                />
              ))}
          </div>
        )}


        {/* ==================================================================
            Stats
            ================================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          {stats.map(
            ({
              label,
              value,
              icon: Icon,
              color,
            }) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                icon={Icon}
                color={color}
              />
            )
          )}
        </div>


        {/* ==================================================================
            Main Content
            ================================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================================
              Left column
              ================================================================= */}

          <div className="lg:col-span-2 space-y-8">

            {/* Pending Requests */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">

              <div className="flex items-center justify-between gap-4 mb-6">

                <h3 className="text-xl md:text-2xl font-black text-navy flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>

                  Pending Requests
                </h3>

                <Link
                  to="/engineer/requests"
                  className="text-sm text-gold font-bold hover:underline inline-flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>


              {recentBookings.length > 0 ||
              recentAppointments.length >
                0 ? (
                <div className="divide-y divide-slate-100">

                  {/* Bookings */}
                  {recentBookings
                    .slice(0, 5)
                    .map((booking, index) => {
                      const id =
                        booking?.id ||
                        booking?._id ||
                        `booking-${index}`;

                      const client =
                        booking?.userId ||
                        booking?.clientId ||
                        {};

                      return (
                        <div
                          key={id}
                          className="py-4 flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">

                            <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition">
                              <Users className="w-5 h-5 text-slate-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-navy truncate">
                                {client?.firstName ||
                                  'Client'}{' '}
                                {client?.lastName ||
                                  ''}
                              </p>

                              <p className="text-sm text-slate-500 truncate">
                                {formatStatus(
                                  booking?.type ||
                                    'Consultation'
                                )}{' '}
                                •{' '}
                                {formatDate(
                                  booking?.startAt
                                )}
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 inline-flex px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase">
                            {formatStatus(
                              booking?.status ||
                                'pending'
                            )}
                          </span>
                        </div>
                      );
                    })}


                  {/* Appointments */}
                  {recentAppointments
                    .slice(0, 5)
                    .map(
                      (
                        appointment,
                        index
                      ) => {
                        const id =
                          appointment?.id ||
                          appointment?._id ||
                          `appointment-${index}`;

                        const client =
                          appointment?.clientId ||
                          appointment?.userId ||
                          {};

                        return (
                          <div
                            key={id}
                            className="py-4 flex items-center justify-between gap-4 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-11 h-11 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-navy truncate">
                                  {client?.firstName ||
                                    'Client'}{' '}
                                  {client?.lastName ||
                                    ''}
                                </p>

                                <p className="text-sm text-slate-500 truncate">
                                  {formatStatus(
                                    appointment?.type ||
                                      'Appointment'
                                  )}{' '}
                                  •{' '}
                                  {formatDate(
                                    appointment?.startAt
                                  )}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 inline-flex px-3 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 uppercase">
                              Appointment
                            </span>
                          </div>
                        );
                      }
                    )}
                </div>
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="No pending requests"
                  description="When users request a consultation or booking, their requests will appear here."
                />
              )}
            </div>


            {/* Recent Activity */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">

              <div className="flex items-center justify-between mb-6">

                <h3 className="text-xl md:text-2xl font-black text-navy flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gold" />
                  </div>

                  Recent Activity
                </h3>
              </div>


              {recentNotifications.length >
              0 ? (
                <div className="space-y-3">

                  {recentNotifications
                    .slice(0, 6)
                    .map(
                      (
                        notification,
                        index
                      ) => {
                        const id =
                          notification?.id ||
                          notification?._id ||
                          `notification-${index}`;

                        return (
                          <div
                            key={id}
                            className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition"
                          >
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                              <Bell className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-navy text-sm">
                                {notification?.title ||
                                  'Notification'}
                              </p>

                              <p className="text-sm text-slate-500 mt-0.5">
                                {notification?.message ||
                                  'You have a new notification.'}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              ) : (
                <EmptyState
                  icon={Bell}
                  title="No recent activity"
                  description="Your latest activity and notifications will appear here."
                />
              )}
            </div>
          </div>


          {/* =================================================================
              Right column
              ================================================================= */}

          <div className="space-y-8">

            {/* Reviews */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">

              <div className="flex items-center justify-between mb-5">

                <h4 className="font-black text-navy text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold fill-current" />
                  Reviews
                </h4>

                <Link
                  to="/engineer/reviews"
                  className="text-sm text-gold font-bold hover:underline"
                >
                  View
                </Link>
              </div>


              <div className="flex items-end gap-2 mb-5">
                <span className="text-5xl font-black text-navy">
                  {safeNumber(
                    r?.average
                  ).toFixed(1)}
                </span>

                <span className="text-slate-500 font-medium mb-2">
                  / 5 ·{' '}
                  {safeNumber(
                    r?.total
                  )}{' '}
                  reviews
                </span>
              </div>


              {recentReviews.length >
              0 ? (
                <div className="space-y-3">

                  {recentReviews
                    .slice(0, 2)
                    .map(
                      (
                        review,
                        index
                      ) => {
                        const rating = Math.min(
                          5,
                          Math.max(
                            0,
                            safeNumber(
                              review?.rating
                            )
                          )
                        );

                        const id =
                          review?.id ||
                          review?._id ||
                          `review-${index}`;

                        return (
                          <div
                            key={id}
                            className="bg-slate-50 rounded-2xl p-4"
                          >
                            <div className="flex items-center gap-2 mb-2">

                              <div className="flex">
                                {[0, 1, 2, 3, 4].map(
                                  (star) => (
                                    <Star
                                      key={
                                        star
                                      }
                                      className={cn(
                                        'w-3.5 h-3.5',
                                        star <
                                          rating
                                          ? 'text-gold fill-current'
                                          : 'text-slate-300'
                                      )}
                                    />
                                  )
                                )}
                              </div>

                              <span className="text-xs font-bold text-slate-500">
                                {rating}
                              </span>
                            </div>

                            <p className="text-sm text-slate-600 line-clamp-3">
                              {review?.comment ||
                                review?.title ||
                                'No review comment.'}
                            </p>
                          </div>
                        );
                      }
                    )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No reviews yet.
                </p>
              )}
            </div>


            {/* Quick Actions */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">

              <h4 className="font-black text-navy mb-5 text-lg">
                Quick Actions
              </h4>

              <div className="space-y-3">

                <Link
                  to="/engineer/blueprints/new"
                  className="group flex items-center gap-3 p-4 bg-gradient-to-r from-gold to-gold/80 text-navy rounded-2xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>

                  <span className="flex-1">
                    Upload Blueprint
                  </span>

                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>


                <Link
                  to="/engineer/availability"
                  className="group flex items-center gap-3 p-4 border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:border-gold hover:text-gold transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>

                  <span className="flex-1">
                    Set Availability
                  </span>

                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>


                <Link
                  to="/engineer/messages"
                  className="group flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl font-semibold hover:bg-blue-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>

                  <span className="flex-1">
                    Check Messages
                  </span>

                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>


            {/* Small Stats */}
            <div className="grid grid-cols-2 gap-4">

              <MiniStat
                icon={Eye}
                label="Profile Views"
                value={safeNumber(
                  p?.profileViews
                )}
              />

              <MiniStat
                icon={Users}
                label="Followers"
                value={safeNumber(
                  p?.followers
                )}
              />

              <MiniStat
                icon={ImageIcon}
                label="Portfolio Views"
                value={safeNumber(
                  pf?.views
                )}
              />

              <MiniStat
                icon={Calendar}
                label="Upcoming Appts"
                value={safeNumber(
                  w?.upcomingAppointments
                )}
              />
            </div>


            {/* Profile completion */}
            {completion < 100 && (
              <div className="bg-navy rounded-[2rem] p-6 text-white shadow-xl overflow-hidden relative">

                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gold/10" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-gold" />
                    </div>

                    <div>
                      <h4 className="font-black">
                        Complete your profile
                      </h4>

                      <p className="text-xs text-white/60">
                        Improve your visibility
                      </p>
                    </div>
                  </div>


                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-700"
                      style={{
                        width: `${completion}%`,
                      }}
                    />
                  </div>


                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">
                      Profile completion
                    </span>

                    <span className="font-black text-gold">
                      {completion}%
                    </span>
                  </div>


                  <Link
                    to="/engineer/verification"
                    className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-gold hover:underline"
                  >
                    Complete profile
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default EngineerDashboard;