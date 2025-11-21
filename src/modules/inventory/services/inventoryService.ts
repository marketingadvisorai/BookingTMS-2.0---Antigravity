import { ActivityService, Activity, CreateActivityInput } from '../../../services/activity.service';
import { Game, CreateGameDTO, UpdateGameDTO, InventoryStats, DifficultyLevel } from '../types';

// Helper to map Activity (DB) to Game (UI)
const mapToGame = (item: Activity): Game => {
    return {
        id: item.id,
        organization_id: item.organization_id || '',
        venue_id: item.venue_id,
        name: item.name,
        description: item.description,
        difficulty: (item.difficulty?.toLowerCase() as DifficultyLevel) || 'medium',
        duration_minutes: item.duration,
        min_players: 1, // Default as Activity uses unified capacity
        max_players: item.capacity,
        price: item.price,
        image_url: item.image_url,
        is_active: item.status === 'active',
        created_at: item.created_at,
        updated_at: item.updated_at
    };
};

// Helper to map CreateGameDTO (UI) to Activity Input (DB)
const mapToActivityInput = (dto: CreateGameDTO): CreateActivityInput => {
    const difficulty = (dto.difficulty.charAt(0).toUpperCase() + dto.difficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard' | 'Expert';

    return {
        organization_id: dto.organization_id,
        venue_id: dto.venue_id,
        name: dto.name,
        description: dto.description || '',
        difficulty,
        duration: dto.duration_minutes,
        capacity: dto.max_players,
        price: dto.price,
        image_url: dto.image_url,
        status: dto.is_active ? 'active' : 'inactive',
        settings: {},
        schedule: {
            operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            startTime: '10:00',
            endTime: '22:00',
            slotInterval: 60,
            advanceBooking: 30,
            customHoursEnabled: false,
            customHours: {},
            customDates: [],
            blockedDates: []
        }
    };
};

export const inventoryService = {
    /**
     * Fetch all games for an organization (or venue)
     */
    async getGames(organizationId: string, venueId?: string): Promise<Game[]> {
        // If venueId is not provided, we might need to fetch for all venues.
        // ActivityService.listActivities requires venueId.
        // If venueId is missing, we should try to find a venue for the org.

        let targetVenueId = venueId;
        if (!targetVenueId) {
            const { data: venues } = await import('../../../lib/supabase')
                .then(m => m.supabase
                    .from('venues')
                    .select('id')
                    .eq('organization_id', organizationId)
                    .limit(1)
                );
            if (venues && venues.length > 0) {
                targetVenueId = venues[0].id;
            }
        }

        if (!targetVenueId) return []; // No venue found

        const items = await ActivityService.listActivities(targetVenueId);
        return items.map(mapToGame);
    },

    /**
     * Create a new game
     */
    async createGame(gameData: CreateGameDTO): Promise<Game> {
        if (!gameData.venue_id) {
            const { data: venues } = await import('../../../lib/supabase')
                .then(m => m.supabase
                    .from('venues')
                    .select('id')
                    .limit(1)
                );

            if (venues && venues.length > 0) {
                gameData.venue_id = venues[0].id;
            } else {
                console.warn('No venue found for organization. Game creation might fail.');
            }
        }

        const input = mapToActivityInput(gameData);
        const created = await ActivityService.createActivity(input);
        return mapToGame(created);
    },

    /**
     * Update a game
     */
    async updateGame(id: string, updates: Partial<CreateGameDTO>): Promise<Game> {
        const activityUpdates: Partial<CreateActivityInput> = {};

        if (updates.name) activityUpdates.name = updates.name;
        if (updates.description) activityUpdates.description = updates.description;
        if (updates.difficulty) activityUpdates.difficulty = (updates.difficulty.charAt(0).toUpperCase() + updates.difficulty.slice(1)) as any;
        if (updates.duration_minutes) activityUpdates.duration = updates.duration_minutes;
        if (updates.max_players) activityUpdates.capacity = updates.max_players;
        if (updates.price) activityUpdates.price = updates.price;
        if (updates.image_url) activityUpdates.image_url = updates.image_url;
        if (updates.is_active !== undefined) activityUpdates.status = updates.is_active ? 'active' : 'inactive';

        const updated = await ActivityService.updateActivity(id, activityUpdates);
        return mapToGame(updated);
    },

    /**
     * Delete a game
     */
    async deleteGame(id: string): Promise<void> {
        await ActivityService.deleteActivity(id);
    },

    /**
     * Calculate inventory statistics
     */
    async getStats(organizationId: string, venueId?: string): Promise<InventoryStats> {
        const games = await this.getGames(organizationId, venueId);

        const totalGames = games.length;
        const activeGames = games.filter(g => g.is_active).length;
        const totalCapacity = games.reduce((sum, g) => sum + (g.max_players || 0), 0);
        const avgPrice = totalGames > 0
            ? Math.round(games.reduce((sum, g) => sum + (g.price || 0), 0) / totalGames)
            : 0;

        return {
            totalGames,
            activeGames,
            totalCapacity,
            avgPrice
        };
    }
};
