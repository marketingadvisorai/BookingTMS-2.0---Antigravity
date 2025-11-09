# 🚀 Resend Email Setup - Step by Step

## ✅ Step 1: API Key Received!

Your Resend API Key: `re_7NcdFMcz_LWtRe9vP25JmGLz5rzZHxAze`

---

## 📋 Step 2: Add API Key to Supabase

### **Option A: Using Supabase Dashboard (Easiest)**

1. **Go to your Supabase Dashboard:**
   - https://supabase.com/dashboard

2. **Select your project**

3. **Go to Project Settings:**
   - Click the ⚙️ gear icon in the left sidebar
   - Select "Edge Functions"

4. **Add Secret:**
   - Scroll to "Secrets" section
   - Click "Add new secret"
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_7NcdFMcz_LWtRe9vP25JmGLz5rzZHxAze`
   - Click "Save"

### **Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (you'll need your project reference ID)
supabase link --project-ref YOUR_PROJECT_REF

# Add the secret
supabase secrets set RESEND_API_KEY=re_7NcdFMcz_LWtRe9vP25JmGLz5rzZHxAze
```

---

## 📊 Step 3: Create Database Tables

1. **Go to Supabase Dashboard → SQL Editor**

2. **Click "New Query"**

3. **Copy and paste the entire contents of:**
   ```
   supabase/migrations/create_email_tables.sql
   ```

4. **Click "Run"** (or press Cmd/Ctrl + Enter)

5. **You should see:**
   ```
   ✅ Email system database schema created successfully!
   📊 Tables created: 5 tables
   🔧 Helper functions created
   🔒 Row Level Security enabled
   📝 Default templates inserted
   ```

**Tables Created:**
- ✅ `email_templates` - Email templates
- ✅ `email_campaigns` - Campaign management
- ✅ `email_logs` - Email tracking
- ✅ `email_workflows` - Automated workflows
- ✅ `email_subscribers` - Subscriber management

---

## 🚀 Step 4: Deploy Edge Function

### **Option A: Using Supabase CLI (Recommended)**

```bash
# Make sure you're in the project directory
cd /Users/muhammadtariqul/Downloads/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2

# Deploy the send-email function
supabase functions deploy send-email

# You should see:
# ✅ Function deployed successfully
# 📍 URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email
```

### **Option B: Using Supabase Dashboard**

1. **Go to Edge Functions in dashboard**
2. **Click "Create Function"**
3. **Name:** `send-email`
4. **Copy code from:** `supabase/functions/send-email/index.ts`
5. **Click "Deploy"**

---

## 🧪 Step 5: Test Email Sending

### **Test 1: Simple Test Email**

Run this in your browser console or create a test file:

```javascript
// Replace with your Supabase URL and anon key
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'your-email@example.com', // ⚠️ CHANGE THIS!
    subject: 'Test Email from Booking TMS',
    html: '<h1>Hello World!</h1><p>This is a test email from your Booking TMS system.</p>',
    text: 'Hello World! This is a test email from your Booking TMS system.'
  }),
});

const data = await response.json();
console.log('Email sent:', data);
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "abc123...",
  "data": { ... }
}
```

**Check:** Your inbox for the test email! 📧

---

## 📧 Step 6: Configure Sender Email

### **For Testing (Use Resend's Domain)**

The Edge Function is already configured to use `onboarding@resend.dev` for testing.

### **For Production (Use Your Domain)**

1. **Go to Resend Dashboard → Domains**
2. **Click "Add Domain"**
3. **Enter your domain:** `yourdomain.com`
4. **Add DNS Records** (shown in Resend):
   - TXT record for verification
   - MX record for receiving
   - DMARC record for security
5. **Wait 5-10 minutes for DNS propagation**
6. **Click "Verify Domain"**
7. **Update Edge Function:**
   - Change `from: 'onboarding@resend.dev'`
   - To: `from: 'bookings@yourdomain.com'`

---

## 🎯 Step 7: Send Booking Confirmation with QR Code

Create a new file: `src/lib/email/emailService.ts`

```typescript
import { supabase } from '../supabase/client';
import { BookingConfirmationEmailTemplate } from './templates/bookingConfirmationWithQR';

export class EmailService {
  static async sendBookingConfirmation(booking: any) {
    try {
      // Generate email HTML with QR code
      const emailHTML = await BookingConfirmationEmailTemplate.generateHTML({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        bookingId: booking.id,
        escaperoomName: booking.room_name,
        bookingDate: new Date(booking.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        bookingTime: booking.time,
        playerCount: booking.player_count,
        totalAmount: `$${booking.total_amount}`,
        businessName: 'Your Escape Room', // ⚠️ CHANGE THIS
        businessAddress: '123 Main St, City, State', // ⚠️ CHANGE THIS
        businessPhone: '(555) 123-4567', // ⚠️ CHANGE THIS
        waiverUrl: `${window.location.origin}/waiver/${booking.waiver_template_id}`,
        qrCodeEnabled: true,
        qrCodeMessage: 'Scan to complete your waiver'
      });

      // Send via Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: booking.customer_email,
          subject: `🎉 Booking Confirmed - ${booking.room_name}`,
          html: emailHTML,
          customerId: booking.customer_id,
          recipientName: booking.customer_name
        }
      });

      if (error) throw error;

      console.log('✅ Booking confirmation sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to send booking confirmation:', error);
      return { success: false, error };
    }
  }

  static async sendWaiverReminder(booking: any) {
    // Similar implementation for waiver reminders
  }

  static async sendBookingReminder(booking: any) {
    // Similar implementation for booking reminders
  }
}
```

---

## 📊 Step 8: Monitor Email Performance

### **In Resend Dashboard:**
1. Go to **Logs** to see all sent emails
2. Check **Analytics** for:
   - Delivery rate
   - Open rate
   - Click rate
   - Bounce rate

### **In Supabase:**
Query the `email_logs` table:

```sql
-- Recent emails
SELECT * FROM email_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Email statistics
SELECT 
  status,
  COUNT(*) as count
FROM email_logs
GROUP BY status;

-- Open rate
SELECT 
  COUNT(CASE WHEN status IN ('opened', 'clicked') THEN 1 END) * 100.0 / COUNT(*) as open_rate
FROM email_logs
WHERE status != 'failed';
```

---

## ✅ Setup Checklist

- [x] Resend account created
- [x] API key obtained: `re_7NcdFMcz_LWtRe9vP25JmGLz5rzZHxAze`
- [ ] API key added to Supabase secrets
- [ ] Database tables created
- [ ] Edge Function deployed
- [ ] Test email sent successfully
- [ ] (Optional) Domain verified in Resend
- [ ] Email service integrated in app
- [ ] Booking confirmation tested

---

## 🎉 Next Steps

Once setup is complete:

1. **Test the full flow:**
   - Create a test booking
   - Verify email is sent
   - Check QR code works
   - Test waiver link

2. **Enable automated workflows:**
   - Go to Marketing → Email Campaigns
   - Enable workflows you want

3. **Monitor performance:**
   - Check Resend dashboard daily
   - Review email_logs table
   - Optimize based on metrics

---

## 🆘 Troubleshooting

### **Email not sending:**
- ✅ Check API key is correct in Supabase
- ✅ Verify Edge Function is deployed
- ✅ Check Edge Function logs in Supabase
- ✅ Ensure recipient email is valid

### **Email going to spam:**
- ✅ Verify domain in Resend
- ✅ Add all DNS records (SPF, DKIM, DMARC)
- ✅ Avoid spam trigger words
- ✅ Include unsubscribe link

### **QR code not showing:**
- ✅ Check qr_code_enabled is true
- ✅ Verify waiver URL is valid
- ✅ Check browser console for errors

---

## 📞 Support

- **Resend Docs:** https://resend.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions:** https://supabase.com/docs/guides/functions

---

**Status:** Ready to configure! 🚀
**Time Required:** ~15 minutes
**Cost:** $0/month (Free tier)
