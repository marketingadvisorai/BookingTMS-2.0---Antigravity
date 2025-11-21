/**
 * Supabase Client Configuration
 * Connects to your Booking TMS database
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qftjyjpitnoapqxlrvfs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGp5anBpdG5vYXBxeGxydmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzIyOTAsImV4cCI6MjA3OTE0ODI5MH0.nO1YARU8309UaV5U1I-fxGeMYJg7CzWXOn2KQvqao7Y';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (will be auto-generated later)
export interface Database {
  public: {
    Tables: {
      venues: any;
      games: any;
      bookings: any;
      customers: any;
      payments: any;
      widgets: any;
      staff: any;
      waivers: any;
      user_profiles: any;
      organizations: any;
      system_settings: any;
      audit_logs: any;
      notifications: any;
    };
  };
}
