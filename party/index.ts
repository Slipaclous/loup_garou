import type * as Party from "partykit/server";
import { RoomState, RoomPlayer } from "../src/lib/multiplayerTypes";
import { getRecommendedDeck, ROLES, RoleId } from "../src/lib/roles";

export default class Server implements Party.Server {
  state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = {
      code: room.id.toUpperCase(),
      phase: 'LOBBY',
      dayNumber: 1,
      players: [],
      nightActions: {},
      dayVotes: {},
      logs: ['✦ La salle de rituel a été ouverte. En attente des âmes... ✦']
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Envoyer l'état actuel de la salle au nouvel arrivant
    conn.send(JSON.stringify({ type: 'SYNC_STATE', state: this.state }));
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'JOIN_ROOM': {
          const { playerId, name, isHost } = data;
          const existing = this.state.players.find(p => p.id === playerId);
          if (!existing) {
            this.state.players.push({
              id: playerId,
              name: name || `Âme ${this.state.players.length + 1}`,
              isAlive: true,
              isLover: false,
              isCaptain: false,
              isHost: !!isHost,
            });
            this.state.logs.push(`⚜ ${name} a rejoint l'assemblée.`);
          }
          this.broadcastState();
          break;
        }

        case 'START_GAME': {
          if (this.state.players.length >= 4) {
            const deck = getRecommendedDeck(this.state.players.length);
            const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

            this.state.players = this.state.players.map((p, idx) => ({
              ...p,
              role: shuffledDeck[idx] || 'villager',
              isAlive: true,
              isLover: false,
              isCaptain: false,
            }));

            this.state.phase = 'ROLE_REVEAL';
            this.state.logs.push('📜 Les rôles sacrés ont été scellés et distribués sur les téléphones !');
            this.broadcastState();
          }
          break;
        }

        case 'SET_PHASE': {
          this.state.phase = data.phase;
          if (data.activeNightStepId) {
            this.state.activeNightStepId = data.activeNightStepId;
          }
          if (data.phase === 'DAY') {
            this.state.dayVotes = {};
          }
          this.broadcastState();
          break;
        }

        case 'SUBMIT_NIGHT_ACTION': {
          const { stepId, targetId, extra } = data;
          if (stepId === 'werewolf') {
            this.state.nightActions.werewolfTargetId = targetId;
          } else if (stepId === 'guard') {
            this.state.nightActions.guardTargetId = targetId;
          } else if (stepId === 'seer') {
            this.state.nightActions.seerTargetId = targetId;
          } else if (stepId === 'witch') {
            if (extra?.heal) this.state.nightActions.witchHeal = true;
            if (extra?.killId) this.state.nightActions.witchKillId = extra.killId;
          } else if (stepId === 'cupid') {
            this.state.nightActions.lovers = extra?.lovers;
            if (extra?.lovers) {
              this.state.players = this.state.players.map(p => ({
                ...p,
                isLover: extra.lovers.includes(p.id)
              }));
            }
          }
          this.broadcastState();
          break;
        }

        case 'SUBMIT_DAY_VOTE': {
          const { voterId, targetId } = data;
          this.state.dayVotes[voterId] = targetId;
          this.broadcastState();
          break;
        }

        case 'EXECUTE_DAY_VOTE': {
          const { condemnedId } = data;
          const condemned = this.state.players.find(p => p.id === condemnedId);
          if (condemned) {
            condemned.isAlive = false;
            this.state.logs.push(`🔥 ${condemned.name} a été consumé(e) sur le bûcher.`);
          }
          this.broadcastState();
          break;
        }
      }
    } catch (e) {
      console.error("Erreur message WebSocket :", e);
    }
  }

  broadcastState() {
    this.room.broadcast(JSON.stringify({ type: 'SYNC_STATE', state: this.state }));
  }
}
