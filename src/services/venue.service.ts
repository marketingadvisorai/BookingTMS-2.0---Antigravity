import { supabase } from '../lib/supabase';

export interface Venue {
    id: string;
    organization_id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
    email?: string;
    capacity?: number;
    timezone: string;
    status: 'active' | 'inactive' | 'maintenance';
    images: string[];
    operating_hours: Record<string, { open: string; close: string; closed: boolean }>;
    description?: string;
    amenities: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateVenueDTO {
    organization_id: string;
    name: string;
    address?: string;
    timezone: string;
    capacity?: number;
    images?: string[];
    operating_hours?: Record<string, { open: string; close: string; closed: boolean }>;
}

export interface UpdateVenueDTO extends Partial<CreateVenueDTO> {
    id: string;
    status?: 'active' | 'inactive' | 'maintenance';
}

export class VenueService {

    /**
     * List all venues for an organization
     */
    static async listVenues(organizationId: string): Promise<Venue[]> {
        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('organization_id', organizationId)
            .order('name');

        if (error) throw error;
        return data as Venue[];
    }

    /**
     * Get a single venue by ID
     */
    static async getVenue(id: string): Promise<Venue | null> {
        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Venue;
    }

    /**
     * Create a new venue
     */
    static async createVenue(venue: CreateVenueDTO): Promise<Venue> {
        const { data, error } = await supabase
            .from('venues')
            .insert({
                ...venue,
                status: 'active',
                images: venue.images || [],
                operating_hours: venue.operating_hours || this.getDefaultOperatingHours()
            })
            .select()
            .single();

        if (error) throw error;
        return data as Venue;
    }

    /**
     * Update an existing venue
     */
    static async updateVenue(venue: UpdateVenueDTO): Promise<Venue> {
        const { id, ...updates } = venue;
        const { data, error } = await supabase
            .from('venues')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Venue;
    }

    /**
     * Delete a venue (soft delete if supported, or hard delete)
     * Currently hard delete for simplicity, but check if is_deleted exists
     */
    static async deleteVenue(id: string): Promise<void> {
        const { error } = await supabase
            .from('venues')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Upload a venue image to Supabase Storage
     */
    static async uploadImage(file: File, organizationId: string): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${organizationId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('venue-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('venue-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    private static getDefaultOperatingHours() {
        return {
            monday: { open: "09:00", close: "17:00", closed: false },
            tuesday: { open: "09:00", close: "17:00", closed: false },
            wednesday: { open: "09:00", "close": "17:00", closed: false },
            thursday: { open: "09:00", "close": "17:00", closed: false },
            friday: { open: "09:00", "close": "17:00", closed: false },
            saturday: { open: "10:00", "close": "20:00", closed: false },
            sunday: { open: "10:00", "close": "20:00", closed: false }
        };
    }
}
