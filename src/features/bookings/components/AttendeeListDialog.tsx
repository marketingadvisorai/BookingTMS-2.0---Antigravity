/**
 * AttendeeListDialog Component
 * 
 * Dialog showing all bookings and attendees for a specific date.
 * Includes summary stats and CSV export functionality.
 * @module features/bookings/components/AttendeeListDialog
 */
import { CalendarDays, Users, DollarSign, Clock, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { toast } from 'sonner';
import type { Booking, GameOption } from '../types';

export interface AttendeeListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | undefined;
  bookings: Booking[];
  gamesData?: GameOption[];
}

/** Escape CSV field values */
const escapeCsv = (value: unknown) => {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

/** Build CSV string from booking rows */
const buildCsv = (rows: Booking[]) => {
  const headers = ['Booking ID', 'Customer', 'Email', 'Phone', 'Game', 'Date', 'Time', 'Group Size', 'Amount', 'Status'];
  const lines = [headers.join(',')];
  rows.forEach(r => {
    lines.push([
      escapeCsv(r.id),
      escapeCsv(r.customer),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.game),
      escapeCsv(r.date),
      escapeCsv(r.time),
      escapeCsv(r.groupSize),
      escapeCsv(r.amount),
      escapeCsv(r.status)
    ].join(','));
  });
  return lines.join('\n');
};

/** Download CSV file */
const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Displays all bookings and attendees for a specific date.
 * Shows summary stats (bookings, attendees, revenue) and allows CSV export.
 */
export function AttendeeListDialog({ open, onOpenChange, date, bookings, gamesData = [] }: AttendeeListDialogProps) {
  if (!date) return null;

  const totalAttendees = bookings.reduce((sum, b) => sum + b.groupSize, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

  const handleExportList = () => {
    if (!bookings.length) {
      toast.info('No bookings to export for this day');
      return;
    }
    const csv = buildCsv(bookings);
    const ts = new Date();
    const stamp = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}_${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}`;
    const filename = `attendees_${date.toISOString().split('T')[0]}_${stamp}.csv`;
    downloadCsv(csv, filename);
    toast.success(`Exported ${bookings.length} records`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            All bookings and attendees for this day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-blue-600 truncate">Bookings</p>
                    <p className="text-lg sm:text-2xl text-blue-900">{bookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-green-600 truncate">Attendees</p>
                    <p className="text-lg sm:text-2xl text-green-900">{totalAttendees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-purple-600 truncate">Revenue</p>
                    <p className="text-lg sm:text-2xl text-purple-900">${totalRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <ScrollArea className="h-[300px] sm:h-[400px]">
            <div className="space-y-3 pr-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No bookings for this day</p>
                </div>
              ) : (
                bookings.map((booking) => {
                  const gameColor = gamesData.find(g => g.name === booking.game)?.color || '#6b7280';
                  return (
                    <Card key={booking.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-12 rounded" style={{ backgroundColor: gameColor }} />
                              <div>
                                <h4 className="text-gray-900">{booking.game}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {booking.time}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {booking.groupSize} people
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Separator className="my-2" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-gray-900">{booking.customer}</p>
                                <p className="text-xs text-gray-600">{booking.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Group Composition</p>
                                <p className="text-gray-900">{booking.adults} Adults, {booking.children} Children</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="text-xl text-gray-900">${booking.amount}</p>
                            <Badge
                              variant="secondary"
                              className={`mt-2
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                                ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExportList}>
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
