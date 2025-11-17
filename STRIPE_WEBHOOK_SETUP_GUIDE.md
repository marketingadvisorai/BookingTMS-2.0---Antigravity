# Stripe Webhook Setup Guide 🔗

**Date:** November 17, 2025  
**Backend URL:** https://bookingtms-backend-api.onrender.com  
**Webhook Endpoint:** `/api/payments/webhook`  
**Webhook Secret:** `whsec_nCAs0hPwMSafx6ch96uOfftQiL2d74kW`

---

## 🎯 Overview

This guide shows you how to configure Stripe webhooks to send real-time payment events to your BookingTMS backend. You can use either the **Stripe Dashboard** (recommended) or the **Stripe CLI**.

---

## ✅ Option 1: Stripe Dashboard (Recommended)

### **Step 1: Navigate to Webhooks**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** in the left sidebar
3. Click **Webhooks**

### **Step 2: Add Endpoint**
1. Click **"Add endpoint"** or **"Create an event destination"**
2. Enter the webhook URL:
   ```
   https://bookingtms-backend-api.onrender.com/api/payments/webhook
   ```

### **Step 3: Select Events**
Select the following events to listen to:

#### **Payment Events:**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`

#### **Charge Events:**
- ✅ `charge.succeeded`
- ✅ `charge.failed`
- ✅ `charge.refunded`
- ✅ `charge.dispute.created`

#### **Transfer Events:**
- ✅ `transfer.created`

**OR** Select **"Select all payment events"** to receive all payment-related webhooks.

### **Step 4: Configure Endpoint**
1. **Description:** Enter a description like "BookingTMS Payment Webhooks"
2. **API Version:** Use your account's default API version (or latest)
3. **Events:** Ensure all payment events are selected
4. Click **"Add endpoint"**

### **Step 5: Verify Signing Secret**
1. After creating the endpoint, click on it
2. You'll see the **Signing secret** (starts with `whsec_`)
3. **Verify it matches:** `whsec_nCAs0hPwMSafx6ch96uOfftQiL2d74kW`
4. ✅ If it matches, you're all set!
5. ❌ If it doesn't match, update the environment variable in Render

---

## 🖥️ Option 2: Stripe CLI

### **Prerequisites:**
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

### **Create Webhook Endpoint:**

```bash
stripe webhook_endpoints create \
  --url https://bookingtms-backend-api.onrender.com/api/payments/webhook \
  --description "BookingTMS Payment Webhooks" \
  --enabled-events payment_intent.succeeded \
  --enabled-events payment_intent.payment_failed \
  --enabled-events charge.succeeded \
  --enabled-events charge.failed \
  --enabled-events charge.refunded \
  --enabled-events charge.dispute.created \
  --enabled-events transfer.created
```

**Expected Output:**
```json
{
  "id": "we_xxx",
  "object": "webhook_endpoint",
  "api_version": "2023-10-16",
  "application": null,
  "created": 1700000000,
  "description": "BookingTMS Payment Webhooks",
  "enabled_events": [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "charge.succeeded",
    "charge.failed",
    "charge.refunded",
    "charge.dispute.created",
    "transfer.created"
  ],
  "livemode": false,
  "metadata": {},
  "secret": "whsec_xxx",
  "status": "enabled",
  "url": "https://bookingtms-backend-api.onrender.com/api/payments/webhook"
}
```

### **Get Signing Secret:**
```bash
stripe webhook_endpoints list
```

Look for your endpoint and copy the `secret` value.

---

## 🧪 Testing Webhooks

### **Test from Stripe Dashboard:**

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select event type: `payment_intent.succeeded`
5. Click **"Send test webhook"**

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response: `{"success":true,"received":true,"eventType":"payment_intent.succeeded"}`

### **Test with Stripe CLI:**

#### **Forward Events to Local Development:**
```bash
stripe listen --forward-to http://localhost:3001/api/payments/webhook
```

#### **Trigger Test Event:**
```bash
stripe trigger payment_intent.succeeded
```

#### **Trigger Test Payment:**
```bash
# Create a test payment intent
stripe payment_intents create \
  --amount 10000 \
  --currency usd \
  --payment-method-types card \
  --confirm \
  --payment-method pm_card_visa
```

---

## 🔐 Webhook Security

### **How Signature Verification Works:**

1. **Stripe signs the webhook payload** with your webhook secret
2. **Sends signature in header:** `stripe-signature`
3. **Backend verifies signature** using the webhook secret
4. **Rejects invalid signatures** (prevents tampering)

### **Signature Format:**
```
stripe-signature: t=1700000000,v1=abc123def456...
```

### **Backend Verification Code:**
```typescript
// In payment.service.ts
const event = this.stripe.webhooks.constructEvent(
  payload,
  signature,
  this.webhookSecret  // whsec_nCAs0hPwMSafx6ch96uOfftQiL2d74kW
);
```

---

## 📊 Monitoring Webhooks

### **View Webhook Logs in Stripe Dashboard:**

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent deliveries**
4. Check:
   - ✅ Status codes (200 = success)
   - ✅ Response times
   - ✅ Retry attempts
   - ✅ Error messages

### **View Backend Logs in Render:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on **bookingtms-backend-api**
3. Click **Logs**
4. Look for:
   ```
   [PaymentService] Webhook received: { type: 'payment_intent.succeeded', id: 'evt_xxx' }
   [PaymentService] Payment succeeded: { paymentIntentId: 'pi_xxx', ... }
   ```

---

## 🐛 Troubleshooting

### **Problem: Webhook returns 401 Unauthorized**

**Solution:**
- Check that webhook secret matches in Render environment variables
- Verify signature is being sent in header

### **Problem: Webhook returns 400 Bad Request**

**Solution:**
- Check that payload is valid JSON
- Verify Content-Type header is `application/json`
- Check backend logs for validation errors

### **Problem: Webhook returns 500 Internal Server Error**

**Solution:**
- Check Render logs for error details
- Verify backend is running
- Check database connection

### **Problem: Webhook not receiving events**

**Solution:**
- Verify endpoint URL is correct
- Check that events are selected in Stripe Dashboard
- Ensure webhook is enabled
- Check firewall/security settings

---

## 📝 Webhook Event Handlers

### **What Happens on Each Event:**

#### **payment_intent.succeeded**
```typescript
✅ Update booking status to "confirmed"
✅ Send confirmation email to customer
✅ Notify venue of new booking
✅ Log successful payment
```

#### **payment_intent.payment_failed**
```typescript
✅ Update booking status to "payment_failed"
✅ Send failure notification to customer
✅ Log failed payment
```

#### **charge.refunded**
```typescript
✅ Update booking status to "refunded"
✅ Notify customer and venue
✅ Log refund details
```

#### **charge.dispute.created**
```typescript
✅ Alert admin immediately
✅ Gather evidence for dispute
✅ Log dispute details
```

#### **transfer.created**
```typescript
✅ Log transfer to venue
✅ Update venue balance
```

---

## 🔄 Webhook Retry Logic

### **Stripe Retry Behavior:**

If your endpoint returns a non-2xx status code:
1. **Immediate retry:** After a few seconds
2. **Exponential backoff:** Retries with increasing delays
3. **Maximum retries:** Up to 3 days
4. **Automatic disable:** After 3 days of failures

### **Best Practices:**

✅ **Return 200 quickly:** Process events asynchronously  
✅ **Handle duplicates:** Use `event.id` to prevent duplicate processing  
✅ **Log everything:** Track all webhook events  
✅ **Monitor failures:** Set up alerts for failed webhooks  

---

## ✅ Verification Checklist

### **Before Going Live:**

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] All payment events selected
- [ ] Webhook secret verified
- [ ] Test webhook sent successfully
- [ ] Backend logs show webhook received
- [ ] Payment flow tested end-to-end
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Alerts configured

---

## 🚀 Production Deployment

### **Switch to Live Mode:**

1. **Get Live API Keys:**
   - Go to **Developers** → **API keys**
   - Copy **Live Secret Key** (starts with `sk_live_`)
   - Copy **Live Publishable Key** (starts with `pk_live_`)

2. **Update Render Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

3. **Create Live Webhook:**
   - Switch to **Live mode** in Stripe Dashboard
   - Create new webhook endpoint (same URL)
   - Copy new **Live Webhook Secret** (starts with `whsec_`)
   - Update Render environment variable:
     ```bash
     STRIPE_WEBHOOK_SECRET=whsec_live_xxx
     ```

4. **Test Live Webhook:**
   - Send test webhook in live mode
   - Verify backend receives and processes event
   - Check logs for any errors

---

## 📚 Additional Resources

### **Stripe Documentation:**
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Webhook Event Types](https://stripe.com/docs/api/events/types)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### **BookingTMS Documentation:**
- `STRIPE_CONNECT_PAYMENTS_COMPLETE.md` - Complete payment system docs
- `src/backend/api/routes/payments.routes.ts` - Payment endpoints
- `src/backend/services/payment.service.ts` - Payment logic

---

## 🎉 Summary

**Webhook setup is complete when:**

✅ **Endpoint created** in Stripe Dashboard  
✅ **Events selected** (all payment events)  
✅ **Secret verified** (matches environment variable)  
✅ **Test successful** (200 OK response)  
✅ **Logs confirmed** (backend receives events)  

**Your webhook is now ready to receive real-time payment events!** 🚀

---

**Need Help?**
- Check Render logs for errors
- Review Stripe webhook delivery logs
- Test with Stripe CLI
- Verify environment variables

**Everything is configured and ready for production!** ✨
