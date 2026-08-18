import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, Trash2, AlertCircle, Clock, FileText,
  MessageSquare, Star, UserPlus, Calendar, Bookmark, Wrench,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';
import { cn } from '../../utils/cn';

const ICONS = {
  booking: Calendar,
  appointment: Calendar,
  message: MessageSquare,
  review: Star,
  system: FileText,
  design: FileText,
  promotion: Bell,
  plot: Wrench,
  collection: Bookmark,
  follow: UserPlus,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ limit: 100 });
      setNotifications(res?.data?.notifications || res?.data || []);
    } catch (e) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-4xl" />)}
        </div>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
            <Bell className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-navy">Notifications</h1>
            <p className="text-slate-600 font-medium">{unread > 0 ? `${unread} unread` : 'You are all caught up'}</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-3xl text-sm font-bold hover:bg-navy/90">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No notifications</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            When you receive new booking requests, messages, reviews, or project updates, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div
                key={n.id || n._id}
                onClick={() => !n.isRead && markAsRead(n.id || n._id)}
                className={cn(
                  'flex items-start gap-4 p-5 rounded-4xl border transition-colors cursor-pointer',
                  n.isRead ? 'bg-white border-slate-200 shadow-sm' : 'bg-gold/5 border-gold/30'
                )}
              >
                <div className={cn('w-11 h-11 rounded-3xl flex items-center justify-center shrink-0', n.isRead ? 'bg-slate-100' : 'bg-gold/20')}>
                  <Icon className={cn('w-5 h-5', n.isRead ? 'text-slate-400' : 'text-gold')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-navy truncate">{n.title}</h4>
                    {!n.isRead && <span className="w-2.5 h-2.5 bg-gold rounded-full shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(n.id || n._id); }}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
