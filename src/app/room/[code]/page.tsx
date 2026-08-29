'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import usePartySocket from "partysocket/react";
import { QRCodeSVG } from 'qrcode.react';
import { RoleCard } from '@/components/game/RoleCard';
import { RoleArtwork } from '@/components/game/RoleArtwork';
import { RoomState, RoomPlayer } from '@/lib/multiplayerTypes';
import { ROLES, RoleId } from '@/lib/roles';
import { sounds } from '@/lib/sound';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string || '').toUpperCase();

  const [mounted, setMounted] = useState(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isRoleFlipped, setIsRoleFlipped] = useState(false);

  useEffect(() => {
    setMounted(true);
    let pid = localStorage.getItem('lg_player_id');
    let pname = localStorage.getItem('lg_player_name');
    const hostFlag = localStorage.getItem(`lg_host_${roomCode}`) === 'true';
    setIsHost(hostFlag);

    if (!pid) {
      pid = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem('lg_player_id', pid);
    }
    if (!pname) {
      pname = hostFlag ? 'Le Conteur (Hôte)' : `Joueur-${pid.substring(pid.length - 4)}`;
      localStorage.setItem('lg_player_name', pname);
    }

    setPlayerId(pid);
    setPlayerName(pname);
  }, [roomCode]);

  // Connexion WebSocket via PartySocket
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomCode,
    onMessage(event) {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'SYNC_STATE') {
          setRoomState(message.state);
        }
      } catch (err) {
        console.error("Erreur message WebSocket :", err);
      }
    },
    onOpen() {
      // S'enregistrer auprès du serveur
      if (playerId) {
        socket.send(JSON.stringify({
          type: 'JOIN_ROOM',
          playerId,
          name: playerName,
          isHost
        }));
      }
    }
  });

  if (!mounted || !roomState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-stone-400 font-medieval text-sm space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-600 border-t-white animate-spin" />
        <span>Connexion au Rituel Sacré [{roomCode}]...</span>
      </div>
    );
  }

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join` : '';

  // =========================================================================
  // 1. PHASE DE LOBBY (SALON D'ATTENTE)
  // =========================================================================
  if (roomState.phase === 'LOBBY') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full space-y-8 relative z-10">
        <div className="w-full altar-panel p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <img src="/images/textures/wax_seal.png" alt="Sceau" className="w-5 h-5 object-contain" />
                <span className="text-xs font-mono text-stone-400 uppercase font-bold tracking-widest">
                  Salle de Rituel Multijoueur
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
                Code : <span className="text-rose-400 tracking-widest">{roomCode}</span>
              </h1>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-xl">
              <QRCodeSVG value={`${joinUrl}?code=${roomCode}`} size={96} />
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medieval text-stone-300 font-bold uppercase tracking-wider">
                Âmes Connectées ({roomState.players.length}) :
              </span>
              <span className="text-[11px] font-mono text-stone-500">Min. 4 Joueurs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {roomState.players.map((p, idx) => (
                <div 
                  key={p.id}
                  className={`p-3 inquisition-box flex items-center gap-2.5 ${p.id === playerId ? 'border-stone-500' : ''}`}
                >
                  <span className="text-xs font-mono text-stone-400 font-bold">#{idx + 1}</span>
                  <span className="text-sm font-medieval font-bold text-white truncate">
                    {p.name} {p.isHost && '👑'} {p.id === playerId && '(Vous)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button
              disabled={roomState.players.length < 4}
              onClick={() => {
                socket.send(JSON.stringify({ type: 'START_GAME' }));
                sounds.playBell();
              }}
              className={`w-full py-4 rounded-xl font-medieval font-bold text-xs uppercase tracking-wider transition-all shadow-xl ${
                roomState.players.length >= 4
                  ? 'bg-rose-950 hover:bg-rose-900 border border-rose-700 text-white cursor-pointer'
                  : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
            >
              {roomState.players.length >= 4 
                ? 'Distribuer les Rôles sur les Téléphones →' 
                : `En attente de ${4 - roomState.players.length} âme(s) supplémentaire(s)...`}
            </button>
          ) : (
            <div className="p-4 bg-black/60 border border-stone-800 rounded-xl text-center">
              <p className="text-xs font-medieval text-stone-400">
                ⌛ En attente que l'hôte lance la partie...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PHASE DE RÉVÉLATION SECRÈTE DES RÔLES
  // =========================================================================
  if (roomState.phase === 'ROLE_REVEAL' && currentPlayer?.role) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full space-y-6 relative z-10">
        <div className="w-full altar-panel p-6 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-mono text-stone-400 uppercase tracking-widest font-bold block">
              ✦ Votre Rôle Secret ✦
            </span>
            <h2 className="text-2xl font-cinzel text-white font-bold">
              {currentPlayer.name}
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Touchez votre carte pour dévoiler votre allégeance en secret.
            </p>
          </div>

          <RoleCard
            roleId={currentPlayer.role}
            playerName={currentPlayer.name}
            isRevealed={isRoleFlipped}
            onToggleReveal={() => setIsRoleFlipped(!isRoleFlipped)}
            size="lg"
          />

          {isHost && (
            <button
              onClick={() => {
                socket.send(JSON.stringify({ type: 'SET_PHASE', phase: 'NIGHT', activeNightStepId: 'guard' }));
                sounds.startNightLoop();
              }}
              className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-medieval font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Faire Tomber la Nuit sur le Village 🌙
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PHASE DE NUIT : ÉCRAN SOMBRE / ACTION SECRÈTE SANS VIBRATION BRUYANTE
  // =========================================================================
  if (roomState.phase === 'NIGHT') {
    const isMyTurn = currentPlayer?.role === roomState.activeNightStepId;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full text-center space-y-6 relative z-10">
        <div className="w-full altar-panel p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-black border border-stone-800 mx-auto flex items-center justify-center text-xl shadow-inner">
              🌙
            </div>
            <h2 className="text-2xl font-cinzel text-white font-bold">
              {isMyTurn ? 'Votre Entité s\'Éveille' : 'Le Village Dort Paisiblement'}
            </h2>
            <p className="text-xs text-stone-400 font-serif italic">
              {isMyTurn 
                ? 'Agissez en silence depuis votre écran sans un geste suspect.' 
                : 'Fermez les yeux et gardez le silence jusqu\'à l\'aube.'}
            </p>
          </div>

          {isMyTurn && (
            <div className="space-y-3 pt-3 border-t border-stone-800 text-left">
              <span className="text-xs font-medieval text-stone-300 uppercase font-bold block">
                Désignez votre cible :
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {roomState.players.filter(p => p.isAlive).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      socket.send(JSON.stringify({
                        type: 'SUBMIT_NIGHT_ACTION',
                        stepId: roomState.activeNightStepId,
                        targetId: p.id
                      }));
                      if (roomState.activeNightStepId === 'guard') sounds.playShield();
                      if (roomState.activeNightStepId === 'werewolf') sounds.playBite();
                      if (roomState.activeNightStepId === 'seer') sounds.playWhisper();
                    }}
                    className="p-3 inquisition-box text-xs font-medieval font-bold text-white truncate cursor-pointer hover:border-stone-500"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isHost && (
            <div className="pt-4 border-t border-stone-800 space-y-2">
              <button
                onClick={() => {
                  socket.send(JSON.stringify({ type: 'SET_PHASE', phase: 'DAY' }));
                  sounds.playBell();
                }}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-medieval font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                ☀️ Réveiller le Village pour le Tribunal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. PHASE DU TRIBUNAL DE JOUR : VOTE SECRET DEPUIS LE TÉLÉPHONE
  // =========================================================================
  if (roomState.phase === 'DAY') {
    const hasVoted = !!roomState.dayVotes[playerId];

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full text-center space-y-6 relative z-10">
        <div className="w-full altar-panel-blood p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-stone-400 uppercase tracking-widest font-bold block">
              ☀️ Tribunal Populaire du Bûcher
            </span>
            <h2 className="text-2xl font-cinzel text-white font-bold">
              Votez pour le Condamné
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Désignez l'âme suspecte que vous souhaitez envoyer au bûcher.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-left">
            {roomState.players.filter(p => p.isAlive).map((p) => {
              const isSelected = roomState.dayVotes[playerId] === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    socket.send(JSON.stringify({
                      type: 'SUBMIT_DAY_VOTE',
                      voterId: playerId,
                      targetId: p.id
                    }));
                    sounds.playClick();
                  }}
                  className={`p-3 rounded-xl border text-xs font-medieval font-bold transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-stone-800 border-stone-500 text-white shadow-md'
                      : 'inquisition-box text-stone-300'
                  }`}
                >
                  {p.name} {isSelected && '🔥'}
                </button>
              );
            })}
          </div>

          {hasVoted && (
            <p className="text-xs font-medieval text-stone-400">
              ✓ Votre vote a été déposé secrètement dans l'urne.
            </p>
          )}

          {isHost && (
            <div className="pt-4 border-t border-stone-800 space-y-2">
              <button
                onClick={() => {
                  socket.send(JSON.stringify({ type: 'SET_PHASE', phase: 'NIGHT', activeNightStepId: 'werewolf' }));
                  sounds.startNightLoop();
                }}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-medieval font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                🌙 Clôturer le Vote & Endormir le Village
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
