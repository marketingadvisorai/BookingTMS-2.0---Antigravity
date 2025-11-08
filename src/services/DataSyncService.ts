/**
 * DataSyncService - Unified data management for the BookingTMS frontend.
 *
 * Responsibilities:
 * - Provide a single source of truth for bookings, events (games/rooms), and vouchers.
 * - Persist data locally (localStorage) to simulate a lightweight client database.
 * - Broadcast real-time events so widgets, embeds, previews, and admin views stay in sync.
 * - Offer migration helpers to keep legacy keys working while moving to structured storage.
 */

// -----------------------------------------------------------------------------
// Shared storage configuration
// -----------------------------------------------------------------------------

export const DATA_SYNC_STORAGE_KEYS = {
  BOOKINGS: 'bookings',
  GAMES: 'bookingtms::games',
  GIFT_VOUCHERS: 'giftVouchers',
} as const;

export const DEFAULT_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

// -----------------------------------------------------------------------------
// Domain models
// -----------------------------------------------------------------------------

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Extreme';

export interface GamePublishingTargets {
  widgets: boolean;
  embed: boolean;
  calendars: boolean;
  previews: boolean;
}

export interface GameSettings {
  visibility: 'public' | 'private';
  publishingTargets: GamePublishingTargets;
  bookingLeadTime?: number;
  cancellationWindow?: number;
  specialInstructions?: string;
}

export interface Booking {
  id: string;
  timestamp: string;
  gameName: string;
  gameId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participants: number;
  ticketTypes: TicketTypeBooking[];
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  promoCode?: string;
  giftCardCredit?: number;
  source: 'admin' | 'widget';
}

export interface TicketTypeBooking {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  spots: number;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
  tagline?: string;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
  duration: string | number;
  capacity: number;
  basePrice: number;
  priceRange?: string;
  ageRange?: string;
  difficulty: number | GameDifficulty;
  difficultyLabel?: GameDifficulty;
  gameType?: 'physical' | 'virtual' | 'hybrid';
  minAdults?: number;
  maxAdults?: number;
  minChildren?: number;
  maxChildren?: number;
  childPrice?: number;
  minAge?: number;
  language?: string[];
  successRate?: number;
  activityDetails?: string;
  additionalInformation?: string;
  faqs?: any[];
  cancellationPolicies?: any[];
  accessibility?: {
    strollerAccessible?: boolean;
    wheelchairAccessible?: boolean;
  };
  location?: string;
  status: 'active' | 'inactive';
  blockedDates: string[];
  availability: {
    [date: string]: TimeSlot[];
  };
  galleryImages?: string[];
  videos?: string[];
  categoryId?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  settings?: GameSettings;
  slug?: string;
}

export interface GameInput {
  name: string;
  description?: string;
  tagline?: string;
  duration: string | number;
  capacity: number;
  basePrice: number;
  status?: 'active' | 'inactive';
  difficulty?: number | GameDifficulty;
  difficultyLabel?: GameDifficulty;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
  gameType?: 'physical' | 'virtual' | 'hybrid';
  galleryImages?: string[];
  videos?: string[];
  priceRange?: string;
  ageRange?: string;
  blockedDates?: string[];
  availability?: {
    [date: string]: TimeSlot[];
  };
  categoryId?: string;
  settings?: GameSettings;
}

export interface GameMutationContext {
  userId?: string;
  userRole?: string;
  organizationId?: string;
}

export interface GiftVoucher {
  id: string;
  amount: number;
  recipients: VoucherRecipient[];
  senderName: string;
  message?: string;
  theme: 'birthday' | 'holiday' | 'celebration' | 'general';
  deliveryDate?: string;
  purchaseDate: string;
  status: 'active' | 'redeemed' | 'expired';
}

export interface VoucherRecipient {
  name: string;
  email: string;
  status: 'sent' | 'delivered' | 'redeemed';
}

interface SharedGamesEnvelope {
  version: number;
  updatedAt: string;
  updatedBy?: string;
  organizationId: string;
  games: Game[];
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const DEFAULT_GAME_IMAGE =
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop';

const DEFAULT_GAME_SETTINGS: GameSettings = {
  visibility: 'public',
  publishingTargets: {
    widgets: true,
    embed: true,
    calendars: true,
    previews: true,
  },
  bookingLeadTime: 0,
  cancellationWindow: 24,
};

const LEGACY_GAME_KEYS = ['admin_games', 'bookingtms_games'];
const LEGACY_GAME_PREFIX = 'bookingtms_games_';

const DIFFICULTY_LABELS: Record<number, GameDifficulty> = {
  1: 'Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Extreme',
};

const DIFFICULTY_LEVELS: Record<GameDifficulty, number> = {
  Easy: 2,
  Medium: 3,
  Hard: 4,
  Extreme: 5,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function toDifficultyLabel(value: number | string | undefined): GameDifficulty {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'easy') return 'Easy';
    if (normalized === 'medium') return 'Medium';
    if (normalized === 'hard') return 'Hard';
    if (normalized === 'extreme') return 'Extreme';
  }
  if (typeof value === 'number' && DIFFICULTY_LABELS[value]) {
    return DIFFICULTY_LABELS[value];
  }
  return 'Medium';
}

function toDifficultyLevel(label: GameDifficulty | undefined): number {
  return label ? DIFFICULTY_LEVELS[label] ?? 3 : 3;
}

function coerceNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function sanitizeSettings(existing?: GameSettings, incoming?: GameSettings): GameSettings {
  const base = existing ?? DEFAULT_GAME_SETTINGS;
  if (!incoming) {
    return {
      ...base,
      publishingTargets: {
        ...DEFAULT_GAME_SETTINGS.publishingTargets,
        ...(base.publishingTargets ?? {}),
      },
    };
  }

  return {
    visibility: incoming.visibility ?? base.visibility ?? 'public',
    bookingLeadTime: incoming.bookingLeadTime ?? base.bookingLeadTime,
    cancellationWindow: incoming.cancellationWindow ?? base.cancellationWindow,
    specialInstructions: incoming.specialInstructions ?? base.specialInstructions,
    publishingTargets: {
      ...DEFAULT_GAME_SETTINGS.publishingTargets,
      ...(base.publishingTargets ?? {}),
      ...(incoming.publishingTargets ?? {}),
    },
  };
}

function normalizeStoredGame(raw: any): Game | null {
  if (!raw || typeof raw !== 'object') return null;

  const label = toDifficultyLabel(raw.difficulty ?? raw.difficultyLabel);
  const duration =
    typeof raw.duration === 'number' || typeof raw.duration === 'string'
      ? raw.duration
      : `${coerceNumber(raw.durationMinutes ?? 60, 60)} min`;
  const basePrice = coerceNumber(raw.basePrice ?? raw.price, 0);
  const capacity = coerceNumber(raw.capacity ?? raw.maxPlayers, 8);
  const image = raw.coverImage || raw.imageUrl || raw.image || DEFAULT_GAME_IMAGE;
  const gameType: 'physical' | 'virtual' | 'hybrid' =
    raw.gameType === 'virtual' || raw.gameType === 'hybrid' ? raw.gameType : 'physical';
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  const updatedAt =
    typeof raw.updatedAt === 'string' ? raw.updatedAt : raw.lastUpdated ?? createdAt;

  return {
    id: String(raw.id ?? `game_${Date.now()}`),
    name: String(raw.name ?? 'Untitled Event'),
    description: raw.description ?? '',
    image,
    imageUrl: raw.imageUrl ?? image,
    coverImage: raw.coverImage ?? image,
    duration,
    capacity,
    basePrice,
    priceRange: raw.priceRange ?? `$${basePrice}`,
    ageRange: raw.ageRange ?? 'All ages',
    difficulty: typeof raw.difficulty === 'number' ? raw.difficulty : toDifficultyLevel(label),
    difficultyLabel: raw.difficultyLabel ?? label,
    gameType,
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    blockedDates: Array.isArray(raw.blockedDates) ? raw.blockedDates : [],
    availability:
      raw.availability && typeof raw.availability === 'object' ? raw.availability : {},
    galleryImages: ensureStringArray(raw.galleryImages),
    videos: ensureStringArray(raw.videos),
    categoryId: raw.categoryId ?? 'default',
    organizationId: raw.organizationId ?? DEFAULT_ORGANIZATION_ID,
    createdAt,
    updatedAt,
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    settings: sanitizeSettings(raw.settings, raw.settings),
  };
}

function buildGameFromInput(
  input: GameInput,
  context?: GameMutationContext
): Game {
  const now = new Date().toISOString();
  const label = toDifficultyLabel(input.difficulty ?? input.difficultyLabel);
  const duration =
    typeof input.duration === 'number' || typeof input.duration === 'string'
      ? input.duration
      : 60;
  const image = input.coverImage || input.imageUrl || input.image || DEFAULT_GAME_IMAGE;
  const basePrice = coerceNumber(input.basePrice, 0);
  const capacity = coerceNumber(input.capacity, 8);
  const gameType: 'physical' | 'virtual' | 'hybrid' =
    input.gameType === 'virtual' || input.gameType === 'hybrid' ? input.gameType : 'physical';

  return {
    id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name?.trim() || 'Untitled Event',
    description: input.description ?? '',
    image,
    imageUrl: input.imageUrl ?? image,
    coverImage: input.coverImage ?? image,
    duration,
    capacity,
    basePrice,
    priceRange: input.priceRange ?? `$${basePrice}`,
    ageRange: input.ageRange ?? 'All ages',
    difficulty: typeof input.difficulty === 'number' ? input.difficulty : toDifficultyLevel(label),
    difficultyLabel: input.difficultyLabel ?? label,
    gameType,
    status: input.status === 'inactive' ? 'inactive' : 'active',
    blockedDates: Array.isArray(input.blockedDates) ? input.blockedDates : [],
    availability:
      input.availability && typeof input.availability === 'object' ? input.availability : {},
    galleryImages: ensureStringArray(input.galleryImages),
    videos: ensureStringArray(input.videos),
    categoryId: input.categoryId ?? 'default',
    organizationId: context?.organizationId ?? DEFAULT_ORGANIZATION_ID,
    createdAt: now,
    updatedAt: now,
    createdBy: context?.userId,
    updatedBy: context?.userId,
    settings: sanitizeSettings(undefined, input.settings),
  };
}

function applyGameUpdates(
  existing: Game,
  updates: Partial<GameInput>,
  context?: GameMutationContext
): Game {
  const label = updates.difficultyLabel ?? toDifficultyLabel(updates.difficulty ?? existing.difficulty);
  const newImage = updates.coverImage || updates.imageUrl || updates.image;
  const basePrice =
    updates.basePrice !== undefined
      ? coerceNumber(updates.basePrice, existing.basePrice)
      : existing.basePrice;
  const capacity =
    updates.capacity !== undefined
      ? coerceNumber(updates.capacity, existing.capacity)
      : existing.capacity;
  const duration =
    updates.duration !== undefined
      ? updates.duration
      : existing.duration;
  const nextGameType: 'physical' | 'virtual' | 'hybrid' =
    updates.gameType === 'virtual' || updates.gameType === 'hybrid'
      ? updates.gameType
      : (existing.gameType ?? 'physical');

  return {
    ...existing,
    name: updates.name?.trim() || existing.name,
    description: updates.description ?? existing.description,
    duration,
    capacity,
    basePrice,
    priceRange: updates.priceRange ?? existing.priceRange ?? `$${basePrice}`,
    ageRange: updates.ageRange ?? existing.ageRange,
    difficulty:
      updates.difficulty !== undefined
        ? typeof updates.difficulty === 'number'
          ? updates.difficulty
          : toDifficultyLevel(label)
        : existing.difficulty,
    difficultyLabel: label || existing.difficultyLabel,
    gameType: nextGameType,
    status:
      updates.status === 'inactive'
        ? 'inactive'
        : updates.status === 'active'
        ? 'active'
        : existing.status,
    image: newImage ?? existing.image,
    imageUrl: updates.imageUrl ?? newImage ?? existing.imageUrl,
    coverImage: updates.coverImage ?? existing.coverImage ?? newImage,
    galleryImages:
      updates.galleryImages !== undefined
        ? ensureStringArray(updates.galleryImages)
        : existing.galleryImages,
    videos:
      updates.videos !== undefined ? ensureStringArray(updates.videos) : existing.videos,
    blockedDates:
      updates.blockedDates !== undefined ? ensureStringArray(updates.blockedDates) : existing.blockedDates,
    availability:
      updates.availability !== undefined
        ? updates.availability
        : existing.availability,
    categoryId: updates.categoryId ?? existing.categoryId,
    settings: sanitizeSettings(existing.settings, updates.settings ?? existing.settings),
    organizationId: context?.organizationId ?? existing.organizationId ?? DEFAULT_ORGANIZATION_ID,
    updatedAt: new Date().toISOString(),
    updatedBy: context?.userId ?? existing.updatedBy,
  };
}

// -----------------------------------------------------------------------------
// Service implementation
// -----------------------------------------------------------------------------

export class DataSyncService {
  protected static readonly STORAGE_KEYS = DATA_SYNC_STORAGE_KEYS;
  protected static readonly SHARED_GAMES_KEY = DATA_SYNC_STORAGE_KEYS.GAMES;
  private static readonly ENVELOPE_VERSION = 1;

  // ---------------------------------------------------------------------------
  // BOOKINGS
  // ---------------------------------------------------------------------------

  static getAllBookings(): Booking[] {
    if (!isBrowser()) return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BOOKINGS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading bookings:', error);
      return [];
    }
  }

  static saveBooking(
    bookingData: Omit<Booking, 'id' | 'timestamp' | 'status' | 'source'>
  ): Booking {
    const now = new Date().toISOString();
    const booking: Booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now,
      status: 'confirmed',
      source: 'widget',
      ...bookingData,
    };

    const bookings = this.getAllBookings();
    bookings.push(booking);
    if (isBrowser()) {
      localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

    console.log('✅ Booking saved:', booking.id);
    return booking;
  }

  static updateBookingStatus(bookingId: string, status: Booking['status']): void {
    const bookings = this.getAllBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings[index].status = status;
      if (isBrowser()) {
        localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      }
      console.log('✅ Booking status updated:', bookingId, status);
    }
  }

  // ---------------------------------------------------------------------------
  // GAMES / EVENTS
  // ---------------------------------------------------------------------------

  static getAllGames(): Game[] {
    if (!isBrowser()) return [];

    try {
      const shared = localStorage.getItem(this.SHARED_GAMES_KEY);
      if (shared) {
        const parsed = JSON.parse(shared) as SharedGamesEnvelope | Game[];
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeStoredGame).filter((g): g is Game => Boolean(g));
        }
        if (parsed && Array.isArray(parsed.games)) {
          return parsed.games
            .map(normalizeStoredGame)
            .filter((g): g is Game => Boolean(g));
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse shared games payload, falling back to legacy keys.', error);
    }

    // Legacy fallback keys
    for (const key of LEGACY_GAME_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const normalized = parsed
              .map(normalizeStoredGame)
              .filter((g): g is Game => Boolean(g));
            if (normalized.length) {
              this.persistGames(normalized);
              return normalized;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse legacy games key "${key}".`, error);
        }
      }
    }

    // Scoped legacy keys (per-user)
    for (let idx = 0; idx < localStorage.length; idx++) {
      const key = localStorage.key(idx) ?? '';
      if (key.startsWith(LEGACY_GAME_PREFIX)) {
        const scoped = localStorage.getItem(key);
        if (!scoped) continue;
        try {
          const parsed = JSON.parse(scoped);
          if (Array.isArray(parsed)) {
            const normalized = parsed
              .map(normalizeStoredGame)
              .filter((g): g is Game => Boolean(g));
            if (normalized.length) {
              this.persistGames(normalized);
              return normalized;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse scoped legacy games key "${key}".`, error);
        }
      }
    }

    return [];
  }

  static getGameById(gameId: string): Game | null {
    const games = this.getAllGames();
    return games.find((g) => g.id === gameId) ?? null;
  }

  protected static persistGames(
    games: Game[],
    context?: {
      updatedBy?: string;
      organizationId?: string;
    }
  ) {
    if (!isBrowser()) return;
    const envelope: SharedGamesEnvelope = {
      version: this.ENVELOPE_VERSION,
      updatedAt: new Date().toISOString(),
      updatedBy: context?.updatedBy,
      organizationId:
        context?.organizationId ?? games[0]?.organizationId ?? DEFAULT_ORGANIZATION_ID,
      games,
    };

    try {
      localStorage.setItem(this.SHARED_GAMES_KEY, JSON.stringify(envelope));
      // Maintain legacy keys to avoid breaking embedded widgets that still expect them
      localStorage.setItem(this.STORAGE_KEYS.GAMES, JSON.stringify(games));
      localStorage.setItem('bookingtms_games', JSON.stringify(games));
    } catch (error) {
      console.error('❌ Failed to persist games data:', error);
    }
  }

  static saveGame(gameData: GameInput, context?: GameMutationContext): Game {
    const games = this.getAllGames();
    const newGame = buildGameFromInput(gameData, context);
    games.push(newGame);
    this.persistGames(games, {
      updatedBy: context?.userId,
      organizationId: context?.organizationId,
    });
    console.log('✅ Game saved and sync event triggered:', newGame.id);
    return newGame;
  }

  static updateGame(
    gameId: string,
    updates: Partial<GameInput>,
    context?: GameMutationContext
  ): Game | null {
    const games = this.getAllGames();
    const index = games.findIndex((g) => g.id === gameId);
    if (index === -1) {
      console.warn(`⚠️ Attempted to update missing game "${gameId}".`);
      return null;
    }

    const updated = applyGameUpdates(games[index], updates, context);
    games[index] = updated;
    this.persistGames(games, {
      updatedBy: context?.userId,
      organizationId: context?.organizationId ?? updated.organizationId,
    });
    console.log('✅ Game updated and sync event triggered:', gameId);
    return updated;
  }

  static deleteGame(gameId: string, context?: GameMutationContext): void {
    const games = this.getAllGames();
    const filtered = games.filter((g) => g.id !== gameId);
    this.persistGames(filtered, {
      updatedBy: context?.userId,
      organizationId: context?.organizationId,
    });
    console.log('✅ Game deleted and sync event triggered:', gameId);
  }

  static replaceAllGames(games: Game[], context?: GameMutationContext): Game[] {
    if (!Array.isArray(games)) return [];
    const normalized = games
      .map(normalizeStoredGame)
      .filter((g): g is Game => Boolean(g));
    this.persistGames(normalized, {
      updatedBy: context?.userId,
      organizationId: context?.organizationId,
    });
    console.log('✅ Game catalog replaced. Total games:', normalized.length);
    return normalized;
  }

  // ---------------------------------------------------------------------------
  // AVAILABILITY HELPERS
  // ---------------------------------------------------------------------------

  static getAvailableTimeSlots(gameId: string, date: string): TimeSlot[] {
    const game = this.getGameById(gameId);
    if (!game) return [];

    const bookings = this.getAllBookings();
    const gameBookings = bookings.filter(
      (b) => b.gameId === gameId && b.date === date && b.status !== 'cancelled'
    );

    const defaultTimeSlots: TimeSlot[] = [
      { time: '10:00 AM', available: true, spots: 8 },
      { time: '11:30 AM', available: true, spots: 8 },
      { time: '1:00 PM', available: true, spots: 8 },
      { time: '2:30 PM', available: true, spots: 8 },
      { time: '4:00 PM', available: true, spots: 8 },
      { time: '5:30 PM', available: true, spots: 8 },
      { time: '7:00 PM', available: true, spots: 8 },
      { time: '8:30 PM', available: true, spots: 8 },
    ];

    return defaultTimeSlots.map((slot) => {
      const participantsInSlot = gameBookings
        .filter((b) => b.time === slot.time)
        .reduce((total, b) => total + b.participants, 0);

      const available = participantsInSlot < (game.capacity || 8);
      const spots = Math.max(0, (game.capacity || 8) - participantsInSlot);

      return {
        time: slot.time,
        available,
        spots,
      };
    });
  }

  static isDateBlocked(gameId: string, date: string): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;
    return Array.isArray(game.blockedDates) && game.blockedDates.includes(date);
  }

  // ---------------------------------------------------------------------------
  // GIFT VOUCHERS
  // ---------------------------------------------------------------------------

  static getAllGiftVouchers(): GiftVoucher[] {
    if (!isBrowser()) return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.GIFT_VOUCHERS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading gift vouchers:', error);
      return [];
    }
  }

  static saveGiftVoucher(
    voucherData: Omit<GiftVoucher, 'id' | 'purchaseDate' | 'status'>
  ): GiftVoucher {
    const voucher: GiftVoucher = {
      id: `voucher_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      purchaseDate: new Date().toISOString(),
      status: 'active',
      ...voucherData,
    };

    const vouchers = this.getAllGiftVouchers();
    vouchers.push(voucher);
    if (isBrowser()) {
      localStorage.setItem(this.STORAGE_KEYS.GIFT_VOUCHERS, JSON.stringify(vouchers));
    }

    console.log('✅ Gift voucher saved:', voucher.id);
    return voucher;
  }

  // ---------------------------------------------------------------------------
  // ANALYTICS & DEBUG UTILITIES
  // ---------------------------------------------------------------------------

  static getBookingStats() {
    const bookings = this.getAllBookings();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

    return {
      totalBookings: bookings.length,
      confirmedBookings,
      totalRevenue,
      averageOrderValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    };
  }

  static exportAllData() {
    return {
      bookings: this.getAllBookings(),
      games: this.getAllGames(),
      giftVouchers: this.getAllGiftVouchers(),
      stats: this.getBookingStats(),
    };
  }

  static clearAllData() {
    if (!isBrowser()) return;
    localStorage.removeItem(this.STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(this.STORAGE_KEYS.GIFT_VOUCHERS);
    localStorage.removeItem(this.SHARED_GAMES_KEY);
    console.log('⚠️ All data cleared');
  }
}

// -----------------------------------------------------------------------------
// Event bus for cross-component synchronization
// -----------------------------------------------------------------------------

class DataSyncEventsClass {
  private listeners: Record<string, Array<() => void>> = {};

  subscribe(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    console.log(
      `👂 Subscribed to event: ${event}. Total listeners: ${this.listeners[event].length}`
    );
  }

  unsubscribe(event: string, callback: () => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  emit(event: string) {
    if (!this.listeners[event]) {
      console.log(`⚠️ No listeners for event: ${event}`);
      return;
    }
    console.log(
      `🔄 Emitting data sync event: ${event} to ${this.listeners[event].length} listeners`
    );
    this.listeners[event].forEach((callback, index) => {
      try {
        callback();
        console.log(`✅ Event ${event} listener ${index} executed successfully`);
      } catch (error) {
        console.error(`❌ Error in event ${event} listener ${index}:`, error);
      }
    });
  }
}

export const DataSyncEvents = new DataSyncEventsClass();

// -----------------------------------------------------------------------------
// Extended service that emits events on mutation
// -----------------------------------------------------------------------------

export class DataSyncServiceWithEvents extends DataSyncService {
  static saveGame(gameData: GameInput, context?: GameMutationContext): Game {
    const saved = super.saveGame(gameData, context);
    DataSyncEvents.emit('games-updated');
    return saved;
  }

  static updateGame(
    gameId: string,
    updates: Partial<GameInput>,
    context?: GameMutationContext
  ): Game | null {
    const updated = super.updateGame(gameId, updates, context);
    if (updated) {
      DataSyncEvents.emit('games-updated');
    }
    return updated;
  }

  static deleteGame(gameId: string, context?: GameMutationContext): void {
    super.deleteGame(gameId, context);
    DataSyncEvents.emit('games-updated');
  }

  static replaceAllGames(games: Game[], context?: GameMutationContext): Game[] {
    const replaced = super.replaceAllGames(games, context);
    DataSyncEvents.emit('games-updated');
    return replaced;
  }

  static saveBooking(
    bookingData: Omit<Booking, 'id' | 'timestamp' | 'status' | 'source'>
  ): Booking {
    const booking = super.saveBooking(bookingData);
    DataSyncEvents.emit('bookings-updated');
    return booking;
  }

  static updateBooking(
    bookingId: string,
    updates: Partial<Booking>
  ): void {
    const bookings = this.getAllBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      if (isBrowser()) {
        localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      }
      DataSyncEvents.emit('bookings-updated');
      console.log('✅ Booking updated and sync event triggered:', bookingId);
    }
  }
}

// -----------------------------------------------------------------------------
// Cross-tab synchronization: listen for storage events and re-emit
// -----------------------------------------------------------------------------

if (isBrowser()) {
  window.addEventListener('storage', (event) => {
    if (!event.key) return;
    if (
      event.key === DATA_SYNC_STORAGE_KEYS.GAMES ||
      event.key === 'admin_games' ||
      event.key === 'bookingtms_games'
    ) {
      DataSyncEvents.emit('games-updated');
    }
    if (event.key === DATA_SYNC_STORAGE_KEYS.BOOKINGS || event.key === 'bookings') {
      DataSyncEvents.emit('bookings-updated');
    }
  });
}

export default DataSyncServiceWithEvents;
