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
    setNightWolfTarget,
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
    if (phase === 'NIGHT_ACTION' || phase.startsWith('NIGHT')) {
      sounds.startNightLoop();
    } else {
      sounds.stopNightLoop();
    }
    return () => {
      sounds.stopNightLoop();
    };
  }, [phase]);

  // Confettis de victoire
  useEffect(() => {
    if (phase === 'GAME_OVER' && winner) {
      sounds.playBell();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  }, [phase, winner]);

  // Minuteur du débat
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      sounds.playBell();
      setIsTimerRunning(false);
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
  const currentNightStep = nightSteps[activeNightStepIndex] || null;
  const currentNightRole = currentNightStep ? currentNightStep.role : null;
  const currentNightRoleDef = currentNightStep ? currentNightStep.roleDef : null;

  // 1. REVELATION SECRETE DES ROLES
  if (phase === 'ROLE_REVEAL' || phase === 'REVEAL_ROLES') {
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
        <div className="w-full bg-[#10141f] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
                Distribution Secrète des Rôles
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/30">
                {revealIndex + 1} / {players.length}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display text-white font-bold">
              Passez l'écran à <span className="text-amber-300 underline underline-offset-4">{currentPlayer.name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Touchez la carte pour révéler votre rôle en secret, puis cachez-la.
            </p>
          </div>

          <RoleCard
            roleId={currentPlayer.role}
            playerName={currentPlayer.name}
            isRevealed={isCardFlipped}
            onToggleReveal={() => {
              setIsCardFlipped(!isCardFlipped);
            }}
            size="lg"
          />

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleNextPlayer}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all uppercase tracking-wider font-mono cursor-pointer"
            >
              {revealIndex + 1 < players.length ? 'Joueur Suivant &rarr;' : 'Terminer & Commencer la Nuit 🌙'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PHASES DE NUIT STEP-BY-STEP
  if (phase === 'NIGHT_ACTION' && currentNightStep && currentNightRoleDef) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-[#10141f] border-2 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl" style={{ borderColor: currentNightRoleDef.color }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: currentNightRoleDef.color }}>
              Nuit {dayNumber} • Étape {activeNightStepIndex + 1} / {nightSteps.length}
            </span>
            <span className="text-xs font-mono text-neutral-400">Ambiance Nocturne Active 🌙</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 shrink-0 bg-black/60 rounded-2xl border-2 border-white/15 p-2 flex items-center justify-center shadow-xl">
              <RoleArtwork roleId={currentNightRoleDef.id} className="w-full h-full" />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-display text-white font-bold">{currentNightStep.title}</h2>
              <p className="text-xs sm:text-sm text-neutral-300 italic bg-black/40 p-3 rounded-xl border border-white/5">
                « {currentNightStep.script} »
              </p>
              <p className="text-xs text-neutral-400">💡 {currentNightStep.hint}</p>
            </div>
          </div>

          {/* CUPIDON */}
          {currentNightRole === 'cupid' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-pink-400 font-bold uppercase block">
                Sélectionnez 2 amoureux ({cupidSelection.length} / 2) :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {players.map((p) => {
                  const isSelected = cupidSelection.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        let next: string[];
                        if (cupidSelection.includes(p.id)) {
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
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all truncate cursor-pointer ${
                        isSelected
                          ? 'bg-pink-950/80 border-pink-500 text-pink-200 shadow-lg shadow-pink-500/20'
                          : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-white/30'
                      }`}
                    >
                      <span>{p.name}</span>
                      {isSelected && <span className="block text-[10px] text-pink-400">♥ Amoureux</span>}
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
                  const isProtected = nightTargetGuard === p.id;
                  const isLastProtected = lastProtectedPlayerId === p.id;
                  return (
                    <button
                      key={p.id}
                      disabled={isLastProtected}
                      onClick={() => {
                        setNightGuardTarget(p.id);
                        sounds.playMagicChime();
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all truncate cursor-pointer ${
                        isProtected
                          ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/20'
                          : isLastProtected
                            ? 'bg-black/30 border-white/5 text-neutral-600 cursor-not-allowed'
                            : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-white/30'
                      }`}
                    >
                      <span>{p.name}</span>
                      {isProtected && <span className="block text-[10px] text-blue-400">🛡️ Protégé</span>}
                      {isLastProtected && <span className="block text-[10px] text-neutral-500">(Nuit préc.)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VOYANTE */}
          {currentNightRole === 'seer' && (
            <div className="space-y-4">
              {!seerRevealedPlayer ? (
                <>
                  <span className="text-xs font-mono text-purple-400 font-bold uppercase block">
                    Touchez un joueur pour sonder sa véritable identité :
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
                  const isTargeted = nightTargetWolf === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setNightWolfTarget(p.id);
                        sounds.playWolfHowl();
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all truncate cursor-pointer ${
                        isTargeted
                          ? 'bg-red-950/80 border-red-500 text-red-200 shadow-lg shadow-red-500/20'
                          : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-white/30'
                      }`}
                    >
                      <span>{p.name}</span>
                      {isTargeted && <span className="block text-[10px] text-red-400">🐺 Proie</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SORCIÈRE */}
          {currentNightRole === 'witch' && (
            <div className="space-y-4">
              <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Potion de Guérison</span>
                  <span className="text-[11px] text-neutral-400">
                    Victime des loups : <strong className="text-red-400">{players.find((p) => p.id === nightTargetWolf)?.name || 'Personne'}</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    const next = !witchHeals;
                    setWitchHeals(next);
                    setNightWitchActions(next, witchKillsId);
                    sounds.playPotion();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    witchHeals ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/10 text-neutral-300 hover:text-white'
                  }`}
                >
                  {witchHeals ? 'Sauvé ✓' : 'Sauver'}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold block">Potion de Mort (Optionnel) :</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {livingPlayers.map((p) => {
                    const isTarget = witchKillsId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          const next = isTarget ? null : p.id;
                          setWitchKillsId(next);
                          setNightWitchActions(witchHeals, next);
                          if (next) sounds.playPotion();
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left truncate transition-all cursor-pointer ${
                          isTarget
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                            : 'bg-[#121622] border-white/10 text-neutral-300 hover:border-white/30'
                        }`}
                      >
                        {p.name} {isTarget && '💀'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => {
                clearSeerTarget();
                nextNightStep();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Étape Suivante &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PHASE DE JOUR
  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header Jour */}
      <div className="bg-[#10141f] border border-amber-500/40 rounded-2xl p-6 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest">
            Jour {dayNumber} • Tribunal Populaire
          </span>
          <h2 className="text-2xl font-display text-white font-bold mt-1">Place Publique de Thiercelieux</h2>
        </div>

        <button
          onClick={startVote}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase font-mono shadow-lg shadow-amber-600/30 cursor-pointer"
        >
          Ouvrir le Vote &rarr;
        </button>
      </div>

      {/* Grille des joueurs vivants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {livingPlayers.map((p) => {
          const role = ROLES[p.role] || ROLES.villager;
          return (
            <div
              key={p.id}
              className="p-4 bg-[#10141f] border rounded-xl flex items-center justify-between gap-3 shadow-md"
              style={{ borderColor: `${role.color}40`, borderLeftWidth: '4px', borderLeftColor: role.color }}
            >
              <div className="w-12 h-12 shrink-0 bg-black/50 rounded-lg border border-white/10 p-1 flex items-center justify-center">
                <RoleArtwork roleId={role.id} className="w-full h-full" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                <span className="text-xs font-bold block" style={{ color: role.color }}>
                  {role.name}
                </span>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Éliminer ${p.name} ?`)) {
                    eliminatePlayer(p.id);
                  }
                }}
                className="px-3 py-1.5 bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900 rounded-lg font-bold text-xs cursor-pointer font-mono"
              >
                Condamner
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
