/**
 * Create Staff Member Edge Function
 * Creates auth user + user profile + org member + staff profile
 * @version 2.0.0 - Dec 2025
 */

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
  password: string;
  full_name: string;
  role: string;
  organization_id: string;
  department?: string;
  job_title?: string;
  phone?: string;
  hire_date?: string;
  skills?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let createdUserId: string | null = null;

  try {
    const body: CreateStaffRequest = await req.json();
    const { email, password, full_name, role, organization_id, department, job_title, phone, hire_date, skills } = body;

    // Validation
    if (!email || !password || !full_name || !role || !organization_id) {
      throw new Error("Missing required fields: email, password, full_name, role, organization_id");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, organization_id }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user");

    createdUserId = authData.user.id;

    // 2. Call RPC to create all related records
    const { data: profileData, error: profileError } = await supabase.rpc(
      'create_staff_member_profile',
      {
        p_user_id: createdUserId,
        p_email: email,
        p_full_name: full_name,
        p_role: role,
        p_organization_id: organization_id,
        p_department: department || null,
        p_job_title: job_title || null,
        p_phone: phone || null,
        p_hire_date: hire_date || null,
        p_skills: skills || []
      }
    );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Cleanup: delete auth user
      await supabase.auth.admin.deleteUser(createdUserId);
      throw new Error(`Failed to create staff profile: ${profileError.message}`);
    }

    const result = profileData?.[0] || profileData;
    
    return new Response(
      JSON.stringify({
        success: true,
        user_id: createdUserId,
        staff_profile_id: result?.out_staff_profile_id || result?.staff_profile_id,
        organization_id: organization_id,
        message: "Staff member created successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error creating staff:", error);
    
    // Cleanup if auth user was created but subsequent steps failed
    if (createdUserId) {
      try {
        await supabase.auth.admin.deleteUser(createdUserId);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
