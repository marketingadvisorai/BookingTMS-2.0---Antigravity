/**
 * Mock Data Service
 * 
 * Provides sample data for testing the booking widget without database.
 * Replace with real Supabase queries when database is ready.
 * 
 * @module lib/mock
 */

import type { Game } from '@/components/booking/types';

// =============================================================================
// MOCK ORGANIZATION DATA
// =============================================================================

export const MOCK_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
export const MOCK_VENUE_ID = '123e4567-e89b-12d3-a456-426614174001';

// =============================================================================
// MOCK GAMES (ESCAPE ROOMS)
// =============================================================================

export const MOCK_GAMES: Game[] = [
  {
    id: 'game-001',
    organization_id: MOCK_ORG_ID,
    name: 'The Haunted Manor',
    description: 'A spine-chilling adventure through a Victorian mansion. Can you solve the mystery before time runs out?',
    difficulty: 'hard',
    duration_minutes: 60,
    min_players: 2,
    max_players: 6,
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1509838680192-7978f2c2f79c?w=800',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-002',
    organization_id: MOCK_ORG_ID,
    name: 'Lost Temple',
    description: 'Explore an ancient temple filled with puzzles and traps. Find the treasure before the temple collapses!',
    difficulty: 'medium',
    duration_minutes: 60,
    min_players: 3,
    max_players: 8,
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-003',
    organization_id: MOCK_ORG_ID,
    name: 'Cyber Heist',
    description: 'A high-tech adventure! Hack into the mainframe and escape before security catches you. Perfect for tech enthusiasts.',
    difficulty: 'expert',
    duration_minutes: 90,
    min_players: 4,
    max_players: 8,
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-004',
    organization_id: MOCK_ORG_ID,
    name: 'Pirate\'s Cove',
    description: 'Ahoy matey! Find the buried treasure on a pirate ship. Fun for families and kids!',
    difficulty: 'easy',
    duration_minutes: 45,
    min_players: 2,
    max_players: 6,
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-005',
    organization_id: MOCK_ORG_ID,
    name: 'Detective\'s Office',
    description: 'Step into a 1940s detective office and solve a murder mystery. Use your deduction skills to crack the case!',
    difficulty: 'medium',
    duration_minutes: 75,
    min_players: 3,
    max_players: 7,
    price: 32,
    image_url: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?w=800',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-006',
    organization_id: MOCK_ORG_ID,
    name: 'Space Station Escape',
    description: 'Your spaceship is malfunctioning! Repair the systems and escape before oxygen runs out. A sci-fi thriller!',
    difficulty: 'hard',
    duration_minutes: 60,
    min_players: 4,
    max_players: 8,
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// =============================================================================
// MOCK TIME SLOTS
// =============================================================================

/**
 * Generate mock available time slots for a date
 */
export function generateMockTimeSlots(date: Date): Array<{
  time: string;
  endTime: string;
  availableSpots: number;
  totalCapacity: number;
  isAvailable: boolean;
  price: number;
}> {
  const slots: Array<{
    time: string;
    endTime: string;
    availableSpots: number;
    totalCapacity: number;
    isAvailable: boolean;
    price: number;
  }> = [];
  const startHour = 10; // 10 AM
  const endHour = 22; // 10 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
    
    // Random availability for demo
    const random = Math.random();
    const availableSpots = random > 0.7 ? 0 : random > 0.4 ? 2 : 8;
    
    slots.push({
      time,
      endTime,
      availableSpots,
      totalCapacity: 8,
      isAvailable: availableSpots > 0,
      price: 30 + Math.floor(random * 20), // $30-50
    });
  }
  
  return slots;
}

// =============================================================================
// MOCK BOOKING CREATION
// =============================================================================

/**
 * Simulate creating a booking
 */
export async function createMockBooking(bookingData: {
  gameId: string;
  date: Date;
  time: string;
  players: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate 90% success rate
  if (Math.random() < 0.9) {
    return {
      id: `booking_${Date.now()}`,
      confirmationCode: generateConfirmationCode(),
      status: 'confirmed',
      ...bookingData,
    };
  } else {
    throw new Error('Booking failed. Please try again.');
  }
}

/**
 * Generate confirmation code
 */
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// =============================================================================
// MOCK PAYMENT PROCESSING
// =============================================================================

/**
 * Simulate Stripe payment
 */
export async function processMockPayment(amount: number, paymentMethod: string) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 95% success rate
  if (Math.random() < 0.95) {
    return {
      success: true,
      transactionId: `pi_${Date.now()}_mock`,
      amount,
      currency: 'usd',
    };
  } else {
    throw new Error('Payment declined. Please try a different card.');
  }
}
