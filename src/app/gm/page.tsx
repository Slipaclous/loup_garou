'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleArtwork } from '@/components/game/RoleArtwork';
import { RoleCard } from '@/components/game/RoleCard';
import { useGameStore, Player } from '@/lib/store';
import { ROLES, RoleId, DEFAULT_PLAYER_NAMES, getRecommendedDeck } from '@/lib/roles';
import { sounds } from '@/lib/sound';
import confetti from 'canvas-confetti';

export default function GameMasterPage() {
  const {
    players,
    logs,
    eliminatePlayer,
    setCaptain,
    setNightCupidLovers,
    resolveHunterShot,
    startGame,
    resetGame,
    dayNumber,
    winner,
    phase,
    settings
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  
  // Modals & Révélations
  const [isRevealingRoles, setIsRevealingRoles] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // Tir du Chasseur + Révélation de la Victime du Chasseur
  const [hunterShootingPlayer, setHunterShootingPlayer] = useState<Player | null>(null);
  const [hunterVictimPlayer, setHunterVictimPlayer] = useState<Player | null>(null);
  const [isHunterVictimFlipped, setIsHunterVictimFlipped] = useState(false);

  // Révélations Matin et Jour
  const [isMorningRevealActive, setIsMorningRevealActive] = useState(false);
  const [morningDeaths, setMorningDeaths] = useState<{ player: Player; roleDef: typeof ROLES.werewolf; reason: string }[]>([]);
  const [morningDeathCardFlipped, setMorningDeathCardFlipped] = useState<Record<string, boolean>>({});
  const [isDayVoteRevealActive, setIsDayVoteRevealActive] = useState(false);
  const [executedPlayer, setExecutedPlayer] = useState<Player | null>(null);
  const [isDayCardFlipped, setIsDayCardFlipped] = useState(false);

  // Déroulé Nuit / Jour
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeCycleTab, setActiveCycleTab] = useState<'NIGHT' | 'DAY'>('NIGHT');
  
  // Sablier du Tribunal & Débats
  const [timerDuration, setTimerDuration] = useState(120);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Cibles
  const [targetWolf, setTargetWolf] = useState<string | null>(null);
  const [targetGuard, setTargetGuard] = useState<string | null>(null);
  const [targetLovers, setTargetLovers] = useState<string[]>([]);
  const [witchHeals, setWitchHeals] = useState(false);
  const [witchKillsId, setWitchKillsId] = useState<string | null>(null);
  const [seerTargetId, setSeerTargetId] = useState<string | null>(null);

  const hasLoversBeenChosen = players.filter(p => p.isLover).length >= 2 || targetLovers.length >= 2;
  const seerPlayer = players.find(p => p.role === 'seer');
  const guardPlayer = players.find(p => p.role === 'guard');
  const isSeerPowerAvailable = seerPlayer?.isAlive && (!settings?.seerSingleUse || !seerPlayer?.hasUsedSeerPower);
  const isGuardPowerAvailable = guardPlayer?.isAlive && (!settings?.guardSingleUse || !guardPlayer?.hasUsedGuardPower);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gestion du Minuteur du Tribunal de Jour avec Battement de Coeur & Gong
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev - 1;
          if (next <= 15 && next > 0) {
            sounds.playHeartbeat();
          }
          return next;
        });
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sounds.playGong();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    if (phase === 'GAME_OVER' || winner) {
      sounds.stopNightLoop();
      sounds.playBell();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  }, [phase, winner]);

  useEffect(() => {
    if (activeCycleTab === 'NIGHT' && !isRevealingRoles && !isMorningRevealActive && !isDayVoteRevealActive && !hunterShootingPlayer && !hunterVictimPlayer && phase !== 'GAME_OVER') {
      sounds.startNightLoop();
    } else {
      sounds.stopNightLoop();
    }
    return () => sounds.stopNightLoop();
  }, [activeCycleTab, isRevealingRoles, isMorningRevealActive, isDayVoteRevealActive, hunterShootingPlayer, hunterVictimPlayer, phase]);

  const handleQuickDemoGame = () => {
    useGameStore.setState({
      selectedRoles: getRecommendedDeck(8),
      players: DEFAULT_PLAYER_NAMES.map((name, i) => ({
        id: `p-${i}-${Date.now()}`,
        name,
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
        isCaptain: false,
      }))
    });
    startGame();
    setIsRevealingRoles(true);
    setRevealIndex(0);
    setIsCardFlipped(false);
  };

  const handleExecutePlayer = (p: Player) => {
    eliminatePlayer(p.id, 'Condamné et brûlé sur la place publique par le village.');
    setExecutedPlayer(p);
    setIsDayCardFlipped(false);
    setIsDayVoteRevealActive(true);
  };

  const startTimer = (seconds: number) => {
    setTimerDuration(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
    sounds.playClick();
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    sounds.playClick();
  };

  const resetTimer = (seconds: number = timerDuration) => {
    setIsTimerRunning(false);
    setTimerSeconds(seconds);
    sounds.playClick();
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-stone-500 font-mono text-xs">
        Invocation du Rituel...
      </div>
    );
  }

  const livingPlayers = (players || []).filter((p) => p.isAlive);
  const deadPlayers = (players || []).filter((p) => !p.isAlive);
  const witchPlayer = players.find((p) => p.role === 'witch');

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timerPercentage = (timerSeconds / timerDuration) * 100;

  // =========================================================================
  // ÉCRAN DE FIN DE PARTIE
  // =========================================================================
  if (phase === 'GAME_OVER' && winner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-xl mx-auto w-full text-center space-y-6">
        <div className="w-full bg-gradient-to-b from-[#180a10] via-[#0d0508] to-[#040102] border-2 border-amber-600/70 rounded-3xl p-8 space-y-6 shadow-[0_0_60px_rgba(217,119,6,0.25)] candle-glow">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-red-700 mx-auto flex items-center justify-center text-4xl shadow-2xl border border-amber-400/40">
            ⚜
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest block">
              ✦ Le Sang a Coulé — Thiercelieux S'éteint ✦
            </span>
            <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white tracking-wide">
              {winner === 'WEREWOLVES' && 'Triomphe des Bêtes'}
              {winner === 'VILLAGE' && 'Rédemption du Village'}
              {winner === 'LOVERS' && 'Triomphe de l\'Amour Interdit'}
              {winner === 'WHITE_WOLF' && 'Festin Solitaire du Loup Blanc'}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-black/70 p-4 rounded-2xl border border-red-900/30 font-serif italic">
            « {logs[logs.length - 1]?.message} »
          </p>

          <div className="space-y-2 pt-3 border-t border-stone-800 text-left">
            <span className="text-[11px] font-medieval text-stone-400 uppercase font-bold tracking-wider block">
              Véritables Natures Révélées :
            </span>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {players.map((p) => {
                const r = ROLES[p.role] || ROLES.villager;
                return (
                  <div key={p.id} className="flex justify-between items-center text-stone-200 p-2.5 rounded-xl bg-black/60 border border-stone-800">
                    <span className="font-medieval font-bold">{p.name} {p.isLover ? '♥' : ''} {!p.isAlive ? '☠️' : '✨'}</span>
                    <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full border" style={{ color: r.color, backgroundColor: `${r.color}15`, borderColor: `${r.color}40` }}>
                      {r.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              resetGame();
              window.location.href = '/setup';
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-900 via-amber-800 to-red-900 hover:opacity-95 text-white font-medieval font-bold text-sm uppercase tracking-wider shadow-2xl transition-all cursor-pointer border border-amber-600/50"
          >
            Commencer une Nouvelle Traque &rarr;
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RÉVÉLATION SECRÈTE DES CARTES
  // =========================================================================
  if (isRevealingRoles && players.length > 0) {
    const currentPlayer = players[revealIndex] || players[0];

    const handleNextPlayer = () => {
      setIsCardFlipped(false);
      if (revealIndex + 1 < players.length) {
        setRevealIndex(revealIndex + 1);
      } else {
        setIsRevealingRoles(false);
        setActiveCycleTab('NIGHT');
        setCurrentStepIndex(0);
        sounds.startNightLoop();
      }
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#160a12] via-[#090408] to-[#030103] border-2 border-amber-700/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold block">
              Sceau Sacré #{revealIndex + 1} / {players.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel text-white font-bold">
              Passez la stèle à <span className="text-amber-300 underline underline-offset-4">{currentPlayer.name}</span>
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Touchez le sceau pour sonder votre rôle secret, puis dissimulez-le.
            </p>
          </div>

          <RoleCard
            roleId={currentPlayer.role}
            playerName={currentPlayer.name}
            isRevealed={isCardFlipped}
            onToggleReveal={() => setIsCardFlipped(!isCardFlipped)}
            size="lg"
          />

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleNextPlayer}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-900 via-amber-800 to-red-900 hover:opacity-95 text-white font-medieval font-bold text-xs shadow-xl uppercase tracking-wider cursor-pointer border border-amber-600/40"
            >
              {revealIndex + 1 < players.length ? 'Âme Suivante &rarr;' : 'Tomber la Nuit 🌙'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. MODAL DU TIR DU CHASSEUR : SÉLECTION DE LA CIBLE
  // =========================================================================
  if (hunterShootingPlayer) {
    const targets = livingPlayers.filter(p => p.id !== hunterShootingPlayer.id);

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#220e06] to-[#0a0301] border-2 border-orange-600 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-[0_0_60px_rgba(234,88,12,0.35)] animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-orange-950 border border-orange-500 flex items-center justify-center text-3xl shadow-lg">
            💥
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
              Ultime Tir du Chasseur
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {hunterShootingPlayer.name} dégaine son arme !
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto font-serif italic">
              « Dans son dernier souffle d’agonie, le chasseur abat une cible parmi les vivants : »
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {targets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playGunshot();
                    resolveHunterShot(p.id);
                    setHunterVictimPlayer(p);
                    setIsHunterVictimFlipped(false);
                    setHunterShootingPlayer(null);
                    setIsDayVoteRevealActive(false);
                    setIsMorningRevealActive(false);
                    setExecutedPlayer(null);
                  }}
                  className="p-4 bg-[#1a0b05] border border-orange-700/60 hover:border-orange-400 hover:bg-orange-950 rounded-2xl text-xs font-bold text-orange-100 truncate transition-all cursor-pointer shadow-lg hover:scale-105"
                >
                  <span className="block text-sm font-medieval text-white mb-0.5">{p.name}</span>
                  <span className="text-[10px] text-orange-400 font-mono">Abattre 🎯</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. RÉVÉLATION DE LA VICTIME DU CHASSEUR (CARTE RETOURNÉE)
  // =========================================================================
  if (hunterVictimPlayer) {
    const roleDef = ROLES[hunterVictimPlayer.role] || ROLES.villager;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6 animate-fadeIn">
        <div className="w-full bg-gradient-to-b from-[#220d09] via-[#0d0504] to-[#040101] border-2 border-orange-600/70 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
              💥 Balle Fatale du Chasseur
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {isHunterVictimFlipped ? `${hunterVictimPlayer.name} a succombé` : 'La Cible du Chasseur'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {isHunterVictimFlipped 
                ? `Le mousquet du chasseur a transpercé :` 
                : `Tournez l'écran vers le village et touchez la carte pour découvrir l'identité de ${hunterVictimPlayer.name} :`}
            </p>
          </div>

          <RoleCard
            roleId={hunterVictimPlayer.role}
            playerName={isHunterVictimFlipped ? hunterVictimPlayer.name : 'Victime du Tir'}
            isRevealed={isHunterVictimFlipped}
            onToggleReveal={() => {
              const next = !isHunterVictimFlipped;
              setIsHunterVictimFlipped(next);
              if (next) sounds.playDeath();
            }}
            size="lg"
          />

          {isHunterVictimFlipped && (
            <div className="p-4 bg-black/80 border-2 rounded-2xl text-center space-y-1 max-w-md w-full shadow-lg" style={{ borderColor: roleDef.color }}>
              <span className="text-xs font-medieval font-bold uppercase" style={{ color: roleDef.color }}>
                {roleDef.team === 'WEREWOLVES' ? '🐺 Une Bête Abattue !' : '🛡️ Un Innocent Frappé par la Balle...'}
              </span>
              <h4 className="text-xl font-cinzel font-bold text-white">{hunterVictimPlayer.name} était {roleDef.name}</h4>
              <p className="text-xs text-stone-400 italic pt-1 font-serif">{roleDef.shortDesc}</p>
            </div>
          )}

          <button
            onClick={() => {
              setHunterVictimPlayer(null);
              setIsHunterVictimFlipped(false);
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-800 to-amber-700 hover:opacity-95 text-white font-medieval font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all"
          >
            Poursuivre la Séance &rarr;
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RÉVÉLATION MATIN
  // =========================================================================
  if (isMorningRevealActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#160c18] via-[#0c060d] to-[#040104] border-2 border-amber-600/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
              Le Voile de la Nuit se Dissipe ☀️
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {morningDeaths.length > 0 ? 'Tribut Funèbre de la Nuit' : 'Une Aube Paisible'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {morningDeaths.length > 0
                ? 'Tournez la stèle vers l\'assemblée et touchez la carte pour révéler la victime :'
                : 'Les cloches du village sonnent : aucun mort à déplorer cette nuit.'}
            </p>
          </div>

          {morningDeaths.length > 0 ? (
            <div className="space-y-6 w-full flex flex-col items-center">
              {morningDeaths.map((d, index) => {
                const isFlipped = morningDeathCardFlipped[d.player.id] || false;
                const isHunter = d.player.role === 'hunter';
                return (
                  <div key={d.player.id} className="flex flex-col items-center space-y-3 w-full">
                    <h3 className="text-xl font-cinzel font-bold text-white">
                      {isFlipped ? (
                        <span className="text-red-400 underline underline-offset-4">{d.player.name}</span>
                      ) : (
                        <span className="text-stone-400 italic">« Qui a péri sous les crocs ? »</span>
                      )}
                    </h3>

                    <RoleCard
                      roleId={d.player.role}
                      playerName={isFlipped ? d.player.name : 'Mystère...'}
                      isRevealed={isFlipped}
                      onToggleReveal={() => {
                        const next = !isFlipped;
                        setMorningDeathCardFlipped({ ...morningDeathCardFlipped, [d.player.id]: next });
                        if (next) sounds.playDeath();
                      }}
                      size="lg"
                    />

                    {isFlipped && (
                      <div className="p-3.5 bg-red-950/80 border border-red-700/60 rounded-2xl text-xs text-red-200 max-w-sm text-center shadow-lg">
                        <p className="font-medieval font-bold"><strong>{d.player.name}</strong> ({d.roleDef.name})</p>
                        <p className="text-[11px] text-red-300/80 mt-0.5 font-serif italic">{d.reason}</p>
                      </div>
                    )}

                    {isFlipped && isHunter && (
                      <button
                        onClick={() => {
                          setIsMorningRevealActive(false);
                          setHunterShootingPlayer(d.player);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-medieval font-bold text-xs uppercase shadow-lg cursor-pointer animate-pulse"
                      >
                        💥 Déclencher le Tir du Chasseur &rarr;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl text-emerald-300 font-bold space-y-2">
              <div className="text-4xl">🕊️</div>
              <p className="text-sm font-serif italic">Le village se réveille indemne. La protection ou la sorcellerie ont triomphé !</p>
            </div>
          )}

          <button
            onClick={() => {
              setIsMorningRevealActive(false);
              setActiveCycleTab('DAY');
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-700 to-red-800 hover:opacity-90 text-white font-medieval font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
          >
            Ouvrir le Tribunal du Bûcher &rarr;
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RÉVÉLATION DU CONDAMNÉ DE JOUR
  // =========================================================================
  if (isDayVoteRevealActive && executedPlayer) {
    const roleDef = ROLES[executedPlayer.role] || ROLES.villager;
    const isHunter = executedPlayer.role === 'hunter';

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#1c0a10] via-[#0b0406] to-[#040102] border-2 border-red-700/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest font-bold">
              🔥 Sentence Exécutée sur la Place Publique
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {isDayCardFlipped ? `${executedPlayer.name} est consumé(e)` : 'Verdict de l\'Inquisition'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {isDayCardFlipped ? 'Le bûcher révèle sa véritable allégeance :' : `Touchez la stèle pour dévoiler l'identité de ${executedPlayer.name} :`}
            </p>
          </div>

          <RoleCard
            roleId={executedPlayer.role}
            playerName={isDayCardFlipped ? executedPlayer.name : 'Condamné au Bûcher'}
            isRevealed={isDayCardFlipped}
            onToggleReveal={() => {
              const next = !isDayCardFlipped;
              setIsDayCardFlipped(next);
              if (next) sounds.playDeath();
            }}
            size="lg"
          />

          {isDayCardFlipped && (
            <div className="p-4 bg-black/80 border-2 rounded-2xl text-center space-y-1 max-w-md w-full shadow-lg" style={{ borderColor: roleDef.color }}>
              <span className="text-xs font-medieval font-bold uppercase" style={{ color: roleDef.color }}>
                {roleDef.team === 'WEREWOLVES' ? '🐺 Une Créature Démoniaque Brûle !' : '🛡️ Un Innocent Exterminé...'}
              </span>
              <h4 className="text-xl font-cinzel font-bold text-white">{executedPlayer.name} était {roleDef.name}</h4>
              <p className="text-xs text-stone-400 italic pt-1 font-serif">{roleDef.shortDesc}</p>
            </div>
          )}

          {isDayCardFlipped && isHunter && (
            <button
              onClick={() => {
                setIsDayVoteRevealActive(false);
                setHunterShootingPlayer(executedPlayer);
              }}
              className="w-full py-3.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-medieval font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              💥 Déclencher le Tir Fatal du Chasseur &rarr;
            </button>
          )}

          <button
            onClick={() => {
              setIsDayVoteRevealActive(false);
              setExecutedPlayer(null);
              setIsDayCardFlipped(false);
            }}
            className="px-8 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-medieval font-bold text-xs uppercase cursor-pointer border border-stone-700"
          >
            Retourner au Tribunal &rarr;
          </button>
        </div>
      </div>
    );
  }

  // Étapes de nuit
  const nightStepsSequence = [
    {
      id: 'cupid',
      roleName: 'Cupidon',
      title: '1. Cupidon — Les Liens Éternels',
      script: '« Cupidon s\'éveille dans l\'obscurité et lie à jamais deux âmes au destin tragique... »',
      hint: 'Désignez les 2 amoureux puis effleurez-les discrètement.',
      roleDef: ROLES.cupid,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '✨ Magie Cupidon',
      condition: !hasLoversBeenChosen && dayNumber <= 1 && players.some(p => p.role === 'cupid' && p.isAlive),
    },
    {
      id: 'guard',
      roleName: 'Salvateur',
      title: '2. Salvateur — Bouclier Protecteur',
      script: '« Le Salvateur étend son manteau sacré sur l\'âme de son choix pour conjurer la mort... »',
      hint: settings?.guardSingleUse ? 'Action Unique pour la partie !' : 'Ne peut pas protéger la même personne deux nuits de suite.',
      roleDef: ROLES.guard,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '🛡️ Protection',
      condition: isGuardPowerAvailable,
    },
    {
      id: 'seer',
      roleName: 'Voyante',
      title: '3. Voyante — Vision Astrale',
      script: '« La Voyante scrute le voile de l\'illusion et me désigne l\'âme dont elle veut sonder la nature... »',
      hint: settings?.seerSingleUse ? 'Action Unique pour la partie !' : 'Dévoilez-lui silencieusement la carte du joueur choisi.',
      roleDef: ROLES.seer,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '🔮 Oeil Astral',
      condition: isSeerPowerAvailable,
    },
    {
      id: 'werewolf',
      roleName: 'Loups-Garous',
      title: '4. Loups-Garous — La Chasse de Sang',
      script: '« Les Loups-Garous ouvrent leurs yeux écarlates, se reconnaissent et choisissent leur proie... »',
      hint: 'Désignez en silence la victime choisie par la meute.',
      roleDef: ROLES.werewolf,
      soundAction: () => sounds.playWolfHowl(),
      soundLabel: '🐺 Hurlement Meute',
      condition: players.some(p => (p.role === 'werewolf' || p.role === 'white_wolf') && p.isAlive),
    },
    {
      id: 'witch',
      roleName: 'Sorcière',
      title: '5. Sorcière — Les Fioles Maléfiques',
      script: '« La Sorcière s\'éveille... Veut-elle user de son élixir de résurrection ou verser son poison mortel ? »',
      hint: 'Chaque fiole est consommable une seule fois dans la partie !',
      roleDef: ROLES.witch,
      soundAction: () => sounds.playPotion(),
      soundLabel: '🧪 Potions',
      condition: players.some(p => p.role === 'witch' && p.isAlive),
    }
  ].filter(s => s.condition !== false);

  const activeNightStep = nightStepsSequence[currentStepIndex] || nightStepsSequence[0];

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = nightStepsSequence[index];
    if (step && step.soundAction) step.soundAction();
  };

  const handleWakeUpVillage = () => {
    sounds.stopNightLoop();
    sounds.playBell();

    const deaths: { player: Player; roleDef: typeof ROLES.werewolf; reason: string }[] = [];

    if (witchPlayer && (witchHeals || witchKillsId)) {
      const updated = players.map(p => {
        if (p.role === 'witch') {
          return {
            ...p,
            hasUsedLifePotion: witchHeals ? true : p.hasUsedLifePotion,
            hasUsedDeathPotion: witchKillsId ? true : p.hasUsedDeathPotion
          };
        }
        return p;
      });
      useGameStore.setState({ players: updated });
    }

    if (targetWolf && targetWolf !== targetGuard && !witchHeals) {
      const wolfVictim = players.find(p => p.id === targetWolf);
      if (wolfVictim) {
        eliminatePlayer(targetWolf, 'Dévoré(e) par la meute des Loups-Garous.');
        deaths.push({
          player: wolfVictim,
          roleDef: ROLES[wolfVictim.role] || ROLES.villager,
          reason: 'Dévoré(e) par les Loups-Garous durant la nuit.'
        });

        if (wolfVictim.isLover) {
          const loverPartner = players.find(p => p.isLover && p.id !== wolfVictim.id && p.isAlive);
          if (loverPartner) {
            deaths.push({
              player: loverPartner,
              roleDef: ROLES[loverPartner.role] || ROLES.villager,
              reason: `Mort(e) de chagrin suite à la mort de son bien-aimé (${wolfVictim.name}).`
            });
          }
        }
      }
    }

    if (witchKillsId) {
      const witchVictim = players.find(p => p.id === witchKillsId);
      if (witchVictim && witchVictim.id !== targetWolf) {
        eliminatePlayer(witchKillsId, 'Empoisonné(e) par la Sorcière.');
        deaths.push({
          player: witchVictim,
          roleDef: ROLES[witchVictim.role] || ROLES.villager,
          reason: 'Empoisonné(e) par le breuvage mortel de la Sorcière.'
        });

        if (witchVictim.isLover) {
          const loverPartner = players.find(p => p.isLover && p.id !== witchVictim.id && p.isAlive);
          if (loverPartner) {
            deaths.push({
              player: loverPartner,
              roleDef: ROLES[loverPartner.role] || ROLES.villager,
              reason: `Mort(e) de chagrin suite à la mort de son bien-aimé (${witchVictim.name}).`
            });
          }
        }
      }
    }

    setMorningDeaths(deaths);
    setMorningDeathCardFlipped({});
    setIsMorningRevealActive(true);
  };

  const handleSleepVillage = () => {
    setActiveCycleTab('NIGHT');
    setCurrentStepIndex(0);
    setTargetWolf(null);
    setTargetGuard(null);
    setWitchHeals(false);
    setWitchKillsId(null);
    setSeerTargetId(null);
    setIsMorningRevealActive(false);
    setIsDayVoteRevealActive(false);
    setHunterShootingPlayer(null);
    setHunterVictimPlayer(null);
    setIsTimerRunning(false);
  };

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-8 relative z-10">
      {/* ========================================================================= */}
      {/* 1. AUTEL DU CONTEUR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#1c0b13] via-[#0e060c] to-[#070306] border-2 border-amber-700/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.9)] candle-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-xs font-medieval text-amber-400 uppercase font-bold tracking-widest">
              ⚜ Autel de l'Inquisition • {activeCycleTab === 'NIGHT' ? 'Nuit Obscure' : "Jour d'Exécution"}
            </span>
            <span className="text-[10px] font-mono px-3 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-700/50">
              Cycle #{dayNumber || 1}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-cinzel text-white font-bold tracking-wide drop-shadow">
            {activeCycleTab === 'NIGHT' ? 'Orchestration des Ténèbres' : 'Tribunal du Bûcher'}
          </h1>
        </div>

        {/* Console de Sons */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => {
              setIsRevealingRoles(true);
              setRevealIndex(0);
              setIsCardFlipped(false);
              sounds.stopNightLoop();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-800 to-amber-950 border border-amber-600/60 hover:from-amber-700 hover:to-amber-900 text-amber-100 text-xs font-medieval font-bold shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            🃏 Sceaux Secrets
          </button>
          <button
            onClick={() => sounds.playWolfHowl()}
            className="px-3.5 py-2.5 rounded-xl bg-red-950/90 border border-red-800/60 hover:bg-red-900 text-red-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            🐺 Hurlement
          </button>
          <button
            onClick={() => sounds.playBell()}
            className="px-3.5 py-2.5 rounded-xl bg-amber-950/90 border border-amber-700/60 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            🔔 Cloche
          </button>
          <button
            onClick={() => sounds.playGong()}
            className="px-3.5 py-2.5 rounded-xl bg-purple-950/90 border border-purple-700/60 hover:bg-purple-900 text-purple-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            🪘 Gong
          </button>
          <button
            onClick={() => sounds.playGunshot()}
            className="px-3.5 py-2.5 rounded-xl bg-orange-950/90 border border-orange-700/60 hover:bg-orange-900 text-orange-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            💥 Mousquet
          </button>
        </div>
      </div>

      {(!players || players.length === 0) ? (
        <div className="p-10 bg-[#120911] border border-stone-800 rounded-3xl text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl font-cinzel font-bold text-white">Le Sanctuaire est Vide</h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto font-sans">
            Invoquez 8 villageois prédéfinis pour animer votre soirée ou configurez une assemblée personnalisée.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleQuickDemoGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-900 via-amber-800 to-red-900 text-white font-medieval font-bold text-xs shadow-xl cursor-pointer"
            >
              ✦ Invoquer l'Assemblée (8 Joueurs)
            </button>
            <Link
              href="/setup"
              className="px-6 py-3 rounded-2xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white font-medieval font-bold text-xs"
            >
              Paramétrer le Village &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SÉLECTEUR DE PHASE */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#140b12] to-[#080407] p-2.5 rounded-2xl border-2 border-stone-800/80 font-medieval text-xs shadow-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveCycleTab('NIGHT');
                  sounds.startNightLoop();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeCycleTab === 'NIGHT'
                    ? 'bg-purple-950 text-purple-100 border border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🌙 Phase de Nuit (Rituel Actif)</span>
              </button>
              <button
                onClick={handleWakeUpVillage}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeCycleTab === 'DAY'
                    ? 'bg-amber-950 text-amber-100 border border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>☀️ Tribunal de Jour & Bûcher</span>
              </button>
            </div>

            <span className="text-amber-400 hidden sm:inline px-4 font-medieval font-bold text-xs tracking-wider">
              {livingPlayers.length} Âmes Survivantes
            </span>
          </div>

          {/* VUE DE NUIT */}
          {activeCycleTab === 'NIGHT' && activeNightStep && (
            <div 
              className="bg-gradient-to-b from-[#160b14] via-[#0c050a] to-[#050204] border-2 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl candle-glow" 
              style={{ borderColor: activeNightStep.roleDef.color }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {nightStepsSequence.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medieval font-bold transition-all cursor-pointer ${
                        idx === currentStepIndex
                          ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/30'
                          : 'bg-black/50 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {idx + 1}. {step.roleName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => activeNightStep.soundAction()}
                  className="px-4 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 rounded-xl text-xs font-medieval font-bold text-purple-200 cursor-pointer shadow transition-all"
                >
                  ▶ Jouer {activeNightStep.soundLabel}
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-40 h-40 shrink-0 bg-black/80 rounded-2xl border-2 border-white/10 p-3 flex items-center justify-center shadow-2xl">
                  <RoleArtwork roleId={activeNightStep.roleDef.id} className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]" />
                </div>

                <div className="space-y-3 flex-1 text-left w-full">
                  <div>
                    <span className="text-xs font-medieval font-bold uppercase tracking-wider" style={{ color: activeNightStep.roleDef.color }}>
                      {activeNightStep.roleDef.subtitle}
                    </span>
                    <h2 className="text-3xl font-cinzel text-white font-bold mt-0.5">
                      {activeNightStep.title}
                    </h2>
                  </div>

                  <div className="p-4 bg-purple-950/40 border-l-4 border-purple-500 rounded-r-2xl space-y-1">
                    <span className="text-[10px] font-medieval uppercase font-bold text-purple-300 block">Incantation à lire à haute voix :</span>
                    <p className="text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed">
                      {activeNightStep.script}
                    </p>
                  </div>
                  <p className="text-xs text-stone-400 font-sans italic">
                    💡 Consigne : {activeNightStep.hint}
                  </p>
                </div>
              </div>

              {/* Sélection Interactive */}
              <div className="pt-4 border-t border-stone-800 space-y-3">
                <span className="text-xs font-medieval uppercase text-stone-300 font-bold block">
                  Désigner l'action de l'entité :
                </span>

                {/* CUPIDON */}
                {activeNightStep.id === 'cupid' && (
                  <div className="space-y-2">
                    <span className="text-xs text-pink-400 font-bold block font-medieval">
                      Choisissez les 2 amoureux ({targetLovers.length} / 2) :
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {players.map((p) => {
                        const isSelected = targetLovers.includes(p.id) || p.isLover;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              let next: string[];
                              if (targetLovers.includes(p.id)) {
                                next = targetLovers.filter(id => id !== p.id);
                              } else if (targetLovers.length < 2) {
                                next = [...targetLovers, p.id];
                              } else {
                                next = [targetLovers[1], p.id];
                              }
                              setTargetLovers(next);
                              if (next.length === 2) {
                                setNightCupidLovers(next[0], next[1]);
                                sounds.playMagicChime();
                              }
                            }}
                            className={`p-3.5 rounded-2xl border text-xs font-medieval font-bold text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-pink-950 border-pink-500 text-pink-200 shadow-lg shadow-pink-500/30'
                                : 'bg-black/50 border-stone-800 text-stone-300 hover:border-stone-600'
                            }`}
                          >
                            <span className="truncate block">{p.name}</span>
                            {isSelected && <span className="text-pink-400 text-[10px] block mt-0.5">♥ Amoureux</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SALVATEUR */}
                {activeNightStep.id === 'guard' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {livingPlayers.map((p) => {
                      const isSelected = targetGuard === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setTargetGuard(p.id);
                            if (settings?.guardSingleUse && guardPlayer) {
                              const updated = players.map(pl => pl.role === 'guard' ? { ...pl, hasUsedGuardPower: true } : pl);
                              useGameStore.setState({ players: updated });
                            }
                            sounds.playMagicChime();
                          }}
                          className={`p-3.5 rounded-2xl border text-xs font-medieval font-bold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-950 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/30'
                              : 'bg-black/50 border-stone-800 text-stone-300 hover:border-stone-600'
                          }`}
                        >
                          <span className="truncate block">{p.name}</span>
                          {isSelected && <span className="text-blue-400 text-[10px] block mt-0.5">🛡️ Protégé</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* VOYANTE */}
                {activeNightStep.id === 'seer' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {livingPlayers.map((p) => {
                      const isSelected = seerTargetId === p.id;
                      const role = ROLES[p.role];
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSeerTargetId(p.id);
                            if (settings?.seerSingleUse && seerPlayer) {
                              const updated = players.map(pl => pl.role === 'seer' ? { ...pl, hasUsedSeerPower: true } : pl);
                              useGameStore.setState({ players: updated });
                            }
                            sounds.playMagicChime();
                          }}
                          className={`p-3.5 rounded-2xl border text-xs font-medieval font-bold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/30'
                              : 'bg-black/50 border-stone-800 text-stone-300 hover:border-stone-600'
                          }`}
                        >
                          <span className="truncate block">{p.name}</span>
                          {isSelected && <span className="text-purple-300 text-[10px] block mt-0.5">🔮 {role.name}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* LOUPS */}
                {activeNightStep.id === 'werewolf' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {livingPlayers.map((p) => {
                      const isSelected = targetWolf === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setTargetWolf(p.id);
                            sounds.playWolfHowl();
                          }}
                          className={`p-3.5 rounded-2xl border text-xs font-medieval font-bold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-950 border-red-500 text-red-200 shadow-lg shadow-red-500/30'
                              : 'bg-black/50 border-stone-800 text-stone-300 hover:border-stone-600'
                          }`}
                        >
                          <span className="truncate block">{p.name}</span>
                          {isSelected && <span className="text-red-400 text-[10px] block mt-0.5">🐺 Proie Désignée</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* SORCIÈRE */}
                {activeNightStep.id === 'witch' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-medieval">
                      <span className={`px-3 py-1 rounded-xl border ${witchPlayer?.hasUsedLifePotion ? 'bg-red-950/30 border-red-900 text-red-400 line-through' : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'}`}>
                        Potion de Vie : {witchPlayer?.hasUsedLifePotion ? 'Épuisée' : 'Disponible (1x)'}
                      </span>
                      <span className={`px-3 py-1 rounded-xl border ${witchPlayer?.hasUsedDeathPotion ? 'bg-red-950/30 border-red-900 text-red-400 line-through' : 'bg-purple-950/60 border-purple-500 text-purple-300'}`}>
                        Potion de Mort : {witchPlayer?.hasUsedDeathPotion ? 'Épuisée' : 'Disponible (1x)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/60 border border-stone-800 rounded-2xl">
                      <div>
                        <span className="text-xs font-medieval font-bold text-white block">Potion de Guérison</span>
                        <span className="text-[11px] text-stone-400">
                          Victime des loups : <strong className="text-red-400">{players.find(p => p.id === targetWolf)?.name || 'Aucune'}</strong>
                        </span>
                      </div>
                      <button
                        disabled={witchPlayer?.hasUsedLifePotion || !targetWolf}
                        onClick={() => {
                          setWitchHeals(!witchHeals);
                          sounds.playPotion();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-medieval font-bold transition-all cursor-pointer ${
                          witchPlayer?.hasUsedLifePotion
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : witchHeals
                              ? 'bg-emerald-700 text-white shadow-md'
                              : 'bg-stone-800 text-stone-300 hover:text-white'
                        }`}
                      >
                        {witchPlayer?.hasUsedLifePotion ? 'Épuisée' : witchHeals ? 'Sauvé ✓' : 'Sauver la Victime'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-medieval font-bold text-stone-300 block">
                        Potion d'Empoisonnement :
                      </span>
                      {witchPlayer?.hasUsedDeathPotion ? (
                        <p className="text-xs text-red-400 italic bg-red-950/20 p-2 rounded border border-red-900/30">
                          Cette fiole a déjà été versée plus tôt dans la partie.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {livingPlayers.map((p) => {
                            const isSelected = witchKillsId === p.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  const target = isSelected ? null : p.id;
                                  setWitchKillsId(target);
                                  if (target) sounds.playPotion();
                                }}
                                className={`p-2.5 rounded-xl border text-xs font-medieval font-bold text-left truncate transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-950 border-purple-500 text-purple-200'
                                    : 'bg-black/50 border-stone-800 text-stone-400 hover:text-white'
                                }`}
                              >
                                {p.name} {isSelected && '💀'}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation des Rôles */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => goToStep(currentStepIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 font-medieval text-xs font-bold cursor-pointer"
                >
                  &larr; Étape Précédente
                </button>

                {currentStepIndex + 1 < nightStepsSequence.length ? (
                  <button
                    onClick={() => goToStep(currentStepIndex + 1)}
                    className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medieval text-xs font-bold cursor-pointer shadow-lg"
                  >
                    Rôle Suivant &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleWakeUpVillage}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-red-800 hover:opacity-90 text-white font-medieval text-xs font-bold cursor-pointer shadow-lg"
                  >
                    ☀️ Lever du Jour sur le Village &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VUE TRIBUNAL DU BÛCHER & SABLIER */}
          {activeCycleTab === 'DAY' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-7 bg-gradient-to-b from-[#1c0a11] via-[#0d0509] to-[#050204] border-2 border-amber-600/50 rounded-3xl space-y-6 shadow-2xl candle-glow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
                  <div>
                    <span className="text-xs font-medieval text-amber-400 uppercase font-bold tracking-widest flex items-center gap-2">
                      <span>⚜</span> Délibérations & Tribunal Populaire
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-cinzel text-white font-bold mt-1">
                      Le Sablier du Jugement
                    </h2>
                  </div>

                  <button
                    onClick={handleSleepVillage}
                    className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-600/60 font-medieval text-xs font-bold cursor-pointer shadow-lg"
                  >
                    🌙 Endormir le Village (Nuit Suivante) &rarr;
                  </button>
                </div>

                {/* MODULE SABLIER */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-black/60 border border-stone-800/80 rounded-2xl relative overflow-hidden">
                  <div className="md:col-span-4 flex flex-col items-center justify-center relative">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke={timerSeconds <= 15 ? '#ef4444' : '#d97706'}
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset={264 - (264 * timerPercentage) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>

                      <div className="absolute flex flex-col items-center">
                        <span className={`text-3xl font-cinzel font-bold tracking-wider ${timerSeconds <= 15 ? 'text-red-500 animate-pulse' : 'text-amber-100'}`}>
                          {formatTimer(timerSeconds)}
                        </span>
                        <span className="text-[9px] font-medieval uppercase text-stone-400 mt-0.5">
                          {isTimerRunning ? 'Débat en cours' : timerSeconds === 0 ? 'Temps Écoulé !' : 'Pause'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-3.5 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <button
                        onClick={toggleTimer}
                        className={`px-5 py-2.5 rounded-xl font-medieval font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
                          isTimerRunning
                            ? 'bg-amber-700 hover:bg-amber-600 text-white'
                            : 'bg-gradient-to-r from-red-800 to-amber-700 hover:opacity-95 text-white'
                        }`}
                      >
                        {isTimerRunning ? '⏸ Mettre en Pause' : '▶ Lancer le Débat'}
                      </button>

                      <button
                        onClick={() => resetTimer()}
                        className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-medieval text-xs font-bold cursor-pointer"
                      >
                        🔄 Réinitialiser
                      </button>

                      <button
                        onClick={() => sounds.playGong()}
                        className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 font-medieval text-xs font-bold cursor-pointer"
                      >
                        🪘 Faire Résonner le Gong
                      </button>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                      <span className="text-[11px] font-medieval text-stone-400">Durée :</span>
                      {[60, 120, 180, 300].map((s) => (
                        <button
                          key={s}
                          onClick={() => startTimer(s)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                            timerDuration === s
                              ? 'bg-amber-950 border border-amber-500 text-amber-300 font-bold'
                              : 'bg-black/40 border border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {s / 60} min
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-stone-400 font-sans italic">
                      💡 Un battement de cœur ❤️‍🔥 retentira automatiquement dans les 15 dernières secondes, suivi du gong final pour clore les délibérations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grille des Âmes Vivantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {livingPlayers.map((p) => {
                  const role = ROLES[p.role] || ROLES.villager;
                  return (
                    <div
                      key={p.id}
                      className="p-4 bg-gradient-to-b from-[#130a13] to-[#070407] border rounded-2xl flex items-center justify-between gap-3 shadow-md"
                      style={{ borderColor: `${role.color}40`, borderLeftWidth: '4px', borderLeftColor: role.color }}
                    >
                      <div className="w-12 h-12 shrink-0 bg-black/70 rounded-xl border border-white/10 p-1 flex items-center justify-center shadow">
                        <RoleArtwork roleId={role.id} className="w-full h-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-medieval font-bold text-white truncate">{p.name}</h4>
                          {p.isCaptain && <span className="text-[10px] text-amber-400 font-bold">👑</span>}
                          {p.isLover && <span className="text-[10px] text-pink-500 font-bold">♥</span>}
                        </div>
                        <span className="text-xs font-bold block" style={{ color: role.color }}>
                          {role.name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0 font-medieval text-[11px]">
                        <button
                          onClick={() => handleExecutePlayer(p)}
                          className="px-3 py-1 bg-red-950/90 border border-red-600/60 text-red-200 hover:bg-red-900 rounded-lg font-bold cursor-pointer transition-colors"
                        >
                          Condamner
                        </button>
                        {!p.isCaptain && (
                          <button
                            onClick={() => setCaptain(p.id)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 rounded-lg cursor-pointer"
                          >
                            Maire
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cimetière */}
              {deadPlayers.length > 0 && (
                <div className="pt-4 border-t border-stone-800 space-y-2">
                  <span className="text-xs font-medieval text-red-400 font-bold uppercase block tracking-wider">
                    ☠️ Cimetière des Damnés ({deadPlayers.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {deadPlayers.map((p) => {
                      const role = ROLES[p.role] || ROLES.villager;
                      return (
                        <div key={p.id} className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-xl text-xs font-medieval text-stone-400">
                          <span className="font-bold text-stone-200 block truncate">{p.name}</span>
                          <span className="text-[11px]" style={{ color: role.color }}>{role.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
