'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleCard } from '@/components/game/RoleCard';
import { RoleArtwork } from '@/components/game/RoleArtwork';
import { useGameStore } from '@/lib/store';
import { ROLES, RoleId } from '@/lib/roles';
import { sounds } from '@/lib/sound';
import confetti from 'canvas-confetti';

export default function PlayPage() {
  const router = useRouter();
  const {
    players,
    phase,
    dayNumber,
    activeNightStepIndex,
    nightSteps,
    nightTargetWolf,
    nightTargetGuard,
    lastProtectedPlayerId,
    seerRevealedPlayer,
    lastDeaths,
    winner,
    logs,
    startNight,
    nextNightStep,
    setNightTargetWolf,
    setNightGuardTarget,
    setNightCupidLovers,
    setNightSeerTarget,
    clearSeerTarget,
    setNightWitchActions,
    startVote,
    eliminatePlayer,
    resolveHunterShot,
    resetGame
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cupidSelection, setCupidSelection] = useState<string[]>([]);
  const [witchHeals, setWitchHeals] = useState(false);
  const [witchKillsId, setWitchKillsId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && players.length === 0) {
      router.push('/setup');
    }
  }, [mounted, players, router]);

  // Boucle sonore de nuit automatique sur /play
  useEffect(() => {
    if (phase === 'NIGHT_ACTION') {
      sounds.startNightLoop();
    } else {
      sounds.stopNightLoop();
    }
    return () => {
      sounds.stopNightLoop();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'GAME_OVER') {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  }, [phase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      sounds.playBell();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!mounted || players.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 font-mono text-sm">
        Chargement de la partie...
      </div>
    );
  }

  const livingPlayers = players.filter((p) => p.isAlive);
  const currentNightRole = nightSteps[activeNightStepIndex] || null;
  const currentNightRoleDef = currentNightRole ? ROLES[currentNightRole] : null;

  // 1. REVELATION SECRETE DES ROLES
  if (phase === 'REVEAL_ROLES') {
    const currentPlayer = players[revealIndex] || players[0];

    const handleNextPlayer = () => {
      setIsCardFlipped(false);
      if (revealIndex + 1 < players.length) {
        setRevealIndex(revealIndex + 1);
      } else {
        startNight();
      }
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full space-y-8">
        <div className="w-full bg-[#0d1017]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl shadow-purple-950/20">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                Distribution Secrète des Cartes
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300">
                {revealIndex + 1} / {players.length}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display text-white font-bold">
              Passez l'écran à <span className="text-amber-300 underline underline-offset-4">{currentPlayer.name}</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Touchez la carte pour découvrir votre rôle en toute discrétion.
            </p>
          </div>

          <RoleCard
            roleId={currentPlayer.role}
            playerName={currentPlayer.name}
            isRevealed={isCardFlipped}
            onToggleReveal={() => setIsCardFlipped(!isCardFlipped)}
            size="lg"
          />

          <div className="w-full max-w-xs space-y-2">
            <button
              onClick={handleNextPlayer}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all uppercase tracking-wider font-mono cursor-pointer"
            >
              {revealIndex + 1 < players.length ? 'Joueur Suivant &rarr;' : 'Commencer la Nuit 🌙'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PHASE DE NUIT
  if (phase === 'NIGHT_ACTION' && currentNightRoleDef) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Timeline Header Nocturne */}
        <div className="w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentNightRoleDef.color }} />
            <span className="text-xs font-mono text-neutral-300 font-bold uppercase tracking-wider">
              Nuit {dayNumber} • Déroulement Nocturne
            </span>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/30">
            Étape {activeNightStepIndex + 1} sur {nightSteps.length}
          </span>
        </div>

        {/* Panneau Actif du Rôle */}
        <div className="w-full bg-[#0d1017]/95 backdrop-blur-xl border-2 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl transition-all" style={{ borderColor: `${currentNightRoleDef.color}80` }}>
          {/* Header Rôle avec Artwork */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-white/10 pb-6">
            <div className="w-24 h-24 shrink-0 bg-black/60 rounded-2xl border-2 border-white/15 flex items-center justify-center p-2 shadow-xl">
              <RoleArtwork roleId={currentNightRoleDef.id} className="w-full h-full" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider block" style={{ color: currentNightRoleDef.color }}>
                {currentNightRoleDef.subtitle}
              </span>
              <h1 className="text-3xl sm:text-4xl font-display text-white font-bold tracking-tight">
                {currentNightRoleDef.name}
              </h1>
              <p className="text-sm font-serif italic text-neutral-200 pt-1">
                « {currentNightRoleDef.wakeScript} »
              </p>
            </div>
          </div>

          {/* ACTIONS SPECIFIQUES */}
          {/* CUPIDON */}
          {currentNightRole === 'cupid' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-pink-400 font-bold uppercase">
                  Choisissez les 2 amoureux :
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {cupidSelection.length} / 2 sélectionnés
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {players.map((p) => {
                  const isSelected = cupidSelection.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        let next: string[];
                        if (isSelected) {
                          next = cupidSelection.filter((id) => id !== p.id);
                        } else if (cupidSelection.length < 2) {
                          next = [...cupidSelection, p.id];
                        } else {
                          next = [cupidSelection[1], p.id];
                        }
                        setCupidSelection(next);
                        if (next.length === 2) {
                          setNightCupidLovers(next[0], next[1]);
                          sounds.playMagicChime();
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-pink-950 border-pink-500 text-pink-100 shadow-lg shadow-pink-500/20 scale-[1.02]' 
                          : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {isSelected && <span className="text-pink-400 font-bold">♥</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SALVATEUR */}
          {currentNightRole === 'guard' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-blue-400 font-bold uppercase block">
                Désignez la personne à protéger cette nuit :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {livingPlayers.map((p) => {
                  const isLast = p.id === lastProtectedPlayerId;
                  const isSelected = nightTargetGuard === p.id;
                  return (
                    <button
                      key={p.id}
                      disabled={isLast}
                      onClick={() => {
                        setNightGuardTarget(p.id);
                        sounds.playMagicChime();
                      }}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isLast 
                          ? 'opacity-30 cursor-not-allowed bg-black/30 border-white/5 text-neutral-600' 
                          : isSelected 
                            ? 'bg-blue-950 border-blue-500 text-blue-100 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                            : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {isLast ? <span className="text-[10px] text-red-400">Hier</span> : isSelected && <span className="text-blue-400">🛡️</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VOYANTE */}
          {currentNightRole === 'seer' && (
            <div className="space-y-3">
              {!seerRevealedPlayer ? (
                <>
                  <span className="text-xs font-mono text-purple-400 font-bold uppercase block">
                    Touchez un joueur pour sonder son âme :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {livingPlayers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setNightSeerTarget(p.id);
                          sounds.playMagicChime();
                        }}
                        className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-purple-500 hover:bg-purple-950/40 text-xs font-bold text-neutral-200 text-left transition-all truncate cursor-pointer"
                      >
                        🔮 {p.name}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 bg-purple-950/60 border-2 border-purple-500 rounded-2xl space-y-3 text-center shadow-xl">
                  <span className="text-xs font-mono text-purple-300 uppercase font-bold tracking-widest block">Révélation Astrale</span>
                  <h3 className="text-2xl font-bold text-white">{seerRevealedPlayer.player.name} est :</h3>
                  <div className="inline-block px-5 py-2 rounded-full text-base font-black text-white shadow-lg" style={{ backgroundColor: seerRevealedPlayer.roleDef.color }}>
                    {seerRevealedPlayer.roleDef.name}
                  </div>
                  <p className="text-xs text-neutral-300 italic pt-1 max-w-md mx-auto">{seerRevealedPlayer.roleDef.shortDesc}</p>
                </div>
              )}
            </div>
          )}

          {/* LOUPS-GAROUS */}
          {currentNightRole === 'werewolf' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-red-400 font-bold uppercase block">
                Désignez la proie de la meute :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {livingPlayers.map((p) => {
                  const isSelected = nightTargetWolf === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setNightTargetWolf(p.id);
                        sounds.playWolfHowl();
                      }}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-red-950 border-red-500 text-red-100 shadow-lg shadow-red-600/30 scale-[1.02]' 
                          : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-red-500/50'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {isSelected && <span className="text-red-400 font-black">🐺 Cible</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SORCIÈRE */}
          {currentNightRole === 'witch' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#121622] border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Victime désignée par les loups :</span>
                <span className="text-red-400 font-bold font-mono">
                  {nightTargetWolf ? players.find((p) => p.id === nightTargetWolf)?.name : 'Aucune'}
                </span>
              </div>

              {nightTargetWolf && (
                <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs">
                  <div>
                    <span className="font-bold text-emerald-300 block">Potion de Guérison (1x par partie)</span>
                    <span className="text-[11px] text-neutral-400">Sauver la victime</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !witchHeals;
                      setWitchHeals(next);
                      setNightWitchActions(next, witchKillsId);
                      sounds.playPotion();
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      witchHeals ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                    }`}
                  >
                    {witchHeals ? 'Sauvetage Actif ✓' : 'Utiliser Potion'}
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-300 font-bold uppercase block">Potion d'Empoisonnement (Tuer un suspect) :</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {livingPlayers.map((p) => {
                    const isSelected = witchKillsId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          const target = isSelected ? null : p.id;
                          setWitchKillsId(target);
                          setNightWitchActions(witchHeals, target);
                          if (target) sounds.playPotion();
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-left truncate transition-all cursor-pointer ${
                          isSelected ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md shadow-purple-500/30' : 'bg-[#121622] border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {p.name} {isSelected && '💀'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bouton Suivant */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                clearSeerTarget();
                nextNightStep();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-xl shadow-purple-600/25 transition-all cursor-pointer"
            >
              {activeNightStepIndex + 1 < nightSteps.length ? 'Rôle Suivant &rarr;' : 'Lever du Soleil (Matin) ☀️'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PHASE DE JOUR & VOTE
  if (phase === 'DAY_START' || phase === 'DAY_VOTE' || phase === 'DAY_HUNTER') {
    return (
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header Jour */}
        <div className="p-6 sm:p-8 bg-[#0d1017]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
              Conseil du Village
            </span>
            <h1 className="text-3xl sm:text-4xl font-display text-white font-bold mt-1">
              Jour {dayNumber}
            </h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-4 py-2 bg-black/60 border border-white/10 rounded-xl text-amber-300 font-bold text-lg shadow-inner">
              ⏱ {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 border border-amber-500/30 cursor-pointer transition-all"
            >
              {isTimerRunning ? 'Pause' : 'Lancer Débat'}
            </button>
          </div>
        </div>

        {/* Rapport des morts */}
        {lastDeaths.length > 0 ? (
          <div className="p-6 bg-red-950/60 border-2 border-red-500/50 rounded-2xl space-y-2.5 shadow-xl">
            <span className="text-xs font-mono text-red-400 font-bold uppercase block tracking-wider">
              ☠️ Bilan Tragique de la Nuit :
            </span>
            {lastDeaths.map((d, i) => (
              <p key={i} className="text-sm sm:text-base text-neutral-200">
                <strong className="text-red-300 font-bold underline underline-offset-2">{d.player.name}</strong> ({ROLES[d.player.role].name}) — {d.reason}
              </p>
            ))}
          </div>
        ) : (
          <div className="p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-sm text-emerald-300 font-bold text-center shadow-lg">
            🕊️ Aucun mort cette nuit ! Le village a été parfaitement protégé.
          </div>
        )}

        {/* Chasseur */}
        {phase === 'DAY_HUNTER' && (
          <div className="p-6 bg-orange-950/80 border-2 border-orange-500 rounded-2xl space-y-3 shadow-xl">
            <span className="text-xs font-mono text-orange-400 font-bold uppercase block tracking-wider">
              🎯 Tir Fatal du Chasseur
            </span>
            <p className="text-xs text-neutral-300">Dans son dernier souffle, le Chasseur abat un suspect :</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {livingPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    resolveHunterShot(p.id);
                    sounds.playGunshot();
                  }}
                  className="p-3 bg-black/60 border border-orange-500 hover:bg-orange-600 hover:text-white rounded-xl text-xs font-bold text-orange-200 truncate transition-all cursor-pointer"
                >
                  Abattre {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tribunal / Vote */}
        {phase === 'DAY_VOTE' && (
          <div className="p-6 bg-[#121622] border-2 border-red-500/40 rounded-2xl space-y-4 shadow-xl">
            <span className="text-xs font-mono text-red-400 font-bold uppercase block tracking-wider">
              🔥 Tribunal du Peuple — Désigner le condamné au bûcher :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {livingPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (confirm(`Exécuter ${p.name} suite au vote du village ?`)) {
                      eliminatePlayer(p.id, 'Condamné et brûlé sur la place publique par le village.');
                      sounds.playDeath();
                    }
                  }}
                  className="p-4 bg-[#0d1017] border border-white/10 hover:border-red-500 hover:bg-red-950/40 rounded-2xl text-left transition-all cursor-pointer shadow"
                >
                  <span className="text-sm font-bold text-white block truncate">{p.name}</span>
                  <span className="text-xs text-red-400 font-mono mt-1 block">Condamner &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions du jour */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          {phase === 'DAY_START' && (
            <button
              onClick={startVote}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-red-600/20 cursor-pointer"
            >
              Passer au Vote du Village
            </button>
          )}

          <button
            onClick={() => {
              startNight();
              sounds.playWolfHowl();
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-700 to-purple-800 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider font-mono ml-auto shadow-lg shadow-indigo-700/20 cursor-pointer"
          >
            Endormir le Village (Nuit {dayNumber + 1}) 🌙 &rarr;
          </button>
        </div>

        {/* Liste des Joueurs */}
        <div className="space-y-3 pt-4">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest font-bold block">
            Habitants ({livingPlayers.length} en vie / {players.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {players.map((p) => (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                  p.isAlive ? 'bg-[#0d1017] border-white/10 text-white shadow' : 'bg-black/30 border-red-900/20 text-neutral-500 line-through'
                }`}
              >
                <span className="truncate font-bold">{p.name}</span>
                {p.isLover && p.isAlive && <span className="text-pink-500 font-bold no-underline">♥</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. GAME OVER
  if (phase === 'GAME_OVER') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-lg mx-auto w-full text-center space-y-8">
        <div className="w-full bg-[#0d1017]/95 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 mx-auto flex items-center justify-center text-white text-3xl shadow-xl">
            🏆
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest">Partie Terminée</span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
              {winner === 'WEREWOLVES' && 'Victoire des Loups-Garous !'}
              {winner === 'VILLAGE' && 'Victoire du Village !'}
              {winner === 'LOVERS' && 'Victoire des Amoureux !'}
              {winner === 'WHITE_WOLF' && 'Victoire du Loup Blanc !'}
            </h1>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            {logs[logs.length - 1]?.message}
          </p>

          <div className="space-y-2 pt-4 border-t border-white/10 text-left">
            <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold block">Rôles Révélés :</span>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
              {players.map((p) => (
                <div key={p.id} className="flex justify-between text-neutral-200 p-2 rounded-lg bg-black/40 border border-white/5">
                  <span>{p.name}</span>
                  <span className="font-bold" style={{ color: ROLES[p.role].color }}>{ROLES[p.role].name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              resetGame();
              router.push('/setup');
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-xl transition-all cursor-pointer"
          >
            Rejouer une Partie &rarr;
          </button>
        </div>
      </div>
    );
  }

  return null;
}
