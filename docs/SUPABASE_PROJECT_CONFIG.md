# Supabase Project Configuration

## OFFICIAL PROJECT - DO NOT CHANGE

All agents and developers MUST use this configuration:

### Supabase Project
- **Project ID:** `qftjyjpitnoapqxlrvfs`
- **Project URL:** `https://qftjyjpitnoapqxlrvfs.supabase.co`
- **Dashboard:** `https://supabase.com/dashboard/project/qftjyjpitnoapqxlrvfs`

### GitHub Repository
- **Repo:** `https://github.com/marketingadvisorai/BookingTMS-2.0---Antigravity`
- **Branch:** `main` (all PRs should target main)

### CLI Commands
Always use `--project-ref qftjyjpitnoapqxlrvfs`:
```bash
# Deploy functions
supabase functions deploy <function-name> --project-ref qftjyjpitnoapqxlrvfs

# Set secrets
supabase secrets set KEY=value --project-ref qftjyjpitnoapqxlrvfs

# List secrets
supabase secrets list --project-ref qftjyjpitnoapqxlrvfs
```

### Environment Variables
```env
SUPABASE_URL=https://qftjyjpitnoapqxlrvfs.supabase.co
VITE_SUPABASE_URL=https://qftjyjpitnoapqxlrvfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGp5anBpdG5vYXBxeGxydmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzIyOTAsImV4cCI6MjA3OTE0ODI5MH0.nO1YARU8309UaV5U1I-fxGeMYJg7CzWXOn2KQvqao7Y
```

### Deployed Edge Functions
- `stripe-manage-product` - Create/update Stripe products
- `create-checkout-session` - Create Stripe checkout
- `verify-checkout-session` - Verify payment
- `stripe-direct` - Direct Stripe API calls

### Secrets Configured
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_PUBLISHABLE_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅

### Database Tables (Key)
- `organizations` - Multi-tenant orgs
- `venues` - Physical locations
- `activities` - Bookable activities (16 records)
- `activity_sessions` - Time slots
- `bookings` - Reservations
- `customers` - Customer records (5 records)
- `users` - App users

---

## ⚠️ IMPORTANT FOR ALL AGENTS

1. **DO NOT** use any other Supabase project ID
2. **DO NOT** create new Supabase projects
3. **ALWAYS** push to the same GitHub repo
4. **ALWAYS** use `--project-ref qftjyjpitnoapqxlrvfs` for CLI commands
5. **VERIFY** you're on the correct project before making changes

---

Updated: 2025-11-27
