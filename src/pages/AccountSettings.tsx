/**
 * Account Settings Page
 * Manage users, roles, and permissions (Super Admin only)
 */

'use client';

import { useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Search,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Check,
  Save,
} from 'lucide-react';
import { User, UserRole, CreateUserPayload } from '../types/auth';
import { toast } from 'sonner';
import { NotificationSettings } from '../components/notifications/NotificationSettings';

export function AccountSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { users, roles, createUser, updateUser, deleteUser, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [savedCreate, setSavedCreate] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'manager' as UserRole,
  });

  // Dark mode classes (following design system)
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderColor = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role config
  const getRoleConfig = (roleId: string) => {
    return roles.find(r => r.id === roleId);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  // Handle create user
  const handleCreateUser = async () => {
    try {
      const payload: CreateUserPayload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'active',
      };

      await createUser(payload);
      
      // Show success state
      setSavedCreate(true);
      toast.success('User created successfully');
      
      // Close dialog after delay
      setTimeout(() => {
        setIsCreateDialogOpen(false);
        setSavedCreate(false);
        setFormData({ name: '', email: '', role: 'manager' });
      }, 1500);
    } catch (error) {
      toast.error('Failed to create user');
      console.error(error);
    }
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        name: formData.name,
        role: formData.role,
      });
      
      // Show success state
      setSavedEdit(true);
      toast.success('User updated successfully');
      
      // Close dialog after delay
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setSavedEdit(false);
        setSelectedUser(null);
        setFormData({ name: '', email: '', role: 'manager' });
      }, 1500);
    } catch (error) {
      toast.error('Failed to update user');
      console.error(error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      console.error(error);
    }
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Account Settings"
        description="Manage users, roles, and permissions"
      />

      <div className="space-y-6">
        <Tabs defaultValue="users" className="space-y-6">
            <TabsList className={isDark ? 'bg-[#161616] border border-[#1e1e1e]' : 'bg-gray-100'}>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="w-4 h-4" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                  />
                </div>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                  style={{ backgroundColor: '#4f46e5' }}
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </div>

              {/* Users List */}
              <Card className={`${cardBg} border ${borderColor} shadow-sm`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`border-b ${borderColor}`}>
                      <tr>
                        <th className={`text-left p-4 ${textSecondary}`}>User</th>
                        <th className={`text-left p-4 ${textSecondary}`}>Role</th>
                        <th className={`text-left p-4 ${textSecondary}`}>Status</th>
                        <th className={`text-left p-4 ${textSecondary}`}>Last Login</th>
                        <th className={`text-right p-4 ${textSecondary}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const roleConfig = getRoleConfig(user.role);
                        return (
                          <tr key={user.id} className={`border-b ${borderColor} ${hoverBg} transition-colors`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                                  <span className={textPrimary}>{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                  <div className={textPrimary}>{user.name}</div>
                                  <div className={`text-sm ${textSecondary}`}>{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {roleConfig && (
                                <Badge
                                  className={`${isDark ? 'bg-opacity-20' : 'bg-opacity-10'} border`}
                                  style={{
                                    backgroundColor: isDark ? `${roleConfig.color}20` : `${roleConfig.color}10`,
                                    color: roleConfig.color,
                                    borderColor: isDark ? `${roleConfig.color}40` : `${roleConfig.color}20`,
                                  }}
                                >
                                  {roleConfig.name}
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              {getStatusBadge(user.status)}
                            </td>
                            <td className="p-4">
                              <span className={textSecondary}>
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                  disabled={user.id === currentUser?.id}
                                  className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white' : ''}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(user)}
                                  disabled={user.id === currentUser?.id}
                                  className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-[#1a1a1a]' : 'text-red-600 hover:text-red-700'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Roles & Permissions Tab */}
            <TabsContent value="roles" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <Card key={role.id} className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${role.color}20` }}
                        >
                          <Shield className="w-6 h-6" style={{ color: role.color }} />
                        </div>
                        <div>
                          <h3 className={textPrimary}>{role.name}</h3>
                          <p className={`text-sm ${textSecondary}`}>{role.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <h4 className={`text-sm ${textSecondary} mb-2`}>Permissions ({role.permissions.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 10).map((permission) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className={`text-xs ${isDark ? 'border-[#2a2a2a] text-[#a3a3a3] bg-[#0a0a0a]' : 'border-gray-300 text-gray-600 bg-white'}`}
                          >
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 10 && (
                          <Badge variant="outline" className={`text-xs ${isDark ? 'border-[#2a2a2a] text-[#a3a3a3] bg-[#0a0a0a]' : 'border-gray-300 text-gray-600'}`}>
                            +{role.permissions.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 pb-24">
              <NotificationSettings />
            </TabsContent>
          </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
          <DialogHeader>
            <DialogTitle className={textPrimary}>Add New User</DialogTitle>
            <DialogDescription className={textSecondary}>
              Create a new user account with specific role and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Name</Label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}>
                  {roles.filter(r => r.id !== 'super-admin').map((role) => (
                    <SelectItem key={role.id} value={role.id} className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className={isDark ? 'border-[#1e1e1e] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}
              disabled={savedCreate}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              className="text-white hover:opacity-90 transition-all duration-300 gap-2"
              style={{ backgroundColor: savedCreate ? '#10b981' : '#4f46e5' }}
              disabled={savedCreate}
            >
              {savedCreate ? (
                <>
                  <Check className="w-4 h-4" />
                  Success
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
          <DialogHeader>
            <DialogTitle className={textPrimary}>Edit User</DialogTitle>
            <DialogDescription className={textSecondary}>
              Update user information and role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Name</Label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Email</Label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-[#737373]' : 'bg-gray-100 border-gray-300'} opacity-50 cursor-not-allowed`}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}>
                  {roles.filter(r => r.id !== 'super-admin').map((role) => (
                    <SelectItem key={role.id} value={role.id} className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className={isDark ? 'border-[#1e1e1e] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}
              disabled={savedEdit}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser} 
              className="text-white hover:opacity-90 transition-all duration-300 gap-2"
              style={{ backgroundColor: savedEdit ? '#10b981' : '#4f46e5' }}
              disabled={savedEdit}
            >
              {savedEdit ? (
                <>
                  <Check className="w-4 h-4" />
                  Success
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={textPrimary}>Delete User</AlertDialogTitle>
            <AlertDialogDescription className={textSecondary}>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={isDark ? 'border-[#1e1e1e] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
}
