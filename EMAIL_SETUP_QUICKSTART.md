# Email System Setup - Quick Start Guide 🚀

## Overview
Let's set up the complete email system with Resend for sending booking confirmations, waiver reminders, and marketing campaigns.

---

## 📋 Prerequisites

- ✅ Supabase project set up
- ✅ Domain name (for email sending)
- ✅ Credit card (for Resend - free tier available)

---

## 🚀 Step-by-Step Setup (30 minutes)

### **Step 1: Create Resend Account (5 minutes)**

1. **Sign up:** https://resend.com/signup
2. **Verify email:** Check your inbox
3. **Choose plan:** Start with Free (3,000 emails/month)

**Free Tier Includes:**
- 3,000 emails per month
- 100 emails per day
- Email tracking (opens, clicks)
- Webhooks
- API access

---

### **Step 2: Get Resend API Key (2 minutes)**

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: `Booking TMS Production`
4. Copy the key (starts with `re_`)
5. **IMPORTANT:** Save it securely - you can't see it again!

Example: `re_123abc456def789ghi012jkl345mno678`

---

### **Step 3: Add API Key to Supabase (3 minutes)**

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Add Resend API key as secret
supabase secrets set RESEND_API_KEY=re_your_key_here
```

**Alternative (via Dashboard):**
1. Go to Supabase Dashboard
2. Project Settings → Edge Functions → Secrets
3. Add new secret:
   - Name: `RESEND_API_KEY`
   - Value: `re_your_key_here`

---

### **Step 4: Verify Your Domain (10 minutes)**

**Why?** To send emails from your domain (e.g., bookings@yourdomain.com)

1. **In Resend Dashboard:**
   - Go to **Domains**
   - Click **Add Domain**
   - Enter your domain: `yourdomain.com`

2. **Add DNS Records:**
   Resend will show you DNS records to add. Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

   ```
   Type: TXT
   Name: @
   Value: resend-verification=abc123...
   
   Type: MX
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```

3. **Verify:** Click "Verify Domain" in Resend (may take 5-10 minutes)

**Status:** ✅ Verified (green) = Ready to send!

---

### **Step 5: Create Database Tables (5 minutes)**

Run this SQL in Supabase SQL Editor:

```sql
-- 1. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preheader VARCHAR(255),
  body TEXT NOT NULL,
  html_body TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  icon VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_category CHECK (category IN ('transactional', 'marketing', 'engagement'))
);

-- 2. Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  template_id UUID REFERENCES email_templates(id),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused'))
);

-- 3. Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES email_campaigns(id),
  template_id UUID REFERENCES email_templates(id),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  customer_id UUID,
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  provider_message_id VARCHAR(255),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- 4. Email Workflows Table
CREATE TABLE IF NOT EXISTS email_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  template_id UUID REFERENCES email_templates(id),
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Email Subscribers Table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_subscribed BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, email)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_workflows_trigger ON email_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
```

**Status:** ✅ Tables created successfully

---

### **Step 6: Create Supabase Edge Function (5 minutes)**

```bash
# Create the function
supabase functions new send-email

# This creates: supabase/functions/send-email/index.ts
```

**Edit `supabase/functions/send-email/index.ts`:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  try {
    const { to, subject, html, text, templateId, campaignId } = await req.json()

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'bookings@yourdomain.com', // ⚠️ CHANGE THIS!
        to: [to],
        subject,
        html: html || text,
      }),
    })

    const data = await response.json()

    // Log to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('email_logs').insert({
      campaign_id: campaignId,
      template_id: templateId,
      recipient_email: to,
      subject,
      body: text,
      status: response.ok ? 'sent' : 'failed',
      provider_message_id: data.id,
      sent_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Deploy the function:**
```bash
supabase functions deploy send-email
```

---

### **Step 7: Test Email Sending (2 minutes)**

Create `test-email.ts`:

```typescript
const response = await fetch('YOUR_SUPABASE_URL/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test Email from Booking TMS',
    html: '<h1>Hello World!</h1><p>This is a test email.</p>',
    text: 'Hello World! This is a test email.'
  }),
});

const data = await response.json();
console.log('Email sent:', data);
```

**Run test:**
```bash
deno run --allow-net test-email.ts
```

**Check:** Your inbox for the test email! ✅

---

## 🎯 Next Steps

### **1. Send Booking Confirmation with QR Code**

```typescript
import { BookingConfirmationEmailTemplate } from './lib/email/templates/bookingConfirmationWithQR';
import { supabase } from './lib/supabase/client';

// After successful booking
const emailHTML = await BookingConfirmationEmailTemplate.generateHTML({
  customerName: booking.customer_name,
  customerEmail: booking.customer_email,
  bookingId: booking.id,
  escaperoomName: booking.room_name,
  bookingDate: booking.date,
  bookingTime: booking.time,
  playerCount: booking.player_count,
  totalAmount: `$${booking.total_amount}`,
  businessName: 'Your Escape Room',
  businessAddress: '123 Main St, City, State',
  businessPhone: '(555) 123-4567',
  waiverUrl: `${window.location.origin}/waiver/${booking.waiver_template_id}`,
  qrCodeEnabled: true,
  qrCodeMessage: 'Scan to complete your waiver'
});

await supabase.functions.invoke('send-email', {
  body: {
    to: booking.customer_email,
    subject: `🎉 Booking Confirmed - ${booking.room_name}`,
    html: emailHTML
  }
});
```

### **2. Set Up Automated Workflows**

Enable workflows in Marketing tab:
1. Go to **Marketing** → **Email Campaigns**
2. Scroll to **Automated Workflows**
3. Toggle ON for:
   - Booking Confirmation
   - Booking Reminder (24h)
   - Waiver Request
   - Review Request

### **3. Monitor Email Performance**

Check Resend Dashboard for:
- Delivery rate
- Open rate
- Click rate
- Bounce rate

---

## 📊 Cost Breakdown

### **Free Tier (Perfect for Starting)**
- **Resend:** 3,000 emails/month (FREE)
- **Supabase:** 500K Edge Function calls (FREE)
- **Total:** $0/month

### **If You Grow**
- **Resend Pro:** $20/month for 50,000 emails
- **Supabase Pro:** $25/month (optional)
- **Total:** $20-45/month

**Most businesses stay on free tier!**

---

## ✅ Setup Checklist

- [ ] Created Resend account
- [ ] Got Resend API key
- [ ] Added API key to Supabase secrets
- [ ] Verified domain in Resend
- [ ] Created database tables
- [ ] Created send-email Edge Function
- [ ] Deployed Edge Function
- [ ] Sent test email successfully
- [ ] Updated `from` email address in function
- [ ] Tested booking confirmation email
- [ ] Enabled automated workflows

---

## 🆘 Troubleshooting

### **Email Not Sending**
- ✅ Check API key is correct in Supabase secrets
- ✅ Verify domain is verified in Resend
- ✅ Check Edge Function logs in Supabase
- ✅ Ensure `from` email uses verified domain

### **Email Going to Spam**
- ✅ Verify domain with all DNS records
- ✅ Add SPF, DKIM, DMARC records
- ✅ Avoid spam trigger words
- ✅ Include unsubscribe link

### **QR Code Not Showing**
- ✅ Check qr_code_enabled is true in template
- ✅ Verify waiver URL is valid
- ✅ Check QR code generation in browser console

---

## 📚 Resources

- **Resend Docs:** https://resend.com/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Email Best Practices:** https://www.campaignmonitor.com/resources/guides/

---

## 🎉 You're Ready!

Your email system is now set up and ready to send:
- ✅ Booking confirmations with QR codes
- ✅ Waiver reminders
- ✅ Marketing campaigns
- ✅ Automated workflows

**Start sending professional emails to your customers!** 📧

---

**Setup Time:** ~30 minutes
**Status:** ✅ Production Ready
**Cost:** $0/month (up to 3,000 emails)
