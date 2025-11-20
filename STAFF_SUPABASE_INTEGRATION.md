# Staff Database Integration with Supabase

## Overview
Staff management has been migrated from localStorage to Supabase database, providing real-time synchronization, better data persistence, and multi-user support.

## Architecture

### Database Layer

#### Table: `user_profiles`
Staff members are stored in the `user_profiles` table with the following structure:
```sql
- id: uuid (FK to auth.users)
- first_name: varchar
- last_name: varchar
- phone: varchar
- role: varchar ('super-admin', 'admin', 'beta-owner', 'manager', 'staff')
- status: varchar ('active', 'inactive')
- company: varchar
- metadata: jsonb (stores department, permissions, lastLogin, hoursWorked, avatar)
- created_at: timestamptz
- updated_at: timestamptz
```

#### RPC Functions
Two security-definer functions were created to join `user_profiles` with `auth.users`:

1. **`get_staff_with_email()`**
   - Returns all staff members with their email addresses
   - Filters by staff roles (staff, manager, admin, beta-owner, super-admin)
   - Ordered by creation date (newest first)

2. **`get_staff_by_id(staff_id uuid)`**
   - Returns a single staff member by ID with email
   - Used for detailed staff queries

### Hook Layer: `useStaff`

Located at `src/hooks/useStaff.ts`, this hook provides:

#### State
- `staff`: Array of staff members from database
- `loading`: Loading state for async operations
- `error`: Error state for failed operations

#### Functions
- `fetchStaff()`: Fetch all staff members
- `createStaff()`: Create new staff member (requires backend API)
- `updateStaff()`: Update staff member details
- `deleteStaff()`: Soft delete (set status to inactive)
- `toggleStaffStatus()`: Toggle between active/inactive
- `updateLastLogin()`: Update last login timestamp
- `refreshStaff()`: Alias for fetchStaff

#### Real-time Subscription
Automatically subscribes to `user_profiles` table changes and refreshes data when updates occur.

### UI Layer: `Staff.tsx`

#### Data Conversion
A helper function `convertStaffToUI()` transforms database format to UI format:
- Combines `first_name` + `last_name` → `name`
- Capitalizes role for display
- Formats dates
- Extracts metadata fields

#### CRUD Operations
- **Create**: Shows message that backend API is required (auth user creation)
- **Read**: Fetches from Supabase via `useStaff` hook
- **Update**: Updates profile and metadata via `updateStaff()`
- **Delete**: Soft deletes via `deleteStaff()`
- **Toggle Status**: Switches between active/inactive via `toggleStaffStatus()`

## Field Mapping

| UI Field | Database Field | Notes |
|----------|---------------|-------|
| `id` | `id` | UUID from auth.users |
| `name` | `first_name + last_name` | Combined for display |
| `email` | `auth.users.email` | Via RPC join |
| `phone` | `phone` | Direct mapping |
| `role` | `role` | Capitalized for UI |
| `joinDate` | `created_at` | Formatted date |
| `status` | `status` | Active/Inactive |
| `department` | `metadata.department` | JSONB field |
| `permissions` | `metadata.permissions` | JSONB array |
| `lastLogin` | `metadata.lastLogin` | JSONB field |
| `hoursWorked` | `metadata.hoursWorked` | JSONB field |
| `avatar` | `metadata.avatar` | JSONB field |

## Migration Notes

### From localStorage to Supabase
- **Old**: Staff data stored in `localStorage` with key `bookingtms_staff`
- **New**: Staff data stored in `user_profiles` table in Supabase
- **Migration**: No automatic migration implemented (localStorage data will be ignored)

### Initial Data
The system currently has no staff members in the database. Initial staff data from `initialStaffData` is no longer used.

## Known Limitations

### Staff Creation
Creating new staff members requires:
1. Creating an auth user in Supabase Auth
2. Creating a corresponding user_profile entry

This requires admin privileges and should be done via:
- Backend API endpoint
- Supabase Admin API
- Manual creation through Supabase dashboard

**Current Status**: Staff creation shows an error message directing users to contact administrator.

### TODO
- [ ] Implement backend API for staff creation with auth user management
- [ ] Add email invitation flow for new staff members
- [ ] Implement password reset functionality
- [ ] Add role-based permission checks
- [ ] Consider migrating localStorage data on first load (optional)

## Security

### RLS Policies
The `user_profiles` table has the following RLS policies:
- **SELECT**: Allowed for anon and authenticated users
- **INSERT**: Allowed for authenticated users
- **UPDATE**: Allowed for authenticated users

### RPC Functions
Both RPC functions use `SECURITY DEFINER` to access auth.users table, which is normally restricted.

## Testing

### Manual Testing Steps
1. Navigate to Staff page
2. Verify loading state appears
3. Verify empty state if no staff exist
4. Test filtering by role and status
5. Test search functionality
6. Test edit staff (update name, phone, department)
7. Test toggle status (active/inactive)
8. Test delete staff (soft delete)

### Real-time Testing
1. Open Staff page in two browser windows
2. Edit staff in one window
3. Verify changes appear in second window automatically

## Database Migrations Applied

1. **`add_metadata_to_user_profiles`**
   - Added `metadata` JSONB column to `user_profiles`
   - Default value: `{}`

2. **`create_staff_management_functions`**
   - Created `get_staff_with_email()` RPC function
   - Created `get_staff_by_id()` RPC function
   - Granted execute permissions to authenticated users

## Performance Considerations

- RPC functions use INNER JOIN which is efficient for small-medium datasets
- Real-time subscriptions use Postgres LISTEN/NOTIFY (low overhead)
- Metadata stored as JSONB allows flexible schema without migrations
- Consider adding indexes on frequently queried fields (role, status)

## Future Enhancements

1. **Advanced Filtering**
   - Filter by department
   - Filter by permissions
   - Filter by last login date

2. **Bulk Operations**
   - Bulk status updates
   - Bulk role assignments
   - CSV import/export

3. **Analytics**
   - Staff activity tracking
   - Hours worked reporting
   - Performance metrics

4. **Notifications**
   - Email notifications for new staff
   - Status change notifications
   - Login alerts

## Support

For issues or questions about staff management:
1. Check Supabase logs for database errors
2. Check browser console for frontend errors
3. Verify RLS policies are correctly configured
4. Ensure user has proper authentication
