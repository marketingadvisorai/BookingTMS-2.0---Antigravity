import { supabase } from '../lib/supabase';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateOrganizationPayload {
    name: string;
    slug?: string;
    logo_url?: string;
}

export class OrganizationService {
    /**
     * Create a new organization and automatically create a default venue.
     */
    static async createOrganization(payload: CreateOrganizationPayload, userId: string): Promise<Organization> {
        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([{
                name: payload.name,
                slug: payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                logo_url: payload.logo_url,
                is_active: true
            }])
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Add User as Owner
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert([{
                organization_id: org.id,
                user_id: userId,
                role: 'owner'
            }]);

        if (memberError) {
            // Rollback org creation if member addition fails (manual compensation)
            await supabase.from('organizations').delete().eq('id', org.id);
            throw memberError;
        }

        // 3. Create Default Venue
        const { error: venueError } = await supabase
            .from('venues')
            .insert([{
                organization_id: org.id,
                name: `${org.name} - Main Venue`,
                is_default: true,
                timezone: 'UTC' // Default to UTC, user can update later
            }]);

        if (venueError) {
            console.error('Failed to create default venue:', venueError);
            // We don't rollback the org here, but we should alert
        }

        return org;
    }

    /**
     * Get organization by ID
     */
    static async getOrganization(orgId: string): Promise<Organization | null> {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * List organizations for the current user
     */
    static async listOrganizationsByUser(userId: string): Promise<Organization[]> {
        const { data, error } = await supabase
            .from('organizations')
            .select('*, organization_members!inner(user_id)')
            .eq('organization_members.user_id', userId);

        if (error) throw error;
        return data;
    }
}
