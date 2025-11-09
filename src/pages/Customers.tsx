'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Search, 
  UserPlus, 
  Download,
  Filter,
  Eye,
  Edit,
  MoreVertical,
  RefreshCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { CustomerStats } from '../components/customers/CustomerStats';
import { CustomerSegments } from '../components/customers/CustomerSegments';
import { AddCustomerDialog } from '../components/customers/AddCustomerDialog';
import { CustomerDetailDialog } from '../components/customers/CustomerDetailDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useCustomers } from '../hooks/useCustomers';
import { toast } from 'sonner';

// Mock customer data
const mockCustomers = [
  {
    id: 'CUST-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    totalBookings: 24,
    totalSpent: 2880,
    lastBooking: 'Nov 1, 2024',
    segment: 'VIP',
    status: 'Active',
    communicationPreference: 'Email'
  },
  {
    id: 'CUST-002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    totalBookings: 8,
    totalSpent: 960,
    lastBooking: 'Oct 28, 2024',
    segment: 'Regular',
    status: 'Active',
    communicationPreference: 'SMS'
  },
  {
    id: 'CUST-003',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '(555) 345-6789',
    totalBookings: 2,
    totalSpent: 240,
    lastBooking: 'Oct 30, 2024',
    segment: 'New',
    status: 'Active',
    communicationPreference: 'Both'
  },
  {
    id: 'CUST-004',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 456-7890',
    totalBookings: 15,
    totalSpent: 1800,
    lastBooking: 'Oct 25, 2024',
    segment: 'VIP',
    status: 'Active',
    communicationPreference: 'Email'
  },
  {
    id: 'CUST-005',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica.martinez@email.com',
    phone: '(555) 567-8901',
    totalBookings: 6,
    totalSpent: 720,
    lastBooking: 'Oct 20, 2024',
    segment: 'Regular',
    status: 'Active',
    communicationPreference: 'Email'
  },
  {
    id: 'CUST-006',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@email.com',
    phone: '(555) 678-9012',
    totalBookings: 3,
    totalSpent: 360,
    lastBooking: 'May 15, 2024',
    segment: 'Inactive',
    status: 'Inactive',
    communicationPreference: 'None'
  },
  {
    id: 'CUST-007',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'amanda.taylor@email.com',
    phone: '(555) 789-0123',
    totalBookings: 1,
    totalSpent: 120,
    lastBooking: 'Oct 31, 2024',
    segment: 'New',
    status: 'Active',
    communicationPreference: 'SMS'
  },
  {
    id: 'CUST-008',
    firstName: 'Robert',
    lastName: 'Anderson',
    email: 'robert.anderson@email.com',
    phone: '(555) 890-1234',
    totalBookings: 12,
    totalSpent: 1440,
    lastBooking: 'Oct 29, 2024',
    segment: 'VIP',
    status: 'Active',
    communicationPreference: 'Both'
  }
];

export default function Customers() {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const isDark = theme === 'dark';
  const { customers: dbCustomers, loading, refreshCustomers, createCustomer, updateCustomer } = useCustomers();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCustomers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const canEdit = hasPermission('customers.edit');
  const canExport = hasPermission('customers.export');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Convert DB customers to UI format
  const customers = dbCustomers.map(c => ({
    id: c.id,
    firstName: c.first_name,
    lastName: c.last_name,
    email: c.email,
    phone: c.phone,
    totalBookings: c.total_bookings,
    totalSpent: c.total_spent,
    lastBooking: c.updated_at ? new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never',
    segment: c.metadata?.lifecycle_stage || 'new',
    status: c.status === 'active' ? 'Active' : 'Inactive',
    communicationPreference: 'Email',
    notes: c.notes,
    favoriteGame: c.metadata?.favorite_game_name || null,
    preferredVenue: c.metadata?.preferred_venue_name || null
  }));
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);


  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const getSegmentColor = (segment: string) => {
    const lowerSegment = segment?.toLowerCase();
    switch (lowerSegment) {
      // Lifecycle stages
      case 'new': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'active': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'churned': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      // Spending tiers
      case 'vip': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'high': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      // Frequency tiers
      case 'frequent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'regular': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'occasional': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'one-time': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      // Legacy support
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredCustomers.map(c => c.id));
      setSelectedCustomers(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
      setSelectAll(false);
    } else {
      newSelected.add(customerId);
      if (newSelected.size === filteredCustomers.length) {
        setSelectAll(true);
      }
    }
    setSelectedCustomers(newSelected);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDetailDialog(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowAddDialog(true);
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      if (selectedCustomer) {
        // Edit existing
        await updateCustomer(selectedCustomer.id, {
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          notes: customerData.notes,
          status: customerData.status?.toLowerCase() || 'active'
        });
      } else {
        // Add new
        await createCustomer({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          country: 'United States',
          status: 'active',
          metadata: {},
          notes: customerData.notes || ''
        });
      }
      setSelectedCustomer(null);
      await refreshCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const filtered = customers.filter((c: any) => {
        const matchesSearch = normalizedSearch === '' ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(normalizedSearch) ||
          (c.email || '').toLowerCase().includes(normalizedSearch);
        const matchesSegment = selectedSegment === 'all' || c.segment === selectedSegment ||
          (selectedSegment === 'Active' && c.status === 'Active') ||
          (selectedSegment === 'Inactive' && c.status === 'Inactive');
        return matchesSearch && matchesSegment;
      });

      if (!filtered.length) {
        alert('No customers to export based on current filters');
        return;
      }

      if (exportFormat === 'csv') {
        const headers = [
          'Customer ID','First Name','Last Name','Email','Phone','Segment','Status','Total Bookings','Total Spent','Last Booking'
        ];
        const escape = (val: any) => {
          const s = val === undefined || val === null ? '' : String(val);
          return '"' + s.replace(/"/g, '""') + '"';
        };
        const rows = filtered.map((c: any) => [
          escape(c.id),
          escape(c.firstName),
          escape(c.lastName),
          escape(c.email),
          escape(c.phone),
          escape(c.segment),
          escape(c.status),
          escape(c.totalBookings),
          escape(c.totalSpent),
          escape(c.lastBooking)
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const doc = new jsPDF();
        let y = 14;
        doc.setFontSize(16);
        doc.text('Customers Export', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
        y += 8;
        const lineHeight = 6;
        const marginLeft = 14;
        const pageHeight = doc.internal.pageSize.getHeight();

        filtered.forEach((c: any, idx: number) => {
          const lines = [
            `#${idx + 1} • ${c.firstName} ${c.lastName} (${c.id})`,
            `Email: ${c.email} • Phone: ${c.phone || 'N/A'}`,
            `Segment: ${c.segment} • Status: ${c.status}`,
            `Bookings: ${c.totalBookings} • Total Spent: $${(c.totalSpent ?? 0).toLocaleString()}`,
            `Last Booking: ${c.lastBooking}`,
          ];

          lines.forEach(line => {
            if (y + lineHeight > pageHeight - 10) {
              doc.addPage();
              y = 14;
            }
            doc.text(line, marginLeft, y);
            y += lineHeight;
          });

          if (y + lineHeight > pageHeight - 10) {
            doc.addPage();
            y = 14;
          }
          doc.text('—'.repeat(40), marginLeft, y);
          y += lineHeight;
        });

        doc.save(`customers_${new Date().toISOString().slice(0,10)}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export customers');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Customers / Guests" 
        description="Manage customer database, profiles, and segments"
        sticky
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="h-11"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] h-11"
              onClick={() => setShowAddDialog(true)}
            >
              <UserPlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Customer</span>
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats Overview */}
        <CustomerStats />

        {/* Main Content */}
        <Tabs defaultValue="database" className="w-full">
          <TabsList className={`${isDark ? 'bg-[#161616]' : 'bg-gray-100'}`}>
            <TabsTrigger value="database">Customer Database</TabsTrigger>
            <TabsTrigger value="segments">Segments & Marketing</TabsTrigger>
          </TabsList>

          {/* Customer Database Tab */}
          <TabsContent value="database" className="space-y-6 mt-6">
            <div className={`${bgClass} ${borderClass} border rounded-lg`}>
              {/* Toolbar */}
              <div className="p-4 border-b" style={{ borderColor: isDark ? '#1e1e1e' : '#e5e7eb' }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${subtextClass}`} />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline"
                          className={`h-12 ${isDark ? 'border-[#1e1e1e] bg-[#0a0a0a] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                        <DropdownMenuItem onClick={() => setSelectedSegment('all')}>
                          All Customers
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedSegment('VIP')}>
                          VIP Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedSegment('Regular')}>
                          Regular Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedSegment('New')}>
                          New Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedSegment('Inactive')}>
                          Inactive Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <PermissionGuard permissions={['customers.export']}>
                      <Button 
                        variant="outline"
                        onClick={() => setShowExportDialog(true)}
                        className={`h-12 ${isDark ? 'border-[#1e1e1e] bg-[#0a0a0a] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </PermissionGuard>

                    <PermissionGuard permissions={['customers.create']}>
                      <Button 
                        onClick={() => {
                          setSelectedCustomer(null);
                          setShowAddDialog(true);
                        }}
                        style={{ backgroundColor: '#4f46e5' }}
                        className="h-12 text-white hover:opacity-90"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Customer
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedCustomers.size > 0 && (
                <div className={`${bgClass} ${borderClass} border rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <p className={textClass}>
                        <span className="font-semibold">{selectedCustomers.size}</span> customer{selectedCustomers.size !== 1 ? 's' : ''} selected
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomers(new Set());
                          setSelectAll(false);
                        }}
                        className={isDark ? 'text-[#a3a3a3] hover:text-white' : ''}
                      >
                        Clear selection
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.info(`Exporting ${selectedCustomers.size} customers...`);
                        }}
                        className={isDark ? 'border-[#2a2a2a] text-[#a3a3a3]' : ''}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Selected
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              {loading ? (
                <div className={`${bgClass} ${borderClass} border rounded-lg p-12 text-center`}>
                  <p className={subtextClass}>Loading customers...</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={isDark ? 'border-[#1e1e1e] hover:bg-transparent' : 'hover:bg-transparent'}>
                      <TableHead className={`${textClass} w-12`}>
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all customers"
                        />
                      </TableHead>
                      <TableHead className={textClass}>Customer</TableHead>
                      <TableHead className={textClass}>Contact</TableHead>
                      <TableHead className={textClass}>Bookings</TableHead>
                      <TableHead className={textClass}>Lifetime Value</TableHead>
                      <TableHead className={textClass}>Last Booking</TableHead>
                      <TableHead className={textClass}>Segment</TableHead>
                      <TableHead className={textClass}>Status</TableHead>
                      <TableHead className={textClass}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id}
                        className={`${isDark ? 'border-[#1e1e1e] hover:bg-[#1a1a1a]' : 'hover:bg-gray-50'}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.has(customer.id)}
                            onCheckedChange={() => handleSelectCustomer(customer.id)}
                            aria-label={`Select ${customer.firstName} ${customer.lastName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={textClass}>
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className={`text-sm ${subtextClass}`}>{customer.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`text-sm ${textClass}`}>{customer.email}</p>
                            <p className={`text-sm ${subtextClass}`}>{customer.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className={textClass}>{customer.totalBookings}</TableCell>
                        <TableCell className={textClass}>${customer.totalSpent.toLocaleString()}</TableCell>
                        <TableCell className={subtextClass}>{customer.lastBooking}</TableCell>
                        <TableCell>
                          <Badge className={getSegmentColor(customer.segment)}>
                            {customer.segment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
                              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Customer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}

              {!loading && filteredCustomers.length === 0 && (
                <div className="p-8 text-center">
                  <p className={subtextClass}>No customers found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="mt-6">
            <CustomerSegments />
          </TabsContent>
      </Tabs>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
          <DialogHeader>
            <DialogTitle className={textClass}>Export Customers</DialogTitle>
            <DialogDescription className={subtextClass}>
              Choose a format and export the currently filtered customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className={subtextClass}>Format</p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={exportFormat === 'csv' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('csv')}
                  className={isDark ? (exportFormat === 'csv' ? '' : 'border-[#2a2a2a] text-[#a3a3a3]') : ''}
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('pdf')}
                  className={isDark ? (exportFormat === 'pdf' ? '' : 'border-[#2a2a2a] text-[#a3a3a3]') : ''}
                >
                  PDF
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowExportDialog(false)}
                className={isDark ? 'text-[#a3a3a3] hover:text-white hover:bg-[#161616]' : ''}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'Exporting…' : 'Export'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <AddCustomerDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
        editCustomer={selectedCustomer}
      />

      <CustomerDetailDialog
        open={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />
    </>
  );
}
