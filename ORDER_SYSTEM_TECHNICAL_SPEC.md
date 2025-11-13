# Order System - Technical Specification

**Version:** 1.0.0  
**Date:** November 13, 2025

---

## Database Migration

### File: `supabase/migrations/024_order_management_system.sql`

```sql
-- =====================================================
-- ORDER MANAGEMENT SYSTEM
-- =====================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  confirmation_code VARCHAR(50) UNIQUE,
  
  -- Relationships
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Customer Info (denormalized)
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'confirmed', 'completed', 'cancelled', 'refunded', 'partially_refunded')
  ),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'failed')
  ),
  
  -- Financial
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Payment Provider
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  
  -- Booking Details (denormalized)
  booking_date DATE,
  booking_time TIME,
  game_name VARCHAR(255),
  venue_name VARCHAR(255),
  party_size INTEGER,
  
  -- Metadata
  order_metadata JSONB DEFAULT '{}'::JSONB,
  source VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  
  item_type VARCHAR(50) NOT NULL CHECK (
    item_type IN ('game_booking', 'addon', 'gift_voucher', 'service_fee', 'tax')
  ),
  
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  stripe_price_id VARCHAR(255),
  capacity_type VARCHAR(50),
  
  item_metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDER TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS order_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  transaction_type VARCHAR(50) NOT NULL CHECK (
    transaction_type IN ('payment', 'refund', 'partial_refund', 'chargeback')
  ),
  transaction_status VARCHAR(50) NOT NULL CHECK (
    transaction_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')
  ),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  provider VARCHAR(50) NOT NULL,
  provider_transaction_id VARCHAR(255),
  provider_fee DECIMAL(10, 2),
  
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  stripe_refund_id VARCHAR(255),
  
  transaction_metadata JSONB DEFAULT '{}'::JSONB,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  error_code VARCHAR(100),
  error_message TEXT
);

-- 4. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  change_metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_orders_organization ON orders(organization_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_booking ON orders(booking_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_game ON order_items(game_id);

CREATE INDEX idx_order_transactions_order ON order_transactions(order_id);
CREATE INDEX idx_order_transactions_type ON order_transactions(transaction_type);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- FUNCTIONS

-- Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  v_number VARCHAR(50);
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = v_number) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate Order Number
CREATE OR REPLACE FUNCTION auto_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_order_number();

-- Update Order Timestamps
CREATE OR REPLACE FUNCTION update_order_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    NEW.paid_at := NOW();
  END IF;
  
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at := NOW();
  END IF;
  
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := NOW();
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_timestamp();

-- Log Status Changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- RLS POLICIES
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view orders in their organization
CREATE POLICY "Users can view orders in their organization"
  ON orders FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert orders in their organization"
  ON orders FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update orders in their organization"
  ON orders FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id));

CREATE POLICY "Users can view transactions" ON order_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_transactions.order_id));

CREATE POLICY "Users can view status history" ON order_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id));
```

---

## Backend Services

### File: `src/services/OrderService.ts`

```typescript
import { supabase } from '../lib/supabase';

export interface CreateOrderParams {
  organization_id: string;
  venue_id: string;
  customer_id: string;
  items: OrderItemInput[];
  source?: string;
  coupon_code?: string;
}

export interface OrderItemInput {
  game_id?: string;
  item_type: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  capacity_type?: string;
}

export class OrderService {
  static async createOrder(params: CreateOrderParams) {
    const { items, ...orderData } = params;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    );
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        ...orderData,
        subtotal,
        total_amount: subtotal,
        status: 'pending',
        payment_status: 'unpaid',
      }])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      ...item,
      subtotal: item.unit_price * item.quantity,
      total_amount: item.unit_price * item.quantity,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return order;
  }
  
  static async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        order_transactions (*),
        order_status_history (*)
      `)
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async updateOrderStatus(
    orderId: string, 
    status: string,
    reason?: string
  ) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async processRefund(
    orderId: string,
    amount?: number,
    reason?: string
  ) {
    const order = await this.getOrder(orderId);
    
    const refundAmount = amount || order.total_amount;
    const isPartial = refundAmount < order.total_amount;
    
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: isPartial ? 'partially_refunded' : 'refunded',
        payment_status: isPartial ? 'partially_refunded' : 'refunded',
      })
      .eq('id', orderId);
    
    // Create transaction record
    await supabase
      .from('order_transactions')
      .insert([{
        order_id: orderId,
        transaction_type: isPartial ? 'partial_refund' : 'refund',
        transaction_status: 'succeeded',
        amount: refundAmount,
        provider: order.payment_provider,
        notes: reason,
      }]);
    
    return { success: true, refundAmount };
  }
}
```

---

## Frontend Components

### File: `src/pages/Orders.tsx`

```typescript
import { useState, useEffect } from 'react';
import { OrderService } from '../services/OrderService';
import { OrderCard } from '../components/orders/OrderCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    loadOrders();
  }, [filter]);
  
  async function loadOrders() {
    setLoading(true);
    const data = await OrderService.getOrders({ status: filter });
    setOrders(data);
    setLoading(false);
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button>Export</Button>
      </div>
      
      <div className="mb-4 flex gap-2">
        <Input placeholder="Search orders..." />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
```

---

## Integration with Checkout

### Update: `src/services/CheckoutService.ts`

```typescript
// BEFORE creating Stripe checkout, create order
export async function createBookingWithCheckout(params) {
  // 1. Create order first
  const order = await OrderService.createOrder({
    organization_id: params.organizationId,
    venue_id: params.venueId,
    customer_id: params.customerId,
    items: [{
      game_id: params.gameId,
      item_type: 'game_booking',
      product_name: params.gameName,
      quantity: params.partySize,
      unit_price: params.pricePerPerson,
    }],
    source: 'widget',
  });
  
  // 2. Create Stripe checkout with order reference
  const session = await stripe.checkout.sessions.create({
    metadata: {
      order_id: order.id,
      organization_id: params.organizationId,
    },
    // ... rest of checkout params
  });
  
  // 3. Update order with Stripe session ID
  await OrderService.updateOrder(order.id, {
    stripe_checkout_session_id: session.id,
  });
  
  return { order, checkoutUrl: session.url };
}
```

---

## Webhook Handler

### File: `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  );
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;
    
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'processing',
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent,
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    // Create transaction record
    await supabase
      .from('order_transactions')
      .insert([{
        order_id: orderId,
        transaction_type: 'payment',
        transaction_status: 'succeeded',
        amount: session.amount_total / 100,
        provider: 'stripe',
        provider_transaction_id: session.payment_intent,
      }]);
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Testing Checklist

- [ ] Create order with items
- [ ] Calculate totals correctly
- [ ] Generate unique order numbers
- [ ] Link order to Stripe checkout
- [ ] Update order on payment success
- [ ] Record transactions
- [ ] Log status changes
- [ ] Process refunds
- [ ] View order details
- [ ] Filter orders by status
- [ ] Export orders to CSV

---

**Ready for Implementation**
