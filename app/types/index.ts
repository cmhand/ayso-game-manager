// Player interface (extending the existing one from GameManager)
export interface Player {
  id: number;
  name: string;
  isPlaying: boolean;
  playingTime: number; // in seconds
  sittingTime: number; // in seconds
  playingPercentage: number;
  sittingPercentage: number;
  projectedPlayingPercentage: number;
  projectedSittingPercentage: number;
  jerseyNumber?: number;
  position?: string;
}

// Team interface
export interface Team {
  id: string;
  name: string;
  season: string;
  ageGroup: string;
  division?: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

// Game interface
export interface Game {
  id: string;
  teamId: string;
  teamName: string;
  opponent: string;
  date: Date;
  duration: number; // in minutes
  location?: string;
  finalStats: GameStats;
  createdAt: Date;
}

// Game statistics
export interface GameStats {
  players: Array<{
    playerId: number;
    playingTime: number;
    sittingTime: number;
    playingPercentage: number;
  }>;
  totalGameTime: number;
}

// Dashboard view types
export type DashboardView = 'teams' | 'roster' | 'game' | 'history';

// Team creation/edit form data
export interface TeamFormData {
  name: string;
  season: string;
  ageGroup: string;
  division?: string;
}

// In-progress game state for persistence
export interface InProgressGame {
  id: string;
  teamId: string;
  teamName: string;
  players: Player[];
  gameTime: number; // current game time in seconds
  gameDuration: number; // total game duration in minutes
  isGameRunning: boolean;
  gameStarted: boolean;
  startedAt: Date; // when the game was started
  lastUpdatedAt: Date; // last time the game state was saved
}
