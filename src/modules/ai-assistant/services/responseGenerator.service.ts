/**
 * Response Generator Service
 * Generates contextual responses for the booking assistant
 */

import type {
  BookingSlots,
  BookingStep,
  ResponseContext,
  QuickReply,
  ActivityOption,
  TimeSlotOption,
} from '../types';

// Response templates
const responses = {
  greeting: [
    "Hi there! 👋 I'm your booking assistant. I can help you book an activity. What would you like to do?",
    "Hello! 🎉 Welcome! I'm here to help you make a reservation. Shall we get started?",
    "Hey! 👋 Ready to book an amazing experience? Let me help you find the perfect time!",
  ],
  
  selectActivity: (activities: ActivityOption[]) => {
    if (activities.length === 0) {
      return "I'm sorry, there are no activities available at the moment. Please check back later!";
    }
    if (activities.length === 1) {
      return `Great choice! We have "${activities[0].name}" available. It's ${activities[0].duration} minutes and costs $${activities[0].price}. Would you like to book this?`;
    }
    return `We have ${activities.length} awesome activities available! Which one interests you?`;
  },
  
  selectDate: (slots: BookingSlots) => {
    const activityName = slots.activityName || 'this activity';
    return `Excellent choice! 📅 When would you like to book ${activityName}? You can say something like "tomorrow", "Saturday", or a specific date.`;
  },
  
  selectTime: (slots: BookingSlots, timeSlots: TimeSlotOption[]) => {
    const date = formatDateNice(slots.date || '');
    if (timeSlots.length === 0) {
      return `I'm sorry, there are no available time slots for ${date}. Would you like to try a different date?`;
    }
    const availableCount = timeSlots.filter(t => t.available).length;
    return `Perfect! For ${date}, we have ${availableCount} time slots available. What time works best for you?`;
  },
  
  selectPartySize: (slots: BookingSlots) => {
    return `Great! ⏰ ${formatTime(slots.time || '')} is confirmed. How many people will be joining? (Our activity accommodates 1-10 guests)`;
  },
  
  collectContact: (slots: BookingSlots) => {
    return `Awesome! 👥 ${slots.partySize} ${slots.partySize === 1 ? 'person' : 'people'} - got it! Now I just need your contact info. What's your name and email address?`;
  },
  
  confirmBooking: (slots: BookingSlots) => {
    return `Perfect! Let me confirm your booking:\n\n` +
      `📍 **${slots.activityName}**\n` +
      `📅 ${formatDateNice(slots.date || '')}\n` +
      `⏰ ${formatTime(slots.time || '')}\n` +
      `👥 ${slots.partySize} ${slots.partySize === 1 ? 'guest' : 'guests'}\n` +
      `✉️ ${slots.customerEmail}\n\n` +
      `Does everything look correct?`;
  },
  
  bookingComplete: (reference: string) => {
    return `🎉 **Booking Confirmed!**\n\n` +
      `Your booking reference is: **${reference}**\n\n` +
      `You'll receive a confirmation email shortly. We can't wait to see you! Is there anything else I can help you with?`;
  },
  
  help: () => {
    return `I can help you with:\n\n` +
      `📅 **Book an activity** - Make a new reservation\n` +
      `🔍 **Check availability** - See what times are open\n` +
      `💰 **Get pricing** - Find out costs\n\n` +
      `Just tell me what you'd like to do!`;
  },
  
  error: () => {
    return "I'm sorry, I didn't quite understand that. Could you try rephrasing? Or type 'help' to see what I can do.";
  },
  
  cancel: () => {
    return "No problem! I've cleared your current booking. Would you like to start over or is there something else I can help you with?";
  },
};

/**
 * Generate response based on current context
 */
export function generateResponse(
  context: ResponseContext,
  userMessage?: string
): { message: string; suggestions: QuickReply[] } {
  const { slots, currentStep, availableActivities, availableTimeSlots } = context;
  
  let message = '';
  let suggestions: QuickReply[] = [];

  switch (currentStep) {
    case 'greeting':
      message = getRandomResponse(responses.greeting);
      suggestions = [
        { id: '1', label: '📅 Book Now', value: 'I want to book an activity', intent: 'book_activity' },
        { id: '2', label: '🔍 Check Availability', value: 'What times are available?', intent: 'check_availability' },
        { id: '3', label: '💰 View Prices', value: 'How much does it cost?', intent: 'get_pricing' },
      ];
      break;

    case 'select_activity':
      message = responses.selectActivity(availableActivities || []);
      suggestions = (availableActivities || []).slice(0, 3).map((a, i) => ({
        id: String(i + 1),
        label: a.name,
        value: `I want to book ${a.name}`,
        intent: 'book_activity' as const,
      }));
      break;

    case 'select_date':
      message = responses.selectDate(slots);
      suggestions = [
        { id: '1', label: 'Today', value: 'today', intent: 'select_date' },
        { id: '2', label: 'Tomorrow', value: 'tomorrow', intent: 'select_date' },
        { id: '3', label: 'This Weekend', value: 'this saturday', intent: 'select_date' },
      ];
      break;

    case 'select_time':
      message = responses.selectTime(slots, availableTimeSlots || []);
      const availableTimes = (availableTimeSlots || []).filter(t => t.available).slice(0, 4);
      suggestions = availableTimes.map((t, i) => ({
        id: String(i + 1),
        label: formatTime(t.time),
        value: t.time,
        intent: 'select_time' as const,
      }));
      break;

    case 'select_party_size':
      message = responses.selectPartySize(slots);
      suggestions = [
        { id: '1', label: '1 person', value: '1 person', intent: 'select_party_size' },
        { id: '2', label: '2 people', value: '2 people', intent: 'select_party_size' },
        { id: '3', label: '4 people', value: '4 people', intent: 'select_party_size' },
        { id: '4', label: '6+ people', value: '6 people', intent: 'select_party_size' },
      ];
      break;

    case 'collect_contact':
      message = responses.collectContact(slots);
      suggestions = [];
      break;

    case 'confirm':
      message = responses.confirmBooking(slots);
      suggestions = [
        { id: '1', label: '✅ Confirm Booking', value: 'Yes, book it!', intent: 'confirm_booking' },
        { id: '2', label: '✏️ Make Changes', value: 'I want to change something', intent: 'cancel_request' },
      ];
      break;

    case 'complete':
      message = responses.bookingComplete('BK-' + generateReference());
      suggestions = [
        { id: '1', label: '📅 Book Another', value: 'I want to book another activity', intent: 'book_activity' },
        { id: '2', label: '👋 Done', value: 'That\'s all, thanks!', intent: 'greeting' },
      ];
      break;

    default:
      message = responses.error();
      suggestions = [
        { id: '1', label: '❓ Help', value: 'help', intent: 'help' },
        { id: '2', label: '🔄 Start Over', value: 'start over', intent: 'cancel_request' },
      ];
  }

  return { message, suggestions };
}

/**
 * Get next step based on current slots
 */
export function getNextStep(slots: BookingSlots, currentStep: BookingStep): BookingStep {
  if (!slots.activityId) return 'select_activity';
  if (!slots.date) return 'select_date';
  if (!slots.time) return 'select_time';
  if (!slots.partySize) return 'select_party_size';
  if (!slots.customerEmail) return 'collect_contact';
  if (currentStep !== 'complete') return 'confirm';
  return 'complete';
}

// Helper functions
function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function formatDateNice(dateStr: string): string {
  if (!dateStr) return 'the selected date';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return 'the selected time';
  try {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function generateReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref + '-' + Date.now().toString(36).toUpperCase().slice(-4);
}

export const responseGeneratorService = {
  generateResponse,
  getNextStep,
};
