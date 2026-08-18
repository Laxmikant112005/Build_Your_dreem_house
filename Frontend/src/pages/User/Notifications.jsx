import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';
import { getSocket } from '../../utils/socket';
import { Bell, Check, X, Mail, Calendar, MessageSquare, Star, AlertTriangle, Info, Trash2, RefreshCw, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

const NOTIFICATION_ICONS = {
  booking: { icon: Calendar, color: 'bg-blue-500', label: 'Booking' },
  message: { icon: MessageSquare, color: 'bg-emerald-500', label: 'Message' },
  review: { icon: Star, color: 'bg-amber-500', label: 'Review' },
  system: { icon: Bell, color: 'bg-slate-500', label: 'System' },
  design: { icon: Star, color: 'bg-purple-500', label: 'Design' },
  appointment: { icon: Calendar, color: 'bg-teal-500', label: 'Appointment' },
  plot: { icon: MapPin, color: 'bg-green-500', label: 'Property' },
  promotion: { icon: Bell, color: 'bg-pink-500', label: 'Promotion' },
  default: { icon: Bell, color: 'bg-slate-400', label: 'Notification' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll({
        page: pagination.page,
        limit: 20,
        unreadOnly: filter === 'unread',
      });
      // notificationService.getAll returns the full axios response.
      // The body is { success, message, data: { notifications, unreadCount, pagination } }.
      const body = res.data?.data ?? res.data ?? {};
      setNotifications(body?.notifications || body || []);
      setUnreadCount(body?.unreadCount || 0);
      setPagination(prev => ({
        ...prev,
        totalPages: body?.pagination?.totalPages || 1,
        total: body?.pagination?.total || 0,
      }));
    } catch (err) {
      console.error('Failed to load notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filter]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

// Real-time socket listener setup
  useEffect(() => {
    let socket = null;
    let cancelled = false;
    (async () => {
      socket = await getSocket();
      if (!socket || cancelled) return;
      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
        toast(notif.title || 'New notification', { icon: '🔔' });
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notifications.find(n => n._id === id && !n.isRead)) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getIcon = (type) => {
    const config = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
    const Icon = config.icon;
    return { Icon, ...config };
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-2">Notifications</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            {unreadCount > 0 ? (
              <><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> {unreadCount} unread</>
            ) : (
              "You're all caught up"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all">
              <Check className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <button onClick={loadNotifications} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-3xl p-2 shadow-sm">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: `Read (${notifications.length - unreadCount})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setFilter(key); setPagination(p => ({ ...p, page: 1 })); }}
            className={cn('px-5 py-2.5 rounded-2xl text-sm font-bold transition-all',
              filter === key ? 'bg-gold text-navy shadow-md' : 'text-slate-600 hover:text-navy hover:bg-slate-100')}>
            {label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-3xl p-6 border border-slate-200">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50/50">
          <Bell className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-navy mb-3">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h3>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            {filter === 'unread'
              ? "You've read everything! Come back later for updates."
              : "You'll see updates here when engineers respond, projects are updated, or bookings are confirmed."}
          </p>
        </div>
      )}

      {/* Notification List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const { Icon, color, label } = getIcon(notification.type);
            const isUnread = !notification.isRead;

            return (
              <div key={notification._id}
                className={cn('group border border-slate-200 rounded-3xl p-5 hover:shadow-lg transition-all',
                  isUnread ? 'bg-gradient-to-r from-blue-50/80 to-white ring-1 ring-blue-100' : 'bg-white hover:-translate-y-0.5')}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h4 className="font-bold text-navy text-base leading-tight">{notification.title}</h4>
                      {isUnread && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mt-2 flex-shrink-0" />}
                    </div>
                    <p className="text-slate-600 text-sm mb-2 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">{label}</span>
                      <span>{formatDate(notification.createdAt)}</span>
                      {notification.priority === 'high' && (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <AlertTriangle className="w-3 h-3" /> High Priority
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUnread && (
                      <button onClick={() => handleMarkRead(notification._id)}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all" title="Mark as read">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notification._id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-400 rounded-xl transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-all">
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button key={pageNum} onClick={() => setPagination(p => ({ ...p, page: pageNum }))}
                  className={cn('w-10 h-10 rounded-2xl font-bold text-sm transition-all',
                    pagination.page === pageNum ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}>
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-all">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;

