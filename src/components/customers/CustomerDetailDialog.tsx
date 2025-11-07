'use client';

import { useTheme } from '../layout/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Package, 
  Clock,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';

interface CustomerDetailDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any;
}

export function CustomerDetailDialog({ open, onClose, customer }: CustomerDetailDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!customer) return null;

  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const mockBookings = [
    { id: 1, date: '2024-11-01', game: 'Zombie Apocalypse', amount: 120, status: 'Completed' },
    { id: 2, date: '2024-10-15', game: 'Bank Heist', amount: 150, status: 'Completed' },
    { id: 3, date: '2024-09-20', game: 'Prison Break', amount: 120, status: 'Completed' },
    { id: 4, date: '2024-08-10', game: 'Haunted Manor', amount: 180, status: 'Completed' },
  ];

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Regular': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'New': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Customer Profile</DialogTitle>
          <DialogDescription className={isDark ? 'text-[#737373]' : 'text-gray-600'}>
            View detailed customer information, booking history, and engagement metrics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Header */}
          <div className={`${cardBgClass} ${borderClass} border rounded-lg p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-2xl ${textClass}`}>
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className={`${subtextClass} mt-1`}>Customer ID: {customer.id}</p>
              </div>
              <Badge className={getSegmentColor(customer.segment)}>
                {customer.segment}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                  <Mail className={`w-4 h-4 ${subtextClass}`} />
                </div>
                <div>
                  <p className={`text-sm ${subtextClass}`}>Email</p>
                  <p className={`text-sm ${textClass}`}>{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                  <Phone className={`w-4 h-4 ${subtextClass}`} />
                </div>
                <div>
                  <p className={`text-sm ${subtextClass}`}>Phone</p>
                  <p className={`text-sm ${textClass}`}>{customer.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                  <Calendar className={`w-4 h-4 ${subtextClass}`} />
                </div>
                <div>
                  <p className={`text-sm ${subtextClass}`}>Last Booking</p>
                  <p className={`text-sm ${textClass}`}>{customer.lastBooking}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                  <Clock className={`w-4 h-4 ${subtextClass}`} />
                </div>
                <div>
                  <p className={`text-sm ${subtextClass}`}>Member Since</p>
                  <p className={`text-sm ${textClass}`}>Jan 2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${subtextClass}`}>Total Bookings</p>
                  <p className={`text-2xl mt-1 ${textClass}`}>{customer.totalBookings}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-blue-50'}`}>
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </div>

            <div className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${subtextClass}`}>Lifetime Value</p>
                  <p className={`text-2xl mt-1 ${textClass}`}>${customer.totalSpent}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-green-50'}`}>
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </div>

            <div className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${subtextClass}`}>Avg. Booking Value</p>
                  <p className={`text-2xl mt-1 ${textClass}`}>$142</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-purple-50'}`}>
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className={`${isDark ? 'bg-[#161616]' : 'bg-gray-100'}`}>
              <TabsTrigger value="bookings">Booking History</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-3 mt-4">
              {mockBookings.map((booking) => (
                <div key={booking.id} className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className={textClass}>{booking.game}</p>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className={`text-sm ${subtextClass} mt-1`}>
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <p className={`text-lg ${textClass}`}>${booking.amount}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                <h4 className={`${textClass} mb-3`}>Communication Preferences</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={subtextClass}>Preferred Method</span>
                    <span className={textClass}>{customer.communicationPreference || 'Email'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={subtextClass}>Marketing Emails</span>
                    <span className={textClass}>Subscribed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={subtextClass}>SMS Notifications</span>
                    <span className={textClass}>Enabled</span>
                  </div>
                </div>
              </div>

              <div className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                <h4 className={`${textClass} mb-3`}>Favorite Games</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Zombie Apocalypse
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Bank Heist
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                <p className={subtextClass}>
                  {customer.notes || 'No notes available for this customer.'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
