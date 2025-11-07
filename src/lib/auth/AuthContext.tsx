/**
 * Authentication Context with Supabase Integration
 * 
 * Features:
 * - Supabase authentication (when configured)
 * - Mock data fallback (for development)
 * - Role-based permissions (RBAC)
 * - User management
 * - Session persistence
 * 
 * To enable Supabase:
 * 1. Set NEXT_PUBLIC_SUPABASE_URL in .env.local
 * 2. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * 3. Run database migration
 * 4. Create first user in Supabase dashboard
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  User, 
  AuthContextType, 
  CreateUserPayload, 
  UpdateUserPayload,
  Permission,
  UserRole 
} from '../../types/auth';
import { ROLES, getRolePermissions, getRoutePermission } from './permissions';

// Supabase client (lazy loaded to avoid errors if not configured)
let supabaseClient: any = null;
let getCurrentUserFn: any = null;
let signOutFn: any = null;

// Safe environment variable access for client-side
const getEnvVar = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // Client-side: Check window object or use import.meta if available
    return (window as any)[key] || undefined;
  }
  // This fallback won't work in browser but prevents error
  return undefined;
};

const loadSupabase = async () => {
  if (typeof window === 'undefined') return null;
  
  // Access environment variables safely in client-side code
  // Next.js should replace these at build time, but we add extra safety
  let supabaseUrl: string | undefined;
  let supabaseKey: string | undefined;
  
  try {
    // Try to access via process.env (works if Next.js replaced at build time)
    supabaseUrl = (typeof process !== 'undefined' && process.env) 
      ? process.env.NEXT_PUBLIC_SUPABASE_URL 
      : getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
      
    supabaseKey = (typeof process !== 'undefined' && process.env) 
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      : getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  } catch (error) {
    console.log('📦 Cannot access environment variables - using mock data');
    return null;
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('📦 Supabase not configured - using mock data');
    return null;
  }

  try {
    const { supabase, getCurrentUser, signOut } = await import('../supabase/client');
    supabaseClient = supabase;
    getCurrentUserFn = getCurrentUser;
    signOutFn = signOut;
    console.log('✅ Supabase connected');
    return supabase;
  } catch (error) {
    console.warn('⚠️ Supabase connection failed - using mock data:', error);
    return null;
  }
};

// ============================================================================
// MOCK DATA (Used when Supabase is not configured)
// ============================================================================

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'superadmin@bookingtms.com',
    name: 'Super Admin User',
    role: 'super-admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2025-11-04T10:30:00Z',
    organizationId: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '2',
    email: 'admin@bookingtms.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: '2024-02-15T00:00:00Z',
    lastLogin: '2025-11-04T09:15:00Z',
    organizationId: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '5',
    email: 'betaadmin@bookingtms.com',
    name: 'Beta Admin',
    role: 'beta-owner',
    status: 'active',
    createdAt: '2024-11-08T00:00:00Z',
    lastLogin: '2025-11-08T00:00:00Z',
    organizationId: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '3',
    email: 'manager@bookingtms.com',
    name: 'Manager User',
    role: 'manager',
    status: 'active',
    createdAt: '2024-03-20T00:00:00Z',
    lastLogin: '2025-11-04T08:45:00Z',
    organizationId: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '4',
    email: 'staff@bookingtms.com',
    name: 'Staff User',
    role: 'staff',
    status: 'active',
    createdAt: '2024-04-10T00:00:00Z',
    lastLogin: '2025-11-04T07:30:00Z',
    organizationId: '00000000-0000-0000-0000-000000000001',
  },
];

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Try to load Supabase
      const supabase = await loadSupabase();
      
      if (supabase) {
        setUseSupabase(true);
        await initializeSupabaseAuth(supabase);
      } else {
        // Use mock data
        await initializeMockAuth();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Fallback to mock data
      await initializeMockAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSupabaseAuth = async (supabase: any) => {
    try {
      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return;
      }

      if (session?.user) {
        setAuthUser(session.user);
        await loadUserProfile(session.user.id);
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session?.user) {
            setAuthUser(session.user);
            await loadUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setAuthUser(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Supabase auth initialization failed:', error);
    }
  };

  const initializeMockAuth = async () => {
    try {
      // Load from localStorage
      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        const user = MOCK_USERS.find(u => u.id === storedUserId);
        if (user) {
          setCurrentUser(user);
          return;
        }
      }
      
      // Don't auto-login - require user to log in
      setCurrentUser(null);
    } catch (error) {
      console.error('Mock auth initialization failed:', error);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!supabaseClient) return;

    try {
      const { data: profile, error } = await supabaseClient
        .from('users')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          status: profile.is_active ? 'active' : 'inactive',
          avatar: profile.avatar_url || undefined,
          phone: profile.phone || undefined,
          createdAt: profile.created_at,
          lastLogin: profile.last_login_at || undefined,
          organizationId: profile.organization_id,
        };

        setCurrentUser(user);

        // Update last login
        await supabaseClient
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const login = async (usernameOrEmail: string, password: string, role?: UserRole): Promise<void> => {
    if (useSupabase && supabaseClient) {
      // Supabase login
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: usernameOrEmail,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          setAuthUser(data.user);
          await loadUserProfile(data.user.id);
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    } else {
      // Mock login - support both username and email
      // Demo credentials for testing
      const demoCredentials: Record<string, { username: string; password: string; role: UserRole }> = {
        'superadmin': { username: 'superadmin', password: 'demo123', role: 'super-admin' },
        'admin': { username: 'admin', password: 'demo123', role: 'admin' },
        'betaadmin': { username: 'betaadmin', password: '123admin', role: 'beta-owner' },
        'manager': { username: 'manager', password: 'demo123', role: 'manager' },
        'staff': { username: 'staff', password: 'demo123', role: 'staff' },
      };

      // Check demo credentials first
      const inputUsername = usernameOrEmail.toLowerCase().trim();
      const demoCred = demoCredentials[inputUsername];
      
      console.log('🔐 Login attempt:', {
        inputUsername,
        passwordLength: password.length,
        expectedPasswordLength: demoCred?.password?.length || 0,
        credentialFound: !!demoCred
      });
      
      if (demoCred) {
        // Validate password (trim whitespace from password too)
        const trimmedPassword = password.trim();
        if (demoCred.password !== trimmedPassword) {
          console.error('❌ Login failed: Invalid password for username:', inputUsername);
          console.error('Expected:', demoCred.password, 'Got:', trimmedPassword);
          throw new Error('Invalid credentials');
        }
        
        // Find user with this role
        let user = MOCK_USERS.find(u => u.role === demoCred.role);
        
        if (!user) {
          // Create a demo user if not found (shouldn't happen with our MOCK_USERS)
          console.warn('Creating new demo user for role:', demoCred.role);
          user = {
            id: Math.random().toString(36).substring(7),
            email: `${demoCred.username}@bookingtms.com`,
            name: `${demoCred.role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} User`,
            role: demoCred.role,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            organizationId: '00000000-0000-0000-0000-000000000001',
          };
        }
        
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        setCurrentUser(user);
        localStorage.setItem('currentUserId', user.id);
        console.log('✅ Login successful:', user.email, user.role);
        return;
      }

      // Fallback to email-based login
      const user = MOCK_USERS.find(u => u.email === usernameOrEmail);
      if (user) {
        // For email login, password is not validated in demo mode
        // In production, you would validate against a hash
        user.lastLogin = new Date().toISOString();
        setCurrentUser(user);
        localStorage.setItem('currentUserId', user.id);
        console.log('✅ Login successful via email:', user.email);
        return;
      }
      
      // No matching credentials found
      console.error('Login failed: No user found for:', usernameOrEmail);
      throw new Error('Invalid credentials');
    }
  };

  const logout = async (): Promise<void> => {
    if (useSupabase && signOutFn) {
      try {
        await signOutFn();
        setCurrentUser(null);
        setAuthUser(null);
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    } else {
      // Mock logout
      setCurrentUser(null);
      localStorage.removeItem('currentUserId');
    }
  };

  const switchUser = async (userId: string): Promise<void> => {
    if (useSupabase) {
      console.warn('switchUser is not supported with Supabase auth');
      throw new Error('User switching requires re-authentication');
    } else {
      // Mock switch
      const user = users.find(u => u.id === userId);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', userId);
      } else {
        throw new Error('User not found');
      }
    }
  };

  // ============================================================================
  // PERMISSION METHODS
  // ============================================================================

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    const rolePermissions = getRolePermissions(currentUser.role);
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessRoute = (route: string): boolean => {
    const permission = getRoutePermission(route);
    if (!permission) return true;
    return hasPermission(permission);
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    
    return currentUser.role === role;
  };

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  const createUser = async (payload: CreateUserPayload): Promise<User> => {
    if (!hasPermission('users.create')) {
      throw new Error('Insufficient permissions to create users');
    }

    if (useSupabase && supabaseClient) {
      // Supabase create user
      try {
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
          email: payload.email,
          password: payload.password,
          email_confirm: true,
          user_metadata: {
            full_name: payload.name,
          },
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Failed to create auth user');
        }

        const { data: profile, error: profileError } = await supabaseClient
          .from('users')
          .insert({
            id: authData.user.id,
            email: payload.email,
            full_name: payload.name,
            role: payload.role,
            organization_id: currentUser!.organizationId!,
            phone: payload.phone || null,
            is_active: true,
          })
          .select()
          .single();

        if (profileError || !profile) {
          await supabaseClient.auth.admin.deleteUser(authData.user.id);
          throw new Error(profileError?.message || 'Failed to create user profile');
        }

        const newUser: User = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          status: profile.is_active ? 'active' : 'inactive',
          phone: profile.phone || undefined,
          createdAt: profile.created_at,
          organizationId: profile.organization_id,
        };

        await loadUsers();
        return newUser;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    } else {
      // Mock create user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        status: payload.status || 'active',
        phone: payload.phone,
        createdAt: new Date().toISOString(),
        organizationId: currentUser?.organizationId,
      };

      setUsers(prev => [...prev, newUser]);
      return newUser;
    }
  };

  const updateUser = async (userId: string, payload: UpdateUserPayload): Promise<User> => {
    if (!hasPermission('users.edit')) {
      throw new Error('Insufficient permissions to update users');
    }

    if (useSupabase && supabaseClient) {
      // Supabase update user
      try {
        const updates: any = {
          updated_at: new Date().toISOString(),
        };

        if (payload.name !== undefined) updates.full_name = payload.name;
        if (payload.email !== undefined) updates.email = payload.email;
        if (payload.role !== undefined) updates.role = payload.role;
        if (payload.phone !== undefined) updates.phone = payload.phone;
        if (payload.avatar !== undefined) updates.avatar_url = payload.avatar;
        if (payload.status !== undefined) updates.is_active = payload.status === 'active';

        const { data: profile, error: profileError } = await supabaseClient
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (profileError || !profile) {
          throw new Error(profileError?.message || 'Failed to update user');
        }

        if (payload.email) {
          await supabaseClient.auth.admin.updateUserById(userId, {
            email: payload.email,
          });
        }

        const updatedUser: User = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          status: profile.is_active ? 'active' : 'inactive',
          phone: profile.phone || undefined,
          avatar: profile.avatar_url || undefined,
          createdAt: profile.created_at,
          lastLogin: profile.last_login_at || undefined,
          organizationId: profile.organization_id,
        };

        if (userId === currentUser?.id) {
          setCurrentUser(updatedUser);
        }

        await loadUsers();
        return updatedUser;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    } else {
      // Mock update user
      const updatedUser = users.find(u => u.id === userId);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      const updated: User = {
        ...updatedUser,
        ...payload,
      };

      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
      }

      return updated;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (!hasPermission('users.delete')) {
      throw new Error('Insufficient permissions to delete users');
    }

    if (userId === currentUser?.id) {
      throw new Error('Cannot delete your own account');
    }

    if (useSupabase && supabaseClient) {
      // Supabase delete user
      try {
        const { error } = await supabaseClient.auth.admin.deleteUser(userId);

        if (error) {
          throw new Error(error.message);
        }

        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    } else {
      // Mock delete user
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const loadUsers = async (): Promise<void> => {
    if (!hasPermission('users.view')) {
      return;
    }

    if (useSupabase && supabaseClient && currentUser?.organizationId) {
      try {
        const { data: profiles, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('organization_id', currentUser.organizationId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading users:', error);
          return;
        }

        const transformedUsers: User[] = (profiles || []).map((profile: any) => ({
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          status: profile.is_active ? 'active' : 'inactive',
          phone: profile.phone || undefined,
          avatar: profile.avatar_url || undefined,
          createdAt: profile.created_at,
          lastLogin: profile.last_login_at || undefined,
          organizationId: profile.organization_id,
        }));

        setUsers(transformedUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
    // Mock data already loaded in state
  };

  // Load users when current user is set
  useEffect(() => {
    if (currentUser && hasPermission('users.view') && useSupabase) {
      loadUsers();
    }
  }, [currentUser?.id, useSupabase]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    currentUser,
    users,
    roles: ROLES,
    isLoading,
    login,
    logout,
    switchUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    isRole,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: loadUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
