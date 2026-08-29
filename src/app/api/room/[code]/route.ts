import { NextRequest, NextResponse } from 'next/server';
import { RoomState } from '@/lib/multiplayerTypes';
import { getRecommendedDeck } from '@/lib/roles';

// Mémoire locale des salons
const globalRooms: Record<string, RoomState> = {};

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  if (!globalRooms[roomCode]) {
    globalRooms[roomCode] = {
      code: roomCode,
      phase: 'LOBBY',
      dayNumber: 1,
      players: [],
      nightActions: {},
      dayVotes: {},
      logs: ['✦ La salle de rituel a été ouverte. En attente des âmes... ✦']
    };
  }

  return Response.json({ state: globalRooms[roomCode] });
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const body = await req.json();

  if (!globalRooms[roomCode]) {
    globalRooms[roomCode] = {
      code: roomCode,
      phase: 'LOBBY',
      dayNumber: 1,
      players: [],
      nightActions: {},
      dayVotes: {},
      logs: ['✦ La salle de rituel a été ouverte. En attente des âmes... ✦']
    };
  }

  const room = globalRooms[roomCode];

  switch (body.type) {
    case 'JOIN_ROOM': {
      const { playerId, name, isHost } = body;
      const existing = room.players.find(p => p.id === playerId);
      if (!existing) {
        room.players.push({
          id: playerId,
          name: name || `Âme ${room.players.length + 1}`,
          isAlive: true,
          isLover: false,
          isCaptain: false,
          isHost: !!isHost,
        });
        room.logs.push(`⚜ ${name} a rejoint l'assemblée.`);
      }
      break;
    }

    case 'START_GAME': {
      if (room.players.length >= 4) {
        const deck = getRecommendedDeck(room.players.length);
        const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

        room.players = room.players.map((p, idx) => ({
          ...p,
          role: shuffledDeck[idx] || 'villager',
          isAlive: true,
          isLover: false,
          isCaptain: false,
        }));

        room.phase = 'ROLE_REVEAL';
        room.logs.push('📜 Les rôles sacrés ont été distribués sur les téléphones !');
      }
      break;
    }

    case 'SET_PHASE': {
      room.phase = body.phase;
      if (body.activeNightStepId) {
        room.activeNightStepId = body.activeNightStepId;
      }
      if (body.phase === 'DAY') {
        room.dayVotes = {};
      }
      break;
    }

    case 'SUBMIT_NIGHT_ACTION': {
      const { stepId, targetId, extra } = body;
      if (stepId === 'werewolf') {
        room.nightActions.werewolfTargetId = targetId;
      } else if (stepId === 'guard') {
        room.nightActions.guardTargetId = targetId;
      } else if (stepId === 'seer') {
        room.nightActions.seerTargetId = targetId;
      } else if (stepId === 'witch') {
        if (extra?.heal) room.nightActions.witchHeal = true;
        if (extra?.killId) room.nightActions.witchKillId = extra.killId;
      } else if (stepId === 'cupid') {
        room.nightActions.lovers = extra?.lovers;
        if (extra?.lovers) {
          room.players = room.players.map(p => ({
            ...p,
            isLover: extra.lovers.includes(p.id)
          }));
        }
      }
      break;
    }

    case 'SUBMIT_DAY_VOTE': {
      const { voterId, targetId } = body;
      room.dayVotes[voterId] = targetId;
      break;
    }
  }

  return Response.json({ state: room });
}
