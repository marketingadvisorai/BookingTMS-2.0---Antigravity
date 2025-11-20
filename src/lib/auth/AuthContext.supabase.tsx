/**
 * Authentication Context with Supabase Integration
 * 
 * This is the Supabase-integrated version of AuthContext
 * To activate: Rename this file to AuthContext.tsx (backup the old one first)
 * 
 * Features:
 * - Real Supabase authentication
 * - User profile management
 * - Role-based permissions
 * - Session persistence
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser, signOut as supabaseSignOut } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  User, 
  AuthContextType, 
  CreateUserPayload, 
  UpdateUserPayload,
  Permission,
  UserRole 
} from '@/types/auth';
import { ROLES, getRolePermissions, getRoutePermission } from './permissions';

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setAuthUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setAuthUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
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
        // Transform database user to app user format
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

        // Update last login timestamp
        await supabase
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

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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
  };

  const logout = async (): Promise<void> => {
    try {
      await supabaseSignOut();
      setCurrentUser(null);
      setAuthUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const switchUser = async (userId: string): Promise<void> => {
    // Note: In production, switching users would require re-authentication
    // This is kept for demo purposes but should be removed in production
    console.warn('switchUser is not supported with Supabase auth');
    throw new Error('User switching requires re-authentication');
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
    if (!permission) return true; // Public route
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
  // USER MANAGEMENT (Super Admin Only)
  // ============================================================================

  const createUser = async (payload: CreateUserPayload): Promise<User> => {
    if (!hasPermission('users.create')) {
      throw new Error('Insufficient permissions to create users');
    }

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true, // Auto-confirm for development
        user_metadata: {
          full_name: payload.name,
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create auth user');
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: payload.email,
          full_name: payload.name,
          role: payload.role,
          organization_id: currentUser!.organizationId!, // Same org as creator
          phone: payload.phone || null,
          is_active: true,
        })
        .select()
        .single();

      if (profileError || !profile) {
        // Rollback: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
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

      // Refresh users list
      await loadUsers();

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, payload: UpdateUserPayload): Promise<User> => {
    if (!hasPermission('users.edit')) {
      throw new Error('Insufficient permissions to update users');
    }

    try {
      // Update user profile
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (payload.name !== undefined) updates.full_name = payload.name;
      if (payload.email !== undefined) updates.email = payload.email;
      if (payload.role !== undefined) updates.role = payload.role;
      if (payload.phone !== undefined) updates.phone = payload.phone;
      if (payload.avatar !== undefined) updates.avatar_url = payload.avatar;
      if (payload.status !== undefined) updates.is_active = payload.status === 'active';

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (profileError || !profile) {
        throw new Error(profileError?.message || 'Failed to update user');
      }

      // If email changed, update auth user
      if (payload.email) {
        await supabase.auth.admin.updateUserById(userId, {
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

      // Update current user if editing self
      if (userId === currentUser?.id) {
        setCurrentUser(updatedUser);
      }

      // Refresh users list
      await loadUsers();

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (!hasPermission('users.delete')) {
      throw new Error('Insufficient permissions to delete users');
    }

    if (userId === currentUser?.id) {
      throw new Error('Cannot delete your own account');
    }

    try {
      // Supabase auth will cascade delete the user profile via ON DELETE CASCADE
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh users list
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const loadUsers = async (): Promise<void> => {
    if (!hasPermission('users.view')) {
      return;
    }

    try {
      const { data: profiles, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', currentUser!.organizationId!)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      const transformedUsers: User[] = (profiles || []).map(profile => ({
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
  };

  // Load users when current user is set
  useEffect(() => {
    if (currentUser && hasPermission('users.view')) {
      loadUsers();
    }
  }, [currentUser?.id]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    currentUser,
    users,
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
