/**
 * Notification Context
 * Global state management for notifications
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationSettings } from '../../types/notifications';
import { defaultNotificationSettings } from '../../types/notifications';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../supabase/client';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Save notification to Supabase
  const saveNotificationToDatabase = useCallback(async (notification: Notification) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          id: notification.id,
          user_id: currentUser.id,
          organization_id: currentUser.organizationId,
          type: notification.type,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          action_url: notification.actionUrl,
          action_label: notification.actionLabel,
          metadata: notification.metadata || {},
          created_at: notification.timestamp,
        } as any);

      if (error) {
        console.error('Error saving notification:', error);
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }, [currentUser]);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50); // Get last 50 notifications

      if (error) throw error;

      if (data) {
        const formattedNotifications: Notification[] = data.map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          priority: notif.priority,
          title: notif.title,
          message: notif.message,
          timestamp: notif.created_at,
          read: notif.read,
          actionUrl: notif.action_url,
          actionLabel: notif.action_label,
          metadata: notif.metadata,
        }));

        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time notifications from Supabase
  useEffect(() => {
    // Request desktop notification permission on mount
    requestDesktopPermission();

    if (!currentUser) return;

    // Set up Supabase Realtime subscription for new bookings
    const bookingsChannel = supabase
      .channel('bookings-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          const booking = payload.new as any;
          const newNotification: Notification = {
            id: `notif-booking-${Date.now()}`,
            type: 'booking',
            priority: 'high',
            title: 'New Booking Received',
            message: `Booking ${booking.booking_number} - ${booking.total_amount ? `$${booking.total_amount}` : 'Amount TBD'}`,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: '/bookings',
            actionLabel: 'View Booking',
            metadata: {
              bookingId: booking.id,
              amount: booking.total_amount,
            },
          };

          // Save to database
          saveNotificationToDatabase(newNotification);

          // Add to local state
          setNotifications(prev => [newNotification, ...prev]);

          if (settings.soundEnabled && settings.soundForBookings && !isQuietHours()) {
            playNotificationSound();
          }

          showDesktopNotification(newNotification);

          if (settings.showInAppNotifications && !isQuietHours()) {
            toast.success(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    // Set up subscription for booking updates (status changes)
    const bookingUpdatesChannel = supabase
      .channel('booking-updates-notifications')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          const booking = payload.new as any;
          const oldBooking = payload.old as any;

          // Only notify on status changes
          if (booking.status !== oldBooking.status) {
            let title = 'Booking Updated';
            let type: any = 'booking';
            let priority: any = 'medium';

            if (booking.status === 'cancelled') {
              title = 'Booking Cancelled';
              type = 'cancellation';
              priority = 'high';
            } else if (booking.status === 'confirmed') {
              title = 'Booking Confirmed';
              priority = 'high';
            }

            const newNotification: Notification = {
              id: `notif-update-${Date.now()}`,
              type,
              priority,
              title,
              message: `Booking ${booking.booking_number} status changed to ${booking.status}`,
              timestamp: new Date().toISOString(),
              read: false,
              actionUrl: '/bookings',
              actionLabel: 'View Details',
              metadata: {
                bookingId: booking.id,
                status: booking.status,
              },
            };

            setNotifications(prev => [newNotification, ...prev]);

            if (type === 'cancellation' && settings.soundEnabled && settings.soundForCancellations && !isQuietHours()) {
              playNotificationSound();
            }

            showDesktopNotification(newNotification);

            if (settings.showInAppNotifications && !isQuietHours()) {
              toast.info(newNotification.title, {
                description: newNotification.message,
              });
            }
          }
        }
      )
      .subscribe();

    // Set up subscription for new customers
    const customersChannel = supabase
      .channel('customers-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customers' },
        (payload) => {
          const customer = payload.new as any;
          const newNotification: Notification = {
            id: `notif-customer-${Date.now()}`,
            type: 'customer',
            priority: 'medium',
            title: 'New Customer Registered',
            message: `${customer.first_name} ${customer.last_name} - ${customer.email}`,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: '/customers',
            actionLabel: 'View Customer',
            metadata: {
              customerId: customer.id,
            },
          };

          setNotifications(prev => [newNotification, ...prev]);

          if (settings.showInAppNotifications && !isQuietHours()) {
            toast.success(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      bookingsChannel.unsubscribe();
      bookingUpdatesChannel.unsubscribe();
      customersChannel.unsubscribe();
    };
  }, [settings, playNotificationSound, showDesktopNotification, isQuietHours, requestDesktopPermission, currentUser]);

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
