import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/layout/ThemeContext';
import {
  Search,
  Users,
  CreditCard,
  Filter,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { UserAccountStripeConnect } from '@/components/systemadmin/UserAccountStripeConnect';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserAccount {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  organization_id?: string;
  stripe_account_id?: string;
  created_at?: string;
}

export const UserStripeAccounts: React.FC = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'not_connected'>('all');
  const [loading, setLoading] = useState(true);

  // Theme classes
  const isDark = theme === 'dark';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  /**
   * Fetch users from database
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Also get auth users to get email
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      // Merge data
      const mergedUsers = (data || []).map(profile => {
        const authUser = authData?.users?.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'No email',
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          organization_id: profile.organization_id,
          stripe_account_id: profile.metadata?.stripe_account_id,
          created_at: profile.created_at
        };
      });

      setUsers(mergedUsers);
      setFilteredUsers(mergedUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users', {
        description: error?.message || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter users based on search and status
   */
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'connected') {
      filtered = filtered.filter(user => user.stripe_account_id);
    } else if (filterStatus === 'not_connected') {
      filtered = filtered.filter(user => !user.stripe_account_id);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filterStatus, users]);

  /**
   * Handle account linked
   */
  const handleAccountLinked = async (userId: string, accountId: string) => {
    try {
      // Update user profile with stripe account ID
      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata: {
            stripe_account_id: accountId
          }
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Account linked successfully!');
      
      // Refresh users
      await fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error('Failed to link account', {
        description: error?.message || 'Unknown error'
      });
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${textClass}`}>User Stripe Accounts</h1>
            <p className={mutedTextClass}>Manage Stripe Connect accounts for users</p>
          </div>
          <Button onClick={fetchUsers} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`${cardBgClass} border ${borderColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Total Users</p>
                  <p className={`text-2xl font-bold ${textClass}`}>{users.length}</p>
                </div>
                <Users className={`w-8 h-8 ${mutedTextClass}`} />
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Connected</p>
                  <p className={`text-2xl font-bold ${textClass}`}>
                    {users.filter(u => u.stripe_account_id).length}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Not Connected</p>
                  <p className={`text-2xl font-bold ${textClass}`}>
                    {users.filter(u => !u.stripe_account_id).length}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'connected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('connected')}
                >
                  Connected
                </Button>
                <Button
                  variant={filterStatus === 'not_connected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('not_connected')}
                >
                  Not Connected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <Card className={`${cardBgClass} border ${borderColor}`}>
            <CardHeader>
              <CardTitle className={textClass}>Users</CardTitle>
              <CardDescription className={mutedTextClass}>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className={`w-8 h-8 ${mutedTextClass} animate-spin mx-auto`} />
                  <p className={`mt-2 ${mutedTextClass}`}>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className={`w-12 h-12 ${mutedTextClass} mx-auto mb-2`} />
                  <p className={mutedTextClass}>No users found</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? isDark ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-300'
                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    } border ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${textClass}`}>
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.email}
                          </p>
                          {user.stripe_account_id && (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-500 text-xs">
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${mutedTextClass}`}>{user.email}</p>
                        {user.role && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 ${mutedTextClass}`} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Selected User Details */}
          <div>
            {selectedUser ? (
              <UserAccountStripeConnect
                userId={selectedUser.id}
                userEmail={selectedUser.email}
                userName={
                  selectedUser.first_name && selectedUser.last_name
                    ? `${selectedUser.first_name} ${selectedUser.last_name}`
                    : selectedUser.email
                }
                organizationId={selectedUser.organization_id}
                existingAccountId={selectedUser.stripe_account_id}
                onAccountLinked={(accountId) => handleAccountLinked(selectedUser.id, accountId)}
              />
            ) : (
              <Card className={`${cardBgClass} border ${borderColor}`}>
                <CardContent className="p-12 text-center">
                  <CreditCard className={`w-16 h-16 ${mutedTextClass} mx-auto mb-4`} />
                  <p className={`text-lg font-medium ${textClass} mb-2`}>
                    Select a User
                  </p>
                  <p className={mutedTextClass}>
                    Choose a user from the list to manage their Stripe Connect account
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStripeAccounts;
