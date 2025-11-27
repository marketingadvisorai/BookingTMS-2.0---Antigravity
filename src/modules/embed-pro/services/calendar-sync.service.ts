/**
 * Embed Pro 2.0 - Calendar Sync Service
 * @module embed-pro/services/calendar-sync.service
 * 
 * Service for generating calendar links and iCal files.
 * Supports Google Calendar, Outlook, Yahoo, Apple Calendar.
 */

import type {
  CalendarEvent,
  BookingCalendarEvent,
  CalendarLinks,
} from '../types/calendar-sync.types';

// =====================================================
// SERVICE CLASS
// =====================================================

class CalendarSyncService {
  /**
   * Generate all calendar links for a booking
   */
  generateCalendarLinks(event: CalendarEvent): CalendarLinks {
    return {
      google: this.generateGoogleCalendarUrl(event),
      outlook: this.generateOutlookUrl(event),
      yahoo: this.generateYahooUrl(event),
      icalDownload: this.generateICalDownloadUrl(event),
      icalContent: this.generateICalContent(event),
    };
  }

  /**
   * Create event from booking data
   */
  createEventFromBooking(booking: {
    bookingRef: string;
    activityName: string;
    venueName: string;
    venueAddress: string;
    startTime: string;
    endTime: string;
    partySize: number;
    customerName: string;
    customerEmail: string;
    timezone?: string;
    venuePhone?: string;
    venueEmail?: string;
  }): BookingCalendarEvent {
    const description = this.buildDescription(booking);

    return {
      title: `${booking.activityName} at ${booking.venueName}`,
      description,
      location: `${booking.venueName}, ${booking.venueAddress}`,
      startTime: booking.startTime,
      endTime: booking.endTime,
      timezone: booking.timezone || 'UTC',
      bookingRef: booking.bookingRef,
      activityName: booking.activityName,
      venueName: booking.venueName,
      venueAddress: booking.venueAddress,
      partySize: booking.partySize,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      uid: `booking-${booking.bookingRef}@bookflow.app`,
      reminder: 60, // 1 hour before
    };
  }

  // =====================================================
  // GOOGLE CALENDAR
  // =====================================================

  private generateGoogleCalendarUrl(event: CalendarEvent): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: `${this.formatDateForGoogle(event.startTime)}/${this.formatDateForGoogle(event.endTime)}`,
    });

    if (event.timezone) {
      params.set('ctz', event.timezone);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  private formatDateForGoogle(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  }

  // =====================================================
  // OUTLOOK
  // =====================================================

  private generateOutlookUrl(event: CalendarEvent): string {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      subject: event.title,
      body: event.description,
      location: event.location,
      startdt: event.startTime,
      enddt: event.endTime,
      path: '/calendar/action/compose',
      rru: 'addevent',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // =====================================================
  // YAHOO CALENDAR
  // =====================================================

  private generateYahooUrl(event: CalendarEvent): string {
    const baseUrl = 'https://calendar.yahoo.com/';
    const duration = this.calculateDurationInMinutes(event.startTime, event.endTime);
    
    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      desc: event.description,
      in_loc: event.location,
      st: this.formatDateForYahoo(event.startTime),
      dur: this.formatDurationForYahoo(duration),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private formatDateForYahoo(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15);
  }

  private formatDurationForYahoo(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
  }

  // =====================================================
  // ICAL FORMAT
  // =====================================================

  private generateICalContent(event: CalendarEvent): string {
    const uid = event.uid || `${Date.now()}@bookflow.app`;
    const now = this.formatDateForICal(new Date().toISOString());
    const start = this.formatDateForICal(event.startTime);
    const end = this.formatDateForICal(event.endTime);

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookFlow//Booking Widget//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${this.escapeICalText(event.title)}`,
      `DESCRIPTION:${this.escapeICalText(event.description)}`,
      `LOCATION:${this.escapeICalText(event.location)}`,
    ];

    // Add reminder/alarm
    if (event.reminder) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${this.escapeICalText(event.title)}`,
        `TRIGGER:-PT${event.reminder}M`,
        'END:VALARM'
      );
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');

    return lines.join('\r\n');
  }

  private generateICalDownloadUrl(event: CalendarEvent): string {
    const icalContent = this.generateICalContent(event);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  }

  private formatDateForICal(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';
  }

  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private buildDescription(booking: {
    bookingRef: string;
    activityName: string;
    venueName: string;
    partySize: number;
    customerName: string;
    venuePhone?: string;
    venueEmail?: string;
  }): string {
    const lines = [
      `Booking Reference: ${booking.bookingRef}`,
      `Activity: ${booking.activityName}`,
      `Venue: ${booking.venueName}`,
      `Party Size: ${booking.partySize} guests`,
      `Booked by: ${booking.customerName}`,
      '',
      'Questions? Contact the venue:',
    ];

    if (booking.venuePhone) {
      lines.push(`Phone: ${booking.venuePhone}`);
    }
    if (booking.venueEmail) {
      lines.push(`Email: ${booking.venueEmail}`);
    }

    return lines.join('\n');
  }

  private calculateDurationInMinutes(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Download iCal file
   */
  downloadICalFile(event: CalendarEvent, filename?: string): void {
    const content = this.generateICalContent(event);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `booking-${Date.now()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Open calendar link in new tab
   */
  openCalendarLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Export singleton
export const calendarSyncService = new CalendarSyncService();
export default calendarSyncService;
