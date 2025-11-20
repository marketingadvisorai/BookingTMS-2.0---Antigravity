# Email Campaign System Architecture 📧

## Overview
Comprehensive architecture for implementing a fully functional email campaign system integrated with Supabase and Resend email service.

---

## 🏗️ System Architecture

```
Frontend (React) → Supabase (Database + Edge Functions) → Resend API → Recipients
```

**Components:**
1. **Frontend:** Marketing tab, template editor, campaign builder
2. **Supabase:** PostgreSQL database, Edge Functions for email processing
3. **Resend:** Email delivery service (3,000 free emails/month)
4. **Webhooks:** Track opens, clicks, bounces

---

## 📊 Database Schema (5 Tables)

### 1. email_templates
- Stores reusable email templates
- Fields: name, category, subject, body, variables, is_active
- Supports transactional, marketing, engagement types

### 2. email_campaigns
- Campaign management and scheduling
- Fields: name, status, scheduled_at, recipient_count, analytics
- Tracks: delivered, opened, clicked, bounced, conversions

### 3. email_logs
- Individual email tracking
- Fields: recipient, status, sent_at, opened_at, clicked_at
- Links to campaigns, templates, customers, bookings

### 4. email_workflows
- Automated email triggers
- Fields: trigger_type, delay_minutes, is_active
- Triggers: booking_created, reminder_24h, waiver_pending, etc.

### 5. email_subscribers
- Subscriber management
- Fields: email, is_subscribed, preferences
- Handles unsubscribes and preferences

---

## 🔧 Supabase Edge Functions (4 Functions)

### 1. send-email
- Sends individual emails via Resend API
- Logs to email_logs table
- Returns provider message ID

### 2. send-campaign
- Sends bulk campaign emails
- Processes recipients in batches of 100
- Updates campaign statistics

### 3. process-email-webhooks
- Handles Resend webhooks
- Updates email_logs with delivery status
- Tracks opens, clicks, bounces

### 4. trigger-workflow-emails
- Automatically sends emails based on triggers
- Replaces template variables
- Updates workflow statistics

---

## 🎯 Frontend Implementation

### EmailService Client
```typescript
// src/lib/email/emailService.ts
- sendEmail(params)
- createCampaign(params)
- sendCampaign(campaignId)
- getCampaignAnalytics(campaignId)
- triggerWorkflowEmail(type, data)
- getEmailLogs(filters)
- updateSubscription(email, isSubscribed)
```

### Template Engine
```typescript
// src/lib/email/templateEngine.ts
- replaceVariables(template, variables)
- extractVariables(template)
- validateTemplate(template, requiredVars)
```

### React Hooks
```typescript
// src/hooks/useCampaignBuilder.ts
- createCampaign()
- sendCampaign()
- loading state management
```

---

## 🔌 Integration Points

### Booking Created
```typescript
await EmailService.triggerWorkflowEmail('booking_created', {
  recipient: { email, name },
  variables: { customerName, bookingDate, bookingTime, etc }
});
```

### Booking Reminder (24h)
- Scheduled cron job
- Queries bookings for tomorrow
- Sends reminder emails automatically

### Waiver Pending
- Triggered after booking if waiver not signed
- Includes waiver link
- Tracks reminder sends

---

## 📦 Email Service: Resend

**Why Resend:**
- ✅ 3,000 free emails/month
- ✅ Modern developer API
- ✅ Excellent deliverability
- ✅ Built-in analytics
- ✅ Webhook support

**Setup:**
1. Sign up at resend.com
2. Get API key
3. Add to Supabase: `supabase secrets set RESEND_API_KEY=xxx`
4. Verify domain
5. Configure webhooks

---

## 🚀 Implementation Plan (5 Phases)

### Phase 1: Foundation (Week 1)
- Create database tables
- Set up Resend account
- Deploy send-email function
- Test basic sending

### Phase 2: Templates & Workflows (Week 2)
- Migrate templates to database
- Implement variable replacement
- Deploy trigger-workflow function
- Test automation

### Phase 3: Campaigns (Week 3)
- Build campaign UI
- Implement recipient selection
- Deploy send-campaign function
- Add scheduling

### Phase 4: Analytics (Week 4)
- Deploy webhook handler
- Implement tracking
- Create analytics dashboard
- Test end-to-end

### Phase 5: Polish (Week 5)
- Unsubscribe management
- Rate limiting
- Retry logic
- Documentation

---

## 💰 Cost Estimation

**Resend:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Scale: $80/month for 500,000 emails

**Supabase:**
- Free tier sufficient for most use cases
- Edge Functions: Free tier includes 500K invocations

**Total Monthly Cost:**
- Small business (<3K emails): $0
- Medium business (<50K emails): $20
- Large business (<500K emails): $80

---

## ✅ Next Steps

1. **Review Architecture** - Confirm approach
2. **Create Database Tables** - Run SQL migrations
3. **Set Up Resend** - Get API key
4. **Deploy Edge Functions** - Test email sending
5. **Build Frontend** - Implement EmailService
6. **Test Workflows** - Verify automation
7. **Launch** - Go live with email campaigns

Ready to start implementation? 🚀
