# 🤖 AI Agent Builder - Step-by-Step Prompt List for MVP Phase 1 Completion

**BookingTMS SaaS Admin Portal - AI Agent Development Guide**

**Copy and paste these prompts ONE AT A TIME to your AI agent builder. Complete each step before moving to the next.**

---

## 📋 **PRIORITY 1: DATA PERSISTENCE (localStorage) - CRITICAL** 

### **Prompt 1: Fix Bookings Page - localStorage CRUD**

```
TASK: Add complete localStorage persistence to the Bookings page (/pages/Bookings.tsx)

REQUIREMENTS:
1. Add localStorage save/load for all CRUD operations (Create, Read, Update, Delete)
2. Use storage key: 'bookingtms_bookings'
3. Load existing bookings from localStorage on component mount
4. Save to localStorage whenever bookings are created, updated, or deleted
5. Show toast success messages for all operations
6. Handle errors gracefully (localStorage quota exceeded, JSON parse errors)

IMPLEMENTATION DETAILS:
- Create useState for bookings array
- Add useEffect to load from localStorage on mount
- Implement handleCreateBooking() - adds new booking and saves to localStorage
- Implement handleUpdateBooking(id, data) - updates existing and saves to localStorage  
- Implement handleDeleteBooking(id) - removes booking and saves to localStorage
- Add error handling with try/catch blocks
- Show loading states during operations

TESTING CHECKLIST:
✅ Create new booking → Refresh page → Booking still appears
✅ Edit booking → Refresh page → Changes are saved
✅ Delete booking → Refresh page → Booking is gone
✅ Multiple bookings work correctly
✅ No console errors
✅ Toast messages appear for all operations

REFERENCE:
- See /pages/ProfileSettings.tsx for localStorage patterns
- Follow MVP-first approach (no database, only localStorage)
- Use existing booking data structure
```

---

### **Prompt 2: Fix Games Page - localStorage CRUD**

```
TASK: Add complete localStorage persistence to the Games page (/pages/Games.tsx)

REQUIREMENTS:
1. Add localStorage save/load for all CRUD operations
2. Use storage key: 'bookingtms_games'
3. Load existing games from localStorage on component mount
4. Save to localStorage whenever games are created, updated, or deleted
5. Show toast success messages for all operations
6. Handle errors gracefully

IMPLEMENTATION DETAILS:
- Create useState for games array
- Add useEffect to load from localStorage on mount
- Implement handleAddGame() - creates new game and saves to localStorage
- Implement handleEditGame(id, data) - updates existing and saves to localStorage
- Implement handleDeleteGame(id) - removes game and saves to localStorage
- Add confirmation dialog for delete operations
- Add error handling with try/catch blocks

TESTING CHECKLIST:
✅ Add new game/room → Refresh page → Game still appears
✅ Edit game details → Refresh page → Changes are saved
✅ Delete game → Refresh page → Game is gone
✅ Game availability settings persist
✅ No console errors
✅ Toast messages appear for all operations

REFERENCE:
- Use same localStorage pattern as Bookings page
- Follow MVP-first approach (no database, only localStorage)
- Preserve existing game data structure and UI
```

---

### **Prompt 3: Fix Customers Page - localStorage CRUD**

```
TASK: Add complete localStorage persistence to the Customers page (/pages/Customers.tsx)

REQUIREMENTS:
1. Add localStorage save/load for all CRUD operations
2. Use storage key: 'bookingtms_customers'
3. Load existing customers from localStorage on component mount
4. Save to localStorage whenever customers are created, updated, or deleted
5. Show toast success messages for all operations
6. Handle errors gracefully
7. Maintain RBAC permissions (use PermissionGuard)

IMPLEMENTATION DETAILS:
- Create useState for customers array
- Add useEffect to load from localStorage on mount
- Implement handleAddCustomer() - creates new customer and saves to localStorage
- Implement handleEditCustomer(id, data) - updates existing and saves to localStorage
- Implement handleDeleteCustomer(id) - removes customer and saves to localStorage
- Implement handleExportCustomers() - exports to JSON (no actual file download needed for MVP)
- Add confirmation dialogs for delete operations
- Respect RBAC permissions (only Super Admin/Admin can edit/delete)

TESTING CHECKLIST:
✅ Add new customer → Refresh page → Customer still appears
✅ Edit customer details → Refresh page → Changes are saved
✅ Delete customer → Refresh page → Customer is gone
✅ Customer segments are preserved
✅ RBAC permissions work (Manager/Staff can only view)
✅ No console errors
✅ Toast messages appear for all operations

REFERENCE:
- Use same localStorage pattern as previous pages
- Check /components/customers/ for existing dialogs
- Verify RBAC with /lib/auth/permissions.ts
```

---

### **Prompt 4: Fix Account Settings - localStorage Persistence**

```
TASK: Add localStorage persistence to Account Settings page (/pages/AccountSettings.tsx)

REQUIREMENTS:
1. Save user account data to localStorage
2. Use storage key: 'bookingtms_account_settings'
3. Load settings on component mount
4. Save whenever user updates account settings
5. Show toast success messages
6. Only accessible to Super Admin (RBAC check)

IMPLEMENTATION DETAILS:
- Add useEffect to load settings from localStorage on mount
- Update handleSaveSettings() to save to localStorage
- Save company settings, notification preferences, security settings
- Preserve all form field values
- Handle nested objects correctly in JSON.stringify/parse

TESTING CHECKLIST:
✅ Change company name → Save → Refresh → Name persists
✅ Update notification settings → Save → Refresh → Settings persist
✅ Change security settings → Save → Refresh → Settings persist
✅ All tabs save correctly
✅ No console errors
✅ Toast success messages appear

REFERENCE:
- See /pages/ProfileSettings.tsx for similar patterns
- This page already has save buttons working
- Just add localStorage persistence
```

---

### **Prompt 5: Verify Profile Settings - localStorage Already Implemented**

```
TASK: Verify that Profile Settings already has localStorage persistence and is working correctly

REQUIREMENTS:
1. Check /pages/ProfileSettings.tsx for localStorage implementation
2. Test all save buttons (Personal Info, Security, Notifications, Preferences)
3. Verify data persists after page refresh
4. Verify green success state appears on save
5. No changes needed if already working

TESTING CHECKLIST:
✅ Personal Info: Change name → Save → Refresh → Name persists
✅ Security: Toggle 2FA → Save → Refresh → Setting persists
✅ Notifications: Change settings → Save → Refresh → Settings persist
✅ Preferences: Change timezone → Save → Refresh → Setting persists
✅ All save buttons show green success state
✅ No console errors

ACTION:
If everything works: Mark as ✅ Complete
If issues found: Fix and test again
```

---

## 📋 **PRIORITY 2: FORM VALIDATION - HIGH**

### **Prompt 6: Add Form Validation to Bookings Page**

```
TASK: Add comprehensive form validation to booking creation/editing

REQUIREMENTS:
1. Validate all required fields before saving
2. Show specific error messages for each field
3. Prevent duplicate bookings (same customer, same time slot)
4. Validate date/time (no past dates, valid time ranges)
5. Validate email format and phone numbers
6. Show validation errors near the relevant fields

IMPLEMENTATION DETAILS:
- Create validation functions for each field type
- Add state for error messages (errorState)
- Show inline error messages below invalid fields
- Disable submit button until all fields are valid
- Use red text/borders for invalid fields
- Clear errors when user corrects input

VALIDATION RULES:
- Customer name: Required, min 2 characters
- Email: Required, valid email format
- Phone: Required, valid phone format
- Date: Required, cannot be in the past
- Time: Required, must be within business hours
- Game/Room: Required, must be selected
- Number of players: Required, min 1, max room capacity

TESTING CHECKLIST:
✅ Empty fields show error messages
✅ Invalid email shows "Invalid email format"
✅ Past dates show "Cannot book in the past"
✅ Duplicate bookings are prevented
✅ Error messages clear when fixed
✅ Submit button disabled when invalid
✅ User-friendly error messages

REFERENCE:
- Use react-hook-form@7.55.0 if needed
- Follow existing form patterns in the codebase
- Keep errors user-friendly (not technical)
```

---

### **Prompt 7: Add Form Validation to Games Page**

```
TASK: Add comprehensive form validation to game/room creation/editing

REQUIREMENTS:
1. Validate all required fields
2. Prevent duplicate game names
3. Validate capacity (min 1, max reasonable number)
4. Validate pricing (positive numbers only)
5. Validate duration (positive numbers, common time increments)
6. Show inline error messages

VALIDATION RULES:
- Game name: Required, min 3 characters, unique
- Description: Optional, max 500 characters
- Capacity: Required, min 1, max 50
- Duration: Required, 15/30/45/60/75/90 minutes
- Base price: Required, min $0, max $999
- Difficulty: Required, Easy/Medium/Hard

TESTING CHECKLIST:
✅ Empty required fields show errors
✅ Duplicate game names are prevented
✅ Invalid capacity shows error
✅ Negative prices show error
✅ Invalid durations show error
✅ Error messages are clear
✅ Submit button disabled when invalid

REFERENCE:
- Use same validation pattern as Bookings
- Keep consistent error styling
```

---

### **Prompt 8: Add Form Validation to Customers Page**

```
TASK: Add comprehensive form validation to customer creation/editing

REQUIREMENTS:
1. Validate all required fields
2. Prevent duplicate emails
3. Validate email and phone formats
4. Validate birthday (reasonable date range)
5. Show inline error messages

VALIDATION RULES:
- First/Last name: Required, min 2 characters
- Email: Required, valid format, unique
- Phone: Required, valid format
- Birthday: Optional, must be valid date, reasonable range (1900-2024)
- Total bookings: Auto-calculated, read-only
- Lifetime value: Auto-calculated, read-only

TESTING CHECKLIST:
✅ Empty required fields show errors
✅ Duplicate emails are prevented
✅ Invalid email format shows error
✅ Invalid phone format shows error
✅ Invalid birthday shows error
✅ Submit button disabled when invalid

REFERENCE:
- Use same validation pattern as previous forms
- Email format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Phone format: flexible, just check for numbers
```

---

## 📋 **PRIORITY 3: UI POLISH - MEDIUM**

### **Prompt 9: Add Empty States to All Pages**

```
TASK: Add user-friendly empty states when there's no data

PAGES TO UPDATE:
1. /pages/Bookings.tsx - "No bookings yet"
2. /pages/Games.tsx - "No games/rooms yet"
3. /pages/Customers.tsx - "No customers yet"
4. /pages/Notifications.tsx - "No notifications"
5. /pages/PaymentHistory.tsx - "No payment history"

REQUIREMENTS FOR EACH EMPTY STATE:
- Show centered icon (relevant to the page)
- Show friendly heading (e.g., "No bookings yet")
- Show descriptive text (e.g., "Create your first booking to get started")
- Show primary action button (e.g., "Add Booking")
- Use proper dark mode colors
- Make responsive for mobile

DESIGN PATTERN:
```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <Icon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
  <h3 className="text-xl text-gray-900 dark:text-white mb-2">No items yet</h3>
  <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
    Description text here
  </p>
  <Button onClick={handleAdd}>
    <Plus className="w-4 h-4 mr-2" />
    Add Item
  </Button>
</div>
```

TESTING CHECKLIST:
✅ Empty states show when no data exists
✅ Icons are appropriate for each page
✅ Text is helpful and friendly
✅ Buttons work correctly
✅ Looks good in dark mode
✅ Responsive on mobile
✅ Empty state disappears when data is added

REFERENCE:
- Use lucide-react icons
- Follow dark mode color patterns
- Keep messaging positive and helpful
```

---

### **Prompt 10: Add Loading States to All Pages**

```
TASK: Add loading spinners and skeleton loaders while data is being loaded

REQUIREMENTS:
1. Show loading state during initial data load
2. Show loading during save operations
3. Disable buttons during operations
4. Use skeleton loaders for lists
5. Use spinners for button operations

PAGES TO UPDATE:
- /pages/Bookings.tsx
- /pages/Games.tsx
- /pages/Customers.tsx
- /pages/Dashboard.tsx
- /pages/PaymentHistory.tsx

IMPLEMENTATION DETAILS:
- Add isLoading state variable
- Show skeleton loaders while loading data
- Show spinner in buttons during save
- Disable form fields during operations
- Show "Saving..." text on buttons

LOADING PATTERNS:
```tsx
// Page loading
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
) : (
  // Actual content
)}

// Button loading
<Button disabled={isSaving}>
  {isSaving ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="w-4 h-4 mr-2" />
      Save
    </>
  )}
</Button>
```

TESTING CHECKLIST:
✅ Loading states appear during operations
✅ Buttons are disabled while saving
✅ Skeleton loaders match content layout
✅ Loading spinners animate correctly
✅ Loading states work in dark mode
✅ No infinite loading states (always resolves)

REFERENCE:
- Use Skeleton component from /components/ui/skeleton.tsx
- Import Loader2 from lucide-react
- Simulate loading with setTimeout for testing
```

---

### **Prompt 11: Add Smooth Transitions and Animations**

```
TASK: Add subtle animations to improve user experience

REQUIREMENTS:
1. Add fade-in animations for page content
2. Add slide-in animations for modals/dialogs
3. Add smooth transitions for hover states
4. Add loading animations for buttons
5. Keep animations subtle and performant

IMPLEMENTATION DETAILS:
- Use Tailwind transition classes
- Add fade-in for page loads: `animate-in fade-in duration-300`
- Add slide-in for dialogs: `animate-in slide-in-from-bottom duration-300`
- Add hover transitions: `transition-all duration-200`
- Add button press effects: `active:scale-95 transition-transform`

ANIMATION PATTERNS:
```tsx
// Page content fade-in
<div className="animate-in fade-in duration-300">
  {/* Content */}
</div>

// Card hover effect
<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
  {/* Content */}
</Card>

// Button hover/active
<Button className="transition-all duration-200 active:scale-95">
  Click Me
</Button>

// Modal enter animation
<Dialog>
  <DialogContent className="animate-in slide-in-from-bottom duration-300">
    {/* Content */}
  </DialogContent>
</Dialog>
```

TESTING CHECKLIST:
✅ Page transitions are smooth
✅ Modals slide in smoothly
✅ Buttons respond to hover/press
✅ Cards have subtle hover effects
✅ Animations don't cause layout shift
✅ Performance is good (no lag)
✅ Works in dark mode

REFERENCE:
- Keep animations under 300ms
- Use GPU-accelerated properties (transform, opacity)
- Test on slower devices
```

---

### **Prompt 12: Improve Spacing and Visual Hierarchy**

```
TASK: Review and improve spacing consistency across all pages

REQUIREMENTS:
1. Consistent padding/margins across all pages
2. Clear visual hierarchy (headers → content → actions)
3. Proper spacing between sections
4. Consistent card spacing
5. Proper button group spacing

SPACING STANDARDS:
- Page padding: `p-6`
- Section spacing: `space-y-6`
- Card internal padding: `p-6`
- Card spacing: `gap-6`
- Button groups: `gap-3`
- Form field spacing: `space-y-4`
- Form row spacing: `gap-4`

PAGES TO REVIEW:
1. /pages/Dashboard.tsx
2. /pages/Bookings.tsx
3. /pages/Games.tsx
4. /pages/Customers.tsx
5. /pages/Settings.tsx
6. /pages/ProfileSettings.tsx

CHECK FOR:
- Inconsistent spacing between sections
- Cards touching each other
- Cramped button groups
- Uneven form field spacing
- Mobile spacing issues

TESTING CHECKLIST:
✅ Consistent spacing across all pages
✅ Clear visual hierarchy
✅ Breathing room between sections
✅ Mobile spacing looks good
✅ Dark mode spacing is consistent
✅ No overlapping elements

REFERENCE:
- Follow Tailwind spacing scale (4px increments)
- Use space-y for vertical stacks
- Use gap for grids and flex layouts
```

---

## 📋 **PRIORITY 4: TESTING - LOW**

### **Prompt 13: Test Complete Workflows End-to-End**

```
TASK: Test all major user workflows from start to finish

WORKFLOWS TO TEST:

1. **Booking Creation Workflow**
   - Login as Admin
   - Navigate to Bookings page
   - Click "Add Booking"
   - Fill all fields
   - Submit form
   - Verify booking appears in list
   - Refresh page
   - Verify booking persists
   - Edit booking
   - Save changes
   - Verify changes persist
   - Delete booking
   - Verify booking removed

2. **Game Management Workflow**
   - Navigate to Games page
   - Add new game/room
   - Set availability
   - Set pricing
   - Save
   - Verify appears in list
   - Refresh page
   - Verify persists
   - Edit game
   - Update details
   - Save
   - Delete game

3. **Customer Management Workflow**
   - Navigate to Customers page
   - Add new customer
   - Fill contact info
   - Save
   - View customer details
   - Edit customer
   - Update info
   - Save
   - Create booking for customer
   - View customer's bookings
   - Verify booking appears in customer profile

4. **Settings Workflow**
   - Navigate to Profile Settings
   - Update personal info
   - Save
   - Change security settings
   - Save
   - Update notification preferences
   - Save
   - Refresh page
   - Verify all changes persist

5. **RBAC Workflow**
   - Login as Super Admin → Verify full access
   - Login as Admin → Verify no Account Settings access
   - Login as Manager → Verify read-only access
   - Login as Staff → Verify limited access
   - Test all permission guards work

TESTING CHECKLIST:
✅ All workflows complete successfully
✅ Data persists after refresh
✅ No console errors
✅ Toast messages appear correctly
✅ RBAC permissions work
✅ Dark mode works throughout
✅ Mobile experience is good
✅ Form validations work
✅ Loading states appear
✅ Empty states appear when needed

DOCUMENT ISSUES:
Create a list of any bugs found and their priority
```

---

### **Prompt 14: Test Data Persistence Thoroughly**

```
TASK: Comprehensive testing of localStorage persistence

TEST SCENARIOS:

1. **Single Item Persistence**
   - Create one booking
   - Refresh page
   - Verify booking exists
   - Close browser tab
   - Reopen
   - Verify booking still exists

2. **Multiple Items Persistence**
   - Create 10 bookings
   - Refresh page
   - Verify all 10 exist
   - Edit 3rd booking
   - Refresh
   - Verify changes saved
   - Delete 5th booking
   - Refresh
   - Verify 9 bookings remain

3. **Cross-Page Persistence**
   - Create booking
   - Navigate to Dashboard
   - Verify booking count updated
   - Navigate back to Bookings
   - Verify booking still exists

4. **Edge Cases**
   - Create 100 bookings (stress test)
   - Verify all save correctly
   - Test with special characters in names
   - Test with very long text
   - Test with empty optional fields

5. **Error Scenarios**
   - Test with localStorage disabled
   - Test with quota exceeded (unlikely in MVP)
   - Test with corrupted localStorage data
   - Verify graceful error handling

TESTING CHECKLIST:
✅ Single items persist correctly
✅ Multiple items persist correctly
✅ Changes persist after refresh
✅ Deletions persist after refresh
✅ Cross-page data is consistent
✅ Large datasets work (100+ items)
✅ Special characters handled
✅ Errors handled gracefully
✅ No data loss
✅ No corruption

ACCEPTANCE CRITERIA:
All localStorage operations must work 100% reliably
```

---

### **Prompt 15: Test All CRUD Operations**

```
TASK: Test Create, Read, Update, Delete for all entities

ENTITIES TO TEST:
1. Bookings
2. Games/Rooms
3. Customers
4. Settings
5. Profile Data

FOR EACH ENTITY TEST:

**CREATE:**
- [ ] Create with all fields filled
- [ ] Create with only required fields
- [ ] Create with special characters
- [ ] Verify appears in list immediately
- [ ] Verify persists after refresh
- [ ] Verify validation works

**READ:**
- [ ] Load all items on page load
- [ ] View individual item details
- [ ] Filter/search works
- [ ] Sort works
- [ ] Pagination works (if applicable)
- [ ] Empty state shows when no items

**UPDATE:**
- [ ] Edit existing item
- [ ] Change all fields
- [ ] Change only one field
- [ ] Verify changes appear immediately
- [ ] Verify changes persist after refresh
- [ ] Verify validation works

**DELETE:**
- [ ] Delete single item
- [ ] Confirm deletion dialog appears
- [ ] Cancel deletion works
- [ ] Confirm deletion works
- [ ] Verify removed from list
- [ ] Verify removal persists after refresh
- [ ] Verify cannot delete if has dependencies

TESTING CHECKLIST:
✅ All CREATE operations work
✅ All READ operations work
✅ All UPDATE operations work
✅ All DELETE operations work
✅ Validations prevent invalid operations
✅ Confirmations appear for destructive actions
✅ Toast messages appear for all operations
✅ No console errors
✅ Data integrity maintained

DOCUMENT RESULTS:
Create a CRUD operations test report
```

---

### **Prompt 16: Test with Different User Roles (RBAC)**

```
TASK: Test complete application with all 4 user roles

USER ROLES TO TEST:
1. Super Admin (superadmin / demo123)
2. Admin (admin / demo123)
3. Manager (manager / demo123)
4. Staff (staff / demo123)

FOR EACH ROLE TEST:

**Super Admin:**
- [ ] Access to all pages
- [ ] Can view Account Settings
- [ ] Can manage users
- [ ] Can create/edit/delete all entities
- [ ] Can export data
- [ ] Full permissions everywhere

**Admin:**
- [ ] Access to most pages
- [ ] NO access to Account Settings
- [ ] Can create/edit/delete bookings
- [ ] Can create/edit/delete games
- [ ] Can create/edit/delete customers
- [ ] Cannot manage users

**Manager:**
- [ ] View-only access to most pages
- [ ] Can view bookings (cannot edit)
- [ ] Can view games (cannot edit)
- [ ] Can view customers (cannot edit)
- [ ] Can view reports
- [ ] Limited edit permissions

**Staff:**
- [ ] Basic view access
- [ ] Can view bookings
- [ ] Can view customers (read-only)
- [ ] Very limited permissions
- [ ] Cannot access sensitive pages

TESTING CHECKLIST:
✅ Login works for all roles
✅ Sidebar shows correct pages for each role
✅ Protected pages block unauthorized users
✅ PermissionGuard hides unauthorized actions
✅ Buttons disabled for unauthorized actions
✅ Toast errors for unauthorized attempts
✅ No console errors
✅ Logout works for all roles

ACCEPTANCE CRITERIA:
RBAC must enforce permissions 100% correctly
No role should access features they don't have permission for
```

---

### **Prompt 17: Verify No Console Errors**

```
TASK: Ensure zero console errors or warnings across the entire application

CHECK FOR:
1. JavaScript errors
2. React warnings
3. TypeScript errors
4. Failed network requests
5. Missing props warnings
6. Key prop warnings
7. Deprecated API warnings
8. Missing dependency warnings

PAGES TO CHECK:
- [ ] Login page
- [ ] Dashboard
- [ ] Bookings
- [ ] Games
- [ ] Customers
- [ ] Staff
- [ ] Reports
- [ ] Media
- [ ] Waivers
- [ ] Booking Widgets
- [ ] Embed
- [ ] Settings
- [ ] Account Settings (Super Admin)
- [ ] Profile Settings
- [ ] Notifications
- [ ] Payment History

FOR EACH PAGE:
1. Open browser DevTools console
2. Navigate to page
3. Perform all actions (create, edit, delete)
4. Check console for errors
5. Document any errors found
6. Fix errors
7. Re-test

COMMON ISSUES TO FIX:
- Missing key props in lists
- Unused variables
- Missing dependencies in useEffect
- Incorrect prop types
- Unhandled promise rejections
- localStorage errors
- State update on unmounted component

TESTING CHECKLIST:
✅ Zero errors in console
✅ Zero warnings in console
✅ No failed network requests (except external)
✅ All components render without errors
✅ All interactions work without errors
✅ Dark mode toggle works without errors
✅ Navigation works without errors
✅ Forms submit without errors

ACCEPTANCE CRITERIA:
100% clean console across entire application
```

---

## 🎉 **FINAL VERIFICATION PROMPT**

### **Prompt 18: Final MVP Phase 1 Verification**

```
TASK: Complete final verification that MVP Phase 1 is 100% complete

FINAL CHECKLIST:

**✅ DATA PERSISTENCE (localStorage)**
- [ ] Bookings page - All CRUD operations save/load correctly
- [ ] Games page - All CRUD operations save/load correctly
- [ ] Customers page - All CRUD operations save/load correctly
- [ ] Account Settings - Settings persist
- [ ] Profile Settings - Settings persist
- [ ] All data survives page refresh
- [ ] All data survives browser close/reopen

**✅ FORM VALIDATION**
- [ ] Bookings form - All validations work
- [ ] Games form - All validations work
- [ ] Customers form - All validations work
- [ ] Error messages are clear and helpful
- [ ] Duplicate prevention works
- [ ] Submit buttons disabled when invalid

**✅ UI POLISH**
- [ ] Empty states on all pages
- [ ] Loading states on all pages
- [ ] Smooth transitions and animations
- [ ] Consistent spacing throughout
- [ ] Mobile responsive everywhere
- [ ] Dark mode works everywhere

**✅ TESTING**
- [ ] All workflows tested end-to-end
- [ ] Data persistence thoroughly tested
- [ ] All CRUD operations tested
- [ ] All user roles tested (RBAC)
- [ ] Zero console errors
- [ ] No broken functionality

**✅ CORE FUNCTIONALITY**
- [ ] Users can login with all roles
- [ ] Users can create bookings
- [ ] Users can manage games/rooms
- [ ] Users can manage customers
- [ ] Users can view dashboard
- [ ] Users can customize settings
- [ ] Navigation works correctly
- [ ] RBAC permissions enforced

**✅ DOCUMENTATION**
- [ ] All features documented
- [ ] Known issues documented
- [ ] Test results documented
- [ ] Ready for Phase 2

ACCEPTANCE CRITERIA:
✅ MVP Phase 1 = 100% Complete
✅ All basic functions work
✅ All data persists correctly
✅ No critical bugs
✅ Ready to move to Phase 2 (Database Integration)

IF ALL CHECKED:
✨ **CONGRATULATIONS! MVP PHASE 1 IS COMPLETE!** ✨

NEXT PHASE:
Phase 2: Database Integration with Supabase
(Do not start until Phase 1 is verified 100% complete)
```

---

## 📌 **HOW TO USE THESE PROMPTS**

### **Step-by-Step Instructions:**

1. **Copy ONE prompt at a time** (Ctrl+C / Cmd+C)
2. **Paste to your AI agent builder** (Claude Sonnet 4, GPT-4, etc.)
3. **Wait for completion and testing**
4. **Verify the acceptance criteria**
5. **Document any issues found**
6. **Fix issues before proceeding**
7. **Move to next prompt only when current is 100% complete**

### **IMPORTANT RULES:**

✅ **DO:**
- Complete prompts in sequential order (1 → 18)
- Test thoroughly before moving to next prompt
- Fix all issues before proceeding
- Document any problems encountered
- Take breaks between priority sections
- Celebrate small wins

❌ **DON'T:**
- Skip prompts or do them out of order
- Do multiple prompts simultaneously
- Move to Phase 2 until ALL prompts complete
- Rush through testing
- Ignore console errors
- Skip documentation

---

## ⏱️ **ESTIMATED TIME TO COMPLETION**

| Priority | Prompts | Estimated Time | Tasks |
|----------|---------|----------------|-------|
| **Priority 1** | 1-5 | 6-9 hours | localStorage CRUD |
| **Priority 2** | 6-8 | 2-3 hours | Form validation |
| **Priority 3** | 9-12 | 2-3 hours | UI polish |
| **Priority 4** | 13-17 | 2-3 hours | Testing |
| **Final Check** | 18 | 1 hour | Verification |
| **TOTAL** | 18 prompts | **13-19 hours** | Complete MVP Phase 1 |

### **Recommended Schedule:**

**Day 1 (4-5 hours):**
- Prompts 1-3: Bookings, Games, Customers localStorage

**Day 2 (3-4 hours):**
- Prompts 4-5: Settings localStorage
- Prompts 6-8: Form validation

**Day 3 (3-4 hours):**
- Prompts 9-12: UI polish

**Day 4 (3-4 hours):**
- Prompts 13-17: Testing
- Prompt 18: Final verification

**Total: 3-4 days of focused work**

---

## 📊 **PROGRESS TRACKING**

Use this checklist to track your progress:

### **Priority 1: Data Persistence** 🔴
- [ ] Prompt 1: Bookings localStorage ✅
- [ ] Prompt 2: Games localStorage ✅
- [ ] Prompt 3: Customers localStorage ✅
- [ ] Prompt 4: Account Settings localStorage ✅
- [ ] Prompt 5: Profile Settings verification ✅

### **Priority 2: Form Validation** 🟡
- [ ] Prompt 6: Bookings validation ✅
- [ ] Prompt 7: Games validation ✅
- [ ] Prompt 8: Customers validation ✅

### **Priority 3: UI Polish** 🟢
- [ ] Prompt 9: Empty states ✅
- [ ] Prompt 10: Loading states ✅
- [ ] Prompt 11: Animations ✅
- [ ] Prompt 12: Spacing ✅

### **Priority 4: Testing** 🔵
- [ ] Prompt 13: Workflows ✅
- [ ] Prompt 14: Persistence testing ✅
- [ ] Prompt 15: CRUD testing ✅
- [ ] Prompt 16: RBAC testing ✅
- [ ] Prompt 17: Console errors ✅

### **Final Verification** ⚪
- [ ] Prompt 18: Final checklist ✅

---

## 🎯 **SUCCESS CRITERIA**

### **Phase 1 is complete when:**

✅ **All 18 prompts completed successfully**  
✅ **All localStorage operations work reliably**  
✅ **All forms have validation**  
✅ **All pages have empty/loading states**  
✅ **Zero console errors across application**  
✅ **All RBAC permissions enforced**  
✅ **All workflows tested end-to-end**  
✅ **Documentation updated**  
✅ **Ready to demo to stakeholders**  
✅ **Ready to begin Phase 2: Database Integration**

---

## 🚀 **NEXT STEPS AFTER COMPLETION**

### **Phase 2: Database Integration** (Next milestone)

Once Phase 1 is 100% complete, you will:

1. **Connect Supabase database**
2. **Migrate from localStorage to PostgreSQL**
3. **Implement real-time sync**
4. **Add user authentication (Supabase Auth)**
5. **Implement Row Level Security (RLS)**
6. **Add API endpoints**
7. **Test multi-user scenarios**

**⚠️ DO NOT START PHASE 2 UNTIL PHASE 1 IS VERIFIED COMPLETE**

---

## 📞 **SUPPORT & RESOURCES**

### **Documentation References:**
- `/MVP_PHASE_1_CHECKLIST.md` - Detailed checklist
- `/TRAE_AI_BUILDER_QUICK_CARD.md` - Quick patterns
- `/guidelines/Guidelines.md` - Complete guidelines
- `/PRD_BOOKINGTMS_ENTERPRISE.md` - Full product roadmap

### **Code References:**
- `/pages/ProfileSettings.tsx` - localStorage examples
- `/lib/auth/permissions.ts` - RBAC implementation
- `/components/ui/` - All UI components
- `/components/layout/ThemeContext.tsx` - Dark mode

### **Demo Credentials:**
```
Super Admin: superadmin / demo123
Admin: admin / demo123
Manager: manager / demo123
Staff: staff / demo123
```

---

## 🎉 **GOOD LUCK!**

**You're building something amazing! Take it one prompt at a time, test thoroughly, and celebrate each milestone. Your MVP Phase 1 is almost complete!**

**Remember:**
- Quality over speed
- Test before moving forward
- Document as you go
- Ask for help when stuck
- Celebrate progress

---

**✨ Happy Building! ✨**

---

## 📝 **NOTES & ISSUES LOG**

Use this section to document any issues or notes as you work through the prompts:

```
Date: _______________
Prompt #: ___________
Issue: ______________________________________________________________
Resolution: _________________________________________________________
Time spent: _________
Status: [ ] Fixed [ ] Pending [ ] Needs review
```

---

**Document Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Project:** BookingTMS SaaS Admin Portal  
**Phase:** MVP Phase 1 Completion  
**Status:** Ready for Development
