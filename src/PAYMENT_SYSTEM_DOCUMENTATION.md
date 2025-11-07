# Payment & Transaction History System Documentation

**Created**: November 3, 2025  
**Version**: 1.0  
**Status**: ✅ Complete

---

## Overview

The Payment & Transaction History system is a comprehensive payment management solution for BookingTMS that handles all aspects of payment processing, refund management, revenue tracking, and financial reconciliation.

### Key Features

1. **Payment History Management**
   - View all transactions with detailed information
   - Advanced filtering and search capabilities
   - Transaction status tracking
   - Customer association and booking references

2. **Detailed Payment Logs**
   - Complete transaction metadata
   - Payment processor references
   - IP address tracking
   - Audit trail with timestamps

3. **Refund Management**
   - Full and partial refund processing
   - Multiple refund reasons
   - Internal notes and documentation
   - Customer notification options

4. **Payment Method Management**
   - Multiple payment method support
   - Card information (last 4 digits, brand)
   - Saved payment methods
   - Payment processor integration ready

5. **Revenue Reconciliation**
   - Transaction reconciliation tracking
   - Unreconciled transaction management
   - Reconciliation summary and metrics
   - Last reconciled date tracking

---

## Architecture

### Type System (`/types/payment.ts`)

Comprehensive TypeScript types for type-safety:

#### Core Types

```typescript
PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 
                'partially_refunded' | 'processing' | 'cancelled'

PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'gift_card' | 
                'bank_transfer' | 'paypal' | 'stripe' | 'square'

TransactionType = 'booking_payment' | 'refund' | 'partial_refund' | 
                  'cancellation_fee' | 'adjustment' | 'chargeback'

RefundReason = 'customer_request' | 'booking_cancelled' | 
               'duplicate_charge' | 'service_issue' | 
               'overcharge' | 'other'
```

#### Transaction Interface

```typescript
interface Transaction {
  // Identity
  id: string
  bookingId?: string
  customerId: string
  customerName: string
  customerEmail: string
  
  // Transaction details
  type: TransactionType
  amount: number
  currency: string
  status: PaymentStatus
  
  // Payment method
  paymentMethod: PaymentMethodDetails
  
  // Timestamps
  createdAt: string
  processedAt?: string
  refundedAt?: string
  
  // References
  transactionRef: string
  invoiceNumber?: string
  receiptUrl?: string
  
  // Refund information
  refundAmount?: number
  refundReason?: RefundReason
  refundNotes?: string
  refundedBy?: string
  originalTransactionId?: string
  
  // Reconciliation
  reconciled: boolean
  reconciledAt?: string
  reconciledBy?: string
  
  // Audit trail
  createdBy: string
  ipAddress?: string
}
```

### Mock Data Layer (`/lib/payment/mockData.ts`)

Realistic test data for development:

- **10 sample transactions** covering all payment statuses
- **Revenue metrics** with breakdown by payment method and status
- **Reconciliation summary** with reconciled/unreconciled counts
- **Saved payment methods** for customers

### Component Architecture

#### Main Page (`/pages/PaymentHistory.tsx`)

**Responsibilities:**
- Transaction list management
- Filtering and search
- Revenue metrics display
- Reconciliation interface
- Modal coordination

**State Management:**
```typescript
- transactions: Transaction[]
- searchQuery: string
- statusFilter: PaymentStatus | 'all'
- paymentMethodFilter: PaymentMethod | 'all'
- dateFilter: 'today' | 'week' | 'month' | 'all'
- selectedTransaction: Transaction | null
```

**Key Features:**
- 3-tier background system (dark mode compliant)
- Permission-based UI rendering
- Real-time filtering with useMemo
- Responsive table design
- Export functionality

#### Refund Dialog (`/components/payments/RefundDialog.tsx`)

**Responsibilities:**
- Refund amount input with validation
- Refund reason selection
- Internal notes
- Customer notification toggle
- Refund processing

**Features:**
- Quick amount buttons (50%, Full Refund)
- Maximum refund validation
- Partial refund support
- Warning alerts
- Loading states

---

## Permissions System

### Available Permissions

Added 4 new payment-related permissions:

```typescript
'payments.view'      // View payment history
'payments.refund'    // Process refunds
'payments.export'    // Export transaction data
'payments.reconcile' // Mark transactions as reconciled
```

### Role Access Matrix

| Role | View Payments | Process Refunds | Export Data | Reconcile |
|------|--------------|-----------------|-------------|-----------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ❌ | ❌ | ❌ |
| **Staff** | ❌ | ❌ | ❌ | ❌ |

### Implementation

```typescript
// Check permission
const { hasPermission } = useAuth();
const canRefund = hasPermission('payments.refund');

// Guard UI element
<PermissionGuard permissions={['payments.refund']}>
  <RefundButton />
</PermissionGuard>
```

---

## UI/UX Design

### Layout Structure

```
Page Background (#0a0a0a)
├─ Revenue Metrics Container (#161616)
│  └─ Metric Cards (#0a0a0a)
│     ├─ Total Revenue
│     ├─ Total Refunds
│     ├─ Net Revenue
│     └─ Success Rate
│
└─ Main Content Container (#161616)
   └─ Tabs (#0a0a0a)
      ├─ Transactions Tab
      │  ├─ Filters (Search, Status, Date)
      │  ├─ Export Button
      │  └─ Transaction Table (#0a0a0a)
      │     └─ Table Header (#161616)
      │
      └─ Reconciliation Tab
         ├─ Summary Metrics
         └─ Unreconciled List
```

### Color System (Dark Mode)

**Backgrounds:**
- Page: `#0a0a0a`
- Elevated containers: `#161616`
- Cards/Tables: `#0a0a0a`
- Table headers: `#161616`
- Modals: `#1e1e1e`

**Borders:**
- Standard: `#1e1e1e`
- Strong: `#2a2a2a`

**Text:**
- Primary: `white`
- Secondary: `#a3a3a3`
- Tertiary: `#737373`

**Status Colors:**
- Success (Completed): `green-400`
- Pending: `amber-400`
- Processing: `blue-400`
- Failed: `red-400`
- Refunded: `gray-400`
- Partial Refund: `orange-400`

### Status Badges

Each transaction status has a unique badge:

- ✅ **Completed** - Green with CheckCircle2 icon
- ⏳ **Pending** - Amber with Clock icon
- 🔄 **Processing** - Blue with RefreshCw icon
- ❌ **Failed** - Red with XCircle icon
- ↩️ **Refunded** - Gray with RotateCcw icon
- ⚠️ **Partially Refunded** - Orange with RotateCcw icon

---

## Features Deep Dive

### 1. Advanced Filtering

**Search Functionality:**
- Customer name
- Customer email
- Transaction reference
- Booking ID

**Filter Options:**
- **Status**: All, Completed, Pending, Processing, Failed, Refunded, Partially Refunded
- **Payment Method**: All, Credit Card, Debit Card, Cash, Gift Card, Bank Transfer, PayPal, Stripe, Square
- **Date Range**: All Time, Today, Last 7 Days, Last 30 Days

**Implementation:**
```typescript
const filteredTransactions = useMemo(() => {
  return transactions.filter(transaction => {
    const searchMatch = /* search logic */;
    const statusMatch = /* status logic */;
    const methodMatch = /* method logic */;
    const dateMatch = /* date logic */;
    return searchMatch && statusMatch && methodMatch && dateMatch;
  });
}, [transactions, searchQuery, statusFilter, paymentMethodFilter, dateFilter]);
```

### 2. Revenue Metrics

**Calculated Metrics:**

1. **Total Revenue**: Sum of all completed transactions
2. **Total Refunds**: Sum of all refunded amounts
3. **Net Revenue**: Total Revenue - Total Refunds
4. **Success Rate**: (Completed Transactions / Total Transactions) × 100
5. **Average Transaction Value**: Total Revenue / Transaction Count

**Breakdown Analytics:**
- By payment method (amount, count, percentage)
- By status (amount, count, percentage)
- Daily revenue trends (revenue, refunds, net)

### 3. Refund Processing

**Workflow:**

1. User clicks refund button on eligible transaction
2. Refund dialog opens with transaction details
3. System shows maximum refundable amount
4. User enters refund amount and reason
5. Optional internal notes
6. Choose customer notification preference
7. System validates amount ≤ available
8. Process refund (async operation)
9. Update transaction status:
   - Full refund → `refunded`
   - Partial refund → `partially_refunded`

**Validation Rules:**
- Amount must be > 0
- Amount must be ≤ (Original Amount - Already Refunded)
- Reason must be selected
- Only completed or partially_refunded transactions can be refunded

**Quick Actions:**
- 50% button: Set refund to half of available amount
- Full Refund button: Set refund to maximum available

### 4. Transaction Details Modal

**Information Displayed:**

**Customer Section:**
- Full name
- Email address

**Transaction Section:**
- Amount
- Status badge
- Payment method (with card details if applicable)
- Transaction date and time
- Booking ID (if applicable)
- Invoice number (if applicable)

**Refund Section** (if refunded):
- Refund amount
- Refund date
- Refund reason
- Internal notes

**Additional:**
- Transaction description
- Payment processor reference

### 5. Reconciliation System

**Purpose:**
Match internal transaction records with external payment processor records.

**Features:**

1. **Summary Dashboard:**
   - Total transactions
   - Reconciled count and amount
   - Unreconciled count and amount
   - Last reconciliation date

2. **Unreconciled List:**
   - Shows all completed but unreconciled transactions
   - One-click "Mark Reconciled" action
   - Updates reconciliation status with timestamp and user

3. **Reconciliation Metadata:**
   ```typescript
   {
     reconciled: boolean
     reconciledAt?: string
     reconciledBy?: string
   }
   ```

### 6. Export Functionality

**Triggered by:** Export button (permission-protected)

**Data Included:**
- All filtered transactions
- Full transaction details
- Customer information
- Payment method details
- Refund information (if applicable)

**Format Options** (future enhancement):
- CSV for spreadsheet analysis
- Excel with multiple sheets
- PDF report with charts

**Current Implementation:**
Shows success toast notification. Would integrate with backend to generate actual file.

---

## Integration Points

### Payment Processor Integration

The system is designed to integrate with external payment processors:

**Supported Processors:**
- Stripe
- Square
- PayPal
- Bank transfers
- Cash
- Gift cards

**Integration Pattern:**
```typescript
interface PaymentMethodDetails {
  type: PaymentMethod
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  holderName?: string
}
```

### Booking System Integration

Transactions linked to bookings via `bookingId`:

```typescript
{
  bookingId?: string  // References booking record
  // ...
}
```

**Benefits:**
- Navigate from transaction to booking
- View payment history for specific booking
- Track booking payment status

### Customer System Integration

Transactions linked to customers via `customerId`:

```typescript
{
  customerId: string
  customerName: string
  customerEmail: string
  // ...
}
```

**Benefits:**
- View customer payment history
- Track customer lifetime value
- Identify payment issues by customer

---

## Data Flow

### Transaction Creation Flow

```
1. Customer makes booking
   ↓
2. Payment processor charges card
   ↓
3. Processor returns transaction reference
   ↓
4. System creates Transaction record
   ↓
5. Status set to 'processing'
   ↓
6. Processor confirms payment
   ↓
7. Status updated to 'completed'
   ↓
8. Receipt generated
   ↓
9. Customer notified
```

### Refund Flow

```
1. User initiates refund
   ↓
2. System validates refund amount
   ↓
3. Refund dialog confirms details
   ↓
4. User submits refund
   ↓
5. Payment processor processes refund
   ↓
6. Transaction updated with refund details
   ↓
7. Status changed to 'refunded' or 'partially_refunded'
   ↓
8. Customer notified (if selected)
   ↓
9. Accounting records updated
```

### Reconciliation Flow

```
1. Admin views unreconciled transactions
   ↓
2. Compares with payment processor records
   ↓
3. Verifies amounts match
   ↓
4. Marks transaction as reconciled
   ↓
5. System records reconciliation metadata
   ↓
6. Transaction moves to reconciled list
```

---

## Security Considerations

### Permission-Based Access

All sensitive actions are permission-protected:

```typescript
// View payments
<PermissionGuard permissions={['payments.view']}>
  <PaymentHistory />
</PermissionGuard>

// Process refunds
<PermissionGuard permissions={['payments.refund']}>
  <RefundButton />
</PermissionGuard>

// Export data
<PermissionGuard permissions={['payments.export']}>
  <ExportButton />
</PermissionGuard>

// Reconcile
<PermissionGuard permissions={['payments.reconcile']}>
  <ReconcileButton />
</PermissionGuard>
```

### Sensitive Data Handling

**Card Information:**
- Never store full card numbers
- Only store last 4 digits
- Store card brand for display
- Expiry for validation

**PCI Compliance:**
- Use payment processor tokens
- Never log full card data
- Encrypt sensitive fields
- Limit access to card data

**Audit Trail:**
All actions tracked:
- Who performed action
- When action occurred
- What changed
- IP address
- User agent

### Data Retention

**Recommended Policies:**
- Keep transaction records: 7 years (tax compliance)
- Archive old transactions: After 2 years
- Delete customer data: On request (GDPR)
- Purge failed transactions: After 90 days

---

## API Endpoints (Future Implementation)

### GET /api/transactions

**Query Parameters:**
- `status`: Filter by status
- `paymentMethod`: Filter by payment method
- `dateFrom`: Start date
- `dateTo`: End date
- `customerId`: Filter by customer
- `bookingId`: Filter by booking
- `search`: Search query
- `page`: Page number
- `limit`: Results per page

**Response:**
```json
{
  "transactions": [...],
  "total": 100,
  "page": 1,
  "limit": 25,
  "hasMore": true
}
```

### POST /api/transactions/:id/refund

**Request Body:**
```json
{
  "amount": 50.00,
  "reason": "customer_request",
  "notes": "Customer was unhappy with service",
  "notifyCustomer": true
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {...},
  "refundId": "ref_123456"
}
```

### POST /api/transactions/:id/reconcile

**Request Body:**
```json
{
  "reconciledBy": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {...}
}
```

### GET /api/revenue/metrics

**Query Parameters:**
- `dateFrom`: Start date
- `dateTo`: End date

**Response:**
```json
{
  "totalRevenue": 1610.00,
  "totalRefunds": 170.00,
  "netRevenue": 1440.00,
  "transactionCount": 10,
  "averageTransactionValue": 161.00,
  "successRate": 70.0,
  "byPaymentMethod": [...],
  "byStatus": [...],
  "dailyRevenue": [...]
}
```

---

## Testing Checklist

### Functional Testing

- [ ] View transaction list
- [ ] Search transactions by customer name
- [ ] Search transactions by email
- [ ] Search transactions by transaction ID
- [ ] Filter by status (all options)
- [ ] Filter by payment method
- [ ] Filter by date range
- [ ] View transaction details
- [ ] Process full refund
- [ ] Process partial refund
- [ ] Validate refund amount limits
- [ ] Mark transaction as reconciled
- [ ] View revenue metrics
- [ ] View reconciliation summary
- [ ] Export transactions

### Permission Testing

- [ ] Super Admin: All features accessible
- [ ] Admin: All features accessible
- [ ] Manager: View only, no refund/export/reconcile
- [ ] Staff: No access to payments page

### UI Testing

- [ ] Dark mode: All colors correct
- [ ] Light mode: All colors correct
- [ ] Responsive: Mobile (375px)
- [ ] Responsive: Tablet (768px)
- [ ] Responsive: Desktop (1024px+)
- [ ] Table scrolls horizontally on mobile
- [ ] Status badges display correctly
- [ ] Loading states show properly
- [ ] Error states handled gracefully

### Edge Cases

- [ ] Empty transaction list
- [ ] No search results
- [ ] Maximum refund amount
- [ ] Already fully refunded transaction
- [ ] Concurrent refund attempts
- [ ] Large transaction amounts
- [ ] Very old transactions
- [ ] Transactions with missing data

---

## Performance Optimization

### Current Optimizations

1. **useMemo for filtering:**
   ```typescript
   const filteredTransactions = useMemo(() => {
     // Filtering logic
   }, [dependencies]);
   ```

2. **Virtual scrolling** (future):
   - Render only visible transactions
   - Load more on scroll
   - Improve performance with 1000+ transactions

3. **Pagination** (future):
   - Limit results per page
   - Server-side pagination
   - Reduce client memory usage

4. **Lazy loading**:
   - Load transaction details on demand
   - Defer refund dialog rendering

### Future Enhancements

1. **Caching:**
   - Cache filtered results
   - Cache revenue metrics
   - Invalidate on data change

2. **Debounced Search:**
   - Delay search execution
   - Reduce filter re-runs

3. **Indexed Search:**
   - Use search indexes
   - Full-text search capability

---

## Future Enhancements

### Phase 2 Features

1. **Batch Operations:**
   - Bulk reconciliation
   - Bulk export
   - Batch refunds

2. **Advanced Analytics:**
   - Revenue charts (line, bar, pie)
   - Payment method trends
   - Refund rate analysis
   - Seasonal patterns

3. **Automated Reconciliation:**
   - Auto-match with processor
   - Discrepancy detection
   - Reconciliation reports

4. **Payment Disputes:**
   - Chargeback management
   - Dispute tracking
   - Evidence submission

5. **Scheduled Reports:**
   - Daily revenue summary
   - Weekly reconciliation report
   - Monthly financial reports

6. **Payment Plans:**
   - Installment tracking
   - Payment schedule
   - Auto-charge management

7. **Tax Management:**
   - Tax calculation
   - Tax reports
   - Multi-jurisdiction support

8. **Multi-Currency:**
   - Support multiple currencies
   - Exchange rate handling
   - Currency conversion

### Phase 3 Features

1. **Fraud Detection:**
   - Suspicious transaction alerts
   - Velocity checks
   - Blacklist management

2. **Customer Payment Portal:**
   - Self-service payment history
   - Download receipts
   - Update payment methods

3. **API Webhooks:**
   - Payment status updates
   - Refund notifications
   - Reconciliation events

4. **Mobile App:**
   - Native iOS/Android apps
   - Push notifications
   - Quick refund processing

---

## Troubleshooting

### Common Issues

**Issue: Refund button disabled**
- Check transaction status (must be completed or partially_refunded)
- Check remaining refundable amount (must be > 0)
- Verify user has 'payments.refund' permission

**Issue: Export not working**
- Verify user has 'payments.export' permission
- Check browser console for errors
- Ensure transactions are loaded

**Issue: Filters not working**
- Check filter state in React DevTools
- Verify useMemo dependencies
- Clear filters and try again

**Issue: Dark mode colors wrong**
- Check ThemeContext is working
- Verify isDark variable
- Review color class names

---

## Files Modified/Created

### New Files

1. `/types/payment.ts` - Type definitions
2. `/lib/payment/mockData.ts` - Mock data
3. `/components/payments/RefundDialog.tsx` - Refund component
4. `/pages/PaymentHistory.tsx` - Main page
5. `/PAYMENT_SYSTEM_DOCUMENTATION.md` - This file

### Modified Files

1. `/lib/auth/permissions.ts` - Added payment permissions
2. `/types/auth.ts` - Added payment permission types
3. `/components/layout/Sidebar.tsx` - Added menu item
4. `/App.tsx` - Added route

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor failed transactions
- Review refund requests

**Weekly:**
- Reconcile transactions
- Review unreconciled list
- Check for anomalies

**Monthly:**
- Generate revenue reports
- Archive old transactions
- Review payment methods

**Quarterly:**
- Audit permission assignments
- Review security logs
- Update payment processors

**Annually:**
- Review data retention policies
- Update compliance documentation
- Renew payment processor contracts

---

## Support & Resources

### Documentation

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Square Payment API](https://developer.squareup.com/docs/payments-api)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)

### Internal Resources

- Design System: `/guidelines/DESIGN_SYSTEM.md`
- RBAC System: `/lib/auth/README.md`
- Component Library: `/guidelines/COMPONENT_LIBRARY.md`

### Contact

For questions or issues:
- Email: dev-team@bookingtms.com
- Slack: #payment-system
- GitHub: Open an issue

---

**Last Updated**: November 3, 2025  
**Document Version**: 1.0  
**Author**: BookingTMS Development Team
