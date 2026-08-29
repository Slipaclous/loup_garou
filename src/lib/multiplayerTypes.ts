import { RoleId } from './roles';

export interface RoomPlayer {
  id: string;
  name: string;
  role?: RoleId;
  isAlive: boolean;
  isLover: boolean;
  isCaptain: boolean;
  isHost: boolean;
}

export type RoomPhase = 'LOBBY' | 'ROLE_REVEAL' | 'NIGHT' | 'DAY' | 'GAME_OVER';

export interface RoomState {
  code: string;
  phase: RoomPhase;
  dayNumber: number;
  activeNightStepId?: string; // 'cupid' | 'guard' | 'seer' | 'werewolf' | 'witch'
  players: RoomPlayer[];
  nightActions: {
    lovers?: string[];
    guardTargetId?: string;
    seerTargetId?: string;
    werewolfTargetId?: string;
    witchHeal?: boolean;
    witchKillId?: string;
  };
  dayVotes: Record<string, string>; // voterId -> targetId
  winner?: 'VILLAGE' | 'WEREWOLVES' | 'LOVERS' | 'WHITE_WOLF';
  logs: string[];
}
