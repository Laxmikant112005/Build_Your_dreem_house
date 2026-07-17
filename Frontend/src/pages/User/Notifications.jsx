import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Bell, Mail, Check, X, Filter, Search } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notificationsData, setNotificationsData] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getByUser(user.id);
      setNotificationsData(data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      markAsRead(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const filteredNotifications = notificationsData.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const getTypeIcon = (type) => {
    const icons = {
      success: Check,
      error: X,
      info: Bell,
      warning: Bell
    };
    const Icon = icons[type] || icons.info;
    return <Icon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy mb-2">Notifications</h1>
          <p className="text-slate-500 font-medium">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        <button 
          onClick={fetchNotifications}
          className="btn-gold px-8 py-3 font-bold whitespace-nowrap"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-3xl p-2 px-4 shadow-sm">
        {[
          { key: 'all', label: `All (${notificationsData.length})` },
          { key: 'unread', label: `Unread (${notificationsData.filter(n => !n.read).length})` },
          { key: 'read', label: `Read (${notificationsData.filter(n => n.read).length})` }
        ].map(({ key, label }) => (
          <button
            key={key}
            className={cn(
              'px-4 py-2 rounded-2xl text-sm font-bold transition-all',
              filter === key 
                ? 'bg-gold text-navy shadow-md' 
                : 'text-slate-600 hover:text-navy hover:bg-slate-100'
            )}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
        <div className="flex-1 flex items-center ml-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm text-slate-500 font-medium">
            Last sync: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy mb-2">No notifications</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              You'll see updates here when engineers respond to your bookings or projects are updated.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type);
            const isUnread = !notification.read;
            
            return (
              <div
                key={notification.id}
                className={cn(
                  'group border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:border-gold/50',
                  isUnread ? 'bg-gradient-to-r from-blue-50 to-slate-50 ring-2 ring-blue-100' : 'hover:-translate-y-0.5'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg',
                    {
                      'bg-emerald-500': notification.type === 'success',
                      'bg-blue-500': notification.type === 'info',
                      'bg-red-500': notification.type === 'error',
                      'bg-amber-500': notification.type === 'warning'
                    }
                  )}>
                    {TypeIcon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h4 className="font-bold text-navy text-lg leading-tight truncate">
                        {notification.title}
                      </h4>
                      {isUnread && (
                        <span className="ml-auto flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.relatedBookingId && (
                        <Link 
                          to="/user/bookings"
                          className="text-gold hover:text-gold/80 font-medium flex items-center gap-1"
                        >
                          View Booking #{notification.relatedBookingId}
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className={cn(
                      "flex-shrink-0 p-2 rounded-xl hover:bg-slate-100 transition-colors ml-auto",
                      isUnread && "text-slate-600 hover:text-slate-800"
                    )}
                    disabled={!isUnread}
                  >
                    {isUnread ? 'Mark read' : <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;

