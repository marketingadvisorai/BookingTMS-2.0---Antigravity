# BookingTMS Troubleshooting Guide

> Version: 0.1.48  
> Last Updated: 2025-11-28

Solutions for common issues and error messages.

---

## Table of Contents

1. [Widget Issues](#widget-issues)
2. [Payment Issues](#payment-issues)
3. [Booking Issues](#booking-issues)
4. [Authentication Issues](#authentication-issues)
5. [Performance Issues](#performance-issues)
6. [Error Messages](#error-messages)

---

## Widget Issues

### Widget Not Loading

**Symptoms:**
- Blank container
- Loading spinner stuck
- Console errors

**Solutions:**

1. **Check embed key**
   ```javascript
   // Verify the embed key is correct
   console.log('Embed key:', embedKey);
   ```

2. **Check browser console**
   - Open DevTools (F12)
   - Look for red errors
   - Note any CORS errors

3. **Verify domain whitelist**
   - Go to Settings → Widgets
   - Add your domain to allowed origins

4. **Test in incognito**
   - Rules out browser extensions
   - Clears cached issues

5. **Check Content Security Policy**
   ```html
   <!-- Add to your site's CSP -->
   frame-src 'self' https://yourdomain.com;
   ```

### Widget Shows "No Activities"

**Causes:**
- No published activities
- Venue has no activities linked
- Activity schedule is empty

**Fix:**
1. Go to Activities
2. Ensure activity is **Published** (not Draft)
3. Verify activity is linked to the venue
4. Check schedule has operating days set

### Widget Calendar Shows No Dates

**Causes:**
- Schedule not configured
- All dates blocked
- Advance booking limit reached

**Fix:**
1. Edit activity → Step 5 (Schedule)
2. Verify operating days are selected
3. Check blocked dates list
4. Increase advance booking days

### Widget Styling Broken

**Causes:**
- CSS conflicts with host site
- Missing fonts
- z-index issues

**Fix:**
1. Use iframe embed (isolates styles)
2. Add CSS specificity:
   ```css
   #bookingtms-widget * {
     box-sizing: border-box;
   }
   ```
3. Load Inter font if missing

---

## Payment Issues

### Checkout Not Redirecting

**Symptoms:**
- Click "Continue to Payment" does nothing
- Console shows Stripe errors

**Solutions:**

1. **Check Stripe connection**
   - Settings → Payments
   - Verify Stripe is connected
   - Re-authenticate if needed

2. **Verify Stripe keys**
   - Ensure using correct mode (test/live)
   - Check keys are not revoked

3. **Check activity has prices**
   - Activity must have Stripe price ID
   - Re-sync prices in Step 6

### Payment Succeeded but No Booking

**Causes:**
- Webhook not configured
- Webhook secret mismatch
- Server error during creation

**Fix:**
1. Check Stripe Dashboard → Webhooks
2. Verify webhook URL is correct:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```
3. Check webhook signing secret matches
4. View webhook logs for errors

### Refund Not Processing

**Causes:**
- Original charge too old
- Stripe account issue
- Already refunded

**Fix:**
1. Check Stripe Dashboard for charge status
2. Verify refund policy allows it
3. Check for existing refunds
4. Process manually in Stripe if needed

### "Payment Failed" Error

**Common Causes & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `card_declined` | Card rejected | Use different card |
| `insufficient_funds` | No balance | Use different card |
| `expired_card` | Card expired | Update card |
| `incorrect_cvc` | Wrong CVC | Re-enter card |
| `processing_error` | Stripe issue | Retry later |

---

## Booking Issues

### Cannot Create Booking

**Symptoms:**
- Form won't submit
- "No availability" error
- Stuck on loading

**Solutions:**

1. **Check session availability**
   - Verify time slot exists
   - Check capacity isn't full
   - Ensure date isn't blocked

2. **Verify customer data**
   - Valid email format
   - Phone number filled
   - Required fields complete

3. **Check activity status**
   - Must be Published
   - Must have schedule
   - Must have pricing

### Booking Shows Wrong Time

**Causes:**
- Timezone mismatch
- DST transition issues

**Fix:**
1. Verify venue timezone setting
2. Check customer's browser timezone
3. Times are stored in UTC, displayed in local

### Cannot Cancel Booking

**Causes:**
- Past cancellation deadline
- Already cancelled
- Payment not refundable

**Fix:**
1. Check cancellation policy settings
2. Override with admin cancel if needed
3. Process refund separately if required

### Duplicate Bookings

**Causes:**
- Double-click on submit
- Webhook fired twice
- Network retry

**Fix:**
1. Check if both bookings have payments
2. Cancel the duplicate
3. Refund if necessary
4. Implement idempotency keys (technical fix)

---

## Authentication Issues

### Cannot Log In

**Solutions:**

1. **Reset password**
   - Click "Forgot Password"
   - Check spam folder for email

2. **Check email**
   - Verify correct email address
   - Case sensitive check

3. **Clear browser data**
   - Clear cookies for site
   - Try incognito mode

4. **Check account status**
   - May be deactivated
   - Contact organization admin

### Session Expired Frequently

**Causes:**
- Short token expiry
- Clock sync issues
- Multiple tabs

**Fix:**
1. Check system clock is accurate
2. Use single tab/window
3. Contact admin to check session settings

### "Unauthorized" Errors

**Causes:**
- Token expired
- Insufficient permissions
- API key revoked

**Fix:**
1. Log out and log back in
2. Verify your role has permission
3. Check API key status

---

## Performance Issues

### Slow Loading

**Solutions:**

1. **Check network**
   - Test internet speed
   - Try different network

2. **Clear cache**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)

3. **Reduce data**
   - Use date filters
   - Paginate large lists

4. **Check browser**
   - Update to latest version
   - Disable heavy extensions

### Widget Loads Slowly

**Solutions:**

1. **Lazy load widget**
   ```javascript
   // Load only when visible
   const observer = new IntersectionObserver((entries) => {
     if (entries[0].isIntersecting) {
       loadWidget();
     }
   });
   observer.observe(container);
   ```

2. **Use iframe**
   - Loads in background
   - Doesn't block main page

3. **Optimize images**
   - Compress cover images
   - Use WebP format

### Dashboard Unresponsive

**Solutions:**

1. **Reduce date range**
   - Filter to smaller period
   - Avoid "All Time" on large datasets

2. **Refresh page**
   - Close and reopen tab
   - Clear local state

3. **Check browser memory**
   - Close unused tabs
   - Restart browser

---

## Error Messages

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `INVALID_EMBED_KEY` | Embed key not found | Check key is correct and active |
| `ACTIVITY_NOT_FOUND` | Activity doesn't exist | Verify activity ID |
| `NO_AVAILABILITY` | No slots available | Check schedule and capacity |
| `CAPACITY_EXCEEDED` | Party size too large | Reduce party size |
| `VALIDATION_ERROR` | Invalid input | Check required fields |
| `STRIPE_ERROR` | Payment issue | Check Stripe setup |
| `UNAUTHORIZED` | Access denied | Log in again |
| `RATE_LIMITED` | Too many requests | Wait and retry |

### Supabase Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `PGRST301` | JWT expired | Refresh session |
| `PGRST204` | No rows returned | Check query parameters |
| `23505` | Duplicate key | Record already exists |
| `23503` | Foreign key violation | Referenced record missing |
| `42501` | RLS violation | Check permissions |

### Network Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | Server unreachable | Check server status |
| `ETIMEDOUT` | Request timeout | Check network, retry |
| `CORS error` | Cross-origin blocked | Add domain to whitelist |
| `ERR_CERT` | SSL issue | Check certificate |

---

## Debug Mode

### Enable Debug Logging

```javascript
// Add to widget initialization
BookingTMS.init({
  embedKey: 'your-key',
  debug: true, // Enables console logging
});
```

### View Debug Info

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for `[BookingTMS]` prefixed logs

### Common Debug Steps

1. **Check network requests**
   - DevTools → Network tab
   - Filter by "XHR" or "Fetch"
   - Look for red (failed) requests

2. **Check local storage**
   - DevTools → Application → Local Storage
   - Look for `bookingtms_` keys

3. **Check console errors**
   - Red errors are critical
   - Yellow warnings may indicate issues

---

## Getting Help

### Before Contacting Support

1. Note the error message (exact text)
2. Get browser info (browser/version)
3. Screenshot the issue
4. Note steps to reproduce
5. Check this guide first

### Support Channels

- **Documentation**: Check `/docs` folder
- **Help Center**: In-app `?` icon
- **Email**: support@yourdomain.com
- **GitHub Issues**: For bug reports

### Information to Provide

```
Browser: Chrome 120
OS: macOS 14.1
URL: https://example.com/booking
Error: "INVALID_EMBED_KEY"
Steps: 1. Opened page 2. Widget shows error
Console: [screenshot]
```
