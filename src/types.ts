/**
 * Types for "한계에 부딪힌 지구 실시간 자원 탈출 게임"
 */

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'blackout' | 'debriefing';

export interface UpgradeDef {
  id: string;
  name: string;
  subtitle: string;
  cost: number;
  pointsPerTap: number;
  resourceCostPerTap: number;
  passivePointsPerSec: number;
  passiveResourcePerSec: number;
  icon: string;
  description: string;
  flavorText: string;
}

export interface TeamData {
  id: string; // 'team-1', 'team-2', etc.
  name: string; // '미국(1모둠)', etc.
  color: string;
  score: number;
  tapCount: number;
  currentUpgradeId: string;
  upgradesPurchased: Record<string, number>;
  activeMembers: number;
  lastTapTimestamp: number;
  recentTapRate: number; // taps per second
  isReady?: boolean;
}

export interface HistorySnapshot {
  timestamp: number;
  resourcePercent: number;
  resourceRemaining: number;
  totalScore: number;
  teamScores: Record<string, number>;
  teamTiers?: Record<string, string>;
  totalClicks?: number;
}

export interface GameState {
  status: GameStatus;
  maxResource: number;
  currentResource: number;
  resourcePercent: number;
  totalClicks: number;
  consumptionRate: number; // resources per second
  elapsedSeconds: number;
  startedAt: number | null;
  endedAt: number | null;
  teams: Record<string, TeamData>;
  isBotEnabled: boolean;
  history: HistorySnapshot[];
  roomCode: string;
}

export interface ProducePayload {
  teamId: string;
  clicks: number;
  clientTimestamp: number;
}

export interface UpgradePayload {
  teamId: string;
  upgradeId: string;
}

export interface AdminConfigPayload {
  maxResource?: number;
  isBotEnabled?: boolean;
}
