export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type GameStatus = 'active' | 'inactive' | 'maintenance';

export interface Game {
  id: string;
  organization_id: string;
  venue_id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  duration_minutes: number;
  min_players: number;
  max_players: number;
  price: number;
  image_url?: string;
  is_active: boolean;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GameFilters {
  status?: GameStatus | 'all';
  search?: string;
  difficulty?: DifficultyLevel | 'all';
}

export interface InventoryStats {
  totalGames: number;
  activeGames: number;
  totalCapacity: number;
  avgPrice: number;
}

export interface CreateGameDTO {
  organization_id: string;
  venue_id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  duration_minutes: number;
  min_players: number;
  max_players: number;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface UpdateGameDTO extends Partial<CreateGameDTO> {
  id: string;
}
