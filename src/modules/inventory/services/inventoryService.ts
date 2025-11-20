import { ServiceItemManager, ServiceItem } from '../../../services/ServiceItemManager';
import { Game, CreateGameDTO, UpdateGameDTO, InventoryStats, DifficultyLevel } from '../types';

// Helper to map ServiceItem (DB) to Game (UI)
const mapToGame = (item: ServiceItem): Game => {
    return {
        id: item.id,
        organization_id: item.organization_id || '',
        venue_id: item.venue_id,
        name: item.name,
        description: item.description,
        difficulty: (item.difficulty?.toLowerCase() as DifficultyLevel) || 'medium',
        duration_minutes: item.duration,
        min_players: item.min_players,
        max_players: item.max_players,
        price: item.price,
        image_url: item.image_url,
        is_active: item.status === 'active',
        created_at: item.created_at,
        updated_at: item.updated_at
    };
};

// Helper to map CreateGameDTO (UI) to ServiceItem (DB) partial
const mapToServiceItemInput = (dto: CreateGameDTO): Omit<ServiceItem, 'id' | 'created_at' | 'updated_at' | 'created_by'> => {
    // Capitalize difficulty for DB consistency if needed, or keep as is if DB supports lowercase
    // ServiceItem definition says 'Easy' | 'Medium'... so we should capitalize
    const difficulty = (dto.difficulty.charAt(0).toUpperCase() + dto.difficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard' | 'Expert';

    return {
        organization_id: dto.organization_id,
        venue_id: dto.venue_id,
        name: dto.name,
        description: dto.description || '',
        difficulty,
        duration: dto.duration_minutes,
        min_players: dto.min_players,
        max_players: dto.max_players,
        price: dto.price,
        image_url: dto.image_url,
        status: dto.is_active ? 'active' : 'inactive',
        settings: {}, // Default empty settings
        // Default schedule (will be overwritten if provided in DTO, but DTO doesn't seem to have it yet)
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
     * Note: ServiceItemManager.getServiceItems takes venueId. 
     * We might need to fetch by organization if venueId is not provided, 
     * but ServiceItemManager currently optimizes for venue.
     * For now, we'll assume we can get a venueId or we might need to extend ServiceItemManager.
     * 
     * UPDATE: ServiceItemManager.getServiceItems(venueId)
     * If we want all games for an org, we might need to fetch for all venues or add an org-level query.
     * For this implementation, let's assume we filter by organization_id after fetching if venueId isn't strict,
     * OR we update ServiceItemManager to allow fetching by Org.
     * 
     * Let's try to use the existing getServiceItems and filter client-side if needed, 
     * or better, let's assume the UI context provides a venueId.
     */
    async getGames(organizationId: string, venueId?: string): Promise<Game[]> {
        // If venueId is provided, use it. If not, we might get all public games?
        // ServiceItemManager.getServiceItems(venueId) returns items for that venue.
        // If venueId is undefined, it returns all games (based on RLS).

        const items = await ServiceItemManager.getServiceItems(venueId);

        // Filter by organization if needed (though RLS should handle this)
        const filtered = organizationId
            ? items.filter(i => i.organization_id === organizationId)
            : items;

        return filtered.map(mapToGame);
    },

    /**
     * Create a new game
     */
    async createGame(gameData: CreateGameDTO): Promise<Game> {
        // Handle missing venue_id for single-venue admins
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
                // Optional: Create a default venue if none exists?
                // For now, let ServiceItemManager throw if still missing, 
                // but we could also throw a friendlier error here.
                console.warn('No venue found for organization. Game creation might fail.');
            }
        }

        const input = mapToServiceItemInput(gameData);
        const created = await ServiceItemManager.createServiceItem(input);
        return mapToGame(created);
    },

    /**
     * Update a game
     */
    async updateGame(id: string, updates: Partial<CreateGameDTO>): Promise<Game> {
        const serviceItemUpdates: Partial<ServiceItem> = {};

        if (updates.name) serviceItemUpdates.name = updates.name;
        if (updates.description) serviceItemUpdates.description = updates.description;
        if (updates.difficulty) serviceItemUpdates.difficulty = (updates.difficulty.charAt(0).toUpperCase() + updates.difficulty.slice(1)) as any;
        if (updates.duration_minutes) serviceItemUpdates.duration = updates.duration_minutes;
        if (updates.min_players) serviceItemUpdates.min_players = updates.min_players;
        if (updates.max_players) serviceItemUpdates.max_players = updates.max_players;
        if (updates.price) serviceItemUpdates.price = updates.price;
        if (updates.image_url) serviceItemUpdates.image_url = updates.image_url;
        if (updates.is_active !== undefined) serviceItemUpdates.status = updates.is_active ? 'active' : 'inactive';

        const updated = await ServiceItemManager.updateServiceItem(id, serviceItemUpdates);
        return mapToGame(updated);
    },

    /**
     * Delete a game
     */
    async deleteGame(id: string): Promise<void> {
        await ServiceItemManager.deleteServiceItem(id);
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
