/**
 * Database Types - Auto-generated from Supabase
 * Generated: 2025-12-01
 * Project: qftjyjpitnoapqxlrvfs
 * 
 * Includes:
 * - activity_sessions.version (optimistic locking)
 * - slot_reservations table
 * - RLS helper functions (get_my_organization_id, is_platform_admin, etc.)
 * - Reservation management functions (create_slot_reservation, etc.)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_sessions: {
        Row: {
          activity_id: string
          capacity_remaining: number
          capacity_total: number
          created_at: string | null
          end_time: string
          id: string
          is_closed: boolean | null
          organization_id: string
          price_at_generation: number | null
          start_time: string
          updated_at: string | null
          venue_id: string
          version: number | null // MVP Task 1.1: Optimistic locking
        }
        Insert: {
          activity_id: string
          capacity_remaining: number
          capacity_total: number
          created_at?: string | null
          end_time: string
          id?: string
          is_closed?: boolean | null
          organization_id: string
          price_at_generation?: number | null
          start_time: string
          updated_at?: string | null
          venue_id: string
          version?: number | null
        }
        Update: {
          activity_id?: string
          capacity_remaining?: number
          capacity_total?: number
          created_at?: string | null
          end_time?: string
          id?: string
          is_closed?: boolean | null
          organization_id?: string
          price_at_generation?: number | null
          start_time?: string
          updated_at?: string | null
          venue_id?: string
          version?: number | null
        }
      }
      slot_reservations: {
        Row: {
          id: string
          session_id: string
          organization_id: string | null
          customer_email: string | null
          spots_reserved: number
          checkout_session_id: string | null
          session_version_at_reserve: number | null
          status: string
          expires_at: string
          created_at: string | null
          converted_at: string | null
          booking_id: string | null
        }
        Insert: {
          id?: string
          session_id: string
          organization_id?: string | null
          customer_email?: string | null
          spots_reserved: number
          checkout_session_id?: string | null
          session_version_at_reserve?: number | null
          status?: string
          expires_at: string
          created_at?: string | null
          converted_at?: string | null
          booking_id?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          organization_id?: string | null
          customer_email?: string | null
          spots_reserved?: number
          checkout_session_id?: string | null
          session_version_at_reserve?: number | null
          status?: string
          expires_at?: string
          created_at?: string | null
          converted_at?: string | null
          booking_id?: string | null
        }
      }
      // Other tables omitted for brevity - see full generated types
    }
    Functions: {
      // MVP Task 1.1: Optimistic Locking Functions
      reserve_session_capacity: {
        Args: {
          p_session_id: string
          p_spots: number
          p_expected_version: number
        }
        Returns: {
          success: boolean
          new_version: number
          remaining: number
          error_code: string | null
        }[]
      }
      release_session_capacity: {
        Args: {
          p_session_id: string
          p_spots: number
        }
        Returns: {
          success: boolean
          new_version: number
          remaining: number
        }[]
      }
      // MVP Task 1.4: Slot Reservation Functions
      create_slot_reservation: {
        Args: {
          p_session_id: string
          p_organization_id: string
          p_spots: number
          p_customer_email?: string | null
          p_checkout_session_id?: string | null
          p_ttl_minutes?: number
        }
        Returns: {
          reservation_id: string | null
          success: boolean
          error_code: string | null
          session_version: number
        }[]
      }
      convert_reservation_to_booking: {
        Args: {
          p_reservation_id: string
          p_booking_id: string
        }
        Returns: boolean
      }
      cancel_slot_reservation: {
        Args: {
          p_reservation_id: string
        }
        Returns: boolean
      }
      cleanup_expired_reservations: {
        Args: Record<string, never>
        Returns: {
          cleaned_count: number
          capacity_released: number
        }[]
      }
      // MVP Task 1.3: RLS Helper Functions
      get_my_organization_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      is_platform_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      can_access_organization: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      get_my_role: {
        Args: Record<string, never>
        Returns: string | null
      }
      has_permission: {
        Args: {
          p_permission: string
        }
        Returns: boolean
      }
    }
  }
}

// Helper types for RPC results
export type ReserveCapacityResult = Database['public']['Functions']['reserve_session_capacity']['Returns'][0]
export type ReleaseCapacityResult = Database['public']['Functions']['release_session_capacity']['Returns'][0]
export type CreateReservationResult = Database['public']['Functions']['create_slot_reservation']['Returns'][0]
export type CleanupReservationsResult = Database['public']['Functions']['cleanup_expired_reservations']['Returns'][0]
