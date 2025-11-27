/**
 * Intent Detection Service
 * Detects user intent from natural language messages
 */

import type { BookingIntent, IntentResult } from '../types';

// Intent patterns with keywords
const intentPatterns: Record<BookingIntent, RegExp[]> = {
  greeting: [
    /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)/i,
    /^(what's up|sup|yo)/i,
  ],
  book_activity: [
    /\b(book|reserve|schedule|make\s*a?\s*(booking|reservation))\b/i,
    /\b(want|like|need)\s*to\s*(book|reserve|schedule)\b/i,
    /\b(sign\s*up|register)\s*(for|me)\b/i,
  ],
  check_availability: [
    /\b(available|availability|open|free)\b/i,
    /\b(what|when|which)\s*(times?|slots?|dates?)\b/i,
    /\b(can\s*i|is\s*there)\s*(come|go|book)\b/i,
  ],
  get_pricing: [
    /\b(price|cost|how\s*much|pricing|rate|fee)\b/i,
    /\b(what|how\s*much)\s*(does|is|do)\s*(it|this)\s*(cost|charge)\b/i,
  ],
  select_date: [
    /\b(today|tomorrow|next\s*week|this\s*weekend)\b/i,
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?\b/,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{1,2}\b/i,
  ],
  select_time: [
    /\b(\d{1,2})\s*:?\s*(\d{2})?\s*(am|pm)?\b/i,
    /\b(morning|afternoon|evening|night)\b/i,
    /\b(noon|midnight)\b/i,
  ],
  select_party_size: [
    /\b(\d+)\s*(people|persons?|guests?|players?|participants?)\b/i,
    /\b(just\s*me|myself|alone|solo)\b/i,
    /\b(couple|pair|two\s*of\s*us)\b/i,
    /\bfor\s*(\d+)\b/i,
  ],
  provide_contact: [
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, // Email
    /\b(\+?1?\s*)?(\d{3})[\s\-\.]?(\d{3})[\s\-\.]?(\d{4})\b/, // Phone
    /\b(my\s*(name|email|phone|number)\s*is)\b/i,
  ],
  confirm_booking: [
    /\b(yes|yeah|yep|sure|confirm|go\s*ahead|book\s*it|looks?\s*good)\b/i,
    /\b(that'?s?\s*(right|correct|perfect))\b/i,
  ],
  cancel_request: [
    /\b(no|nope|cancel|stop|never\s*mind|start\s*over)\b/i,
    /\b(change|different|other)\b/i,
  ],
  help: [
    /\b(help|assist|support|how\s*(do|does|can))\b/i,
    /\b(what\s*can\s*you\s*do|options?|menu)\b/i,
  ],
  unknown: [],
};

// Entity extraction patterns
const entityPatterns = {
  date: /\b(today|tomorrow|\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s*week)\b/i,
  time: /\b(\d{1,2})\s*:?\s*(\d{2})?\s*(am|pm)?|morning|afternoon|evening|noon\b/i,
  partySize: /\b(\d+)\s*(people|persons?|guests?|players?)?|just\s*me|solo|couple\b/i,
  email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
  phone: /\b(\+?1?\s*)?(\d{3})[\s\-\.]?(\d{3})[\s\-\.]?(\d{4})\b/,
  name: /\b(my\s*name\s*is|i'?m)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i,
};

/**
 * Detect intent from user message
 */
export function detectIntent(message: string): IntentResult {
  const normalizedMessage = message.toLowerCase().trim();
  
  let bestMatch: { intent: BookingIntent; confidence: number } = {
    intent: 'unknown',
    confidence: 0,
  };

  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedMessage)) {
        // Calculate confidence based on match quality
        const match = normalizedMessage.match(pattern);
        const confidence = match ? (match[0].length / normalizedMessage.length) * 0.8 + 0.2 : 0;
        
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent: intent as BookingIntent, confidence };
        }
      }
    }
  }

  // Extract entities
  const entities = extractEntities(message);

  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    entities,
  };
}

/**
 * Extract entities from message
 */
export function extractEntities(message: string): Record<string, string | number> {
  const entities: Record<string, string | number> = {};

  // Extract date
  const dateMatch = message.match(entityPatterns.date);
  if (dateMatch) {
    entities.date = parseDate(dateMatch[0]);
  }

  // Extract time
  const timeMatch = message.match(entityPatterns.time);
  if (timeMatch) {
    entities.time = parseTime(timeMatch[0]);
  }

  // Extract party size
  const partySizeMatch = message.match(entityPatterns.partySize);
  if (partySizeMatch) {
    entities.partySize = parsePartySize(partySizeMatch[0]);
  }

  // Extract email
  const emailMatch = message.match(entityPatterns.email);
  if (emailMatch) {
    entities.email = emailMatch[0].toLowerCase();
  }

  // Extract phone
  const phoneMatch = message.match(entityPatterns.phone);
  if (phoneMatch) {
    entities.phone = phoneMatch[0].replace(/[\s\-\.]/g, '');
  }

  // Extract name
  const nameMatch = message.match(entityPatterns.name);
  if (nameMatch && nameMatch[2]) {
    entities.name = nameMatch[2];
  }

  return entities;
}

/**
 * Parse date string to ISO format
 */
function parseDate(dateStr: string): string {
  const lower = dateStr.toLowerCase();
  const today = new Date();
  
  if (lower === 'today') {
    return today.toISOString().split('T')[0];
  }
  
  if (lower === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (lower.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  // Day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.indexOf(lower);
  if (dayIndex >= 0) {
    const targetDay = new Date(today);
    const currentDay = targetDay.getDay();
    const diff = (dayIndex - currentDay + 7) % 7 || 7;
    targetDay.setDate(targetDay.getDate() + diff);
    return targetDay.toISOString().split('T')[0];
  }

  // Try to parse date format (MM/DD or MM/DD/YYYY)
  const dateMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10);
    const day = parseInt(dateMatch[2], 10);
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : today.getFullYear();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return dateStr;
}

/**
 * Parse time string to 24h format
 */
function parseTime(timeStr: string): string {
  const lower = timeStr.toLowerCase();
  
  if (lower === 'morning') return '10:00';
  if (lower === 'afternoon') return '14:00';
  if (lower === 'evening') return '18:00';
  if (lower === 'noon') return '12:00';

  const timeMatch = timeStr.match(/(\d{1,2})\s*:?\s*(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return timeStr;
}

/**
 * Parse party size from string
 */
function parsePartySize(sizeStr: string): number {
  const lower = sizeStr.toLowerCase();
  
  if (lower.includes('just me') || lower.includes('solo') || lower.includes('myself')) {
    return 1;
  }
  
  if (lower.includes('couple') || lower.includes('pair') || lower.includes('two of us')) {
    return 2;
  }

  const numMatch = sizeStr.match(/\d+/);
  if (numMatch) {
    return parseInt(numMatch[0], 10);
  }

  return 1;
}

export const intentDetectionService = {
  detectIntent,
  extractEntities,
};
