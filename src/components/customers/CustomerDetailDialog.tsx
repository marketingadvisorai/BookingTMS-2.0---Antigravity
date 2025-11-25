'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { useCustomers, CustomerInsights, CustomerGame, CustomerVenue } from '../../hooks/useCustomers';
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
  TrendingUp,
  Gamepad2,
  Building2
} from 'lucide-react';

interface CustomerDetailDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any;
}

export function CustomerDetailDialog({ open, onClose, customer }: CustomerDetailDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getCustomerInsights, getCustomerGames, getCustomerVenues, getCustomerHistory } = useCustomers();

  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [games, setGames] = useState<CustomerGame[]>([]);
  const [venues, setVenues] = useState<CustomerVenue[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customer?.id) {
      loadCustomerData();
    }
  }, [open, customer?.id]);

  const loadCustomerData = async () => {
    if (!customer?.id) return;

    setLoading(true);
    try {
      const [insightsData, gamesData, venuesData, bookingsData] = await Promise.all([
        getCustomerInsights(customer.id),
        getCustomerGames(customer.id),
        getCustomerVenues(customer.id),
        getCustomerHistory(customer.id)
      ]);

      setInsights(insightsData);
      setGames(gamesData);
      setVenues(venuesData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const getSegmentColor = (segment: string) => {
    const lowerSegment = segment?.toLowerCase();
    switch (lowerSegment) {
      case 'vip': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'high': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'frequent':
      case 'regular': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'new':
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'churned':
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
              <TabsTrigger value="games">Activities Played ({games.length})</TabsTrigger>
              <TabsTrigger value="venues">Venues Visited ({venues.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-3 mt-4">
              {loading ? (
                <div className={`${cardBgClass} ${borderClass} border rounded-lg p-8 text-center`}>
                  <p className={subtextClass}>Loading booking history...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className={`${cardBgClass} ${borderClass} border rounded-lg p-8 text-center`}>
                  <p className={subtextClass}>No bookings found</p>
                </div>
              ) : (
                bookings.map((booking: any) => (
                  <div key={booking.booking_id} className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className={textClass}>{booking.game_name}</p>
                          <Badge className={getSegmentColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className={`text-sm ${subtextClass} mt-1`}>
                          {booking.venue_name} • {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className={`text-lg ${textClass}`}>{formatCurrency(booking.total_amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="games" className="space-y-3 mt-4">
              {loading ? (
                <div className={`${cardBgClass} ${borderClass} border rounded-lg p-8 text-center`}>
                  <p className={subtextClass}>Loading games...</p>
                </div>
              ) : games.length === 0 ? (
                <div className={`${cardBgClass} ${borderClass} border rounded-lg p-8 text-center`}>
                  <p className={subtextClass}>No games played yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.map((game) => (
                    <div key={game.game_id} className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-blue-50'}`}>
                          <Gamepad2 className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`${textClass} font-medium`}>{game.game_name}</h4>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className={subtextClass}>Times Played:</span>
                              <span className={textClass}>{game.booking_count}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={subtextClass}>Total Spent:</span>
                              <span className={textClass}>{formatCurrency(game.total_spent)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={subtextClass}>Last Played:</span>
                              <span className={textClass}>
                                {new Date(game.last_played).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="venues" className="space-y-3 mt-4">
              {loading ? (
                <div className={`${cardBgClass} ${borderClass} border rounded-lg p-8 text-center`}>
                  <p className={subtextClass}>Loading venues...</p>
                </div>
              ) : venues.length === 0 ? (
                <div className={`${cardBgClass} ${borderClass} border rounded-lg p-8 text-center`}>
                  <p className={subtextClass}>No venues visited yet</p>
                </div>
              ) : (
                venues.map((venue) => (
                  <div key={venue.venue_id} className={`${cardBgClass} ${borderClass} border rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-purple-50'}`}>
                        <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`${textClass} font-medium`}>{venue.venue_name}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={subtextClass}>Visits:</span>
                            <span className={textClass}>{venue.visit_count}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className={subtextClass}>Total Spent:</span>
                            <span className={textClass}>{formatCurrency(venue.total_spent)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className={subtextClass}>Last Visit:</span>
                            <span className={textClass}>
                              {new Date(venue.last_visit).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
