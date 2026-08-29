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
  
  // Modal de distribution secrète des rôles
  const [isRevealingRoles, setIsRevealingRoles] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Modal Tir de vengeance du Chasseur (Prioritaire)
  const [hunterShootingPlayer, setHunterShootingPlayer] = useState<Player | null>(null);

  // Écran de révélation des morts du matin
  const [isMorningRevealActive, setIsMorningRevealActive] = useState(false);
  const [morningDeaths, setMorningDeaths] = useState<{ player: Player; roleDef: typeof ROLES.werewolf; reason: string }[]>([]);
  const [morningDeathCardFlipped, setMorningDeathCardFlipped] = useState<Record<string, boolean>>({});

  // Écran de révélation du vote / bûcher de fin de journée
  const [isDayVoteRevealActive, setIsDayVoteRevealActive] = useState(false);
  const [executedPlayer, setExecutedPlayer] = useState<Player | null>(null);
  const [isDayCardFlipped, setIsDayCardFlipped] = useState(false);

  // Navigation séquentielle Jour par Jour (Step-by-step)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeCycleTab, setActiveCycleTab] = useState<'NIGHT' | 'DAY'>('NIGHT');
  
  // Cibles interactives de la nuit pour le MJ
  const [targetWolf, setTargetWolf] = useState<string | null>(null);
  const [targetGuard, setTargetGuard] = useState<string | null>(null);
  const [targetLovers, setTargetLovers] = useState<string[]>([]);
  const [witchHeals, setWitchHeals] = useState(false);
  const [witchKillsId, setWitchKillsId] = useState<string | null>(null);
  const [seerTargetId, setSeerTargetId] = useState<string | null>(null);

  // Vérifier si Cupidon a déjà lié les amoureux
  const hasLoversBeenChosen = players.filter(p => p.isLover).length >= 2 || targetLovers.length >= 2;

  // Vérifier si la Voyante et le Salvateur ont déjà utilisé leur pouvoir (si option unique activée)
  const seerPlayer = players.find(p => p.role === 'seer');
  const guardPlayer = players.find(p => p.role === 'guard');
  const isSeerPowerAvailable = seerPlayer?.isAlive && (!settings?.seerSingleUse || !seerPlayer?.hasUsedSeerPower);
  const isGuardPowerAvailable = guardPlayer?.isAlive && (!settings?.guardSingleUse || !guardPlayer?.hasUsedGuardPower);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Déclenchement de la cloche et des confettis en cas de victoire (Fin de partie)
  useEffect(() => {
    if (phase === 'GAME_OVER' || winner) {
      sounds.stopNightLoop();
      sounds.playBell();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  }, [phase, winner]);

  // Déclenchement automatique de la boucle audio nocturne
  useEffect(() => {
    if (activeCycleTab === 'NIGHT' && !isRevealingRoles && !isMorningRevealActive && !isDayVoteRevealActive && !hunterShootingPlayer && phase !== 'GAME_OVER') {
      sounds.startNightLoop();
    } else {
      sounds.stopNightLoop();
    }
    return () => {
      sounds.stopNightLoop();
    };
  }, [activeCycleTab, isRevealingRoles, isMorningRevealActive, isDayVoteRevealActive, hunterShootingPlayer, phase]);

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

  const handleStartSecretReveal = () => {
    setIsRevealingRoles(true);
    setRevealIndex(0);
    setIsCardFlipped(false);
    sounds.stopNightLoop();
  };

  // Exécution lors du vote de jour avec révélation écran
  const handleExecutePlayer = (p: Player) => {
    eliminatePlayer(p.id, 'Condamné et brûlé sur la place publique par le village.');
    setExecutedPlayer(p);
    setIsDayCardFlipped(false);
    setIsDayVoteRevealActive(true);
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-stone-500 font-mono text-xs">
        Ouverture du Grimoire de l'Inquisition...
      </div>
    );
  }

  const livingPlayers = (players || []).filter((p) => p.isAlive);
  const deadPlayers = (players || []).filter((p) => !p.isAlive);
  const witchPlayer = players.find((p) => p.role === 'witch');

  // =========================================================================
  // 0. ÉCRAN DE VICTOIRE / FIN DE PARTIE — STÈLE FUNÉRAIRE & GLOIRE ANCIENNE
  // =========================================================================
  if (phase === 'GAME_OVER' && winner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-xl mx-auto w-full text-center space-y-6">
        <div className="w-full bg-gradient-to-b from-[#160c12] to-[#080407] border-2 border-amber-600/60 rounded-3xl p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] candle-glow">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-700 mx-auto flex items-center justify-center text-4xl shadow-2xl border border-amber-400/40">
            ⚜
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest block">
              ✦ Sentence Définitive de Thiercelieux ✦
            </span>
            <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white tracking-wide">
              {winner === 'WEREWOLVES' && 'Triomphe de la Meute'}
              {winner === 'VILLAGE' && 'Rédemption du Village'}
              {winner === 'LOVERS' && 'Sacrifice des Amoureux'}
              {winner === 'WHITE_WOLF' && 'Festin du Loup Blanc'}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-black/60 p-4 rounded-2xl border border-red-900/30 font-serif italic">
            « {logs[logs.length - 1]?.message} »
          </p>

          <div className="space-y-2 pt-3 border-t border-stone-800 text-left">
            <span className="text-[11px] font-medieval text-stone-400 uppercase font-bold tracking-wider block">
              Registres de l'Inquisition (Véritables Identités) :
            </span>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {players.map((p) => {
                const r = ROLES[p.role] || ROLES.villager;
                return (
                  <div key={p.id} className="flex justify-between items-center text-stone-200 p-2.5 rounded-xl bg-black/50 border border-stone-800">
                    <span className="font-medieval font-bold">{p.name} {p.isLover ? '♥' : ''} {!p.isAlive ? '☠️' : '✨'}</span>
                    <span className="font-bold text-[11px] px-2 py-0.5 rounded border border-current/30" style={{ color: r.color, backgroundColor: `${r.color}15` }}>
                      {r.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                resetGame();
                window.location.href = '/setup';
              }}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-medieval font-bold text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer"
            >
              Célébrer un Nouveau Sabbat &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. DISTRIBUTION SECRÈTE DES RÔLES
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
        <div className="w-full bg-gradient-to-b from-[#140b12] to-[#070408] border-2 border-amber-700/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                Distribution Secrète des Cartes
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 bg-amber-950/80 text-amber-300 rounded border border-amber-600/40">
                {revealIndex + 1} / {players.length}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-cinzel text-white font-bold">
              Passez l'écran à <span className="text-amber-300 underline underline-offset-4">{currentPlayer.name}</span>
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Touchez le sceau pour découvrir votre allégeance en secret, puis cachez-la.
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-medieval font-bold text-xs shadow-xl transition-all uppercase tracking-wider cursor-pointer"
            >
              {revealIndex + 1 < players.length ? 'Âme Suivante &rarr;' : 'Clore le Rituel & Tomber la Nuit 🌙'}
            </button>

            <button
              onClick={() => {
                setIsRevealingRoles(false);
                sounds.startNightLoop();
              }}
              className="text-xs text-stone-500 hover:text-stone-300 font-mono transition-colors cursor-pointer block mx-auto"
            >
              Passer la révélation & aller au tableau MJ &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MODAL TIR DU CHASSEUR (PRIORITÉ ABSOLUE)
  // =========================================================================
  if (hunterShootingPlayer) {
    const targets = livingPlayers.filter(p => p.id !== hunterShootingPlayer.id);

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#1c0c07] to-[#090403] border-2 border-orange-600 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-[0_0_50px_rgba(234,88,12,0.3)] animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-orange-950/80 border border-orange-500 flex items-center justify-center text-3xl shadow-lg">
            💥
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
              Dernier Râle du Chasseur
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {hunterShootingPlayer.name} a été abattu !
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed font-serif italic">
              « Le Chasseur arme son vieux mousquet une dernière fois. Qui emporte-t-il avec lui dans la tombe ? »
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <span className="text-xs font-medieval text-orange-300 uppercase font-bold block">
              Désignez la cible à exécuter ({targets.length} proies restantes) :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {targets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playGunshot();
                    resolveHunterShot(p.id);
                    setHunterShootingPlayer(null);
                    setIsDayVoteRevealActive(false);
                    setIsMorningRevealActive(false);
                    setExecutedPlayer(null);
                  }}
                  className="p-4 bg-[#28120a] border border-orange-700/60 hover:border-orange-500 hover:bg-orange-950 rounded-2xl text-xs font-bold text-orange-100 truncate transition-all cursor-pointer shadow-lg hover:scale-105"
                >
                  <span className="block text-sm font-medieval text-white mb-0.5">{p.name}</span>
                  <span className="text-[10px] text-orange-400 font-mono">Abattre 🎯</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setHunterShootingPlayer(null);
            }}
            className="text-xs text-stone-400 hover:text-stone-200 font-mono transition-colors cursor-pointer pt-2"
          >
            Fermer sans tirer &rarr;
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. RÉVÉLATION DU MATIN : SON DE CLOCHE SEUL AU DÉPART, DEATH UNIQUEMENT AU CLIC DE LA CARTE
  // =========================================================================
  if (isMorningRevealActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#130d17] to-[#070509] border-2 border-amber-600/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
              Aube Glaciale sur Thiercelieux ☀️
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {morningDeaths.length > 0 ? 'Le Bilan Sanglant de la Nuit' : 'Une Nuit Sans Proie'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-sans">
              {morningDeaths.length > 0
                ? 'Tournez l\'écran vers l\'assemblée et touchez la stèle pour dévoiler la victime :'
                : 'Les villageois découvrent avec stupeur que tout le monde a survécu à la nuit.'}
            </p>
          </div>

          {morningDeaths.length > 0 ? (
            <div className="space-y-6 w-full flex flex-col items-center">
              {morningDeaths.map((d, index) => {
                const isFlipped = morningDeathCardFlipped[d.player.id] || false;
                const isHunter = d.player.role === 'hunter';
                return (
                  <div key={d.player.id} className="flex flex-col items-center space-y-3 w-full">
                    <div className="text-center">
                      <span className="text-xs font-medieval text-amber-400 uppercase font-bold tracking-wider">
                        Victime #{index + 1}
                      </span>
                      <h3 className="text-xl font-cinzel font-bold text-white mt-0.5">
                        {isFlipped ? (
                          <span className="text-red-400 underline underline-offset-4">{d.player.name}</span>
                        ) : (
                          <span className="text-stone-400 italic">« Qui a péri sous la lune ? »</span>
                        )}
                      </h3>
                    </div>

                    <RoleCard
                      roleId={d.player.role}
                      playerName={isFlipped ? d.player.name : 'Mystère...'}
                      isRevealed={isFlipped}
                      onToggleReveal={() => {
                        const nextFlipped = !isFlipped;
                        setMorningDeathCardFlipped({
                          ...morningDeathCardFlipped,
                          [d.player.id]: nextFlipped
                        });
                        if (nextFlipped) {
                          sounds.playDeath();
                        }
                      }}
                      size="lg"
                    />

                    {isFlipped && (
                      <div className="p-3.5 bg-red-950/70 border border-red-700/60 rounded-2xl text-xs text-red-200 max-w-sm text-center shadow-lg">
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
              <p className="text-sm font-serif italic">Le Salvateur ou la Sorcière ont veillé ! Aucun mort à déplorer cette nuit.</p>
            </div>
          )}

          <button
            onClick={() => {
              setIsMorningRevealActive(false);
              setActiveCycleTab('DAY');
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-700 to-red-800 hover:opacity-90 text-white font-medieval font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
          >
            Ouvrir les Débats du Tribunal &rarr;
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. RÉVÉLATION DU CONDAMNÉ DU BÛCHER (VOTE DE JOUR)
  // =========================================================================
  if (isDayVoteRevealActive && executedPlayer) {
    const roleDef = ROLES[executedPlayer.role] || ROLES.villager;
    const isHunter = executedPlayer.role === 'hunter';

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-gradient-to-b from-[#190a0f] to-[#070305] border-2 border-red-700/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl candle-glow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest font-bold">
              🔥 Sentence du Tribunal Populaire
            </span>
            <h2 className="text-2xl sm:text-4xl font-cinzel text-white font-bold">
              {isDayCardFlipped ? `${executedPlayer.name} a été exécuté(e)` : 'Verdict de l\'Inquisition'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-sans">
              {isDayCardFlipped 
                ? `Les flammes révèlent enfin sa véritable nature :` 
                : `Tournez l'écran vers le village et touchez la carte pour révéler l'identité de ${executedPlayer.name} :`}
            </p>
          </div>

          <RoleCard
            roleId={executedPlayer.role}
            playerName={isDayCardFlipped ? executedPlayer.name : 'Condamné au bûcher'}
            isRevealed={isDayCardFlipped}
            onToggleReveal={() => {
              const next = !isDayCardFlipped;
              setIsDayCardFlipped(next);
              if (next) {
                sounds.playDeath();
              }
            }}
            size="lg"
          />

          {isDayCardFlipped && (
            <div className="p-4 bg-black/70 border-2 rounded-2xl text-center space-y-1 max-w-md w-full shadow-lg" style={{ borderColor: roleDef.color }}>
              <span className="text-xs font-medieval font-bold uppercase" style={{ color: roleDef.color }}>
                {roleDef.team === 'WEREWOLVES' ? '🐺 Un Monstre a Péri !' : '🛡️ Un Innocent Sacrifié...'}
              </span>
              <h4 className="text-xl font-cinzel font-bold text-white">{executedPlayer.name} était {roleDef.name}</h4>
              <p className="text-xs text-stone-400 italic pt-1 font-serif">{roleDef.shortDesc}</p>
            </div>
          )}

          {isDayCardFlipped && isHunter && (
            <div className="p-4 bg-orange-950/80 border-2 border-orange-600 rounded-2xl text-xs text-orange-200 font-medieval font-bold space-y-3 w-full max-w-md">
              <span className="block">🎯 LE CHASSEUR DÉGAINE SON MOUSQUET DANS SON DERNIER SOUFFLE !</span>
              <button
                onClick={() => {
                  setIsDayVoteRevealActive(false);
                  setHunterShootingPlayer(executedPlayer);
                }}
                className="w-full py-3 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-medieval font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all"
              >
                💥 Faire Tirer le Chasseur &rarr;
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setIsDayVoteRevealActive(false);
                setExecutedPlayer(null);
                setIsDayCardFlipped(false);
              }}
              className="px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-medieval font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-700"
            >
              Retourner au Tribunal &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Étapes nocturnes ordonnées
  const nightStepsSequence = [
    {
      id: 'cupid',
      roleName: 'Cupidon',
      title: '1. Cupidon — Les Liens Amoureux',
      script: '« Cupidon se réveille, et désigne deux personnes qui tomberont éperdument amoureuses ! »',
      hint: 'Choisissez 2 villageois ci-dessous pour les lier, puis touchez-les discrètement pour qu\'ils se reconnaissent.',
      roleDef: ROLES.cupid,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '✨ Magie Cupidon',
      condition: !hasLoversBeenChosen && dayNumber <= 1 && players.some(p => p.role === 'cupid' && p.isAlive),
    },
    {
      id: 'guard',
      roleName: 'Salvateur',
      title: '2. Salvateur — Protection Nocturne',
      script: '« Le Salvateur se réveille, et désigne un joueur à protéger cette nuit contre les loups... »',
      hint: settings?.guardSingleUse ? 'Action Unique : une seule protection pour toute la partie !' : 'Il ne peut pas protéger la même personne deux nuits consécutives.',
      roleDef: ROLES.guard,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '🛡️ Protection',
      condition: isGuardPowerAvailable,
    },
    {
      id: 'seer',
      roleName: 'Voyante',
      title: '3. Voyante — Sonde d\'Âme',
      script: '« La Voyante se réveille, et me montre la personne dont elle veut sonder la véritable nature... »',
      hint: settings?.seerSingleUse ? 'Action Unique : une seule sonde pour toute la partie !' : 'Montrez-lui silencieusement la carte du rôle désigné.',
      roleDef: ROLES.seer,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '🔮 Oeil Astral',
      condition: isSeerPowerAvailable,
    },
    {
      id: 'werewolf',
      roleName: 'Loups-Garous',
      title: '4. Loups-Garous — La Chasse',
      script: '« Les Loups-Garous se réveillent, se reconnaissent et désignent en silence leur victime... »',
      hint: 'Les loups doivent tomber d\'accord d\'un signe de tête.',
      roleDef: ROLES.werewolf,
      soundAction: () => sounds.playWolfHowl(),
      soundLabel: '🐺 Hurlement Meute',
      condition: players.some(p => (p.role === 'werewolf' || p.role === 'white_wolf') && p.isAlive),
    },
    {
      id: 'witch',
      roleName: 'Sorcière',
      title: '5. Sorcière — Les Potions',
      script: '« La Sorcière se réveille. Je lui montre la victime des loups... Veut-elle utiliser sa potion de guérison ? Sa potion d\'empoisonnement ? »',
      hint: 'Chaque potion n\'est utilisable qu\'UNE SEULE FOIS dans toute la partie !',
      roleDef: ROLES.witch,
      soundAction: () => sounds.playPotion(),
      soundLabel: '🧪 Élixir / Potion',
      condition: players.some(p => p.role === 'witch' && p.isAlive),
    }
  ].filter(s => s.condition !== false);

  const activeNightStep = nightStepsSequence[currentStepIndex] || nightStepsSequence[0];

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = nightStepsSequence[index];
    if (step && step.soundAction) {
      step.soundAction();
    }
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
        eliminatePlayer(targetWolf, 'Dévoré(e) par les Loups-Garous durant la nuit.');
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
        eliminatePlayer(witchKillsId, 'Empoisonné(e) par la Sorcière cette nuit.');
        deaths.push({
          player: witchVictim,
          roleDef: ROLES[witchVictim.role] || ROLES.villager,
          reason: 'Empoisonné(e) par la potion de la Sorcière.'
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
  };

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header Régie MJ en Grimoire d'Inquisition */}
      <div className="bg-gradient-to-r from-[#150a11] via-[#0d070c] to-[#080407] border-2 border-amber-700/50 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl candle-glow">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medieval text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
              <span>⚜</span> Régie du Conteur
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 font-bold border border-red-800/60 font-mono">
              Jour {dayNumber || 1} • {activeCycleTab === 'NIGHT' ? '🌙 Nuit Profonde' : '☀️ Place du Village'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-cinzel text-white font-bold">
            {activeCycleTab === 'NIGHT' ? 'Orchestration de la Nuit' : 'Tribunal & Bûcher du Village'}
          </h1>
        </div>

        {/* Console sonore analogique gothique */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartSecretReveal}
            className="px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-600/60 hover:bg-amber-900 text-amber-200 text-xs font-medieval font-bold transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            🃏 Passer les Cartes
          </button>
          <button
            onClick={() => sounds.playWolfHowl()}
            className="px-3 py-2 rounded-xl bg-red-950/90 border border-red-800/60 hover:bg-red-900 text-red-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            🐺 Loup
          </button>
          <button
            onClick={() => sounds.playBell()}
            className="px-3 py-2 rounded-xl bg-amber-950/90 border border-amber-700/60 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            🔔 Cloche
          </button>
          <button
            onClick={() => sounds.playGunshot()}
            className="px-3 py-2 rounded-xl bg-orange-950/90 border border-orange-700/60 hover:bg-orange-900 text-orange-200 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            💥 Fusil
          </button>
          <button
            onClick={() => sounds.playDeath()}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
          >
            ⚰️ Glas
          </button>
        </div>
      </div>

      {(!players || players.length === 0) ? (
        <div className="p-8 bg-[#100b12] border border-stone-800 rounded-3xl text-center space-y-4 shadow-xl">
          <h3 className="text-xl font-cinzel font-bold text-white">Aucune assemblée réunie</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto font-sans">
            Lancez une partie avec 8 villageois prédéfinis pour animer votre soirée ou configurez votre propre village.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleQuickDemoGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:opacity-90 text-white font-medieval font-bold text-xs cursor-pointer shadow-xl"
            >
              ✦ Lancer Directement (8 Joueurs)
            </button>
            <Link
              href="/setup"
              className="px-5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 hover:text-white font-medieval font-bold text-xs"
            >
              Configurer l'Assemblée &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SÉLECTEUR DE CYCLE : NUIT vs JOUR */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#120a10] to-[#080407] p-2.5 rounded-2xl border border-stone-800 font-medieval text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveCycleTab('NIGHT');
                  sounds.startNightLoop();
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCycleTab === 'NIGHT' 
                    ? 'bg-purple-950 text-purple-200 border border-purple-600/70 shadow-lg' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🌙 Sabbat de Nuit (Ambiance Active)</span>
              </button>
              <button
                onClick={handleWakeUpVillage}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCycleTab === 'DAY' 
                    ? 'bg-amber-950 text-amber-200 border border-amber-600/70 shadow-lg' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>☀️ Tribunal de Jour & Bûcher</span>
              </button>
            </div>

            <span className="text-stone-400 hidden sm:inline px-3 font-mono text-[11px]">
              {livingPlayers.length} âmes vivantes
            </span>
          </div>

          {/* ========================================================================= */}
          {/* VUE 1 : DÉROULEMENT SÉQUENTIEL DE LA NUIT */}
          {/* ========================================================================= */}
          {activeCycleTab === 'NIGHT' && activeNightStep && (
            <div className="bg-gradient-to-b from-[#140b13] to-[#070408] border-2 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl candle-glow" style={{ borderColor: activeNightStep.roleDef.color }}>
              {/* Fil d'Ariane des étapes de nuit */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
                <div className="flex items-center gap-2">
                  {nightStepsSequence.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medieval font-bold transition-all cursor-pointer ${
                        idx === currentStepIndex 
                          ? 'bg-amber-700 text-white shadow-md' 
                          : 'bg-black/40 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {idx + 1}. {step.roleName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => activeNightStep.soundAction()}
                  className="px-3.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 rounded-xl text-xs font-medieval font-bold text-purple-200 cursor-pointer shadow transition-colors"
                >
                  ▶ Déclencher {activeNightStep.soundLabel}
                </button>
              </div>

              {/* Panneau de l'étape active */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-36 h-36 shrink-0 bg-black/80 rounded-2xl border-2 border-white/10 p-3 flex items-center justify-center shadow-2xl">
                  <RoleArtwork roleId={activeNightStep.roleDef.id} className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                </div>

                <div className="space-y-3 flex-1 text-left w-full">
                  <div>
                    <span className="text-xs font-medieval font-bold uppercase tracking-wider" style={{ color: activeNightStep.roleDef.color }}>
                      {activeNightStep.roleDef.subtitle}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-cinzel text-white font-bold mt-0.5">
                      {activeNightStep.title}
                    </h2>
                  </div>

                  {/* Phrase à prononcer */}
                  <div className="p-4 bg-purple-950/40 border-l-4 border-purple-500 rounded-r-2xl space-y-1">
                    <span className="text-[10px] font-medieval uppercase font-bold text-purple-300 block">Incantation à réciter à voix haute :</span>
                    <p className="text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed">
                      {activeNightStep.script}
                    </p>
                  </div>
                  <p className="text-xs text-stone-400 font-sans italic">
                    💡 Indication Conteur : {activeNightStep.hint}
                  </p>
                </div>
              </div>

              {/* Sélection interactive des cibles */}
              <div className="pt-4 border-t border-stone-800 space-y-3">
                <span className="text-xs font-medieval uppercase text-stone-300 font-bold block">
                  Désigner ou valider l'action de l'entité :
                </span>
                
                {/* 1. CUPIDON */}
                {activeNightStep.id === 'cupid' && (
                  <div className="space-y-2">
                    <span className="text-xs text-pink-400 font-bold block font-medieval">
                      Sélectionnez les 2 âmes liées ({targetLovers.length} / 2) :
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

                {/* 2. SALVATEUR */}
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

                {/* 3. VOYANTE */}
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

                {/* 4. LOUPS */}
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

                {/* 5. SORCIÈRE */}
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
                          Victime des loups : <strong className="text-red-400">{players.find(p => p.id === targetWolf)?.name || 'Aucune victime'}</strong>
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
                              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/40' 
                              : 'bg-stone-800 text-stone-300 hover:text-white'
                        }`}
                      >
                        {witchPlayer?.hasUsedLifePotion ? 'Déjà Utilisée' : witchHeals ? 'Potion Activée ✓' : 'Sauver la Victime'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-medieval font-bold text-stone-300 block">
                        Potion d'Empoisonnement (Tuer une âme ciblée) :
                      </span>
                      
                      {witchPlayer?.hasUsedDeathPotion ? (
                        <p className="text-xs text-red-400 italic bg-red-950/20 p-2 rounded border border-red-900/30">
                          Cette potion a déjà été consommée plus tôt dans la partie.
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
                                    ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md shadow-purple-500/30' 
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

              {/* Navigation des rôles */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => goToStep(currentStepIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 font-medieval text-xs font-bold cursor-pointer"
                >
                  &larr; Entité Précédente
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

          {/* ========================================================================= */}
          {/* VUE 2 : PHASE DE JOUR & TRIBUNAL */}
          {/* ========================================================================= */}
          {activeCycleTab === 'DAY' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-b from-[#150a11] to-[#070408] border border-amber-600/40 rounded-3xl space-y-4 shadow-xl candle-glow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div>
                    <span className="text-xs font-medieval text-amber-400 uppercase font-bold tracking-widest">
                      Place Publique & Bûcher
                    </span>
                    <h2 className="text-2xl font-cinzel text-white font-bold mt-0.5">
                      Conseil de l'Inquisition
                    </h2>
                  </div>

                  <button
                    onClick={handleSleepVillage}
                    className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-medieval text-xs font-bold cursor-pointer shadow-lg"
                  >
                    🌙 Endormir le Village (Nuit Suivante) &rarr;
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  Laissez l'assemblée débattre et voter. Lorsqu'un suspect est condamné par la majorité, cliquez sur <strong>Condamner</strong> pour afficher la stèle révélatrice à toute la table.
                </p>
              </div>

              {/* Grille des joueurs vivants en stèles d'inquisition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {livingPlayers.map((p) => {
                  const role = ROLES[p.role] || ROLES.villager;
                  return (
                    <div
                      key={p.id}
                      className="p-4 bg-gradient-to-b from-[#110a11] to-[#070407] border rounded-2xl flex items-center justify-between gap-3 shadow-md"
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
                          className="px-2.5 py-1 bg-red-950/80 border border-red-600/50 text-red-200 hover:bg-red-900 rounded-lg font-bold cursor-pointer transition-colors"
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
