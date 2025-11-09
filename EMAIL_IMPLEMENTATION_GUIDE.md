# Email System Implementation Guide 🚀

## Step-by-Step Implementation

---

## Step 1: Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- 1. Email Templates Table
CREATE TABLE email_templates (
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
CREATE TABLE email_campaigns (
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
CREATE TABLE email_logs (
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
CREATE TABLE email_workflows (
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
CREATE TABLE email_subscribers (
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
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_workflows_trigger ON email_workflows(trigger_type);
CREATE INDEX idx_email_subscribers_email ON email_subscribers(email);
```

---

## Step 2: Set Up Resend Account

1. **Sign up:** https://resend.com
2. **Verify email**
3. **Get API Key:**
   - Go to API Keys section
   - Create new API key
   - Copy the key (starts with `re_`)
4. **Add to Supabase:**
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_key_here
   ```

---

## Step 3: Create Supabase Edge Functions

### Create send-email function:
```bash
supabase functions new send-email
```

**File: supabase/functions/send-email/index.ts**
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
        from: 'bookings@yourdomain.com', // Change this!
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

### Deploy function:
```bash
supabase functions deploy send-email
```

---

## Step 4: Create Frontend Email Service

**File: src/lib/email/emailService.ts**
```typescript
import { supabase } from '../supabase/client';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  campaignId?: string;
}

export class EmailService {
  static async sendEmail(params: SendEmailParams) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params
    });

    if (error) throw error;
    return data;
  }

  static async getTemplates() {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createTemplate(template: any) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: any) {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCampaigns() {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getEmailLogs(campaignId?: string) {
    let query = supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
}
```

**File: src/lib/email/templateEngine.ts**
```typescript
export class TemplateEngine {
  static replaceVariables(
    template: string, 
    variables: Record<string, any>
  ): string {
    let result = template;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(variables[key] || ''));
    });

    return result;
  }

  static extractVariables(template: string): string[] {
    const regex = /{{(\w+)}}/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    return matches;
  }
}
```

---

## Step 5: Update Marketing.tsx to Use Database

**Add to Marketing.tsx:**
```typescript
import { EmailService } from '../lib/email/emailService';
import { TemplateEngine } from '../lib/email/templateEngine';

// Load templates from database
useEffect(() => {
  const loadTemplates = async () => {
    try {
      const dbTemplates = await EmailService.getTemplates();
      if (dbTemplates && dbTemplates.length > 0) {
        setEmailTemplates(dbTemplates);
      } else {
        // Use default templates if database is empty
        setEmailTemplates(getDefaultTemplates());
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setEmailTemplates(getDefaultTemplates());
    }
  };

  loadTemplates();
}, []);

// Save template to database
const handleSaveEditedTemplate = async (editedTemplate: EmailTemplate) => {
  try {
    await EmailService.updateTemplate(editedTemplate.id, {
      name: editedTemplate.name,
      subject: editedTemplate.subject,
      body: editedTemplate.body,
      variables: editedTemplate.variables,
      updated_at: new Date().toISOString()
    });
    
    // Refresh templates
    const templates = await EmailService.getTemplates();
    setEmailTemplates(templates);
    
    toast.success(`"${editedTemplate.name}" updated successfully!`);
  } catch (error) {
    console.error('Error saving template:', error);
    toast.error('Failed to save template');
  }
};

// Send test email
const handleSendTestEmail = async (template: EmailTemplate) => {
  try {
    const testVariables = {
      customerName: 'John Doe',
      escaperoomName: 'Mystery Manor',
      bookingDate: 'Nov 15, 2025',
      bookingTime: '7:00 PM',
      bookingId: 'BK-123456'
    };

    const subject = TemplateEngine.replaceVariables(template.subject, testVariables);
    const body = TemplateEngine.replaceVariables(template.body, testVariables);

    await EmailService.sendEmail({
      to: 'your-email@example.com', // Change this!
      subject,
      html: body,
      text: body,
      templateId: template.id
    });

    toast.success('Test email sent!');
  } catch (error) {
    console.error('Error sending test email:', error);
    toast.error('Failed to send test email');
  }
};
```

---

## Step 6: Integrate with Booking System

**In your booking creation code:**
```typescript
// After successful booking creation
try {
  await EmailService.sendEmail({
    to: customer.email,
    subject: `🎉 Booking Confirmed - ${booking.room_name}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${customer.name},</p>
      <p>Your booking for <strong>${booking.room_name}</strong> is confirmed!</p>
      <ul>
        <li>Date: ${booking.date}</li>
        <li>Time: ${booking.time}</li>
        <li>Players: ${booking.player_count}</li>
        <li>Booking ID: #${booking.id}</li>
      </ul>
      <p>See you soon!</p>
    `,
    text: `Booking Confirmed! Hi ${customer.name}, your booking for ${booking.room_name} is confirmed.`
  });
} catch (error) {
  console.error('Failed to send confirmation email:', error);
  // Don't fail the booking if email fails
}
```

---

## Step 7: Test the System

### Test 1: Send Test Email
```typescript
await EmailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World!</h1>',
  text: 'Hello World!'
});
```

### Test 2: Load Templates
```typescript
const templates = await EmailService.getTemplates();
console.log('Templates:', templates);
```

### Test 3: Replace Variables
```typescript
const template = "Hi {{customerName}}, your booking for {{escaperoomName}} is confirmed!";
const result = TemplateEngine.replaceVariables(template, {
  customerName: 'John',
  escaperoomName: 'Mystery Manor'
});
console.log(result); // "Hi John, your booking for Mystery Manor is confirmed!"
```

---

## Step 8: Monitor & Debug

### Check Email Logs
```typescript
const logs = await EmailService.getEmailLogs();
console.log('Recent emails:', logs);
```

### Check Resend Dashboard
- Go to https://resend.com/emails
- View sent emails
- Check delivery status
- Monitor bounces

### Check Supabase Logs
- Go to Supabase Dashboard
- Edge Functions → Logs
- View function invocations
- Check for errors

---

## 🎯 Quick Start Checklist

- [ ] Create database tables in Supabase
- [ ] Sign up for Resend account
- [ ] Get Resend API key
- [ ] Add API key to Supabase secrets
- [ ] Create send-email Edge Function
- [ ] Deploy Edge Function
- [ ] Create EmailService.ts
- [ ] Create TemplateEngine.ts
- [ ] Update Marketing.tsx
- [ ] Test sending email
- [ ] Integrate with booking system
- [ ] Monitor email logs

---

## 🚨 Important Notes

1. **Change Email Address:** Update `from: 'bookings@yourdomain.com'` in Edge Function
2. **Verify Domain:** Add DNS records in Resend to verify your domain
3. **Test Mode:** Resend has test mode - use it first!
4. **Rate Limits:** Free tier: 3,000 emails/month, 100 emails/day
5. **Error Handling:** Always wrap email sends in try-catch
6. **Don't Block:** Send emails asynchronously, don't block user actions

---

## 📚 Resources

- **Resend Docs:** https://resend.com/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Email Best Practices:** https://resend.com/docs/send-with-nodejs

---

Ready to implement? Start with Step 1! 🚀
