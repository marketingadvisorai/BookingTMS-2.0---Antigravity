
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateStaffRequest {
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    role: string;
    organization_id: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const {
            email,
            password,
            first_name,
            last_name,
            role,
            organization_id,
        }: CreateStaffRequest = await req.json();

        if (!email || !role || !organization_id) {
            throw new Error("Missing required fields");
        }

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: password || undefined, // Allow passwordless (invite) if needed, but useStaff sends password
            email_confirm: true,
            user_metadata: {
                full_name: `${first_name} ${last_name}`.trim(),
                first_name,
                last_name,
                organization_id // Store in metadata too for easy access
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        const userId = authData.user.id;

        // 2. Insert into users table (if it exists and not handled by trigger)
        // We try to insert, if it fails (e.g. table doesn't exist or trigger handled it), we catch/ignore specific errors?
        // Better: Check if user exists in 'users' first? 
        // Or just upsert.

        // Note: 'users' table schema is inferred.
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                full_name: `${first_name} ${last_name}`.trim(),
                role: role, // 'staff', 'manager', etc.
                organization_id: organization_id,
                is_active: true,
                is_platform_team: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error("Error creating user profile:", profileError);
            // If table doesn't exist, this will error. But we assume it exists based on previous findings.
            // We don't throw here to avoid rolling back the auth user creation? 
            // Actually, we should probably delete the auth user if profile creation fails.
            await supabase.auth.admin.deleteUser(userId);
            throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        // 3. Insert into organization_members
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
                organization_id: organization_id,
                user_id: userId,
                role: role
            });

        if (memberError) {
            console.error("Error creating org member:", memberError);
            // Cleanup
            await supabase.from('users').delete().eq('id', userId);
            await supabase.auth.admin.deleteUser(userId);
            throw new Error(`Failed to add to organization: ${memberError.message}`);
        }

        return new Response(
            JSON.stringify({
                user: authData.user,
                message: "Staff member created successfully"
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error) {
        console.error("Error creating staff:", error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
