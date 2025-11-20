import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Crown,
  Star,
  Award,
  AlertCircle,
  Send,
  Key,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { PageHeader } from '../components/layout/PageHeader';
import { toast } from 'sonner';
import avatarImage from 'figma:asset/00e8f72492f468a73fc822a8f3b89537848df6aa.png';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Staff';
  status: 'Active' | 'Inactive' | 'Invited';
  avatar?: string;
  joinDate: string;
  lastActive: string;
  permissions: {
    bookings: boolean;
    games: boolean;
    staff: boolean;
    reports: boolean;
    billing: boolean;
    settings: boolean;
  };
}

export function Team() {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff' as TeamMember['role'],
    sendEmail: true
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@bookingtms.com',
      phone: '+1 (555) 123-4567',
      role: 'Owner',
      status: 'Active',
      avatar: avatarImage,
      joinDate: 'Jan 15, 2024',
      lastActive: '2 minutes ago',
      permissions: {
        bookings: true,
        games: true,
        staff: true,
        reports: true,
        billing: true,
        settings: true
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@bookingtms.com',
      phone: '+1 (555) 234-5678',
      role: 'Admin',
      status: 'Active',
      joinDate: 'Feb 10, 2024',
      lastActive: '1 hour ago',
      permissions: {
        bookings: true,
        games: true,
        staff: true,
        reports: true,
        billing: false,
        settings: true
      }
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@bookingtms.com',
      phone: '+1 (555) 345-6789',
      role: 'Manager',
      status: 'Active',
      joinDate: 'Mar 5, 2024',
      lastActive: '3 hours ago',
      permissions: {
        bookings: true,
        games: true,
        staff: false,
        reports: true,
        billing: false,
        settings: false
      }
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily.r@bookingtms.com',
      phone: '+1 (555) 456-7890',
      role: 'Staff',
      status: 'Active',
      joinDate: 'Apr 20, 2024',
      lastActive: '5 hours ago',
      permissions: {
        bookings: true,
        games: false,
        staff: false,
        reports: false,
        billing: false,
        settings: false
      }
    },
    {
      id: '5',
      name: 'David Park',
      email: 'david.park@bookingtms.com',
      phone: '+1 (555) 567-8901',
      role: 'Staff',
      status: 'Inactive',
      joinDate: 'May 12, 2024',
      lastActive: '2 days ago',
      permissions: {
        bookings: true,
        games: false,
        staff: false,
        reports: false,
        billing: false,
        settings: false
      }
    },
    {
      id: '6',
      name: 'Jessica Taylor',
      email: 'jessica.t@bookingtms.com',
      phone: '+1 (555) 678-9012',
      role: 'Manager',
      status: 'Invited',
      joinDate: 'Oct 28, 2024',
      lastActive: 'Never',
      permissions: {
        bookings: true,
        games: true,
        staff: false,
        reports: true,
        billing: false,
        settings: false
      }
    }
  ]);

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-4 h-4" />;
      case 'Admin':
        return <Shield className="w-4 h-4" />;
      case 'Manager':
        return <Star className="w-4 h-4" />;
      case 'Staff':
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    if (isDark) {
      switch (role) {
        case 'Owner':
          return 'bg-orange-500/20 text-orange-400 border-0';
        case 'Admin':
          return 'bg-purple-500/20 text-purple-400 border-0';
        case 'Manager':
          return 'bg-[#4f46e5]/20 text-[#6366f1] border-0';
        case 'Staff':
          return 'bg-[#2a2a2a] text-[#a3a3a3] border-0';
      }
    } else {
      switch (role) {
        case 'Owner':
          return 'bg-orange-100 text-orange-700 border-0';
        case 'Admin':
          return 'bg-purple-100 text-purple-700 border-0';
        case 'Manager':
          return 'bg-blue-100 text-blue-700 border-0';
        case 'Staff':
          return 'bg-gray-100 text-gray-700 border-0';
      }
    }
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'Inactive':
        return (
          <Badge className={isDark ? 'bg-[#2a2a2a] text-[#737373] border-0' : 'bg-gray-100 text-gray-700 border-0'}>
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'Invited':
        return (
          <Badge className={isDark ? 'bg-yellow-500/20 text-yellow-400 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
            <Clock className="w-3 h-3 mr-1" />
            Invited
          </Badge>
        );
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'Active').length,
    invited: teamMembers.filter(m => m.status === 'Invited').length,
    roles: {
      owner: teamMembers.filter(m => m.role === 'Owner').length,
      admin: teamMembers.filter(m => m.role === 'Admin').length,
      manager: teamMembers.filter(m => m.role === 'Manager').length,
      staff: teamMembers.filter(m => m.role === 'Staff').length
    }
  };

  const handleInviteMember = () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMember: TeamMember = {
      id: String(teamMembers.length + 1),
      name: inviteForm.name,
      email: inviteForm.email,
      phone: inviteForm.phone,
      role: inviteForm.role,
      status: 'Invited',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastActive: 'Never',
      permissions: {
        bookings: inviteForm.role !== 'Staff',
        games: inviteForm.role === 'Owner' || inviteForm.role === 'Admin' || inviteForm.role === 'Manager',
        staff: inviteForm.role === 'Owner' || inviteForm.role === 'Admin',
        reports: inviteForm.role !== 'Staff',
        billing: inviteForm.role === 'Owner',
        settings: inviteForm.role === 'Owner' || inviteForm.role === 'Admin'
      }
    };

    setTeamMembers([...teamMembers, newMember]);
    toast.success(`Invitation sent to ${inviteForm.name}`);
    setIsInviteDialogOpen(false);
    setInviteForm({
      name: '',
      email: '',
      phone: '',
      role: 'Staff',
      sendEmail: true
    });
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMember) {
      setTeamMembers(teamMembers.filter(m => m.id !== selectedMember.id));
      toast.success(`${selectedMember.name} has been removed from the team`);
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleResendInvite = (member: TeamMember) => {
    toast.success(`Invitation resent to ${member.name}`);
  };

  const handleToggleStatus = (member: TeamMember) => {
    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    setTeamMembers(teamMembers.map(m => 
      m.id === member.id ? { ...m, status: newStatus as TeamMember['status'] } : m
    ));
    toast.success(`${member.name} is now ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Team Management"
          description="Manage your team members, roles, and permissions"
        />
        <Button 
          style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
          className={`w-full sm:w-auto h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={() => setIsInviteDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Invite Team Member</span>
          <span className="sm:hidden">Invite Member</span>
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Members</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{teamStats.total}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <Users className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Active</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{teamStats.active}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <CheckCircle2 className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Pending Invites</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{teamStats.invited}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Managers & Admins</p>
                <p className={`text-2xl mt-2 ${textClass}`}>
                  {teamStats.roles.admin + teamStats.roles.manager}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Shield className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px] h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Team Members ({filteredMembers.length})</CardTitle>
          <CardDescription className={textMutedClass}>View and manage all team members</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <div key={member.id}>
                <div className={`flex items-center justify-between p-4 rounded-lg ${hoverBgClass} transition-colors`}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className={isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className={`text-sm ${textClass}`}>{member.name}</p>
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{member.role}</span>
                        </Badge>
                        {getStatusBadge(member.status)}
                      </div>
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${textMutedClass}`}>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {member.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          Joined {member.joinDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          Last active {member.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                      <DropdownMenuItem onClick={() => handleEditMember(member)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Member
                      </DropdownMenuItem>
                      {member.status === 'Invited' && (
                        <DropdownMenuItem onClick={() => handleResendInvite(member)}>
                          <Send className="w-4 h-4 mr-2" />
                          Resend Invite
                        </DropdownMenuItem>
                      )}
                      {member.role !== 'Owner' && (
                        <>
                          <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                            {member.status === 'Active' ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMember(member)}
                            className={isDark ? 'text-red-400' : 'text-red-600'}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {index < filteredMembers.length - 1 && <Separator className={borderClass} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roles & Permissions Info */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Roles & Permissions</CardTitle>
          <CardDescription className={textMutedClass}>Understanding team member roles and their access levels</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>Owner</p>
              </div>
              <p className={`text-xs ${isDark ? 'text-orange-400/70' : 'text-orange-700'}`}>
                Full access to all features including billing, team management, and critical settings
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>Admin</p>
              </div>
              <p className={`text-xs ${isDark ? 'text-purple-400/70' : 'text-purple-700'}`}>
                Manage bookings, games, staff, and settings. No billing access
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Star className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Manager</p>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                Manage bookings, games, and view reports. Limited settings access
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${textMutedClass}`} />
                <p className={`text-sm ${textClass}`}>Staff</p>
              </div>
              <p className={`text-xs ${textMutedClass}`}>
                View and manage bookings only. Basic operational access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className={`max-w-md ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Invite Team Member</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name" className={textClass}>Full Name *</Label>
              <Input
                id="invite-name"
                placeholder="John Smith"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email" className={textClass}>Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="john@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-phone" className={textClass}>Phone Number</Label>
              <Input
                id="invite-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role" className={textClass}>Role</Label>
              <Select 
                value={inviteForm.role} 
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as TeamMember['role'] })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div>
                <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Send email invitation</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                  User will receive an email to join the team
                </p>
              </div>
              <Switch
                checked={inviteForm.sendEmail}
                onCheckedChange={(checked) => setInviteForm({ ...inviteForm, sendEmail: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} className="h-11">
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={`h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={handleInviteMember}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Edit Team Member</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Update member information and permissions
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={textClass}>Full Name</Label>
                  <Input defaultValue={selectedMember.name} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className={textClass}>Role</Label>
                  <Select defaultValue={selectedMember.role}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Owner" disabled>Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={textClass}>Email</Label>
                  <Input type="email" defaultValue={selectedMember.email} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className={textClass}>Phone</Label>
                  <Input type="tel" defaultValue={selectedMember.phone} className="h-11" />
                </div>
              </div>

              <Separator className={borderClass} />

              <div>
                <h3 className={`text-sm mb-3 ${textClass}`}>Permissions</h3>
                <div className="space-y-3">
                  {Object.entries(selectedMember.permissions).map(([key, value]) => (
                    <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                      <div>
                        <p className={`text-sm ${textClass} capitalize`}>{key}</p>
                        <p className={`text-xs ${textMutedClass}`}>
                          {key === 'bookings' && 'View and manage bookings'}
                          {key === 'games' && 'Create and edit games/rooms'}
                          {key === 'staff' && 'Manage team members'}
                          {key === 'reports' && 'Access reports and analytics'}
                          {key === 'billing' && 'Manage billing and subscriptions'}
                          {key === 'settings' && 'Modify system settings'}
                        </p>
                      </div>
                      <Switch defaultChecked={value} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-11">
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={`h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={() => {
                toast.success('Member updated successfully');
                setIsEditDialogOpen(false);
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
          <DialogHeader>
            <DialogTitle className={textClass}>Remove Team Member</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Are you sure you want to remove {selectedMember?.name} from the team?
            </DialogDescription>
          </DialogHeader>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-900'}`}>This action cannot be undone</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-red-400/70' : 'text-red-700'}`}>
                  The team member will lose access to all resources immediately.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="h-11">
              Cancel
            </Button>
            <Button 
              className={`h-11 ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={confirmDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing import
import { Save } from 'lucide-react';
