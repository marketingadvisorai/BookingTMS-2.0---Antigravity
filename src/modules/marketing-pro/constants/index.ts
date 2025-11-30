/**
 * MarketingPro 1.1 - Constants
 * @description Centralized constants and default values
 */

import type { TabConfig, EmailTemplate } from '../types';

// Tab configuration for navigation
export const MARKETING_TABS: TabConfig[] = [
  { 
    id: 'promotions', 
    label: 'Promotions', 
    icon: 'Percent',
    description: 'Manage discount codes and special offers',
    color: 'blue'
  },
  { 
    id: 'gift-cards', 
    label: 'Gift Cards', 
    icon: 'Gift',
    description: 'Create and track gift card sales',
    color: 'pink'
  },
  { 
    id: 'reviews', 
    label: 'Reviews', 
    icon: 'Star',
    description: 'Monitor and respond to customer feedback',
    color: 'yellow'
  },
  { 
    id: 'email', 
    label: 'Email Campaigns', 
    icon: 'Mail',
    description: 'Send targeted marketing emails',
    color: 'purple'
  },
  { 
    id: 'affiliate', 
    label: 'Affiliates', 
    icon: 'UserPlus',
    description: 'Manage affiliate partners and commissions',
    color: 'green'
  },
];

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES: Omit<EmailTemplate, 'lastModified'>[] = [
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    category: 'transactional',
    subject: '🎉 Confirmed! Your {{escaperoomName}} Adventure',
    preheader: 'Your adventure is confirmed!',
    body: 'Hi {{customerName}},\n\n🎊 Your booking is CONFIRMED!\n\n🎯 DETAILS\n🎮 Room: {{escaperoomName}}\n📅 Date: {{bookingDate}}\n⏰ Time: {{bookingTime}}\n👥 Players: {{playerCount}}\n🎫 ID: #{{bookingId}}',
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'playerCount', 'bookingId'],
    icon: 'CheckCircle',
    description: 'Sent after successful booking',
    isActive: true,
  },
  {
    id: 'booking-reminder',
    name: 'Booking Reminder (24hr)',
    category: 'transactional',
    subject: '⏰ Tomorrow! Your {{escaperoomName}} Adventure',
    preheader: 'Your adventure is tomorrow!',
    body: 'Hi {{customerName}},\n\n⏰ REMINDER: Your adventure is TOMORROW!\n\n📅 Date: {{bookingDate}}\n⏰ Time: {{bookingTime}}\n📍 Location: {{businessAddress}}',
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'businessAddress'],
    icon: 'Clock',
    description: '24-hour booking reminder',
    isActive: true,
  },
  {
    id: 'digital-waiver',
    name: 'Digital Waiver Request',
    category: 'transactional',
    subject: '📝 Complete Your Waiver - {{escaperoomName}}',
    preheader: 'Quick waiver before your visit',
    body: 'Hi {{customerName}},\n\n📝 Please complete your digital waiver:\n{{waiverLink}}\n\n⏱️ Takes 2 minutes\n✅ Required before arrival',
    variables: ['customerName', 'escaperoomName', 'waiverLink'],
    icon: 'MessageSquare',
    description: 'Waiver completion request',
    isActive: true,
  },
  {
    id: 'referral-program',
    name: 'Referral Rewards Program',
    category: 'engagement',
    subject: '💰 Give $20, Get $20 - Share the Fun!',
    preheader: 'Earn rewards by sharing',
    body: 'Hi {{customerName}},\n\n💰 Share your referral code: {{referralCode}}\n\n🎁 They get $20 off\n💵 You earn $20 credit\n\nShare now: {{referralLink}}',
    variables: ['customerName', 'referralCode', 'referralLink'],
    icon: 'Gift',
    description: 'Referral program invitation',
    isActive: true,
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    category: 'engagement',
    subject: '👋 Welcome to {{businessName}}!',
    preheader: 'Start your adventure today',
    body: 'Hi {{customerName}},\n\n👋 Welcome to {{businessName}}!\n\n🎮 Explore our rooms\n🎁 Get 10% off first booking\nCode: WELCOME10',
    variables: ['customerName', 'businessName'],
    icon: 'UserPlus',
    description: 'New customer welcome',
    isActive: true,
  },
  {
    id: 'review-request',
    name: 'Review Request',
    category: 'engagement',
    subject: '⭐ How Was Your {{escaperoomName}} Experience?',
    preheader: 'Share your feedback',
    body: 'Hi {{customerName}},\n\n⭐ Please review your experience:\n\n📍 Google: {{googleReviewLink}}\n📘 Facebook: {{facebookReviewLink}}\n\n🎁 Get 20% off next booking (code: REVIEW20)',
    variables: ['customerName', 'escaperoomName', 'googleReviewLink', 'facebookReviewLink'],
    icon: 'Star',
    description: 'Post-visit review request',
    isActive: true,
  },
  {
    id: 'cancellation-confirmation',
    name: 'Cancellation Confirmation',
    category: 'transactional',
    subject: 'Booking Cancelled - We Hope to See You Soon',
    preheader: 'Your cancellation has been processed',
    body: 'Hi {{customerName}},\n\n❌ CANCELLED\nBooking ID: #{{bookingId}}\n\n💰 Refund: ${{refundAmount}}\nExpected: {{expectedRefundDate}}\n\n🎯 Rebook with COMEBACK10 for 10% off',
    variables: ['customerName', 'bookingId', 'refundAmount', 'expectedRefundDate'],
    icon: 'XCircle',
    description: 'Cancellation confirmation',
    isActive: true,
  },
  {
    id: 'win-back-campaign',
    name: 'Win-Back Campaign',
    category: 'marketing',
    subject: 'We Miss You! Come Back for 25% Off 💙',
    preheader: 'Special offer just for you',
    body: "Hi {{customerName}},\n\n💙 We miss you! It's been {{daysSinceLastVisit}} days.\n\n🎁 Come back for 25% OFF\nCode: WELCOME25\nValid: {{offerValidDays}} days\n\nBook now: {{bookingLink}}",
    variables: ['customerName', 'daysSinceLastVisit', 'offerValidDays', 'bookingLink'],
    icon: 'TrendingUp',
    description: 'Re-engage inactive customers',
    isActive: true,
  },
];

// Trigger events for email automation
export const WORKFLOW_TRIGGERS = [
  { value: 'booking-confirmed', label: 'Booking Confirmed' },
  { value: 'booking-cancelled', label: 'Booking Cancelled' },
  { value: 'customer-signup', label: 'New Customer Signup' },
  { value: 'visit-completed', label: 'Visit Completed' },
  { value: 'abandoned-cart', label: 'Cart Abandoned' },
  { value: 'payment-received', label: 'Payment Received' },
  { value: 'review-requested', label: 'Review Requested' },
  { value: 'custom-date', label: 'Custom Date/Time' },
];

// Target audience options
export const TARGET_AUDIENCES = [
  { value: 'all', label: 'All Subscribers' },
  { value: 'active', label: 'Active Customers' },
  { value: 'inactive', label: 'Inactive Customers' },
  { value: 'new', label: 'New Subscribers' },
];

// Gift card amount presets
export const GIFT_CARD_AMOUNTS = [
  { value: '25', label: '$25' },
  { value: '50', label: '$50' },
  { value: '100', label: '$100' },
  { value: '150', label: '$150' },
  { value: 'custom', label: 'Custom Amount' },
];
