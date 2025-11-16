# System Admin Dialogs - Quick Reference Card

**⚡ 30-Second Quick Start** | Last Updated: November 15, 2025

---

## 🎯 5 Complete Dialogs

| Dialog | Icon | Purpose | Confirmation Required |
|--------|------|---------|----------------------|
| **View Owner** | 👁️ Eye | Read-only owner details | ❌ No |
| **Edit Owner** | ✏️ Edit | Update owner information | ❌ No |
| **Delete Owner** | 🗑️ Trash | Remove owner permanently | ✅ **Yes - Type "DELETE"** |
| **Add Owner** | ➕ Plus | Create new owner | ❌ No |
| **Manage Plan** | 👑 Crown | Edit subscription plans | ❌ No |

---

## 🚀 Quick Usage

### View Owner
```tsx
<Button onClick={() => handleViewOwner(owner.id)}>
  <Eye className="w-4 h-4" />
</Button>
```
**Shows**: Profile, contact, plan, venues, features, stats

---

### Edit Owner
```tsx
<Button onClick={() => handleEditOwner(owner.id)}>
  <Edit className="w-4 h-4" />
</Button>
```
**Edits**: Name, email, website, plan, status, features

---

### Delete Owner
```tsx
<Button onClick={() => handleDeleteOwner(owner.id)}>
  <Trash2 className="w-4 h-4" />
</Button>
```
**⚠️ WARNING**: Must type "DELETE" to confirm  
**Deletes**: All data, venues, bookings, payments

---

### Add Owner
```tsx
<Button onClick={() => setShowAddOwnerDialog(true)}>
  <Users className="w-4 h-4 mr-2" />
  Add Owner
</Button>
```
**Required**: Owner name, organization, ID, email  
**Auto-generates**: Profile slug

---

### Manage Plan
```tsx
<Button onClick={() => setSelectedPlanForManage(plan)}>
  Manage Plan
</Button>
```
**Edits**: Name, price, color, features  
**Shows**: Subscribers, revenue, preview

---

## 🎨 Design Compliance

### Light Mode
- Inputs: `bg-gray-100 border-gray-300`
- Cards: `bg-white border-gray-200`
- Labels: `text-gray-700`

### Dark Mode
- Background: `bg-[#161616]`
- Text: `text-white`
- Borders: `border-[#333]`

---

## ✅ Quick Testing

### Test Each Dialog
1. ✅ Opens on click
2. ✅ Shows correct data
3. ✅ All inputs work
4. ✅ Save/Add updates table
5. ✅ Cancel preserves data
6. ✅ Toast notifications appear
7. ✅ Dark mode styling correct

### Delete Dialog Only
8. ✅ Warning displayed
9. ✅ Must type "DELETE"
10. ✅ Delete button disabled until confirmed

---

## 🔄 State Variables

```tsx
// In SystemAdminDashboard.tsx
const [owners, setOwners] = useState(ownersData);
const [plans, setPlans] = useState(plansData);
const [selectedOwnerForView, setSelectedOwnerForView] = useState(null);
const [selectedOwnerForEdit, setSelectedOwnerForEdit] = useState(null);
const [selectedOwnerForDelete, setSelectedOwnerForDelete] = useState(null);
const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
const [selectedPlanForManage, setSelectedPlanForManage] = useState(null);
```

---

## 📱 Features

- ✅ Full dark mode support
- ✅ Mobile responsive
- ✅ Form validation
- ✅ Confirmation screens
- ✅ Toast notifications
- ✅ Auto-save to state
- ✅ Professional UI
- ✅ Accessibility compliant

---

## 🎯 Action Buttons in Owners Table

| Button | Color | Action |
|--------|-------|--------|
| Profile Dropdown | Gray | View/Settings/Embed |
| Eye | Blue | View details |
| Edit | Blue | Edit owner |
| Trash | Red | Delete owner |

---

## 🔒 Delete Confirmation Flow

1. Click Delete button (🗑️)
2. Warning dialog appears
3. Shows impact summary
4. Type "DELETE" in input
5. Delete button enables
6. Click "Delete Owner Permanently"
7. Owner removed from table
8. Success toast appears

---

## 📊 Files Reference

```
components/systemadmin/
├── ViewOwnerDialog.tsx      # 220 lines
├── EditOwnerDialog.tsx      # 240 lines
├── DeleteOwnerDialog.tsx    # 180 lines
├── AddOwnerDialog.tsx       # 280 lines
└── ManagePlanDialog.tsx     # 260 lines
```

---

## 🐛 Common Issues

### Dialog won't open
- Check state variable is set
- Verify `isOpen={!!variable}`

### Data not saving
- Check handler function called
- Verify state update logic

### Styling looks wrong
- Check dark mode context
- Verify explicit class overrides

---

## 📚 Full Documentation

See `/SYSTEM_ADMIN_DIALOGS_COMPLETE.md` for:
- Complete feature list
- Detailed examples
- Testing checklist
- Troubleshooting guide

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Total Components**: 5 dialogs  
**Total Lines**: ~1,180 lines of code
