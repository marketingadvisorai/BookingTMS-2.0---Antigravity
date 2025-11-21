
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch all active activities
        const { data: activities, error: activityError } = await supabase
            .from("activities")
            .select("id, venue_id, organization_id, schedule, max_players, price")
            .eq("is_active", true);

        if (activityError) throw activityError;

        const results = [];

        // 2. Generate sessions for each activity for the next 30 days
        for (const activity of activities) {
            const schedule = activity.schedule || {};
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days

            let currentDate = new Date(startDate);
            let sessionsCreated = 0;

            while (currentDate <= endDate) {
                const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                const daySchedule = schedule[dayName];

                if (daySchedule && daySchedule.isOpen) {
                    const openTime = daySchedule.open;
                    const closeTime = daySchedule.close;

                    // Parse times (HH:mm)
                    const [openHour, openMinute] = openTime.split(":").map(Number);
                    const [closeHour, closeMinute] = closeTime.split(":").map(Number);

                    let sessionStart = new Date(currentDate);
                    sessionStart.setHours(openHour, openMinute, 0, 0);

                    let sessionEnd = new Date(currentDate);
                    sessionEnd.setHours(closeHour, closeMinute, 0, 0);

                    // Generate hourly slots
                    while (sessionStart < sessionEnd) {
                        const slotEnd = new Date(sessionStart);
                        slotEnd.setHours(slotEnd.getHours() + 1);

                        if (slotEnd > sessionEnd) break;

                        // Check if session already exists
                        const { data: existing } = await supabase
                            .from("activity_sessions")
                            .select("id")
                            .eq("activity_id", activity.id)
                            .eq("start_time", sessionStart.toISOString())
                            .single();

                        if (!existing) {
                            await supabase.from("activity_sessions").insert({
                                activity_id: activity.id,
                                venue_id: activity.venue_id,
                                organization_id: activity.organization_id,
                                start_time: sessionStart.toISOString(),
                                end_time: slotEnd.toISOString(),
                                capacity_total: activity.max_players,
                                capacity_remaining: activity.max_players,
                                price_at_generation: activity.price,
                                is_closed: false,
                            });
                            sessionsCreated++;
                        }

                        sessionStart = slotEnd;
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            results.push({ activity: activity.id, sessionsCreated });
        }

        return new Response(
            JSON.stringify({ success: true, results }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error generating sessions:", error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
