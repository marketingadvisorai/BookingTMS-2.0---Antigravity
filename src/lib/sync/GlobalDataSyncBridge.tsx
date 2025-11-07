import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import DataSyncServiceWithEvents, {
  DataSyncEvents,
  DATA_SYNC_STORAGE_KEYS,
  DEFAULT_ORGANIZATION_ID,
  Game,
  GameDifficulty,
} from '@/services/DataSyncService';
import type { Database } from '@/types/supabase';

// Fallback image for games without an image_url
const DEFAULT_GAME_IMAGE = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop';

// Map Supabase game row -> local DataSyncService game shape
function mapSupabaseGameToLocal(row: Database['public']['Tables']['games']['Row']): Game {
  const extendedRow = row as any;
  // Convert difficulty enum to numeric scale used by widgets (1–5)
  const difficultyLabelMap: Record<string, GameDifficulty> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Extreme',
  };
  const difficultyNumericMap: Record<GameDifficulty, number> = {
    Easy: 2,
    Medium: 3,
    Hard: 4,
    Extreme: 5,
  };

  const difficultyLabel = difficultyLabelMap[row.difficulty ?? ''] ?? 'Medium';
  const numericDifficulty = difficultyNumericMap[difficultyLabel];
  const durationValue = row.duration_minutes ?? 60;

  // Store both image and imageUrl for cross-component compatibility
  const imageUrl = row.image_url || DEFAULT_GAME_IMAGE;

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
    galleryImages: Array.isArray(extendedRow?.gallery_images) ? extendedRow.gallery_images : [],
    videos: Array.isArray(extendedRow?.videos) ? extendedRow.videos : [],
    categoryId: extendedRow?.category_id ?? 'default',
    organizationId: row.organization_id ?? DEFAULT_ORGANIZATION_ID,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    createdBy: extendedRow?.created_by ?? undefined,
    updatedBy: extendedRow?.updated_by ?? undefined,
    settings: {
      visibility: extendedRow?.visibility === 'private' ? 'private' : 'public',
      publishingTargets: {
        widgets: true,
        embed: true,
        calendars: true,
        previews: true,
      },
      bookingLeadTime: extendedRow?.booking_lead_time ?? 0,
      cancellationWindow: extendedRow?.cancellation_window ?? 24,
      specialInstructions: extendedRow?.special_instructions ?? undefined,
    },
  };
}

// Persist fetched games to a base key so widgets/pages can consume them
function persistGamesToLocalBase(games: Game[], orgId?: string) {
  try {
    DataSyncServiceWithEvents.replaceAllGames(games, {
      organizationId: orgId ?? games[0]?.organizationId ?? DEFAULT_ORGANIZATION_ID,
    });
    console.log(`✅ Synced ${games.length} games to shared storage and emitted update event`);
  } catch (err) {
    console.error('❌ Failed to persist games to shared storage', err);
  }
}

// Fetch all org-scoped games and persist
async function fetchAndStoreOrgGames(orgId: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('⚠️ Supabase games fetch error:', error);
    return;
  }

  const mapped = (data || []).map(mapSupabaseGameToLocal);
  persistGamesToLocalBase(mapped, orgId);
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
        key === DATA_SYNC_STORAGE_KEYS.GAMES ||
        key === 'admin_games' ||
        key === 'bookingtms_games'
      ) {
        DataSyncEvents.emit('games-updated');
      }
      if (key === DATA_SYNC_STORAGE_KEYS.BOOKINGS || key === 'bookings') {
        DataSyncEvents.emit('bookings-updated');
      }
    };
    window.addEventListener('storage', handleStorage);

    // Initial sync from Supabase (only in admin app, not embed)
    const orgId = currentUser?.organizationId;
    if (!embedMode && orgId) {
      fetchAndStoreOrgGames(orgId);
    }

    // Realtime subscription: keep shared games storage in sync (only in admin app)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (!embedMode && orgId) {
      channel = supabase
        .channel(`games-org-${orgId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'games',
            filter: `organization_id=eq.${orgId}`,
          },
          async () => {
            console.log('🔔 Supabase games change detected — refreshing local cache');
            await fetchAndStoreOrgGames(orgId);
          }
        )
        .subscribe((status) => {
          console.log('📡 Supabase games channel status:', status);
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
