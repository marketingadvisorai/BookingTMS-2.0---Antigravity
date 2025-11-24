import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import DataSyncServiceWithEvents, {
  DataSyncEvents,
  DATA_SYNC_STORAGE_KEYS,
  DEFAULT_ORGANIZATION_ID,
  Activity,
  ActivityDifficulty,
} from '@/services/DataSyncService';
import type { Database } from '@/types/supabase';

// Fallback image for activities without an image_url
const DEFAULT_ACTIVITY_IMAGE = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop';

// Map Supabase activity row -> local DataSyncService activity shape
function mapSupabaseActivityToLocal(row: Database['public']['Tables']['activities']['Row']): Activity {
  const extendedRow = row as any;
  // Convert difficulty enum to numeric scale used by widgets (1–5)
  const difficultyLabelMap: Record<string, ActivityDifficulty> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Extreme',
  };
  const difficultyNumericMap: Record<ActivityDifficulty, number> = {
    Easy: 2,
    Medium: 3,
    Hard: 4,
    Extreme: 5,
  };

  const difficultyLabel = difficultyLabelMap[(row.difficulty || '').toLowerCase()] ?? 'Medium';
  const numericDifficulty = difficultyNumericMap[difficultyLabel];
  const durationValue = row.duration ?? 60;

  // Store both image and imageUrl for cross-component compatibility
  const imageUrl = row.image_url || DEFAULT_ACTIVITY_IMAGE;

  return {
    id: String(row.id),
    name: row.name,
    description: row.description || '',
    image: imageUrl,
    imageUrl,
    coverImage: imageUrl,
    duration: durationValue,
    capacity: row.max_players ?? 8,
    basePrice: row.price ?? 0,
    priceRange: `$${row.price ?? 0}`,
    ageRange: 'All ages',
    difficulty: numericDifficulty,
    difficultyLabel,
    status: row.is_active ? 'active' : 'inactive',
    blockedDates: [],
    availability: {},
    galleryImages: [], // extendedRow?.gallery_images ?? [],
    videos: [], // extendedRow?.videos ?? [],
    categoryId: 'default', // extendedRow?.category_id ?? 'default',
    organizationId: row.organization_id ?? DEFAULT_ORGANIZATION_ID,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    createdBy: row.created_by ?? undefined,
    updatedBy: undefined, // extendedRow?.updated_by ?? undefined,
    settings: (row.settings as any) || {
      visibility: 'public',
      publishingTargets: {
        widgets: true,
        embed: true,
        calendars: true,
        previews: true,
      },
      bookingLeadTime: 0,
      cancellationWindow: 24,
      specialInstructions: undefined,
    },
    schedule: row.schedule as any,
  } as Activity;
}

// Persist fetched activities to a base key so widgets/pages can consume them
function persistActivitiesToLocalBase(activities: Activity[], orgId?: string) {
  try {
    DataSyncServiceWithEvents.replaceAllActivities(activities, {
      organizationId: orgId ?? activities[0]?.organizationId ?? DEFAULT_ORGANIZATION_ID,
    });
    console.log(`✅ Synced ${activities.length} activities to shared storage and emitted update event`);
  } catch (err) {
    console.error('❌ Failed to persist activities to shared storage', err);
  }
}

// Fetch all org-scoped activities and persist
async function fetchAndStoreOrgActivities(orgId: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('⚠️ Supabase activities fetch error:', error);
    return;
  }

  const mapped = (data || []).map(mapSupabaseActivityToLocal);
  persistActivitiesToLocalBase(mapped, orgId);
}

interface Props {
  embedMode?: boolean;
}

// Global bridge: mirrors Supabase changes into local storage and re-emits events
export default function GlobalDataSyncBridge({ embedMode = false }: Props) {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Cross-tab/localStorage sync: re-emit events when relevant keys change
    const handleStorage = (e: StorageEvent) => {
      const key = e.key || '';
      if (
        key === DATA_SYNC_STORAGE_KEYS.ACTIVITIES ||
        key === DATA_SYNC_STORAGE_KEYS.GAMES ||
        key === 'admin_games' ||
        key === 'bookingtms_games'
      ) {
        DataSyncEvents.emit('activities-updated');
      }
      if (key === DATA_SYNC_STORAGE_KEYS.BOOKINGS || key === 'bookings') {
        DataSyncEvents.emit('bookings-updated');
      }
    };
    window.addEventListener('storage', handleStorage);

    // Initial sync from Supabase (only in admin app, not embed)
    const orgId = currentUser?.organizationId;
    if (!embedMode && orgId) {
      fetchAndStoreOrgActivities(orgId);
    }

    // Realtime subscription: keep shared activities storage in sync (only in admin app)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (!embedMode && orgId) {
      channel = supabase
        .channel(`activities-org-${orgId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `organization_id=eq.${orgId}`,
          },
          async () => {
            console.log('🔔 Supabase activities change detected — refreshing local cache');
            await fetchAndStoreOrgActivities(orgId);
          }
        )
        .subscribe((status) => {
          console.log('📡 Supabase activities channel status:', status);
        });
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.warn('⚠️ Failed to remove Supabase channel', err);
        }
      }
    };
    // We only depend on embedMode and organization context
  }, [embedMode, currentUser?.organizationId]);

  return null;
}
