# System Admin Dialogs - Complete Implementation Guide

**Status**: ✅ Complete  
**Date**: November 15, 2025  
**Version**: 1.0.0

---

## 📋 Overview

Comprehensive dialog system for System Admin Dashboard with full CRUD operations, confirmation screens, and professional UI.

---

## 🎯 Features Implemented

### 1. **View Owner Dialog** (`ViewOwnerDialog.tsx`)
**Purpose**: Display detailed owner information in a read-only view

**Features**:
- Complete owner profile overview
- Contact information with clickable links
- Organization ID display
- Plan and status badges
- Enabled features list
- Account statistics (venues, features, uptime)
- Public profile link with preview
- Quick actions: Edit Owner, Delete Owner

**Trigger**: Click Eye (👁️) icon in Owners table

**Dark Mode**: ✅ Fully supported

---

### 2. **Edit Owner Dialog** (`EditOwnerDialog.tsx`)
**Purpose**: Update existing owner information and settings

**Features**:
- **Basic Information**:
  - Owner Name
  - Organization Name
  - Organization ID
- **Contact Information**:
  - Email Address
  - Website URL
- **Plan & Settings**:
  - Plan selection (Basic/Growth/Pro)
  - Number of venues
  - Status (Active/Inactive)
- **Feature Toggles**:
  - AI Agents
  - Waivers
  - Analytics
  - Marketing
  - Booking Widgets

**Validation**: ✅ All required fields validated

**Save Behavior**: Updates owner in state, shows success toast

**Trigger**: Click Edit (✏️) icon or "Edit Owner" button in View dialog

**Dark Mode**: ✅ Fully supported

---

### 3. **Delete Owner Dialog** (`DeleteOwnerDialog.tsx`)
**Purpose**: Safely delete owner with confirmation

**Features**:
- **⚠️ Warning Message**: Clear explanation of consequences
- **Impact Summary**: Shows what will be deleted:
  - Organization data
  - Associated venues (count displayed)
  - Booking history
  - Payment information
  - Analytics data
- **Owner Details Review**: Shows all info before deletion
- **Confirmation Input**: Must type "DELETE" to confirm
- **Safety Check**: Delete button disabled until confirmation typed

**Delete Behavior**: Removes owner from state, shows success toast

**Trigger**: Click Delete (🗑️) icon or "Delete" button in View dialog

**Dark Mode**: ✅ Fully supported

**Security**: 🔒 Requires typing "DELETE" to confirm

---

### 4. **Add Owner Dialog** (`AddOwnerDialog.tsx`)
**Purpose**: Create new owner account

**Features**:
- **Basic Information** (Required):
  - Owner Name *
  - Organization Name *
  - Organization ID *
- **Contact Information**:
  - Email Address * (validated)
  - Website URL (optional)
- **Plan & Settings**:
  - Plan selection with pricing display
  - Number of venues
  - Status
- **Feature Toggles**:
  - Select which features to enable
  - Default: Booking Widgets enabled
- **Auto-generated**:
  - Profile slug from organization name
  - Unique ID

**Validation**:
- ✅ Required fields checked
- ✅ Email format validated
- ✅ All fields must be filled

**Add Behavior**: Adds new owner to state, shows success toast

**Trigger**: Click "Add Owner" button in Owners table header

**Dark Mode**: ✅ Fully supported

---

### 5. **Manage Plan Dialog** (`ManagePlanDialog.tsx`)
**Purpose**: Edit subscription plan details and features

**Features**:
- **Current Stats Display**:
  - Active Subscribers count
  - Monthly Revenue calculation
- **Plan Details**:
  - Plan Name
  - Monthly Price
  - Brand Color (color picker + hex input)
- **Features Management**:
  - Add new features
  - Remove existing features
  - Reorder features
  - Visual list with checkmarks
- **Live Preview**: Shows how plan card will look
- **Revenue Calculation**: Auto-calculates (price × subscribers)

**Validation**:
- ✅ Plan name required
- ✅ Price must be > 0
- ✅ At least one feature required

**Save Behavior**: Updates plan in state, shows success toast

**Trigger**: Click "Manage Plan" button in plan cards

**Dark Mode**: ✅ Fully supported

---

## 🎨 Design System Compliance

### Colors (Light Mode)
- **Inputs**: `bg-gray-100 border-gray-300 placeholder:text-gray-500`
- **Cards**: `bg-white border border-gray-200 shadow-sm`
- **Labels**: `text-gray-700`
- **Secondary Text**: `text-gray-600`
- **Primary Actions**: `bg-indigo-600 hover:bg-indigo-700`

### Colors (Dark Mode)
- **Background**: `bg-[#161616]`
- **Secondary BG**: `bg-[#0a0a0a]`
- **Text**: `text-white`
- **Muted Text**: `text-gray-400`
- **Borders**: `border-[#333]`
- **Primary Actions**: `bg-indigo-600 hover:bg-indigo-700`

### Typography
- All default typography from `globals.css`
- No font size/weight overrides unless specified

### Components
- All Shadcn UI components
- Explicit styling overrides applied
- Consistent spacing and padding

---

## 🔄 State Management

### SystemAdminDashboard State
```tsx
const [owners, setOwners] = useState(ownersData);
const [plans, setPlans] = useState(plansData);
const [selectedOwnerForView, setSelectedOwnerForView] = useState<any>(null);
const [selectedOwnerForEdit, setSelectedOwnerForEdit] = useState<any>(null);
const [selectedOwnerForDelete, setSelectedOwnerForDelete] = useState<any>(null);
const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
const [selectedPlanForManage, setSelectedPlanForManage] = useState<any>(null);
```

### Data Flow
1. **View**: Reads from state, no modifications
2. **Edit**: Updates existing owner in state
3. **Delete**: Removes owner from state
4. **Add**: Appends new owner to state
5. **Manage Plan**: Updates plan in state

---

## 📱 Mobile Responsiveness

All dialogs are mobile-optimized:
- ✅ Scrollable content (max-h-[90vh])
- ✅ Responsive grid layouts (grid-cols-1 md:grid-cols-2)
- ✅ Touch-friendly buttons (minimum 44x44px)
- ✅ Proper spacing on small screens
- ✅ Horizontal scrolling for tables

---

## 🚀 Usage Examples

### Opening View Dialog
```tsx
<Button onClick={() => handleViewOwner(owner.id)}>
  <Eye className="w-4 h-4" />
</Button>

// Handler
const handleViewOwner = (id: number) => {
  const owner = owners.find(o => o.id === id);
  if (owner) {
    setSelectedOwnerForView(owner);
  }
};
```

### Opening Edit Dialog
```tsx
<Button onClick={() => handleEditOwner(owner.id)}>
  <Edit className="w-4 h-4" />
</Button>

// Handler
const handleEditOwner = (id: number) => {
  const owner = owners.find(o => o.id === id);
  if (owner) {
    setSelectedOwnerForEdit(owner);
  }
};
```

### Opening Delete Dialog
```tsx
<Button onClick={() => handleDeleteOwner(owner.id)}>
  <Trash2 className="w-4 h-4" />
</Button>

// Handler
const handleDeleteOwner = (id: number) => {
  const owner = owners.find(o => o.id === id);
  if (owner) {
    setSelectedOwnerForDelete(owner);
  }
};
```

### Opening Add Dialog
```tsx
<Button onClick={() => setShowAddOwnerDialog(true)}>
  <Users className="w-4 h-4 mr-2" />
  Add Owner
</Button>
```

### Opening Manage Plan Dialog
```tsx
<Button onClick={() => setSelectedPlanForManage(plan)}>
  Manage Plan
</Button>
```

---

## ✅ Testing Checklist

### View Owner Dialog
- [ ] Opens when clicking Eye icon
- [ ] Displays all owner information correctly
- [ ] Contact links work (email, website)
- [ ] Public profile link opens in new tab
- [ ] Edit button opens Edit dialog
- [ ] Delete button opens Delete dialog
- [ ] Close button works
- [ ] Dark mode styling correct

### Edit Owner Dialog
- [ ] Opens when clicking Edit icon
- [ ] Form pre-filled with owner data
- [ ] All inputs editable
- [ ] Plan dropdown works
- [ ] Feature toggles work
- [ ] Save updates owner in table
- [ ] Cancel discards changes
- [ ] Toast notification appears
- [ ] Dark mode styling correct

### Delete Owner Dialog
- [ ] Opens when clicking Delete icon
- [ ] Warning message displays
- [ ] Owner details shown correctly
- [ ] Confirmation input required
- [ ] Delete button disabled until "DELETE" typed
- [ ] Delete removes owner from table
- [ ] Cancel preserves owner
- [ ] Toast notification appears
- [ ] Dark mode styling correct

### Add Owner Dialog
- [ ] Opens when clicking "Add Owner"
- [ ] All fields empty initially
- [ ] Required field validation works
- [ ] Email validation works
- [ ] Plan dropdown works
- [ ] Feature toggles work
- [ ] Add creates new owner in table
- [ ] Cancel discards form
- [ ] Toast notification appears
- [ ] Profile slug auto-generated
- [ ] Dark mode styling correct

### Manage Plan Dialog
- [ ] Opens when clicking "Manage Plan"
- [ ] Form pre-filled with plan data
- [ ] Stats display correctly
- [ ] Price updates revenue calculation
- [ ] Color picker works
- [ ] Can add new features
- [ ] Can remove features
- [ ] Preview updates in real-time
- [ ] Save updates plan card
- [ ] Cancel discards changes
- [ ] Toast notification appears
- [ ] Dark mode styling correct

---

## 📊 Component Files

```
components/systemadmin/
├── ViewOwnerDialog.tsx      # View owner details
├── EditOwnerDialog.tsx      # Edit owner information
├── DeleteOwnerDialog.tsx    # Delete with confirmation
├── AddOwnerDialog.tsx       # Create new owner
└── ManagePlanDialog.tsx     # Manage subscription plans
```

---

## 🎯 Future Enhancements

### Phase 2 (Database Integration)
- [ ] Connect to Supabase backend
- [ ] Real-time data synchronization
- [ ] Server-side validation
- [ ] Error handling for API failures
- [ ] Loading states during operations

### Phase 3 (Advanced Features)
- [ ] Bulk owner operations
- [ ] Export owner data
- [ ] Import owners from CSV
- [ ] Advanced filtering and search
- [ ] Activity logs and audit trail
- [ ] Email notifications on changes

### Phase 4 (Analytics)
- [ ] Owner performance metrics
- [ ] Revenue forecasting
- [ ] Churn analysis
- [ ] Usage analytics
- [ ] Custom reports

---

## 🐛 Troubleshooting

### Dialog doesn't open
- Check state variable is set correctly
- Verify dialog component is rendered
- Check `isOpen` prop is truthy

### Data not updating
- Verify handler functions are called
- Check state update logic
- Ensure IDs match correctly

### Styling issues
- Verify all theme classes applied
- Check dark mode context
- Ensure explicit overrides present

### Validation errors
- Check all required fields filled
- Verify email format
- Ensure proper data types

---

## 📚 Related Documentation

- **Main Guide**: `/Guidelines.md`
- **System Admin Guide**: `/SYSTEM_ADMIN_COMPLETE_FINAL.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Library**: `/guidelines/COMPONENT_LIBRARY.md`

---

**Last Updated**: November 15, 2025  
**Maintained By**: BookingTMS Development Team  
**Status**: ✅ Production Ready
