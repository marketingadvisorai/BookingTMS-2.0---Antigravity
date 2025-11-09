import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useStaff, StaffMember as StaffMemberType } from '../hooks/useStaff';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  UserX,
  Shield,
  Users as UsersIcon,
  Crown,
  User,
  Calendar,
  Clock,
  Download,
  Filter,
  X,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { PermissionGuard } from '../components/auth/PermissionGuard';

// Legacy interface for UI compatibility
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Staff';
  joinDate: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  department?: string;
  permissions?: string[];
  lastLogin?: string;
  hoursWorked?: number;
}

// Helper to convert DB staff to UI format
const convertStaffToUI = (dbStaff: StaffMemberType): StaffMember => ({
  id: dbStaff.id,
  name: `${dbStaff.first_name} ${dbStaff.last_name}`.trim(),
  email: dbStaff.email,
  phone: dbStaff.phone || '',
  role: (dbStaff.role.charAt(0).toUpperCase() + dbStaff.role.slice(1)) as 'Admin' | 'Manager' | 'Staff',
  joinDate: new Date(dbStaff.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  status: dbStaff.status === 'active' ? 'Active' : 'Inactive',
  avatar: dbStaff.metadata?.avatar,
  department: dbStaff.metadata?.department,
  permissions: dbStaff.metadata?.permissions,
  lastLogin: dbStaff.metadata?.lastLogin,
  hoursWorked: dbStaff.metadata?.hoursWorked
});

const initialStaffData: StaffMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@bookingtms.com',
    phone: '+1 (555) 123-4567',
    role: 'Admin',
    joinDate: 'Jan 15, 2024',
    status: 'Active',
    department: 'Operations',
    lastLogin: '2 hours ago',
    hoursWorked: 160
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@bookingtms.com',
    phone: '+1 (555) 234-5678',
    role: 'Manager',
    joinDate: 'Feb 20, 2024',
    status: 'Active',
    department: 'Customer Service',
    lastLogin: '1 hour ago',
    hoursWorked: 155
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@bookingtms.com',
    phone: '+1 (555) 345-6789',
    role: 'Staff',
    joinDate: 'Mar 10, 2024',
    status: 'Active',
    department: 'Game Master',
    lastLogin: '30 minutes ago',
    hoursWorked: 140
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@bookingtms.com',
    phone: '+1 (555) 456-7890',
    role: 'Staff',
    joinDate: 'Apr 5, 2024',
    status: 'Active',
    department: 'Game Master',
    lastLogin: '5 hours ago',
    hoursWorked: 138
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.k@bookingtms.com',
    phone: '+1 (555) 567-8901',
    role: 'Staff',
    joinDate: 'May 12, 2024',
    status: 'Inactive',
    department: 'Maintenance',
    lastLogin: '3 days ago',
    hoursWorked: 95
  },
  {
    id: '6',
    name: 'Lisa Martinez',
    email: 'lisa.m@bookingtms.com',
    phone: '+1 (555) 678-9012',
    role: 'Manager',
    joinDate: 'Jun 18, 2024',
    status: 'Active',
    department: 'Sales & Marketing',
    lastLogin: '10 minutes ago',
    hoursWorked: 142
  }
];

export function Staff() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  const hoverShadowClass = isDark ? 'hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'hover:shadow-md';
  
  // Use Supabase staff hook
  const { staff: dbStaff, loading, createStaff, updateStaff, deleteStaff, toggleStaffStatus } = useStaff();
  
  // Convert DB staff to UI format
  const staffMembers = dbStaff.map(convertStaffToUI);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    department: '',
    status: 'Active'
  });
  const [password, setPassword] = useState('');

  // Calculate stats
  const stats = {
    total: staffMembers.length,
    active: staffMembers.filter(s => s.status === 'Active').length,
    managers: staffMembers.filter(s => s.role === 'Manager').length,
    staff: staffMembers.filter(s => s.role === 'Staff').length
  };

  // Filter staff members
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = async () => {
    if (!formData.name || !formData.email || !formData.phone || !password) {
      toast.error('Please fill in all required fields including password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Split name into first and last
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await createStaff({
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role?.toLowerCase() as 'admin' | 'manager' | 'staff',
        department: formData.department,
      }, password);
      
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Staff',
        department: '',
        status: 'Active',
        avatar: undefined
      });
      setPassword('');
    } catch (err) {
      console.error('Error adding staff:', err);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    try {
      // Split name into first and last
      const nameParts = formData.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await updateStaff(selectedStaff.id, {
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone || '',
        role: formData.role?.toLowerCase() as 'admin' | 'manager' | 'staff',
        status: formData.status?.toLowerCase() || 'active',
        metadata: {
          department: formData.department,
          avatar: formData.avatar,
          permissions: formData.permissions,
          hoursWorked: formData.hoursWorked
        }
      } as any);
      
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Staff',
        department: '',
        status: 'Active',
        avatar: undefined
      });
    } catch (err) {
      console.error('Error updating staff:', err);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      await deleteStaff(selectedStaff.id);
      setIsDeleteDialogOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const staff = staffMembers.find(s => s.id === id);
      if (!staff) return;
      
      await toggleStaffStatus(id, staff.status.toLowerCase());
    } catch (err) {
      console.error('Error toggling staff status:', err);
    }
  };

  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      status: staff.status,
      avatar: staff.avatar
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return isDark 
          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
          : 'bg-red-100 text-red-700 border border-red-200';
      case 'Manager':
        return isDark 
          ? 'bg-[#4f46e5]/20 text-[#6366f1] border border-[#4f46e5]/30' 
          : 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Staff':
        return isDark 
          ? 'bg-[#2a2a2a] text-[#a3a3a3] border border-[#2a2a2a]' 
          : 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return isDark 
          ? 'bg-[#2a2a2a] text-[#a3a3a3] border border-[#2a2a2a]' 
          : 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-3 h-3 mr-1" />;
      case 'Manager':
        return <Shield className="w-3 h-3 mr-1" />;
      case 'Staff':
        return <User className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const clearFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterRole !== 'all' || filterStatus !== 'all' || searchQuery !== '';

  const handleAvatarFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Staff Management"
        description="Manage your team members and their roles"
        sticky
        action={
          <PermissionGuard permissions={['staff.create']}>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </PermissionGuard>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Staff</p>
                <p className={`text-2xl mt-1 ${textClass}`}>{stats.total}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <UsersIcon className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Active</p>
                <p className={`text-2xl mt-1 ${textClass}`}>{stats.active}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <UserCheck className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Managers</p>
                <p className={`text-2xl mt-1 ${textClass}`}>{stats.managers}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Shield className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Staff Members</p>
                <p className={`text-2xl mt-1 ${textClass}`}>{stats.staff}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <User className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[140px] h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="h-11">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button variant="outline" className="h-11">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members - Mobile Card View / Desktop Table */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className={`text-center py-12 ${textMutedClass}`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              Loading staff members...
            </div>
          ) : (
            <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3 p-4">
            {filteredStaff.length === 0 ? (
              <div className={`text-center py-8 ${textMutedClass}`}>
                No staff members found
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <Card key={staff.id} className={`${cardBgClass} border ${borderClass} ${hoverShadowClass} transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                            {getInitials(staff.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${textClass}`}>{staff.name}</p>
                          <Badge className={`${getRoleBadgeColor(staff.role)} text-xs mt-1`}>
                            {getRoleIcon(staff.role)}
                            {staff.role}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(staff)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(staff)}
                            className={isDark ? 'text-red-400 focus:text-red-400' : 'text-red-600 focus:text-red-600'}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className={`flex items-center gap-2 ${textMutedClass}`}>
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${textMutedClass}`}>
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{staff.phone}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className={textMutedClass}>{staff.department}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={staff.status === 'Active'}
                            onCheckedChange={() => handleToggleStatus(staff.id)}
                          />
                          <span className={textClass}>{staff.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderClass}`}>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Member</th>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Contact</th>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Role</th>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Department</th>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Join Date</th>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Status</th>
                  <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`text-center py-8 ${textMutedClass}`}>
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className={`border-b ${borderClass} ${hoverBgClass} transition-colors`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                              {getInitials(staff.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`text-sm ${textClass}`}>{staff.name}</p>
                            <p className={`text-xs ${textMutedClass}`}>{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 text-xs ${textMutedClass}`}>
                            <Mail className="w-3 h-3" />
                            <span>{staff.email}</span>
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${textMutedClass}`}>
                            <Phone className="w-3 h-3" />
                            <span>{staff.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleBadgeColor(staff.role)}>
                          {getRoleIcon(staff.role)}
                          {staff.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                          <Building className="w-3 h-3" />
                          <span>{staff.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{staff.joinDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={staff.status === 'Active'}
                            onCheckedChange={() => handleToggleStatus(staff.id)}
                          />
                          <span className={`text-sm ${textClass}`}>{staff.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(staff)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(staff.id)}>
                              {staff.status === 'Active' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(staff)}
                              className={isDark ? 'text-red-400 focus:text-red-400' : 'text-red-600 focus:text-red-600'}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Add New Staff Member</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Fill in the details to add a new team member to your staff.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={textClass}>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                    {formData.name ? getInitials(formData.name) : 'NA'}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                  className="max-w-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={textClass}>Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={textClass}>Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@bookingtms.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className={textClass}>Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className={textClass}>Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className={textClass}>Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className={textClass}>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Game Master">Game Master</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={handleAddStaff}
            >
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Edit Staff Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
              <DialogHeader>
                <DialogTitle className={textClass}>Edit Staff Member</DialogTitle>
                <DialogDescription className={textMutedClass}>
                  Update the details for {selectedStaff?.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={textClass}>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={formData.avatar} />
                      <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                        {formData.name ? getInitials(formData.name) : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                      className="max-w-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className={textClass}>Full Name *</Label>
                    <Input
                      id="edit-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className={textClass}>Email Address *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="john.doe@bookingtms.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className={textClass}>Phone Number *</Label>
                <Input
                  id="edit-phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className={textClass}>Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department" className={textClass}>Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Game Master">Game Master</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={handleEditStaff}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Staff Details</DialogTitle>
            <DialogDescription className={textMutedClass}>
              View detailed information about {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedStaff.avatar} />
                  <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                    {getInitials(selectedStaff.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={textClass}>{selectedStaff.name}</h3>
                  <Badge className={getRoleBadgeColor(selectedStaff.role)}>
                    {getRoleIcon(selectedStaff.role)}
                    {selectedStaff.role}
                  </Badge>
                </div>
              </div>

              <Separator className={borderClass} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className={`text-sm ${textMutedClass}`}>Email</p>
                  <p className={`text-sm ${textClass}`}>{selectedStaff.email}</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${textMutedClass}`}>Phone</p>
                  <p className={`text-sm ${textClass}`}>{selectedStaff.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${textMutedClass}`}>Department</p>
                  <p className={`text-sm ${textClass}`}>{selectedStaff.department}</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${textMutedClass}`}>Join Date</p>
                  <p className={`text-sm ${textClass}`}>{selectedStaff.joinDate}</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${textMutedClass}`}>Status</p>
                  <Badge className={selectedStaff.status === 'Active' 
                    ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700')
                    : (isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700')
                  }>
                    {selectedStaff.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${textMutedClass}`}>Last Login</p>
                  <p className={`text-sm ${textClass}`}>{selectedStaff.lastLogin}</p>
                </div>
              </div>

              <Separator className={borderClass} />

              <div className="space-y-2">
                <p className={`text-sm ${textMutedClass}`}>Performance</p>
                <div className={`grid grid-cols-1 gap-3 p-4 rounded-lg ${bgElevatedClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${textMutedClass}`} />
                      <span className={`text-sm ${textClass}`}>Hours Worked</span>
                    </div>
                    <span className={textClass}>{selectedStaff.hoursWorked} hrs</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(selectedStaff!);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={textClass}>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription className={textMutedClass}>
              Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              style={{ backgroundColor: isDark ? '#ef4444' : undefined }}
              className={!isDark ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-500'}
              onClick={handleDeleteStaff}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
