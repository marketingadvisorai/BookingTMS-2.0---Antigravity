# 🚀 BookingTMS Quick Start Card

**Version**: 3.2.2  
**Status**: ✅ Ready to Use  
**Last Updated**: November 4, 2025

---

## ⚡ 30-Second Start

```bash
npm run dev
```

**Open**: http://localhost:3000  
**Login**: `superadmin@bookingtms.com` / any password  
**Done!** Explore the app.

---

## 📋 What You Get

✅ **17 Admin Pages** - Dashboard, Bookings, Games, Customers, Reports, etc.  
✅ **6 Booking Widgets** - Customer-facing booking interfaces  
✅ **100+ Components** - Shadcn/UI based, production-ready  
✅ **Dark Mode** - Full system with toggle  
✅ **RBAC System** - Role-based access control  
✅ **Notifications** - Complete notification center  
✅ **Mock Data** - Works without database setup  

---

## 🎯 Two Modes

### Mode 1: Demo Mode (Default) 📦
**No setup required** - Just works!

```bash
npm run dev
```

- Uses mock data (localStorage)
- All features functional
- Perfect for testing/development
- No database needed

### Mode 2: Production Mode 🚀
**5 minutes to connect Supabase**

1. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Restart server:
   ```bash
   npm run dev
   ```

**Guide**: `/CONNECT_TO_SUPABASE.md`

---

## 🔑 Demo Users

| Email | Role | Access |
|-------|------|--------|
| `superadmin@bookingtms.com` | Super Admin | Full access + user management |
| `admin@bookingtms.com` | Admin | Full operational access |
| `manager@bookingtms.com` | Manager | View + limited edit |

**Password**: Anything (mock mode ignores password)

---

## 🎨 Features to Try

### Admin Portal
- ✅ Dashboard with KPI cards
- ✅ Bookings management (calendar view)
- ✅ Games/Rooms management
- ✅ Customer CRM
- ✅ Payment history
- ✅ Reports & analytics
- ✅ Dark mode toggle (⚡ icon in header)
- ✅ Notifications center (🔔 icon)
- ✅ User management (Account Settings)

### Booking Widgets
- ✅ FareBook Widget (with dark mode!)
- ✅ Calendar Widget
- ✅ List Widget
- ✅ Quick Book Widget
- ✅ Multi-Step Widget
- ✅ Resolvex Widget

---

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Check environment
node verify-env.js

# Install dependencies
npm install

# Install Supabase (optional)
npm install @supabase/supabase-js

# Clean restart
rm -rf node_modules
npm install
npm run dev
```

---

## 📖 Documentation

### Getting Started
- **README**: `/README.md`
- **Fix Summary**: `/FIX_SUMMARY.md`
- **Troubleshooting**: `/TROUBLESHOOTING.md`

### Supabase Setup
- **Quick Start**: `/SUPABASE_QUICK_START.md` (5 min)
- **Complete Guide**: `/CONNECT_TO_SUPABASE.md` (detailed)
- **Setup Guide**: `/SUPABASE_SETUP_GUIDE.md` (30 pages)
- **Environment Fix**: `/SUPABASE_ENV_FIX.md`

### Development
- **Guidelines**: `/guidelines/Guidelines.md`
- **Quick Reference**: `/guidelines/AI_AGENT_QUICK_START.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Components**: `/guidelines/COMPONENT_LIBRARY.md`

### PRD & Architecture
- **PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md` (50 pages)
- **Quick PRD**: `/PRD_QUICK_START.md`
- **Status**: `/PROJECT_STATUS_SUMMARY.md`

---

## 🐛 Troubleshooting

### App won't start
```bash
rm -rf node_modules
npm install
npm run dev
```

### "process is not defined"
✅ **Already fixed!** Just restart:
```bash
npm run dev
```

### Styling looks wrong
Check if dark mode is on (⚡ icon in header)

### Login doesn't work
Use: `superadmin@bookingtms.com` / any password

**More help**: `/TROUBLESHOOTING.md`

---

## 🎯 Next Steps

### Today (5 minutes)
- [ ] Start app: `npm run dev`
- [ ] Log in and explore
- [ ] Toggle dark mode
- [ ] Check notifications
- [ ] Try booking widgets

### This Week (Optional)
- [ ] Connect Supabase (5 min setup)
- [ ] Add sample data
- [ ] Explore RBAC system
- [ ] Customize branding

### Future
- [ ] Stripe integration (payments)
- [ ] Email notifications (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Deploy to production

---

## 💡 Pro Tips

1. **Dark Mode**: Toggle with ⚡ icon in header
2. **Switch Users**: Top-right dropdown (in demo mode)
3. **Notifications**: Bell icon (🔔) in header
4. **Mobile View**: Resize browser to see responsive design
5. **Keyboard**: Tab through forms to test accessibility

---

## 📊 Project Stats

- **Pages**: 17 admin pages
- **Widgets**: 6 booking widgets
- **Components**: 100+ reusable components
- **Lines of Code**: 25,000+
- **Documentation Files**: 30+
- **Dark Mode**: 100% coverage
- **Responsive**: Mobile-first design
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🎉 You're Ready!

```
┌─────────────────────────────────┐
│  Everything is set up!          │
│                                 │
│  Just run: npm run dev          │
│                                 │
│  Then explore and enjoy! 🚀     │
└─────────────────────────────────┘
```

**Questions?** Check `/TROUBLESHOOTING.md`  
**Issues?** See `/FIX_SUMMARY.md`  
**Want Supabase?** Read `/CONNECT_TO_SUPABASE.md`

---

**Happy building!** 💙
