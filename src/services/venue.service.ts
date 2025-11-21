import { supabase } from '../lib/supabase';

export interface Venue {
    id: string;
    organization_id: string;
    name: string;
    address?: string;
    timezone: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateVenuePayload {
    organization_id: string;
    name: string;
    address?: string;
    timezone?: string;
    is_default?: boolean;
}

export class VenueService {
    /**
     * Create a new venue
     */
    static async createVenue(payload: CreateVenuePayload): Promise<Venue> {
        const { data, error } = await supabase
            .from('venues')
            .insert([{
                ...payload,
                timezone: payload.timezone || 'UTC'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update a venue
     */
    static async updateVenue(venueId: string, updates: Partial<Venue>): Promise<Venue> {
        const { data, error } = await supabase
            .from('venues')
            .update(updates)
            .eq('id', venueId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * List venues for an organization
     */
    static async listVenues(orgId: string): Promise<Venue[]> {
        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('organization_id', orgId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Delete a venue
     */
    static async deleteVenue(venueId: string): Promise<void> {
        const { error } = await supabase
            .from('venues')
            .delete()
            .eq('id', venueId);

        if (error) throw error;
    }
}
