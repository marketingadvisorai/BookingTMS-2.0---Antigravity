/**
 * Step2BookingDetails Component
 * 
 * Second step of AddBookingDialog - collects booking details (venue, game, date, time, group size).
 * @module features/bookings/components/add-booking/Step2BookingDetails
 */
import { useMemo } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import type { Booking, GameOption } from '../../types';

interface BookingFormData {
  venueId: string;
  gameId: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  notes: string;
  customerNotes: string;
}

interface Step2BookingDetailsProps {
  formData: BookingFormData;
  onChange: (updates: Partial<BookingFormData>) => void;
  venues: Array<{ id: string; name: string }>;
  gamesData: GameOption[];
  bookings: Booking[];
}

/** Check if a time slot is available */
const isSlotAvailable = (
  date: string,
  time: string,
  gameId: string,
  venueId: string,
  bookings: Booking[],
  gamesData: GameOption[]
): boolean => {
  if (!date || !time || !gameId || !venueId) return false;
  const game = gamesData.find(g => g.id === gameId);
  if (!game) return false;
  return !bookings.some((b) => {
    const sameDate = b.date === date;
    const sameTime = b.time === time;
    const sameGame = b.gameId ? b.gameId === gameId : b.game === game.name;
    const sameVenue = b.venueId ? b.venueId === venueId : true;
    return sameDate && sameTime && sameGame && sameVenue && b.status !== 'cancelled';
  });
};

/** Standard time slots */
const TIME_SLOTS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const TIME_LABELS: Record<string, string> = {
  '10:00': '10:00 AM',
  '12:00': '12:00 PM',
  '14:00': '2:00 PM',
  '16:00': '4:00 PM',
  '18:00': '6:00 PM',
  '20:00': '8:00 PM'
};

/**
 * Booking details form - venue, game, date, time, group size, and notes.
 */
export function Step2BookingDetails({ formData, onChange, venues, gamesData, bookings }: Step2BookingDetailsProps) {
  // Filter games by selected venue
  const availableGames = useMemo(() => {
    if (!formData.venueId) return gamesData;
    return gamesData.filter((g) => g.venueId === formData.venueId);
  }, [gamesData, formData.venueId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</div>
        <h3 className="text-sm sm:text-base text-gray-900 dark:text-white">Booking Details</h3>
      </div>

      {/* Venue Selection */}
      <div>
        <Label htmlFor="venue" className="text-sm">Select Venue *</Label>
        <Select
          value={formData.venueId}
          onValueChange={(value) => onChange({ venueId: value, gameId: '', time: '' })}
        >
          <SelectTrigger className="mt-1 h-11">
            <SelectValue placeholder="Choose a venue" />
          </SelectTrigger>
          <SelectContent>
            {venues.length > 0 ? (
              venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-venues" disabled>No venues available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Game Selection */}
      <div>
        <Label htmlFor="game" className="text-sm">Select Game *</Label>
        <Select
          value={formData.gameId}
          onValueChange={(value) => onChange({ gameId: value, time: '' })}
          disabled={!formData.venueId}
        >
          <SelectTrigger className="mt-1 h-11">
            <SelectValue placeholder={formData.venueId ? 'Choose a game' : 'Select a venue first'} />
          </SelectTrigger>
          <SelectContent>
            {availableGames.length > 0 ? (
              availableGames.map((game) => (
                <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-games" disabled>
                {formData.venueId ? 'No games available for this venue' : 'Select a venue to load games'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-sm">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="time" className="text-sm">Time *</Label>
          <Select
            value={formData.time}
            onValueChange={(value) => onChange({ time: value })}
            disabled={!formData.date || !formData.gameId}
          >
            <SelectTrigger className="mt-1 h-11">
              <SelectValue placeholder={formData.gameId ? 'Select time' : 'Select a game first'} />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => {
                const unavailable = formData.date && formData.gameId 
                  ? !isSlotAvailable(formData.date, t, formData.gameId, formData.venueId, bookings, gamesData) 
                  : true;
                return (
                  <SelectItem key={t} value={t} disabled={unavailable}>
                    {TIME_LABELS[t]}{unavailable && formData.date && formData.gameId ? ' (Unavailable)' : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Group Size */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="adults" className="text-sm">Number of Adults *</Label>
          <Input
            id="adults"
            type="number"
            min="1"
            value={formData.adults}
            onChange={(e) => onChange({ adults: parseInt(e.target.value) || 0 })}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="children" className="text-sm">Number of Children</Label>
          <Input
            id="children"
            type="number"
            min="0"
            value={formData.children}
            onChange={(e) => onChange({ children: parseInt(e.target.value) || 0 })}
            className="mt-1 h-11"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm">Internal Notes (Admin Only)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Internal notes for staff..."
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="customerNotes" className="text-sm">Customer Notes</Label>
        <Textarea
          id="customerNotes"
          value={formData.customerNotes}
          onChange={(e) => onChange({ customerNotes: e.target.value })}
          placeholder="Special requests from customer..."
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  );
}
