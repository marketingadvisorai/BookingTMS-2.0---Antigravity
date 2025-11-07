/**
 * Mock Notification Data
 * Realistic notification examples for development and testing
 */

import type { Notification } from '../../types/notifications';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'booking',
    priority: 'high',
    title: 'New Booking Received',
    message: 'Sarah Johnson booked Mystery Manor for 6 guests on Nov 5, 2:00 PM',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    read: false,
    actionUrl: '/bookings',
    actionLabel: 'View Booking',
    metadata: {
      bookingId: 'BK-2024-1145',
      customerId: 'CUST-001',
      gameId: 'mystery-manor',
      amount: 180,
    },
  },
  {
    id: 'notif-002',
    type: 'payment',
    priority: 'medium',
    title: 'Payment Received',
    message: '$240.00 payment received from Michael Chen',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    read: false,
    actionUrl: '/payment-history',
    actionLabel: 'View Transaction',
    metadata: {
      bookingId: 'BK-2024-1144',
      customerId: 'CUST-002',
      amount: 240,
    },
  },
  {
    id: 'notif-003',
    type: 'cancellation',
    priority: 'high',
    title: 'Booking Cancelled',
    message: 'Emily Davis cancelled Space Odyssey booking for Nov 4, 4:30 PM',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: false,
    actionUrl: '/bookings',
    actionLabel: 'View Details',
    metadata: {
      bookingId: 'BK-2024-1143',
      customerId: 'CUST-003',
      gameId: 'space-odyssey',
    },
  },
  {
    id: 'notif-004',
    type: 'customer',
    priority: 'low',
    title: 'New Customer Registered',
    message: 'Jessica Martinez created an account',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    read: true,
    actionUrl: '/customers',
    actionLabel: 'View Profile',
    metadata: {
      customerId: 'CUST-005',
    },
  },
  {
    id: 'notif-005',
    type: 'alert',
    priority: 'urgent',
    title: 'High Demand Alert',
    message: 'Treasure Hunt is 90% booked for this weekend',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: true,
    actionUrl: '/games',
    actionLabel: 'View Capacity',
    metadata: {
      gameId: 'treasure-hunt',
      capacityPercent: 90,
    },
  },
  {
    id: 'notif-006',
    type: 'refund',
    priority: 'medium',
    title: 'Refund Processed',
    message: '$120.00 refund issued to James Wilson',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    read: true,
    actionUrl: '/payment-history',
    actionLabel: 'View Transaction',
    metadata: {
      bookingId: 'BK-2024-1140',
      customerId: 'CUST-004',
      amount: 120,
    },
  },
  {
    id: 'notif-007',
    type: 'booking',
    priority: 'high',
    title: 'New Booking Received',
    message: 'Alex Thompson booked Haunted Mansion for 4 guests on Nov 6, 7:00 PM',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: true,
    actionUrl: '/bookings',
    actionLabel: 'View Booking',
    metadata: {
      bookingId: 'BK-2024-1142',
      customerId: 'CUST-006',
      gameId: 'haunted-mansion',
      amount: 160,
    },
  },
  {
    id: 'notif-008',
    type: 'staff',
    priority: 'medium',
    title: 'Staff Assignment',
    message: 'John Smith assigned to Mystery Manor on Nov 5, 2:00 PM',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    read: true,
    actionUrl: '/staff',
    actionLabel: 'View Schedule',
    metadata: {
      staffId: 'STAFF-001',
      bookingId: 'BK-2024-1145',
      gameId: 'mystery-manor',
    },
  },
  {
    id: 'notif-009',
    type: 'message',
    priority: 'medium',
    title: 'Customer Message',
    message: 'Sarah Johnson sent a message about their upcoming booking',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: true,
    actionUrl: '/customers',
    actionLabel: 'View Message',
    metadata: {
      customerId: 'CUST-001',
      bookingId: 'BK-2024-1145',
    },
  },
  {
    id: 'notif-010',
    type: 'system',
    priority: 'low',
    title: 'System Update',
    message: 'New features available: Enhanced reporting and analytics',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/reports',
    actionLabel: 'Explore Features',
  },
  {
    id: 'notif-011',
    type: 'payment',
    priority: 'medium',
    title: 'Payment Received',
    message: '$320.00 payment received from David Brown',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/payment-history',
    actionLabel: 'View Transaction',
    metadata: {
      bookingId: 'BK-2024-1138',
      customerId: 'CUST-007',
      amount: 320,
    },
  },
  {
    id: 'notif-012',
    type: 'booking',
    priority: 'high',
    title: 'New Booking Received',
    message: 'Lisa Martinez booked Space Odyssey for 8 guests on Nov 7, 5:30 PM',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/bookings',
    actionLabel: 'View Booking',
    metadata: {
      bookingId: 'BK-2024-1141',
      customerId: 'CUST-005',
      gameId: 'space-odyssey',
      amount: 280,
    },
  },
];

export const getNotificationStats = (notifications: Notification[]) => {
  return {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: {
      booking: notifications.filter(n => n.type === 'booking').length,
      payment: notifications.filter(n => n.type === 'payment').length,
      cancellation: notifications.filter(n => n.type === 'cancellation').length,
      alert: notifications.filter(n => n.type === 'alert').length,
      system: notifications.filter(n => n.type === 'system').length,
    },
    byPriority: {
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length,
    },
  };
};
