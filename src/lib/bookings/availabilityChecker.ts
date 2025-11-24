import { supabase } from '../supabase';

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export class AvailabilityChecker {
  /**
   * Check if a specific time slot is available
   */
  static async isSlotAvailable(
    gameId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {

    try {
      // Check for overlapping bookings
      const { data: overlapping, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('activity_id', gameId) // Refactored from game_id
        .eq('booking_date', date)
        .neq('status', 'canceled')
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

      if (error) {
        console.error('Error checking availability:', error);
        return false;
      }

      return !overlapping || overlapping.length === 0;
    } catch (error) {
      console.error('Error in isSlotAvailable:', error);
      return false;
    }
  }

  /**
   * Get available time slots for a game on a specific date
   */
  static async getAvailableSlots(
    gameId: string,
    date: string
  ): Promise<TimeSlot[]> {
    try {
      // Get game details
      const { data: game, error: gameError } = await supabase
        .from('activities') // Refactored from games
        .select('duration, min_players, max_players')
        .eq('id', gameId)
        .single();


      if (gameError || !game) {
        console.error('Error fetching game:', gameError);
        return [];
      }

      const duration = game.duration || 60;

      // Generate time slots (10 AM to 9 PM)
      const slots: TimeSlot[] = [];
      const startHour = 10;
      const endHour = 21;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of [0, 30]) {
          const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          const endTime = this.addDuration(time, duration);

          // Don't add slots that would end after closing time
          const [endH] = endTime.split(':').map(Number);
          if (endH >= endHour) continue;

          const available = await this.isSlotAvailable(
            gameId,
            date,
            time,
            endTime
          );

          slots.push({
            time,
            available,
            reason: available ? undefined : 'Already booked',
          });
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  /**
   * Get only available slots (filtered)
   */
  static async getOnlyAvailableSlots(
    gameId: string,
    date: string
  ): Promise<string[]> {
    const allSlots = await this.getAvailableSlots(gameId, date);
    return allSlots.filter((slot) => slot.available).map((slot) => slot.time);
  }

  /**
   * Check if a date has any available slots
   */
  static async hasAvailableSlots(
    gameId: string,
    date: string
  ): Promise<boolean> {
    const availableSlots = await this.getOnlyAvailableSlots(gameId, date);
    return availableSlots.length > 0;
  }

  /**
   * Get next available date for a game
   */
  static async getNextAvailableDate(
    gameId: string,
    startDate: Date = new Date()
  ): Promise<Date | null> {
    const maxDaysToCheck = 30;
    const currentDate = new Date(startDate);

    for (let i = 0; i < maxDaysToCheck; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasSlots = await this.hasAvailableSlots(gameId, dateStr);

      if (hasSlots) {
        return currentDate;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
  }

  /**
   * Add duration to a time string
   */
  static addDuration(time: string, durationMinutes: number): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  /**
   * Format time for display (24h to 12h)
   */
  static formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  /**
   * Check if date is in the past
   */
  static isDateInPast(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
  }

  /**
   * Check if time slot is in the past for today
   */
  static isTimeSlotInPast(date: string, time: string): boolean {
    if (!this.isDateInPast(date)) {
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);

        return slotTime < now;
      }
      return false;
    }
    return true;
  }
}
