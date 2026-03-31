import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'auth', title: 'مرحباً د. أحمد', body: 'تم تشغيل النظام الطبي بنجاح. نتمنى لك يوماً سعيداً.', time: 'الآن', read: false },
];

function timeAgo() {
  return 'الآن';
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const addNotification = useCallback(({ type, title, body }) => {
    const newNotif = {
      id: Date.now(),
      type,
      title,
      body,
      time: timeAgo(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotifications = useCallback((ids) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const markSelectedRead = useCallback((ids) => {
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      addNotification, 
      markOneRead, 
      markAllRead, 
      deleteNotifications, 
      markSelectedRead,
      clearAll, 
      unreadCount 
    }}>

      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
