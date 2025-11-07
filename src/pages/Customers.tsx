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
import { 
  Search, 
  UserPlus, 
  Download,
  Filter,
  Eye,
  Edit,
  MoreVertical
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState(mockCustomers);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const canEdit = hasPermission('customers.edit');

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Regular': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'New': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
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

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDetailDialog(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowAddDialog(true);
  };

  const handleSaveCustomer = (customerData: any) => {
    if (selectedCustomer) {
      // Edit existing
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, ...customerData }
          : c
      ));
    } else {
      // Add new
      const newCustomer = {
        id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        ...customerData,
        totalBookings: 0,
        totalSpent: 0,
        lastBooking: 'Never',
        segment: customerData.segment || 'New',
        status: 'Active'
      };
      setCustomers([...customers, newCustomer]);
    }
    setSelectedCustomer(null);
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
        subtitle="Manage customer database, profiles, and segments"
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

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={isDark ? 'border-[#1e1e1e] hover:bg-transparent' : 'hover:bg-transparent'}>
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

              {filteredCustomers.length === 0 && (
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
