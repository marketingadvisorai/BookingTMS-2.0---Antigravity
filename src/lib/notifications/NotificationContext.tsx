/**
 * Notification Context
 * Global state management for notifications
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationSettings } from '../../types/notifications';
import { defaultNotificationSettings } from '../../types/notifications';
import { mockNotifications } from './mockData';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner@2.0.3';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  clearSettings: () => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Function to get user-specific storage key
  const getStorageKey = useCallback(() => {
    return currentUser ? `notificationSettings_${currentUser.id}` : 'notificationSettings_guest';
  }, [currentUser]);

  // Function to load notification settings for the current user
  const loadUserSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return { ...defaultNotificationSettings, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to parse notification settings:', e);
        }
      }
    }
    return defaultNotificationSettings;
  }, [getStorageKey]);

  const [settings, setSettings] = useState<NotificationSettings>(loadUserSettings);

  // Reset settings when user changes
  useEffect(() => {
    setSettings(loadUserSettings());
  }, [loadUserSettings, currentUser?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;

    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(settings.soundVolume / 100 * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [settings.soundEnabled, settings.soundVolume]);

  // Check if we're in quiet hours
  const isQuietHours = useCallback(() => {
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = settings.quietHoursStart;
    const end = settings.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }, [settings.quietHoursEnabled, settings.quietHoursStart, settings.quietHoursEnd]);

  // Request desktop notification permission
  const requestDesktopPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (!settings.desktopEnabled || isQuietHours()) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Check if desktop notifications are enabled for this type
    const shouldShow = 
      (notification.type === 'booking' && settings.desktopForBookings) ||
      (notification.type === 'payment' && settings.desktopForPayments) ||
      (notification.type === 'cancellation' && settings.desktopForCancellations) ||
      (notification.type === 'message' && settings.desktopForMessages);

    if (!shouldShow) return;

    new Notification(notification.title, {
      body: notification.message,
      icon: '/notification-icon.png', // You can add an actual icon
      badge: '/notification-badge.png',
      tag: notification.id,
    });
  }, [settings, isQuietHours]);

  // Simulate receiving new notifications (for demo purposes)
  useEffect(() => {
    // Request desktop notification permission on mount
    requestDesktopPermission();

    // Simulate receiving a new notification every 2 minutes (for demo)
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'booking',
        priority: 'high',
        title: 'New Booking Received',
        message: `Demo booking created at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/bookings',
        actionLabel: 'View Booking',
        metadata: {
          bookingId: `BK-${Date.now()}`,
          amount: 180,
        },
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Play sound if enabled and not in quiet hours
      if (settings.soundEnabled && settings.soundForBookings && !isQuietHours()) {
        playNotificationSound();
      }

      // Show desktop notification
      showDesktopNotification(newNotification);

      // Show toast notification if in-app notifications are enabled
      if (settings.showInAppNotifications && !isQuietHours()) {
        toast.success(newNotification.title, {
          description: newNotification.message,
        });
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [settings, playNotificationSound, showDesktopNotification, isQuietHours, requestDesktopPermission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };

      // Save to user-specific localStorage
      if (typeof window !== 'undefined') {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }

      // Request desktop permission if enabling desktop notifications
      if (newSettings.desktopEnabled && !prev.desktopEnabled) {
        requestDesktopPermission();
      }

      return updated;
    });
  }, [requestDesktopPermission, getStorageKey]);

  // Function to clear notification settings (used on logout)
  const clearSettings = useCallback(() => {
    setSettings(defaultNotificationSettings);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
    clearSettings,
    playNotificationSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
