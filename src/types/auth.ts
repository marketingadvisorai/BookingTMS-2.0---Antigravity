/**
 * Authentication and Authorization Types
 * Defines the structure for users, roles, and permissions in the BookingTMS system
 */

// ============================================================================
// PERMISSION SYSTEM
// ============================================================================

/**
 * Available permissions in the system
 * Each permission represents a specific action or access right
 */
export type Permission =
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.stats'
  
  // Bookings
  | 'bookings.view'
  | 'bookings.create'
  | 'bookings.edit'
  | 'bookings.delete'
  | 'bookings.export'
  
  // Events/Games
  | 'games.view'
  | 'games.create'
  | 'games.edit'
  | 'games.delete'
  
  // Booking Widgets
  | 'widgets.view'
  | 'widgets.edit'
  | 'widgets.create'
  | 'widgets.delete'
  | 'widgets.calendar.view'
  | 'widgets.calendar.edit'
  | 'widgets.calendar.create'
  
  // Venues
  | 'venues.view'
  | 'venues.create'
  | 'venues.edit'
  | 'venues.delete'
  | 'venues.configure'
  
  // Marketing
  | 'marketing.view'
  | 'marketing.edit'
  
  // Campaigns
  | 'campaigns.view'
  | 'campaigns.edit'
  
  // Customers
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'customers.export'
  
  // AI Agents
  | 'ai-agents.view'
  | 'ai-agents.edit'
  
  // Reports
  | 'reports.view'
  | 'reports.export'
  
  // Staff/Team
  | 'staff.view'
  | 'staff.edit'
  | 'staff.create'
  | 'staff.delete'
  
  // Waivers
  | 'waivers.view'
  | 'waivers.edit'
  | 'waivers.create'
  
  // Media
  | 'media.view'
  | 'media.upload'
  | 'media.delete'
  
  // Settings
  | 'settings.view'
  | 'settings.edit'
  
  // Payments
  | 'payments.view'
  | 'payments.refund'
  | 'payments.export'
  | 'payments.reconcile'
  
  // Account Management (Super Admin only)
  | 'accounts.view'
  | 'accounts.manage'
  | 'accounts.roles';

/**
 * User role types
 * Defines the hierarchy of user roles in the system
 */
export type UserRole = 'super-admin' | 'admin' | 'beta-owner' | 'manager' | 'staff';

/**
 * Role configuration with permissions
 */
export interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  color: string; // For UI display
  icon?: string; // Icon name from lucide-react
}

// ============================================================================
// USER SYSTEM
// ============================================================================

/**
 * User account status
 */
export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  organizationId?: string;
  permissions?: Permission[]; // Override permissions for specific users
}

/**
 * User creation payload
 */
export interface CreateUserPayload {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  status?: UserStatus;
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: Permission[];
}

// ============================================================================
// AUTH CONTEXT
// ============================================================================

/**
 * Authentication context state
 */
export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  roles: RoleConfig[];
  isLoading: boolean;
  
  // Authentication
  login: (usernameOrEmail: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;
  
  // User management
  createUser: (payload: CreateUserPayload) => Promise<User>;
  updateUser: (userId: string, payload: UpdateUserPayload) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Role checks
  isRole: (role: UserRole) => boolean;
  canAccessRoute: (path: string) => boolean;
}

// ============================================================================
// ROUTE PROTECTION
// ============================================================================

/**
 * Route permission configuration
 */
export interface RoutePermission {
  path: string;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole[];
  redirectTo?: string;
}
