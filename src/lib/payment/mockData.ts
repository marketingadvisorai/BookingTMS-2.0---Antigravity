/**
 * Mock Payment Data
 * Realistic transaction data for development and testing
 */

import { Transaction, RevenueMetrics, ReconciliationSummary, SavedPaymentMethod } from '../../types/payment';

// Generate realistic transaction data
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    bookingId: 'BK-2024-001',
    customerId: 'cust_001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    type: 'booking_payment',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      holderName: 'Sarah Johnson'
    },
    createdAt: '2024-11-03T10:30:00Z',
    processedAt: '2024-11-03T10:30:05Z',
    transactionRef: 'pi_3QHGwK2eZvKYlo2C0b8h4r5t',
    invoiceNumber: 'INV-2024-001',
    receiptUrl: '#',
    description: 'Escape Room Booking - The Mystery Chamber (4 players)',
    reconciled: true,
    reconciledAt: '2024-11-03T23:59:00Z',
    reconciledBy: 'admin@bookingtms.com',
    createdBy: 'system',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'txn_002',
    bookingId: 'BK-2024-002',
    customerId: 'cust_002',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@email.com',
    type: 'booking_payment',
    amount: 200.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: {
      type: 'credit_card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      holderName: 'Michael Chen'
    },
    createdAt: '2024-11-03T11:15:00Z',
    processedAt: '2024-11-03T11:15:03Z',
    transactionRef: 'pi_3QHGwL3fZvKYlo2C1c9i5s6u',
    invoiceNumber: 'INV-2024-002',
    receiptUrl: '#',
    description: 'Escape Room Booking - Horror Mansion (6 players)',
    reconciled: true,
    reconciledAt: '2024-11-03T23:59:00Z',
    reconciledBy: 'admin@bookingtms.com',
    createdBy: 'system',
    ipAddress: '192.168.1.2'
  },
  {
    id: 'txn_003',
    bookingId: 'BK-2024-003',
    customerId: 'cust_003',
    customerName: 'Emily Rodriguez',
    customerEmail: 'emily.rodriguez@email.com',
    type: 'booking_payment',
    amount: 120.00,
    currency: 'USD',
    status: 'refunded',
    paymentMethod: {
      type: 'credit_card',
      last4: '1234',
      brand: 'Visa',
      expiryMonth: 3,
      expiryYear: 2025,
      holderName: 'Emily Rodriguez'
    },
    createdAt: '2024-11-02T14:20:00Z',
    processedAt: '2024-11-02T14:20:04Z',
    refundedAt: '2024-11-02T16:30:00Z',
    transactionRef: 'pi_3QHGwM4gZvKYlo2C2d0j6t7v',
    invoiceNumber: 'INV-2024-003',
    receiptUrl: '#',
    refundAmount: 120.00,
    refundReason: 'booking_cancelled',
    refundNotes: 'Customer had to cancel due to emergency',
    refundedBy: 'admin@bookingtms.com',
    description: 'Escape Room Booking - Pirate Adventure (3 players)',
    reconciled: true,
    reconciledAt: '2024-11-02T23:59:00Z',
    reconciledBy: 'admin@bookingtms.com',
    createdBy: 'system',
    ipAddress: '192.168.1.3'
  },
  {
    id: 'txn_004',
    bookingId: 'BK-2024-004',
    customerId: 'cust_004',
    customerName: 'David Thompson',
    customerEmail: 'david.thompson@email.com',
    type: 'booking_payment',
    amount: 180.00,
    currency: 'USD',
    status: 'pending',
    paymentMethod: {
      type: 'bank_transfer',
      holderName: 'David Thompson'
    },
    createdAt: '2024-11-03T15:45:00Z',
    transactionRef: 'bt_3QHGwN5hZvKYlo2C3e1k7u8w',
    invoiceNumber: 'INV-2024-004',
    description: 'Escape Room Booking - Space Station (5 players)',
    reconciled: false,
    createdBy: 'system',
    ipAddress: '192.168.1.4'
  },
  {
    id: 'txn_005',
    bookingId: 'BK-2024-005',
    customerId: 'cust_005',
    customerName: 'Jessica Martinez',
    customerEmail: 'jessica.martinez@email.com',
    type: 'booking_payment',
    amount: 90.00,
    currency: 'USD',
    status: 'failed',
    paymentMethod: {
      type: 'credit_card',
      last4: '9999',
      brand: 'Amex',
      expiryMonth: 6,
      expiryYear: 2024,
      holderName: 'Jessica Martinez'
    },
    createdAt: '2024-11-03T16:00:00Z',
    transactionRef: 'pi_3QHGwO6iZvKYlo2C4f2l8v9x',
    description: 'Escape Room Booking - Zombie Outbreak (2 players)',
    reconciled: false,
    createdBy: 'system',
    ipAddress: '192.168.1.5',
    notes: 'Card declined - insufficient funds'
  },
  {
    id: 'txn_006',
    bookingId: 'BK-2024-006',
    customerId: 'cust_006',
    customerName: 'Robert Wilson',
    customerEmail: 'robert.wilson@email.com',
    type: 'booking_payment',
    amount: 250.00,
    currency: 'USD',
    status: 'partially_refunded',
    paymentMethod: {
      type: 'credit_card',
      last4: '7777',
      brand: 'Visa',
      expiryMonth: 10,
      expiryYear: 2026,
      holderName: 'Robert Wilson'
    },
    createdAt: '2024-11-01T09:00:00Z',
    processedAt: '2024-11-01T09:00:02Z',
    refundedAt: '2024-11-01T14:00:00Z',
    transactionRef: 'pi_3QHGwP7jZvKYlo2C5g3m9w0y',
    invoiceNumber: 'INV-2024-006',
    receiptUrl: '#',
    refundAmount: 50.00,
    refundReason: 'service_issue',
    refundNotes: 'One player unable to participate, partial refund issued',
    refundedBy: 'admin@bookingtms.com',
    description: 'Escape Room Booking - Corporate Team Building (8 players)',
    reconciled: true,
    reconciledAt: '2024-11-01T23:59:00Z',
    reconciledBy: 'admin@bookingtms.com',
    createdBy: 'system',
    ipAddress: '192.168.1.6'
  },
  {
    id: 'txn_007',
    customerId: 'cust_007',
    customerName: 'Amanda Lee',
    customerEmail: 'amanda.lee@email.com',
    type: 'gift_card',
    amount: 100.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: {
      type: 'paypal',
      holderName: 'Amanda Lee'
    },
    createdAt: '2024-11-02T12:30:00Z',
    processedAt: '2024-11-02T12:30:01Z',
    transactionRef: 'pp_3QHGwQ8kZvKYlo2C6h4n0x1z',
    invoiceNumber: 'INV-2024-007',
    receiptUrl: '#',
    description: 'Gift Card Purchase - $100 value',
    reconciled: true,
    reconciledAt: '2024-11-02T23:59:00Z',
    reconciledBy: 'admin@bookingtms.com',
    createdBy: 'system',
    ipAddress: '192.168.1.7'
  },
  {
    id: 'txn_008',
    bookingId: 'BK-2024-007',
    customerId: 'cust_008',
    customerName: 'Christopher Brown',
    customerEmail: 'christopher.brown@email.com',
    type: 'booking_payment',
    amount: 160.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: {
      type: 'cash',
      holderName: 'Christopher Brown'
    },
    createdAt: '2024-11-03T13:00:00Z',
    processedAt: '2024-11-03T13:00:00Z',
    transactionRef: 'cash_001',
    invoiceNumber: 'INV-2024-008',
    receiptUrl: '#',
    description: 'Escape Room Booking - Medieval Quest (4 players) - Walk-in',
    reconciled: false,
    createdBy: 'staff@bookingtms.com',
    ipAddress: '192.168.1.8',
    notes: 'Cash payment at front desk'
  },
  {
    id: 'txn_009',
    bookingId: 'BK-2024-008',
    customerId: 'cust_009',
    customerName: 'Sophia Anderson',
    customerEmail: 'sophia.anderson@email.com',
    type: 'booking_payment',
    amount: 140.00,
    currency: 'USD',
    status: 'processing',
    paymentMethod: {
      type: 'stripe',
      last4: '3333',
      brand: 'Visa',
      expiryMonth: 9,
      expiryYear: 2025,
      holderName: 'Sophia Anderson'
    },
    createdAt: '2024-11-03T17:00:00Z',
    transactionRef: 'pi_3QHGwR9lZvKYlo2C7i5o1y2a',
    invoiceNumber: 'INV-2024-009',
    description: 'Escape Room Booking - Detective Mystery (4 players)',
    reconciled: false,
    createdBy: 'system',
    ipAddress: '192.168.1.9'
  },
  {
    id: 'txn_010',
    bookingId: 'BK-2024-009',
    customerId: 'cust_010',
    customerName: 'Daniel Garcia',
    customerEmail: 'daniel.garcia@email.com',
    type: 'booking_payment',
    amount: 220.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: {
      type: 'gift_card',
      holderName: 'Daniel Garcia'
    },
    createdAt: '2024-11-03T10:00:00Z',
    processedAt: '2024-11-03T10:00:01Z',
    transactionRef: 'gc_3QHGwS0mZvKYlo2C8j6p2z3b',
    invoiceNumber: 'INV-2024-010',
    receiptUrl: '#',
    description: 'Escape Room Booking - Cyber Heist (6 players) - Gift Card Redemption',
    reconciled: true,
    reconciledAt: '2024-11-03T23:59:00Z',
    reconciledBy: 'admin@bookingtms.com',
    createdBy: 'system',
    ipAddress: '192.168.1.10',
    notes: 'Redeemed gift card GC-2024-001'
  }
];

export const mockRevenueMetrics: RevenueMetrics = {
  totalRevenue: 1610.00,
  totalRefunds: 170.00,
  netRevenue: 1440.00,
  transactionCount: 10,
  averageTransactionValue: 161.00,
  successRate: 70.0,
  
  byPaymentMethod: [
    { method: 'credit_card', amount: 1000.00, count: 6, percentage: 62.1 },
    { method: 'gift_card', amount: 220.00, count: 1, percentage: 13.7 },
    { method: 'cash', amount: 160.00, count: 1, percentage: 9.9 },
    { method: 'bank_transfer', amount: 180.00, count: 1, percentage: 11.2 },
    { method: 'paypal', amount: 100.00, count: 1, percentage: 6.2 }
  ],
  
  byStatus: [
    { status: 'completed', amount: 1160.00, count: 6, percentage: 72.0 },
    { status: 'refunded', amount: 120.00, count: 1, percentage: 7.5 },
    { status: 'partially_refunded', amount: 250.00, count: 1, percentage: 15.5 },
    { status: 'pending', amount: 180.00, count: 1, percentage: 11.2 },
    { status: 'processing', amount: 140.00, count: 1, percentage: 8.7 },
    { status: 'failed', amount: 90.00, count: 1, percentage: 5.6 }
  ],
  
  dailyRevenue: [
    { date: '2024-11-01', revenue: 250.00, refunds: 50.00, net: 200.00 },
    { date: '2024-11-02', revenue: 220.00, refunds: 120.00, net: 100.00 },
    { date: '2024-11-03', revenue: 1140.00, refunds: 0.00, net: 1140.00 }
  ]
};

export const mockReconciliationSummary: ReconciliationSummary = {
  totalTransactions: 10,
  reconciledTransactions: 6,
  unreconciledTransactions: 4,
  totalAmount: 1610.00,
  reconciledAmount: 1040.00,
  unreconciledAmount: 570.00,
  lastReconciledDate: '2024-11-03T23:59:00Z'
};

export const mockSavedPaymentMethods: SavedPaymentMethod[] = [
  {
    id: 'pm_001',
    customerId: 'cust_001',
    type: 'credit_card',
    details: {
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      holderName: 'Sarah Johnson'
    },
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastUsedAt: '2024-11-03T10:30:00Z'
  },
  {
    id: 'pm_002',
    customerId: 'cust_002',
    type: 'credit_card',
    details: {
      type: 'credit_card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      holderName: 'Michael Chen'
    },
    isDefault: true,
    isActive: true,
    createdAt: '2024-02-20T14:00:00Z',
    lastUsedAt: '2024-11-03T11:15:00Z'
  }
];
