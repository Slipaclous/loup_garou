import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoleId, ROLES, getRecommendedDeck } from './roles';
import { sounds } from './sound';

export type GamePhase = 
  | 'SETUP'
  | 'REVEAL_ROLES'
  | 'NIGHT_START'
  | 'NIGHT_ACTION'
  | 'DAY_START'
  | 'DAY_VOTE'
  | 'DAY_HUNTER'
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  role: RoleId;
  isAlive: boolean;
  isLover: boolean;
  isProtected: boolean;
  elderLives: number; // 2 for elder, 1 for normal
  isFoolRevealed: boolean;
  hasUsedLifePotion: boolean;
  hasUsedDeathPotion: boolean;
  isCaptain: boolean;
  customNotes?: string;
}

export interface GameLog {
  id: string;
  dayNumber: number;
  phase: 'NIGHT' | 'DAY';
  message: string;
  timestamp: Date;
  type: 'INFO' | 'DEATH' | 'ACTION' | 'VICTORY';
}

interface GameState {
  players: Player[];
  selectedRoles: RoleId[];
  gameMode: 'PASS_AND_PLAY' | 'GM_ASSISTANT';
  phase: GamePhase;
  dayNumber: number;
  activeNightStepIndex: number;
  nightSteps: RoleId[];
  nightTargetWolf: string | null;
  nightTargetWitchHeal: boolean;
  nightTargetWitchKill: string | null;
  nightTargetGuard: string | null;
  lastProtectedPlayerId: string | null;
  nightLoversChosen: [string, string] | null;
  hunterPendingPlayerId: string | null;
  seerRevealedPlayer: { player: Player; roleDef: typeof ROLES[RoleId] } | null;
  lastDeaths: { player: Player; reason: string }[];
  winner: 'VILLAGE' | 'WEREWOLVES' | 'LOVERS' | 'WHITE_WOLF' | null;
  logs: GameLog[];
  soundEnabled: boolean;

  // Actions
  toggleSound: () => void;
  setGameMode: (mode: 'PASS_AND_PLAY' | 'GM_ASSISTANT') => void;
  setPlayersList: (names: string[]) => void;
  setSelectedRoles: (roles: RoleId[]) => void;
  autoBalanceRoles: () => void;
  startGame: () => void;
  resetGame: () => void;
  
  // Night resolution
  startNight: () => void;
  nextNightStep: () => void;
  setNightTargetWolf: (playerId: string | null) => void;
  setNightGuardTarget: (playerId: string | null) => void;
  setNightCupidLovers: (p1: string, p2: string) => void;
  setNightSeerTarget: (playerId: string) => void;
  clearSeerTarget: () => void;
  setNightWitchActions: (heal: boolean, killPlayerId: string | null) => void;
  resolveNight: () => void;

  // Day resolution
  startVote: () => void;
  eliminatePlayer: (playerId: string, reason: string) => void;
  resolveHunterShot: (targetPlayerId: string) => void;
  setCaptain: (playerId: string) => void;
  addCustomLog: (message: string, type?: GameLog['type']) => void;
  checkVictory: () => 'VILLAGE' | 'WEREWOLVES' | 'LOVERS' | 'WHITE_WOLF' | null;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      selectedRoles: ['werewolf', 'werewolf', 'seer', 'witch', 'hunter', 'villager'],
      gameMode: 'PASS_AND_PLAY',
      phase: 'SETUP',
      dayNumber: 0,
      activeNightStepIndex: 0,
      nightSteps: [],
      nightTargetWolf: null,
      nightTargetWitchHeal: false,
      nightTargetWitchKill: null,
      nightTargetGuard: null,
      lastProtectedPlayerId: null,
      nightLoversChosen: null,
      hunterPendingPlayerId: null,
      seerRevealedPlayer: null,
      lastDeaths: [],
      winner: null,
      logs: [],
      soundEnabled: true,

      toggleSound: () => {
        const next = !get().soundEnabled;
        sounds.isMuted = !next;
        set({ soundEnabled: next });
      },

      setGameMode: (gameMode) => set({ gameMode }),

      setPlayersList: (names) => {
        const currentSelected = get().selectedRoles;
        let newRoles = [...currentSelected];
        if (newRoles.length !== names.length) {
          newRoles = getRecommendedDeck(names.length);
        }
        set({ selectedRoles: newRoles });
      },

      setSelectedRoles: (selectedRoles) => set({ selectedRoles }),

      autoBalanceRoles: () => {
        const count = get().players.length || 6;
        set({ selectedRoles: getRecommendedDeck(count) });
      },

      startGame: () => {
        const { selectedRoles } = get();
        // Mélanger les rôles
        const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
        
        // Charger les noms depuis l'état existant ou par défaut
        const state = get();
        let playerNames = state.players.map(p => p.name);
        if (playerNames.length !== shuffledRoles.length) {
          playerNames = Array.from({ length: shuffledRoles.length }, (_, i) => `Joueur ${i + 1}`);
        }

        const newPlayers: Player[] = playerNames.map((name, i) => {
          const role = shuffledRoles[i];
          return {
            id: `p-${i + 1}-${Date.now()}`,
            name: name.trim() || `Joueur ${i + 1}`,
            role: role,
            isAlive: true,
            isLover: false,
            isProtected: false,
            elderLives: role === 'elder' ? 2 : 1,
            isFoolRevealed: false,
            hasUsedLifePotion: false,
            hasUsedDeathPotion: false,
            isCaptain: false,
          };
        });

        sounds.playMagicChime();

        set({
          players: newPlayers,
          phase: 'REVEAL_ROLES',
          dayNumber: 0,
          winner: null,
          lastDeaths: [],
          logs: [
            {
              id: `${Date.now()}-start`,
              dayNumber: 0,
              phase: 'NIGHT',
              message: `La partie commence avec ${newPlayers.length} villageois réunis à Thiercelieux.`,
              timestamp: new Date(),
              type: 'INFO'
            }
          ]
        });
      },

      resetGame: () => {
        set({
          phase: 'SETUP',
          dayNumber: 0,
          winner: null,
          lastDeaths: [],
          seerRevealedPlayer: null,
          hunterPendingPlayerId: null,
          nightLoversChosen: null
        });
      },

      startNight: () => {
        const { players, dayNumber } = get();
        const nextDay = dayNumber + 1;

        // Calculer l'ordre des rôles qui se réveillent cette nuit
        const livingRoles = new Set(players.filter(p => p.isAlive).map(p => p.role));
        
        const orderedSteps: RoleId[] = [];
        
        // Cupidon : Seulement nuit 1
        if (nextDay === 1 && livingRoles.has('cupid')) {
          orderedSteps.push('cupid');
        }
        // Salvateur
        if (livingRoles.has('guard')) {
          orderedSteps.push('guard');
        }
        // Voyante
        if (livingRoles.has('seer')) {
          orderedSteps.push('seer');
        }
        // Loups-Garous
        if (livingRoles.has('werewolf') || livingRoles.has('white_wolf')) {
          orderedSteps.push('werewolf');
        }
        // Loup Blanc (1 nuit sur 2, ex: nuit 2, 4...)
        if (livingRoles.has('white_wolf') && nextDay % 2 === 0) {
          orderedSteps.push('white_wolf');
        }
        // Sorcière
        if (livingRoles.has('witch')) {
          const witchPlayer = players.find(p => p.role === 'witch' && p.isAlive);
          if (witchPlayer && (!witchPlayer.hasUsedLifePotion || !witchPlayer.hasUsedDeathPotion)) {
            orderedSteps.push('witch');
          }
        }

        sounds.playWolfHowl();

        set({
          phase: 'NIGHT_ACTION',
          dayNumber: nextDay,
          activeNightStepIndex: 0,
          nightSteps: orderedSteps,
          nightTargetWolf: null,
          nightTargetWitchHeal: false,
          nightTargetWitchKill: null,
          nightTargetGuard: null,
          seerRevealedPlayer: null,
          lastDeaths: [],
          logs: [
            ...get().logs,
            {
              id: `${Date.now()}-night`,
              dayNumber: nextDay,
              phase: 'NIGHT',
              message: `Nuit tombée sur Thiercelieux (Nuit ${nextDay}). Le village s'endort paisiblement...`,
              timestamp: new Date(),
              type: 'INFO'
            }
          ]
        });
      },

      nextNightStep: () => {
        const { activeNightStepIndex, nightSteps } = get();
        if (activeNightStepIndex + 1 < nightSteps.length) {
          set({
            activeNightStepIndex: activeNightStepIndex + 1,
            seerRevealedPlayer: null
          });
        } else {
          // Toutes les actions de nuit sont terminées -> Résolution du matin
          get().resolveNight();
        }
      },

      setNightTargetWolf: (playerId) => set({ nightTargetWolf: playerId }),
      setNightGuardTarget: (playerId) => set({ nightTargetGuard: playerId }),
      
      setNightCupidLovers: (p1, p2) => {
        const { players } = get();
        const updated = players.map(p => {
          if (p.id === p1 || p.id === p2) {
            return { ...p, isLover: true };
          }
          return p;
        });
        set({ players: updated, nightLoversChosen: [p1, p2] });
      },

      setNightSeerTarget: (playerId) => {
        const { players } = get();
        const target = players.find(p => p.id === playerId);
        if (target) {
          sounds.playMagicChime();
          set({
            seerRevealedPlayer: {
              player: target,
              roleDef: ROLES[target.role]
            }
          });
        }
      },

      clearSeerTarget: () => set({ seerRevealedPlayer: null }),

      setNightWitchActions: (heal, killPlayerId) => {
        set({
          nightTargetWitchHeal: heal,
          nightTargetWitchKill: killPlayerId
        });
      },

      resolveNight: () => {
        const {
          players,
          nightTargetWolf,
          nightTargetWitchHeal,
          nightTargetWitchKill,
          nightTargetGuard,
          dayNumber
        } = get();

        const deadPlayerIds = new Set<string>();
        const deathReasons: { player: Player; reason: string }[] = [];

        // 1. Morsure des loups
        if (nightTargetWolf) {
          // Vérifier si le joueur est protégé par le Salvateur
          const isProtected = nightTargetGuard === nightTargetWolf;
          // Vérifier si la Sorcière soigne
          const isHealed = nightTargetWitchHeal;

          const victim = players.find(p => p.id === nightTargetWolf);

          if (victim) {
            if (isProtected || isHealed) {
              // Sauvé !
            } else if (victim.role === 'elder' && victim.elderLives > 1) {
              // L'Ancien résiste à 1 attaque
              victim.elderLives -= 1;
            } else {
              deadPlayerIds.add(victim.id);
              deathReasons.push({
                player: victim,
                reason: 'Dévoré(e) sauvagement par les Loups-Garous durant son sommeil.'
              });
            }
          }
        }

        // 2. Potion de mort de la Sorcière
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

        // 3. Répercussion des Amoureux (Si l'un meurt, l'autre meurt de chagrin)
        const lovers = players.filter(p => p.isLover);
        if (lovers.length === 2) {
          const deadLover = lovers.find(l => deadPlayerIds.has(l.id));
          const survivingLover = lovers.find(l => !deadPlayerIds.has(l.id));
          if (deadLover && survivingLover) {
            deadPlayerIds.add(survivingLover.id);
            deathReasons.push({
              player: survivingLover,
              reason: `Mort(e) de chagrin suite à la perte de son amour éternel (${deadLover.name}).`
            });
          }
        }

        // 4. Mettre à jour l'état des joueurs
        const updatedPlayers = players.map(p => {
          let updated = { ...p };
          if (deadPlayerIds.has(p.id)) {
            updated.isAlive = false;
          }
          if (p.role === 'witch') {
            if (nightTargetWitchHeal) updated.hasUsedLifePotion = true;
            if (nightTargetWitchKill) updated.hasUsedDeathPotion = true;
          }
          return updated;
        });

        // 5. Vérifier si un Chasseur est mort durant la nuit
        const hunterDied = updatedPlayers.find(p => p.role === 'hunter' && deadPlayerIds.has(p.id));

        sounds.playBell();
        if (deathReasons.length > 0) {
          setTimeout(() => sounds.playDeath(), 600);
        }

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
              id: `${Date.now()}-${d.player.id}`,
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
          phase: hunterDied ? 'DAY_HUNTER' : 'DAY_START',
          hunterPendingPlayerId: hunterDied ? hunterDied.id : null,
          lastProtectedPlayerId: nightTargetGuard,
          lastDeaths: deathReasons,
          logs: newLogs
        });

        // Vérification de victoire
        get().checkVictory();
      },

      startVote: () => {
        set({ phase: 'DAY_VOTE' });
      },

      eliminatePlayer: (playerId, reason) => {
        const { players, dayNumber } = get();
        const target = players.find(p => p.id === playerId);
        if (!target) return;

        // Cas spécial de l'Idiot du Village
        if (target.role === 'fool' && !target.isFoolRevealed) {
          sounds.playMagicChime();
          const updated = players.map(p => p.id === playerId ? { ...p, isFoolRevealed: true } : p);
          set({
            players: updated,
            logs: [
              ...get().logs,
              {
                id: `${Date.now()}-fool`,
                dayNumber,
                phase: 'DAY',
                message: `${target.name} est l'Idiot du Village ! Le village est pris de pitié et l'épargne. Mais il perd son droit de vote.`,
                timestamp: new Date(),
                type: 'ACTION'
              }
            ]
          });
          return;
        }

        const deadPlayerIds = new Set<string>([playerId]);
        const deathReasons: { player: Player; reason: string }[] = [
          { player: target, reason }
        ];

        // Vérifier les amoureux
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

        sounds.playDeath();

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

        // Victoire des Amoureux : s'ils ne sont que 2 en vie et qu'ils sont amoureux
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

        // Victoire du Loup Blanc seul
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

        // Victoire des Loups : ils sont égaux ou supérieurs en nombre aux villageois
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

        // Victoire des Villageois : tous les loups sont éliminés
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
      name: 'loup-garou-party-state',
      partialize: (state) => ({
        players: state.players,
        selectedRoles: state.selectedRoles,
        gameMode: state.gameMode,
        phase: state.phase,
        dayNumber: state.dayNumber,
        winner: state.winner,
        logs: state.logs,
        soundEnabled: state.soundEnabled
      })
    }
  )
);
