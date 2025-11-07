/**
 * Supabase Client Configuration
 * Connects to your Booking TMS database
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ohfjkcajnqvethmrpdwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmprY2FqbnF2ZXRobXJwZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDE2OTEsImV4cCI6MjA3Nzc3NzY5MX0.EkzMR6RP3YiVNASU3Ppq4KiJHCP8R8lY4yQxKhs_4e8';

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
