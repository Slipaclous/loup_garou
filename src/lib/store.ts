import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLES, RoleId, DEFAULT_PLAYER_NAMES, getRecommendedDeck, RoleDef } from './roles';
import { sounds } from './sound';

export type GamePhase =
  | 'SETUP'
  | 'REVEAL_ROLES'
  | 'ROLE_REVEAL'
  | 'NIGHT_START'
  | 'NIGHT_ACTION'
  | 'NIGHT_CUPID'
  | 'NIGHT_LOVERS_REVEAL'
  | 'NIGHT_GUARD'
  | 'NIGHT_SEER'
  | 'NIGHT_WEREWOLVES'
  | 'NIGHT_WITCH'
  | 'NIGHT_END'
  | 'DAY_START'
  | 'DAY_DISCUSS'
  | 'DAY_VOTE'
  | 'DAY_HUNTER'
  | 'DAY_FOOL_REVEAL'
  | 'GAME_OVER';

export interface GameSettings {
  seerSingleUse: boolean;  // Voyante à usage unique (1x par partie)
  guardSingleUse: boolean; // Salvateur à usage unique (1x par partie)
}

export interface Player {
  id: string;
  name: string;
  role: RoleId;
  isAlive: boolean;
  isLover: boolean;
  isProtected: boolean;
  elderLives: number;
  isFoolRevealed: boolean;
  hasUsedLifePotion: boolean;
  hasUsedDeathPotion: boolean;
  hasUsedSeerPower?: boolean;
  hasUsedGuardPower?: boolean;
  isCaptain: boolean;
}

export interface GameLog {
  id: string;
  dayNumber: number;
  phase: 'NIGHT' | 'DAY';
  message: string;
  timestamp: Date;
  type: 'DEATH' | 'INFO' | 'ACTION' | 'VICTORY';
}

export interface NightStep {
  role: RoleId;
  roleDef: RoleDef;
  title: string;
  script: string;
  hint: string;
  soundLabel: string;
  soundAction: () => void;
}

interface GameState {
  players: Player[];
  selectedRoles: RoleId[];
  settings: GameSettings;
  phase: GamePhase;
  dayNumber: number;
  gameMode: 'PASS_AND_PLAY' | 'GM_ASSISTANT';
  
  // Nuit en cours
  activeNightStepIndex: number;
  nightSteps: NightStep[];
  nightTargetGuard: string | null;
  lastProtectedPlayerId: string | null;
  nightTargetSeer: string | null;
  nightTargetWolf: string | null;
  nightTargetWitchHeal: boolean;
  nightTargetWitchKill: string | null;
  nightTargetCupid: [string, string] | null;
  
  // États de transition
  revealingPlayerIndex: number;
  lastDeaths: { player: Player; reason: string }[];
  hunterPendingPlayerId: string | null;
  seerRevealedPlayer: { player: Player; roleDef: RoleDef } | null;
  winner: 'VILLAGE' | 'WEREWOLVES' | 'LOVERS' | 'WHITE_WOLF' | null;
  
  // Logs & Sons
  logs: GameLog[];
  soundEnabled: boolean;
  isSoundMuted: boolean;
  
  // Actions
  setGameMode: (mode: 'PASS_AND_PLAY' | 'GM_ASSISTANT') => void;
  setPlayers: (players: Player[]) => void;
  setSelectedRoles: (roles: RoleId[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  toggleSound: () => void;
  
  // Déroulement du jeu
  startGame: () => void;
  startNight: () => void;
  nextNightStep: () => void;
  nextRevealCard: () => void;
  endRoleReveal: () => void;
  startVote: () => void;
  
  // Actions de nuit
  setNightGuardTarget: (playerId: string | null) => void;
  setNightSeerTarget: (playerId: string | null) => void;
  clearSeerTarget: () => void;
  setNightWolfTarget: (playerId: string | null) => void;
  setNightWitchHeal: (heal: boolean) => void;
  setNightWitchKill: (playerId: string | null) => void;
  setNightWitchActions: (heals: boolean, killsId: string | null) => void;
  setNightCupidLovers: (p1Id: string, p2Id: string) => void;
  
  // Avancement des phases
  advancePhase: () => void;
  eliminatePlayer: (playerId: string, reason?: string) => void;
  resolveHunterShot: (targetPlayerId: string) => void;
  setCaptain: (playerId: string) => void;
  checkVictory: () => 'VILLAGE' | 'WEREWOLVES' | 'LOVERS' | 'WHITE_WOLF' | null;
  resetGame: () => void;
  addCustomLog: (message: string, type?: 'DEATH' | 'INFO' | 'ACTION' | 'VICTORY') => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      selectedRoles: getRecommendedDeck(8),
      settings: {
        seerSingleUse: false,
        guardSingleUse: false,
      },
      phase: 'SETUP',
      dayNumber: 1,
      gameMode: 'PASS_AND_PLAY',
      
      activeNightStepIndex: 0,
      nightSteps: [],
      nightTargetGuard: null,
      lastProtectedPlayerId: null,
      nightTargetSeer: null,
      nightTargetWolf: null,
      nightTargetWitchHeal: false,
      nightTargetWitchKill: null,
      nightTargetCupid: null,
      
      revealingPlayerIndex: 0,
      lastDeaths: [],
      hunterPendingPlayerId: null,
      seerRevealedPlayer: null,
      winner: null,
      
      logs: [],
      soundEnabled: true,
      isSoundMuted: false,

      setGameMode: (gameMode) => set({ gameMode }),
      setPlayers: (players) => set({ players }),
      setSelectedRoles: (selectedRoles) => set({ selectedRoles }),
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      
      addPlayer: (name) => {
        const { players } = get();
        if (players.length >= 18) return;
        const newPlayer: Player = {
          id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: name.trim() || `Joueur ${players.length + 1}`,
          role: 'villager',
          isAlive: true,
          isLover: false,
          isProtected: false,
          elderLives: 1,
          isFoolRevealed: false,
          hasUsedLifePotion: false,
          hasUsedDeathPotion: false,
          hasUsedSeerPower: false,
          hasUsedGuardPower: false,
          isCaptain: false
        };
        set({ players: [...players, newPlayer] });
      },

      removePlayer: (id) => {
        const { players } = get();
        set({ players: players.filter((p) => p.id !== id) });
      },

      updatePlayerName: (id, name) => {
        const { players } = get();
        set({
          players: players.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
        });
      },

      toggleSound: () => {
        const current = get().soundEnabled;
        set({ soundEnabled: !current, isSoundMuted: current });
      },

      resetGame: () => {
        sounds.stopNightLoop();
        set({
          phase: 'SETUP',
          dayNumber: 1,
          activeNightStepIndex: 0,
          nightSteps: [],
          nightTargetGuard: null,
          lastProtectedPlayerId: null,
          nightTargetSeer: null,
          nightTargetWolf: null,
          nightTargetWitchHeal: false,
          nightTargetWitchKill: null,
          nightTargetCupid: null,
          revealingPlayerIndex: 0,
          lastDeaths: [],
          hunterPendingPlayerId: null,
          seerRevealedPlayer: null,
          winner: null,
          logs: []
        });
      },

      startGame: () => {
        const { players, selectedRoles } = get();
        if (players.length < 4 || players.length !== selectedRoles.length) {
          return;
        }

        const shuffledRoles = [...selectedRoles];
        for (let i = shuffledRoles.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
        }

        const initializedPlayers: Player[] = players.map((p, index) => {
          const role = shuffledRoles[index];
          return {
            ...p,
            role,
            isAlive: true,
            isLover: false,
            isProtected: false,
            elderLives: role === 'elder' ? 2 : 1,
            isFoolRevealed: false,
            hasUsedLifePotion: false,
            hasUsedDeathPotion: false,
            hasUsedSeerPower: false,
            hasUsedGuardPower: false,
            isCaptain: false
          };
        });

        set({
          players: initializedPlayers,
          phase: 'ROLE_REVEAL',
          revealingPlayerIndex: 0,
          dayNumber: 1,
          winner: null,
          lastDeaths: [],
          logs: [
            {
              id: `${Date.now()}-start`,
              dayNumber: 1,
              phase: 'NIGHT',
              message: 'La partie commence. Distribution des cartes en secret...',
              timestamp: new Date(),
              type: 'INFO'
            }
          ]
        });
      },

      startNight: () => {
        const { players, dayNumber, settings } = get();
        const hasCupid = players.some(p => p.role === 'cupid' && p.isAlive) && dayNumber === 1;
        
        const guardPlayer = players.find(p => p.role === 'guard' && p.isAlive);
        const hasGuard = guardPlayer && (!settings.guardSingleUse || !guardPlayer.hasUsedGuardPower);

        const seerPlayer = players.find(p => p.role === 'seer' && p.isAlive);
        const hasSeer = seerPlayer && (!settings.seerSingleUse || !seerPlayer.hasUsedSeerPower);

        const hasWolves = players.some(p => (p.role === 'werewolf' || p.role === 'white_wolf') && p.isAlive);
        const hasWitch = players.some(p => p.role === 'witch' && p.isAlive);

        const steps: NightStep[] = [];
        if (hasCupid) steps.push({ role: 'cupid', roleDef: ROLES.cupid, title: 'Cupidon', script: ROLES.cupid.wakeScript || '', hint: 'Désignez les 2 amoureux', soundLabel: 'Magie', soundAction: () => sounds.playMagicChime() });
        if (hasGuard) steps.push({ role: 'guard', roleDef: ROLES.guard, title: 'Salvateur', script: ROLES.guard.wakeScript || '', hint: settings.guardSingleUse ? 'Action unique pour la partie !' : 'Désignez un joueur à protéger', soundLabel: 'Protection', soundAction: () => sounds.playMagicChime() });
        if (hasSeer) steps.push({ role: 'seer', roleDef: ROLES.seer, title: 'Voyante', script: ROLES.seer.wakeScript || '', hint: settings.seerSingleUse ? 'Action unique pour la partie !' : 'Désignez un joueur pour voir son rôle', soundLabel: 'Oeil Astral', soundAction: () => sounds.playMagicChime() });
        if (hasWolves) steps.push({ role: 'werewolf', roleDef: ROLES.werewolf, title: 'Loups-Garous', script: ROLES.werewolf.wakeScript || '', hint: 'Désignez la proie de la meute', soundLabel: 'Hurlement', soundAction: () => sounds.playWolfHowl() });
        if (hasWitch) steps.push({ role: 'witch', roleDef: ROLES.witch, title: 'Sorcière', script: ROLES.witch.wakeScript || '', hint: 'Utilisez vos potions', soundLabel: 'Potion', soundAction: () => sounds.playPotion() });

        set({
          phase: 'NIGHT_ACTION',
          nightSteps: steps,
          activeNightStepIndex: 0,
          nightTargetWolf: null,
          nightTargetGuard: null,
          nightTargetWitchHeal: false,
          nightTargetWitchKill: null,
          seerRevealedPlayer: null
        });

        sounds.startNightLoop();
      },

      nextNightStep: () => {
        const { activeNightStepIndex, nightSteps } = get();
        if (activeNightStepIndex + 1 < nightSteps.length) {
          const nextIdx = activeNightStepIndex + 1;
          set({ activeNightStepIndex: nextIdx, seerRevealedPlayer: null });
          const step = nightSteps[nextIdx];
          if (step && step.soundAction) step.soundAction();
        } else {
          get().advancePhase();
        }
      },

      startVote: () => {
        set({ phase: 'DAY_VOTE' });
      },

      nextRevealCard: () => {
        const { revealingPlayerIndex, players } = get();
        if (revealingPlayerIndex + 1 < players.length) {
          set({ revealingPlayerIndex: revealingPlayerIndex + 1 });
        } else {
          get().endRoleReveal();
        }
      },

      endRoleReveal: () => {
        const { players } = get();
        const hasCupid = players.some(p => p.role === 'cupid');
        const nextPhase: GamePhase = hasCupid ? 'NIGHT_CUPID' : 'NIGHT_GUARD';
        
        set({
          phase: nextPhase,
          revealingPlayerIndex: 0
        });

        sounds.startNightLoop();
      },

      setNightGuardTarget: (playerId) => {
        const { settings, players } = get();
        const updated = players.map(p => {
          if (p.role === 'guard' && settings.guardSingleUse && playerId) {
            return { ...p, hasUsedGuardPower: true };
          }
          return p;
        });
        set({ players: updated, nightTargetGuard: playerId, lastProtectedPlayerId: playerId });
      },

      setNightSeerTarget: (playerId) => {
        const { players, settings } = get();
        const target = players.find(p => p.id === playerId) || null;
        const updated = players.map(p => {
          if (p.role === 'seer' && settings.seerSingleUse && playerId) {
            return { ...p, hasUsedSeerPower: true };
          }
          return p;
        });

        if (target) {
          set({ players: updated, nightTargetSeer: playerId, seerRevealedPlayer: { player: target, roleDef: ROLES[target.role] || ROLES.villager } });
        } else {
          set({ players: updated, nightTargetSeer: null, seerRevealedPlayer: null });
        }
      },

      clearSeerTarget: () => set({ nightTargetSeer: null, seerRevealedPlayer: null }),
      setNightWolfTarget: (playerId) => set({ nightTargetWolf: playerId }),
      setNightWitchHeal: (heal) => set({ nightTargetWitchHeal: heal }),
      setNightWitchKill: (playerId) => set({ nightTargetWitchKill: playerId }),
      setNightWitchActions: (heals, killsId) => set({ nightTargetWitchHeal: heals, nightTargetWitchKill: killsId }),
      
      setNightCupidLovers: (p1Id, p2Id) => {
        const { players } = get();
        const updated = players.map(p => ({
          ...p,
          isLover: p.id === p1Id || p.id === p2Id
        }));
        set({
          players: updated,
          nightTargetCupid: [p1Id, p2Id]
        });
      },

      advancePhase: () => {
        const { phase, players, dayNumber, nightTargetWolf, nightTargetGuard, nightTargetWitchHeal, nightTargetWitchKill } = get();

        if (phase === 'NIGHT_ACTION' || phase === 'NIGHT_WITCH' || phase === 'NIGHT_END') {
          sounds.stopNightLoop();
          
          const deadPlayerIds = new Set<string>();
          const deathReasons: { player: Player; reason: string }[] = [];

          if (nightTargetWolf && nightTargetWolf !== nightTargetGuard && !nightTargetWitchHeal) {
            const wolfVictim = players.find(p => p.id === nightTargetWolf);
            if (wolfVictim) {
              if (wolfVictim.role === 'elder' && wolfVictim.elderLives > 1) {
                wolfVictim.elderLives -= 1;
              } else {
                deadPlayerIds.add(wolfVictim.id);
                deathReasons.push({
                  player: wolfVictim,
                  reason: 'Attaqué(e) et dévoré(e) par la meute des Loups-Garous.'
                });
              }
            }
          }

          if (nightTargetWitchKill) {
            const witchVictim = players.find(p => p.id === nightTargetWitchKill);
            if (witchVictim && !deadPlayerIds.has(witchVictim.id)) {
              deadPlayerIds.add(witchVictim.id);
              deathReasons.push({
                player: witchVictim,
                reason: 'Empoisonné(e) par la fiole mortelle de la Sorcière.'
              });
            }
          }

          const deadLovers = players.filter(p => deadPlayerIds.has(p.id) && p.isLover);
          if (deadLovers.length > 0) {
            const allLovers = players.filter(p => p.isLover);
            allLovers.forEach(l => {
              if (!deadPlayerIds.has(l.id)) {
                deadPlayerIds.add(l.id);
                deathReasons.push({
                  player: l,
                  reason: `Mort(e) de chagrin après la perte tragique de son grand amour (${deadLovers[0].name}).`
                });
              }
            });
          }

          const updatedPlayers = players.map(p => {
            const updated = { ...p };
            if (deadPlayerIds.has(p.id)) {
              updated.isAlive = false;
            }
            if (p.role === 'witch') {
              if (nightTargetWitchHeal) updated.hasUsedLifePotion = true;
              if (nightTargetWitchKill) updated.hasUsedDeathPotion = true;
            }
            return updated;
          });

          const hunterDied = updatedPlayers.find(p => p.role === 'hunter' && deadPlayerIds.has(p.id));

          sounds.playBell();

          const newLogs: GameLog[] = [...get().logs];
          if (deathReasons.length === 0) {
            newLogs.push({
              id: `${Date.now()}-morn-peace`,
              dayNumber,
              phase: 'DAY',
              message: 'Le village se réveille dans le calme : aucun mort n\'est à déplorer cette nuit !',
              timestamp: new Date(),
              type: 'INFO'
            });
          } else {
            deathReasons.forEach(d => {
              newLogs.push({
                id: `${Date.now()}-morn-${d.player.id}`,
                dayNumber,
                phase: 'DAY',
                message: `${d.player.name} (${ROLES[d.player.role].name}) : ${d.reason}`,
                timestamp: new Date(),
                type: 'DEATH'
              });
            });
          }

          set({
            players: updatedPlayers,
            lastDeaths: deathReasons,
            phase: hunterDied ? 'DAY_HUNTER' : 'DAY_START',
            hunterPendingPlayerId: hunterDied ? hunterDied.id : null,
            logs: newLogs,
            nightTargetGuard: null,
            nightTargetSeer: null,
            nightTargetWolf: null,
            nightTargetWitchHeal: false,
            nightTargetWitchKill: null,
            seerRevealedPlayer: null
          });

          get().checkVictory();
          return;
        }

        if (phase === 'DAY_START') {
          set({ phase: 'DAY_DISCUSS' });
          return;
        }

        if (phase === 'DAY_DISCUSS') {
          set({ phase: 'DAY_VOTE' });
          return;
        }

        if (phase === 'DAY_VOTE') {
          const nextDay = dayNumber + 1;
          set({
            dayNumber: nextDay,
            phase: 'NIGHT_START',
            lastDeaths: [],
            logs: [
              ...get().logs,
              {
                id: `${Date.now()}-night-${nextDay}`,
                dayNumber: nextDay,
                phase: 'NIGHT',
                message: `La nuit ${nextDay} tombe sur le village... Tout le monde s'endort.`,
                timestamp: new Date(),
                type: 'INFO'
              }
            ]
          });
          get().startNight();
          return;
        }
      },

      eliminatePlayer: (playerId, customReason) => {
        const { players, dayNumber } = get();
        const target = players.find(p => p.id === playerId);
        if (!target) return;

        const deadPlayerIds = new Set<string>([target.id]);
        const deathReasons = [
          {
            player: target,
            reason: customReason || 'Condamné(e) par le vote du village et mené(e) au bûcher.'
          }
        ];

        if (target.isLover) {
          const partner = players.find(p => p.isLover && p.id !== target.id);
          if (partner && partner.isAlive) {
            deadPlayerIds.add(partner.id);
            deathReasons.push({
              player: partner,
              reason: `Mort(e) de chagrin suite à l'exécution de son bien-aimé (${target.name}).`
            });
          }
        }

        const updatedPlayers = players.map(p => {
          if (deadPlayerIds.has(p.id)) {
            return { ...p, isAlive: false };
          }
          return p;
        });

        const isHunter = target.role === 'hunter';

        const updatedLogs = [...get().logs];
        deathReasons.forEach(d => {
          updatedLogs.push({
            id: `${Date.now()}-${d.player.id}-vote`,
            dayNumber,
            phase: 'DAY',
            message: `${d.player.name} (${ROLES[d.player.role].name}) a été éliminé par le village.`,
            timestamp: new Date(),
            type: 'DEATH'
          });
        });

        set({
          players: updatedPlayers,
          lastDeaths: deathReasons,
          phase: isHunter ? 'DAY_HUNTER' : 'DAY_START',
          hunterPendingPlayerId: isHunter ? target.id : null,
          logs: updatedLogs
        });

        get().checkVictory();
      },

      resolveHunterShot: (targetPlayerId) => {
        const { players, dayNumber } = get();
        const victim = players.find(p => p.id === targetPlayerId);
        if (!victim) return;

        sounds.playGunshot();

        const deadPlayerIds = new Set<string>([targetPlayerId]);
        const deathReasons = [
          {
            player: victim,
            reason: 'Abattu sur le coup par le dernier tir de mousquet du Chasseur.'
          }
        ];

        if (victim.isLover) {
          const partner = players.find(p => p.isLover && p.id !== victim.id);
          if (partner && partner.isAlive) {
            deadPlayerIds.add(partner.id);
            deathReasons.push({
              player: partner,
              reason: `Mort(e) de chagrin suite à la mort de son amour sous le tir du Chasseur.`
            });
          }
        }

        const updatedPlayers = players.map(p => {
          if (deadPlayerIds.has(p.id)) {
            return { ...p, isAlive: false };
          }
          return p;
        });

        const newLogs = [...get().logs];
        deathReasons.forEach(d => {
          newLogs.push({
            id: `${Date.now()}-hunter-${d.player.id}`,
            dayNumber,
            phase: 'DAY',
            message: `${d.player.name} (${ROLES[d.player.role].name}) : ${d.reason}`,
            timestamp: new Date(),
            type: 'DEATH'
          });
        });

        set({
          players: updatedPlayers,
          hunterPendingPlayerId: null,
          phase: 'DAY_START',
          lastDeaths: deathReasons,
          logs: newLogs
        });

        get().checkVictory();
      },

      setCaptain: (playerId) => {
        const { players } = get();
        const updated = players.map(p => ({
          ...p,
          isCaptain: p.id === playerId
        }));
        set({ players: updated });
      },

      addCustomLog: (message, type = 'INFO') => {
        const { logs, dayNumber, phase } = get();
        set({
          logs: [
            ...logs,
            {
              id: `${Date.now()}-custom`,
              dayNumber,
              phase: phase.startsWith('NIGHT') ? 'NIGHT' : 'DAY',
              message,
              timestamp: new Date(),
              type
            }
          ]
        });
      },

      checkVictory: () => {
        const { players, dayNumber } = get();
        const livingPlayers = players.filter(p => p.isAlive);
        
        if (livingPlayers.length === 0) {
          return null;
        }

        const livingLovers = livingPlayers.filter(p => p.isLover);
        if (livingPlayers.length === 2 && livingLovers.length === 2) {
          set({
            winner: 'LOVERS',
            phase: 'GAME_OVER',
            logs: [
              ...get().logs,
              {
                id: `${Date.now()}-win`,
                dayNumber,
                phase: 'DAY',
                message: 'Victoire des Amoureux ! L\'amour a triomphé des crocs et des trahisons.',
                timestamp: new Date(),
                type: 'VICTORY'
              }
            ]
          });
          return 'LOVERS';
        }

        const livingWhiteWolf = livingPlayers.filter(p => p.role === 'white_wolf');
        if (livingPlayers.length === 1 && livingWhiteWolf.length === 1) {
          set({
            winner: 'WHITE_WOLF',
            phase: 'GAME_OVER',
            logs: [
              ...get().logs,
              {
                id: `${Date.now()}-win`,
                dayNumber,
                phase: 'DAY',
                message: 'Le Loup Blanc est l\'unique survivant et dévore les restes de Thiercelieux !',
                timestamp: new Date(),
                type: 'VICTORY'
              }
            ]
          });
          return 'WHITE_WOLF';
        }

        const wolvesCount = livingPlayers.filter(p => p.role === 'werewolf' || p.role === 'white_wolf').length;
        const villageCount = livingPlayers.length - wolvesCount;

        if (wolvesCount >= villageCount && wolvesCount > 0) {
          set({
            winner: 'WEREWOLVES',
            phase: 'GAME_OVER',
            logs: [
              ...get().logs,
              {
                id: `${Date.now()}-win`,
                dayNumber,
                phase: 'DAY',
                message: 'Victoire des Loups-Garous ! Le village a été totalement décimé sous la lune de sang.',
                timestamp: new Date(),
                type: 'VICTORY'
              }
            ]
          });
          return 'WEREWOLVES';
        }

        if (wolvesCount === 0) {
          set({
            winner: 'VILLAGE',
            phase: 'GAME_OVER',
            logs: [
              ...get().logs,
              {
                id: `${Date.now()}-win`,
                dayNumber,
                phase: 'DAY',
                message: 'Victoire du Village ! Les monstres ont tous été exterminés, Thiercelieux est sauvé !',
                timestamp: new Date(),
                type: 'VICTORY'
              }
            ]
          });
          return 'VILLAGE';
        }

        return null;
      }
    }),
    {
      name: 'werewolf-storage',
      partialize: (state) => ({
        players: state.players,
        selectedRoles: state.selectedRoles,
        settings: state.settings,
        phase: state.phase,
        dayNumber: state.dayNumber,
        gameMode: state.gameMode,
        logs: state.logs,
        soundEnabled: state.soundEnabled,
        isSoundMuted: state.isSoundMuted
      })
    }
  )
);
