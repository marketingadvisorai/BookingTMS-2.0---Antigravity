# AI Agent Implementation Guide
**For: Claude, GPT-4, Sonnet, and other AI coding assistants**  
**Project:** Booking TMS MVP - Escape Room Booking Engine  
**Date:** November 18, 2025

---

## 🤖 HOW TO USE THIS GUIDE

This document provides **exact, step-by-step instructions** for implementing the MVP roadmap.

**Before starting any task:**
1. Read `MVP_ROADMAP_2025-11-18.md` for context
2. Read this guide for the specific task
3. Read the target files before modifying
4. Make changes incrementally
5. Test after each change

---

## 📂 KEY FILES REFERENCE

### **Booking Engine Core**
- `src/components/widgets/CalendarWidget.tsx` - Main booking widget
- `src/hooks/useBookings.ts` - Booking data hooks
- `src/services/SupabaseBookingService.ts` - Backend booking service
- `src/core/domain/booking/Booking.types.ts` - Type definitions

### **Payment Integration**
- `src/lib/payments/checkoutService.ts` - Stripe checkout
- `src/backend/api/routes/payments.routes.ts` - Payment webhooks
- `src/pages/BookingSuccess.tsx` - Success page
- `src/pages/BookingCancelled.tsx` - Cancellation page

### **Email & Notifications**
- `src/lib/email/emailService.ts` - Email service
- `src/lib/email/templates/bookingConfirmationWithQR.ts` - Email template

### **Admin Dashboard**
- `src/pages/Dashboard.tsx` - Main dashboard
- `src/pages/Bookings.tsx` - Bookings management
- `src/pages/Games.tsx` - Game management

### **Database**
- `src/types/supabase.ts` - Database types
- Database functions: Create via Supabase dashboard

---

## 🎯 IMPLEMENTATION PRIORITIES

### **Week 1: Core Booking Engine**
1. Simplify CalendarWidget for escape rooms
2. Fix payment stability
3. Implement email confirmations
4. Create embeddable widget

### **Week 2: Admin & Management**
5. Refine admin dashboard
6. Improve game management
7. Enhance customer management
8. Build reporting/analytics

### **Week 3: Polish & Launch**
9-12. Polish all features and prepare for launch

---

## 🔧 COMMON PATTERNS

### **Data Fetching Pattern**
```typescript
// Always use React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### **Error Handling Pattern**
```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('User-friendly error message');
}
```

### **Form Validation Pattern**
```typescript
// Use react-hook-form for forms
const { register, handleSubmit, formState: { errors } } = useForm();
```

---

## ⚠️ CRITICAL RULES

1. **Never expose secrets** - Use environment variables
2. **Always validate input** - Both client and server
3. **Use RLS policies** - Ensure data isolation in Supabase
4. **Test on mobile** - Mobile-first approach
5. **Handle loading states** - Never leave users hanging
6. **Log errors** - But don't expose sensitive info

---

## 📝 TASK TEMPLATES

### **Before Starting Any Task:**
```typescript
// 1. Read the current implementation
// 2. Understand the data flow
// 3. Identify dependencies
// 4. Create a backup branch
// 5. Make incremental changes
// 6. Test after each change
```

### **After Completing Any Task:**
```typescript
// 1. Run build: npm run build
// 2. Test manually
// 3. Check mobile responsiveness
// 4. Update documentation
// 5. Commit with clear message
// 6. Update roadmap status
```

---

## 🚀 QUICK START FOR AGENTS

**To implement Task 1 (Booking Widget):**
1. Read `src/components/widgets/CalendarWidget.tsx`
2. Create simplified version in new file
3. Test booking flow end-to-end
4. Replace old widget with new one

**To implement Task 2 (Payment):**
1. Read `src/lib/payments/checkoutService.ts`
2. Add idempotency keys
3. Implement webhook handler
4. Test with Stripe test cards

**To implement Task 3 (Email):**
1. Read `src/lib/email/emailService.ts`
2. Implement email queue
3. Create email templates
4. Test email delivery

---

## 📊 SUCCESS CRITERIA

Each task must meet these criteria before marking complete:
- ✅ Code compiles without errors
- ✅ Manual testing passes
- ✅ Mobile responsive
- ✅ Error handling implemented
- ✅ Documentation updated
- ✅ Performance acceptable

---

**For detailed step-by-step instructions for each task, see the MVP_ROADMAP document.**

**Last Updated:** 2025-11-18 07:40 UTC+06
