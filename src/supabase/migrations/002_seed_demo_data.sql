-- BookingTMS Database - Demo Data Seed
-- Version: 1.0.0
-- Description: Comprehensive demo data for BookingTMS application
-- This seed creates realistic demo data for testing and development

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

-- Insert demo organization (if not exists)
INSERT INTO organizations (id, name, slug, plan, settings, is_active) 
VALUES 
  (
    '00000000-0000-0000-0000-000000000001', 
    'BookingTMS Escape Rooms', 
    'bookingtms-escape-rooms', 
    'pro',
    '{
      "timezone": "America/New_York",
      "currency": "USD",
      "business_hours": {
        "monday": {"open": "10:00", "close": "22:00"},
        "tuesday": {"open": "10:00", "close": "22:00"},
        "wednesday": {"open": "10:00", "close": "22:00"},
        "thursday": {"open": "10:00", "close": "22:00"},
        "friday": {"open": "10:00", "close": "23:00"},
        "saturday": {"open": "09:00", "close": "23:00"},
        "sunday": {"open": "09:00", "close": "21:00"}
      },
      "booking_settings": {
        "min_advance_hours": 2,
        "max_advance_days": 90,
        "allow_same_day_bookings": true,
        "require_deposit": false,
        "deposit_percentage": 20
      }
    }'::jsonb,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- =====================================================
-- DEMO AUTH USERS (via Supabase Auth)
-- =====================================================

-- NOTE: These need to be created via Supabase Auth Dashboard or API
-- For demo purposes, we'll assume these auth.users IDs exist:

-- Super Admin: superadmin@bookingtms.com (UUID: 10000000-0000-0000-0000-000000000001)
-- Admin:       admin@bookingtms.com       (UUID: 10000000-0000-0000-0000-000000000002)
-- Manager:     manager@bookingtms.com     (UUID: 10000000-0000-0000-0000-000000000003)
-- Staff:       staff@bookingtms.com       (UUID: 10000000-0000-0000-0000-000000000004)

-- =====================================================
-- USERS TABLE
-- =====================================================

-- Insert demo users (linked to auth.users)
-- NOTE: First create these users in Supabase Auth, then run this
INSERT INTO users (id, email, full_name, role, organization_id, phone, is_active, last_login_at) 
VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'superadmin@bookingtms.com',
    'Sarah Anderson',
    'super-admin',
    '00000000-0000-0000-0000-000000000001',
    '+1 (555) 100-0001',
    true,
    NOW() - INTERVAL '2 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'admin@bookingtms.com',
    'Michael Chen',
    'admin',
    '00000000-0000-0000-0000-000000000001',
    '+1 (555) 100-0002',
    true,
    NOW() - INTERVAL '5 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'manager@bookingtms.com',
    'Emily Rodriguez',
    'manager',
    '00000000-0000-0000-0000-000000000001',
    '+1 (555) 100-0003',
    true,
    NOW() - INTERVAL '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'staff@bookingtms.com',
    'David Thompson',
    'staff',
    '00000000-0000-0000-0000-000000000001',
    '+1 (555) 100-0004',
    true,
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  last_login_at = EXCLUDED.last_login_at,
  updated_at = NOW();

-- =====================================================
-- GAMES (Escape Rooms)
-- =====================================================

INSERT INTO games (id, organization_id, name, description, difficulty, duration_minutes, min_players, max_players, price, is_active) 
VALUES 
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'The Mysterious Library',
    'A renowned professor has gone missing, and his final clue points to the ancient library. Can you solve the mystery before time runs out? Perfect for beginners!',
    'easy',
    60,
    2,
    8,
    120.00,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Heist at the Museum',
    'You are part of an elite team of thieves planning the ultimate heist. Bypass security systems, crack the vault, and escape with the treasure. High energy and teamwork required!',
    'medium',
    75,
    3,
    10,
    150.00,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Escape from Alcatraz',
    'Trapped in the most notorious prison in history. Can you outsmart the guards and make your escape? Only the best make it out alive. Our most challenging room!',
    'hard',
    90,
    4,
    8,
    180.00,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Murder Mystery Manor',
    'A wealthy businessman was found dead in his manor. You are the detectives called to solve the case. Examine the evidence, interrogate suspects, and catch the killer!',
    'medium',
    60,
    2,
    6,
    130.00,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'The Lost Temple',
    'Deep in the jungle lies an ancient temple filled with deadly traps and priceless artifacts. Navigate the dangers and claim the treasure. Advanced puzzle-solving required!',
    'expert',
    90,
    4,
    8,
    200.00,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'Zombie Apocalypse',
    'The zombie outbreak has begun! Find the cure in the abandoned laboratory before you become infected. Fast-paced and thrilling!',
    'medium',
    60,
    3,
    8,
    140.00,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  price = EXCLUDED.price,
  updated_at = NOW();

-- =====================================================
-- CUSTOMERS
-- =====================================================

INSERT INTO customers (id, organization_id, email, full_name, phone, total_bookings, total_spent, segment, notes) 
VALUES 
  -- VIP Customers (high spend)
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'jessica.martinez@email.com',
    'Jessica Martinez',
    '+1 (555) 200-0001',
    15,
    2250.00,
    'vip',
    'Regular customer. Loves challenging rooms. Prefers weekend bookings.'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'robert.williams@email.com',
    'Robert Williams',
    '+1 (555) 200-0002',
    12,
    1800.00,
    'vip',
    'Corporate bookings. Brings team for team-building exercises.'
  ),
  
  -- Regular Customers
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'amanda.lee@email.com',
    'Amanda Lee',
    '+1 (555) 200-0003',
    8,
    960.00,
    'regular',
    'Birthday party bookings. Great reviews on social media.'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'christopher.davis@email.com',
    'Christopher Davis',
    '+1 (555) 200-0004',
    6,
    780.00,
    'regular',
    'Enthusiast. Completed 4 different rooms.'
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'sophia.johnson@email.com',
    'Sophia Johnson',
    '+1 (555) 200-0005',
    7,
    910.00,
    'regular',
    'Prefers mystery/detective themes.'
  ),
  
  -- New Customers
  (
    '30000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'daniel.brown@email.com',
    'Daniel Brown',
    '+1 (555) 200-0006',
    2,
    240.00,
    'new',
    'First-timer. Requested easy room for introduction.'
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'olivia.garcia@email.com',
    'Olivia Garcia',
    '+1 (555) 200-0007',
    1,
    120.00,
    'new',
    'Found us on Google. Interested in team building.'
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000001',
    'james.wilson@email.com',
    'James Wilson',
    '+1 (555) 200-0008',
    3,
    390.00,
    'new',
    'College student group. Requested student discount.'
  ),
  
  -- Inactive Customer
  (
    '30000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000001',
    'patricia.moore@email.com',
    'Patricia Moore',
    '+1 (555) 200-0009',
    4,
    520.00,
    'inactive',
    'Last booking was 8 months ago. Send re-engagement email.'
  ),
  
  -- More new customers for recent bookings
  (
    '30000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'ethan.taylor@email.com',
    'Ethan Taylor',
    '+1 (555) 200-0010',
    1,
    150.00,
    'new',
    'Upcoming booking for anniversary celebration.'
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  total_bookings = EXCLUDED.total_bookings,
  total_spent = EXCLUDED.total_spent,
  segment = EXCLUDED.segment,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =====================================================
-- BOOKINGS
-- =====================================================

-- Generate realistic bookings across past, today, and future dates
INSERT INTO bookings (
  id, 
  organization_id, 
  booking_number, 
  customer_id, 
  game_id, 
  booking_date, 
  start_time, 
  end_time, 
  party_size, 
  status, 
  total_amount, 
  discount_amount, 
  final_amount, 
  payment_status,
  notes,
  created_by,
  created_at
) 
VALUES 
  -- Past bookings (completed)
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'BK-10001',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    CURRENT_DATE - INTERVAL '30 days',
    '14:00',
    '15:30',
    6,
    'completed',
    180.00,
    0.00,
    180.00,
    'paid',
    'Great experience! Loved the challenge.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '31 days'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'BK-10002',
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    CURRENT_DATE - INTERVAL '25 days',
    '18:00',
    '19:15',
    8,
    'completed',
    150.00,
    15.00,
    135.00,
    'paid',
    'Corporate team building event.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '26 days'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'BK-10003',
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '20 days',
    '16:00',
    '17:00',
    5,
    'completed',
    120.00,
    0.00,
    120.00,
    'paid',
    'Birthday party for 10-year-old.',
    '10000000-0000-0000-0000-000000000004',
    NOW() - INTERVAL '22 days'
  ),
  
  -- Recent bookings (last week)
  (
    '40000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'BK-10004',
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000005',
    CURRENT_DATE - INTERVAL '7 days',
    '20:00',
    '21:30',
    6,
    'completed',
    200.00,
    0.00,
    200.00,
    'paid',
    'Advanced players. Completed in 82 minutes!',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '8 days'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'BK-10005',
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000004',
    CURRENT_DATE - INTERVAL '5 days',
    '15:00',
    '16:00',
    4,
    'completed',
    130.00,
    0.00,
    130.00,
    'paid',
    'Mystery enthusiasts. Solved it in 45 minutes.',
    '10000000-0000-0000-0000-000000000004',
    NOW() - INTERVAL '6 days'
  ),
  
  -- Today's bookings
  (
    '40000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'BK-10006',
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    '11:00',
    '12:00',
    4,
    'checked_in',
    120.00,
    0.00,
    120.00,
    'paid',
    'First-time visitors. Checked in 10 minutes ago.',
    '10000000-0000-0000-0000-000000000004',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'BK-10007',
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000006',
    CURRENT_DATE,
    '14:30',
    '15:30',
    6,
    'confirmed',
    140.00,
    0.00,
    140.00,
    'paid',
    'Confirmed for this afternoon.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 days'
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000001',
    'BK-10008',
    '30000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000002',
    CURRENT_DATE,
    '19:00',
    '20:15',
    7,
    'confirmed',
    150.00,
    0.00,
    150.00,
    'paid',
    'Evening booking. College group.',
    '10000000-0000-0000-0000-000000000004',
    NOW() - INTERVAL '1 day'
  ),
  
  -- Tomorrow's bookings
  (
    '40000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000001',
    'BK-10009',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    CURRENT_DATE + INTERVAL '1 day',
    '13:00',
    '14:30',
    5,
    'confirmed',
    180.00,
    0.00,
    180.00,
    'paid',
    'VIP customer. Preferred time slot.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '12 hours'
  ),
  (
    '40000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'BK-10010',
    '30000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000004',
    CURRENT_DATE + INTERVAL '1 day',
    '17:00',
    '18:00',
    2,
    'confirmed',
    130.00,
    0.00,
    130.00,
    'paid',
    'Anniversary celebration. Requested romantic setup.',
    '10000000-0000-0000-0000-000000000004',
    NOW() - INTERVAL '6 hours'
  ),
  
  -- Future bookings (this week)
  (
    '40000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'BK-10011',
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    CURRENT_DATE + INTERVAL '3 days',
    '16:00',
    '17:15',
    10,
    'confirmed',
    150.00,
    30.00,
    120.00,
    'paid',
    'Corporate team building. Group discount applied.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 days'
  ),
  (
    '40000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    'BK-10012',
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000006',
    CURRENT_DATE + INTERVAL '5 days',
    '15:00',
    '16:00',
    8,
    'confirmed',
    140.00,
    0.00,
    140.00,
    'paid',
    'Weekend booking for family.',
    '10000000-0000-0000-0000-000000000004',
    NOW() - INTERVAL '1 day'
  ),
  
  -- Pending booking (payment not yet received)
  (
    '40000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000001',
    'BK-10013',
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000005',
    CURRENT_DATE + INTERVAL '7 days',
    '19:00',
    '20:30',
    6,
    'pending',
    200.00,
    0.00,
    200.00,
    'pending',
    'Awaiting payment confirmation.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '3 hours'
  ),
  
  -- Cancelled booking
  (
    '40000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000001',
    'BK-10014',
    '30000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '2 days',
    '12:00',
    '13:00',
    4,
    'cancelled',
    120.00,
    0.00,
    120.00,
    'refunded',
    'Customer cancelled due to emergency. Full refund issued.',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  payment_status = EXCLUDED.payment_status,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =====================================================
-- PAYMENTS
-- =====================================================

-- Create payment records for paid bookings
INSERT INTO payments (
  id,
  booking_id,
  stripe_payment_intent_id,
  stripe_charge_id,
  amount,
  currency,
  status,
  payment_method_type,
  last_4,
  card_brand,
  receipt_url
)
VALUES
  -- Payment for BK-10001
  (
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'pi_demo_1001',
    'ch_demo_1001',
    180.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo1'
  ),
  -- Payment for BK-10002
  (
    '50000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    'pi_demo_1002',
    'ch_demo_1002',
    135.00,
    'USD',
    'paid',
    'card',
    '5555',
    'mastercard',
    'https://stripe.com/receipt/demo2'
  ),
  -- Payment for BK-10003
  (
    '50000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000003',
    'pi_demo_1003',
    'ch_demo_1003',
    120.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo3'
  ),
  -- Payment for BK-10004
  (
    '50000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000004',
    'pi_demo_1004',
    'ch_demo_1004',
    200.00,
    'USD',
    'paid',
    'card',
    '1234',
    'amex',
    'https://stripe.com/receipt/demo4'
  ),
  -- Payment for BK-10005
  (
    '50000000-0000-0000-0000-000000000005',
    '40000000-0000-0000-0000-000000000005',
    'pi_demo_1005',
    'ch_demo_1005',
    130.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo5'
  ),
  -- Payment for BK-10006 (today - checked in)
  (
    '50000000-0000-0000-0000-000000000006',
    '40000000-0000-0000-0000-000000000006',
    'pi_demo_1006',
    'ch_demo_1006',
    120.00,
    'USD',
    'paid',
    'card',
    '5555',
    'mastercard',
    'https://stripe.com/receipt/demo6'
  ),
  -- Payment for BK-10007
  (
    '50000000-0000-0000-0000-000000000007',
    '40000000-0000-0000-0000-000000000007',
    'pi_demo_1007',
    'ch_demo_1007',
    140.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo7'
  ),
  -- Payment for BK-10008
  (
    '50000000-0000-0000-0000-000000000008',
    '40000000-0000-0000-0000-000000000008',
    'pi_demo_1008',
    'ch_demo_1008',
    150.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo8'
  ),
  -- Payment for BK-10009 (tomorrow)
  (
    '50000000-0000-0000-0000-000000000009',
    '40000000-0000-0000-0000-000000000009',
    'pi_demo_1009',
    'ch_demo_1009',
    180.00,
    'USD',
    'paid',
    'card',
    '5555',
    'mastercard',
    'https://stripe.com/receipt/demo9'
  ),
  -- Payment for BK-10010
  (
    '50000000-0000-0000-0000-000000000010',
    '40000000-0000-0000-0000-000000000010',
    'pi_demo_1010',
    'ch_demo_1010',
    130.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo10'
  ),
  -- Payment for BK-10011
  (
    '50000000-0000-0000-0000-000000000011',
    '40000000-0000-0000-0000-000000000011',
    'pi_demo_1011',
    'ch_demo_1011',
    120.00,
    'USD',
    'paid',
    'card',
    '1234',
    'amex',
    'https://stripe.com/receipt/demo11'
  ),
  -- Payment for BK-10012
  (
    '50000000-0000-0000-0000-000000000012',
    '40000000-0000-0000-0000-000000000012',
    'pi_demo_1012',
    'ch_demo_1012',
    140.00,
    'USD',
    'paid',
    'card',
    '4242',
    'visa',
    'https://stripe.com/receipt/demo12'
  ),
  -- Refund for cancelled booking BK-10014
  (
    '50000000-0000-0000-0000-000000000014',
    '40000000-0000-0000-0000-000000000014',
    'pi_demo_1014',
    'ch_demo_1014',
    120.00,
    'USD',
    'refunded',
    'card',
    '5555',
    'mastercard',
    'https://stripe.com/receipt/demo14'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Create sample notifications for demo users
INSERT INTO notifications (
  id,
  user_id,
  organization_id,
  type,
  priority,
  title,
  message,
  action_url,
  action_label,
  is_read,
  created_at
)
VALUES
  -- Unread notifications
  (
    '60000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'booking',
    'high',
    'New Booking Received',
    'BK-10013 - Christopher Davis booked The Lost Temple for ' || TO_CHAR(CURRENT_DATE + INTERVAL '7 days', 'Mon DD') || ' at 7:00 PM',
    '/bookings',
    'View Booking',
    false,
    NOW() - INTERVAL '10 minutes'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'payment',
    'medium',
    'Payment Received',
    'Payment of $140.00 received for BK-10012',
    '/payments',
    'View Payment',
    false,
    NOW() - INTERVAL '2 hours'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'booking',
    'medium',
    'Customer Checked In',
    'Daniel Brown checked in for BK-10006 - The Mysterious Library',
    '/bookings',
    'View Details',
    false,
    NOW() - INTERVAL '15 minutes'
  ),
  
  -- Read notifications
  (
    '60000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'cancellation',
    'high',
    'Booking Cancelled',
    'BK-10014 has been cancelled - Full refund processed',
    '/bookings',
    'View Details',
    true,
    NOW() - INTERVAL '1 day'
  ),
  (
    '60000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'message',
    'medium',
    'New Customer Inquiry',
    'Ethan Taylor sent a message about booking details',
    '/inbox',
    'View Message',
    true,
    NOW() - INTERVAL '6 hours'
  ),
  (
    '60000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'staff',
    'low',
    'Shift Reminder',
    'Your shift starts in 1 hour - Front Desk',
    '/staff',
    'View Schedule',
    true,
    NOW() - INTERVAL '12 hours'
  ),
  (
    '60000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'system',
    'medium',
    'System Update',
    'BookingTMS v2.1 deployed successfully',
    '/settings',
    'View Changes',
    true,
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO UPDATE SET
  is_read = EXCLUDED.is_read,
  updated_at = NOW();

-- =====================================================
-- SUMMARY & STATS
-- =====================================================

-- This will display summary after running the seed
DO $$
DECLARE
  org_count INTEGER;
  user_count INTEGER;
  game_count INTEGER;
  customer_count INTEGER;
  booking_count INTEGER;
  payment_count INTEGER;
  notification_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO game_count FROM games;
  SELECT COUNT(*) INTO customer_count FROM customers;
  SELECT COUNT(*) INTO booking_count FROM bookings;
  SELECT COUNT(*) INTO payment_count FROM payments;
  SELECT COUNT(*) INTO notification_count FROM notifications;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'BOOKINGTMS DEMO DATA SEED COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Organizations: %', org_count;
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Games/Rooms: %', game_count;
  RAISE NOTICE 'Customers: %', customer_count;
  RAISE NOTICE 'Bookings: %', booking_count;
  RAISE NOTICE 'Payments: %', payment_count;
  RAISE NOTICE 'Notifications: %', notification_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Demo Credentials:';
  RAISE NOTICE 'Super Admin: superadmin@bookingtms.com / demo123';
  RAISE NOTICE 'Admin: admin@bookingtms.com / demo123';
  RAISE NOTICE 'Manager: manager@bookingtms.com / demo123';
  RAISE NOTICE 'Staff: staff@bookingtms.com / demo123';
  RAISE NOTICE '========================================';
END $$;
