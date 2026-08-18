import React, { createContext, useContext, useReducer, useEffect } from 'react';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, { id: Date.now(), ...action.payload, read: false }];
    case 'MARK_READ':
      return state.map(n => n.id === action.payload ? { ...n, read: true } : n);
    case 'REMOVE_NOTIFICATION':
      return state.filter(n => n.id !== action.payload);
    case 'SET_NOTIFICATIONS':
      return action.payload;
    case 'CLEAR_ALL':
      return [];
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const addNotification = (message, type = 'info') => {
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { message, type: type || 'info', timestamp: new Date().toISOString() }
    });
    
    // Auto-remove after 5s
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: Date.now() });
    }, 5000);
  };

  const addPersistentNotification = (message, type = 'info') => {
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { message, type: type || 'info', timestamp: new Date().toISOString(), persistent: true }
    });
  };

  const markAsRead = (id) => {
    dispatch({ type: 'MARK_READ', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const unreadCount = notifications.filter(n => !n.read && !n.persistent).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      addPersistentNotification,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

