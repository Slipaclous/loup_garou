'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleArtwork } from '@/components/game/RoleArtwork';
import { RoleCard } from '@/components/game/RoleCard';
import { useGameStore, Player } from '@/lib/store';
import { ROLES, RoleId, DEFAULT_PLAYER_NAMES, getRecommendedDeck } from '@/lib/roles';
import { sounds } from '@/lib/sound';

export default function GameMasterPage() {
  const {
    players,
    logs,
    eliminatePlayer,
    setCaptain,
    setNightCupidLovers,
    startGame,
    dayNumber,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  
  // Modal de distribution secrète des rôles
  const [isRevealingRoles, setIsRevealingRoles] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Écran de révélation des morts du matin
  const [isMorningRevealActive, setIsMorningRevealActive] = useState(false);
  const [morningDeaths, setMorningDeaths] = useState<{ player: Player; roleDef: typeof ROLES.werewolf; reason: string }[]>([]);
  const [morningDeathCardFlipped, setMorningDeathCardFlipped] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Déclenchement automatique de la boucle audio nocturne
  useEffect(() => {
    if (activeCycleTab === 'NIGHT' && !isRevealingRoles && !isMorningRevealActive) {
      sounds.startNightLoop();
    } else {
      sounds.stopNightLoop();
    }
    return () => {
      sounds.stopNightLoop();
    };
  }, [activeCycleTab, isRevealingRoles, isMorningRevealActive]);

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

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 font-mono text-sm">
        Chargement du Grimoire MJ...
      </div>
    );
  }

  const livingPlayers = (players || []).filter((p) => p.isAlive);
  const deadPlayers = (players || []).filter((p) => !p.isAlive);
  const witchPlayer = players.find((p) => p.role === 'witch');

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
        sounds.playWolfHowl();
        sounds.startNightLoop();
      }
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full space-y-6">
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

            <button
              onClick={() => {
                setIsRevealingRoles(false);
                sounds.startNightLoop();
              }}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors cursor-pointer"
            >
              Passer la révélation & aller au tableau MJ &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. RÉVÉLATION CINÉMATIQUE DES MORTS DU MATIN (ANONYME JUSQU'AU CLIC)
  // =========================================================================
  if (isMorningRevealActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="w-full bg-[#0e121d] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl shadow-amber-950/30">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
              Lever du Jour sur Thiercelieux ☀️
            </span>
            <h2 className="text-2xl sm:text-4xl font-display text-white font-bold">
              {morningDeaths.length > 0 ? 'Le Bilan Tragique de la Nuit' : 'Une Nuit Paisible...'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {morningDeaths.length > 0
                ? 'Tournez l\'écran vers le village et touchez la carte pour découvrir la victime et son rôle :'
                : 'Les villageois se réveillent. Tout le monde a survécu à la nuit !'}
            </p>
          </div>

          {morningDeaths.length > 0 ? (
            <div className="space-y-6 w-full flex flex-col items-center">
              {morningDeaths.map((d, index) => {
                const isFlipped = morningDeathCardFlipped[d.player.id] || false;
                return (
                  <div key={d.player.id} className="flex flex-col items-center space-y-3 w-full">
                    {/* Nom masqué tant que la carte n'est pas cliquée */}
                    <div className="text-center">
                      <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">
                        Victime #{index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        {isFlipped ? (
                          <span className="text-red-400 font-bold underline underline-offset-4">{d.player.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">« Qui a péri cette nuit ? »</span>
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
                        // Joue le glas funèbre au moment précis de la révélation
                        if (nextFlipped) {
                          sounds.playDeath();
                        }
                      }}
                      size="lg"
                    />

                    {isFlipped && (
                      <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs text-red-200 max-w-sm text-center shadow-lg animate-fadeIn">
                        <p><strong>{d.player.name}</strong> ({d.roleDef.name})</p>
                        <p className="text-[11px] text-red-300/80 mt-0.5">{d.reason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-300 font-bold space-y-2">
              <div className="text-4xl">🕊️</div>
              <p className="text-sm">Le Salvateur ou la Sorcière ont veillé ! Aucun mort à déplorer cette nuit.</p>
            </div>
          )}

          <button
            onClick={() => {
              setIsMorningRevealActive(false);
              setActiveCycleTab('DAY');
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            Ouvrir les Débats du Village &rarr;
          </button>
        </div>
      </div>
    );
  }

  // Étapes nocturnes ordonnées (CUPIDON N'APPARAÎT QUE LA PREMIÈRE NUIT ET DISPARAÎT SI DÉJÀ JOUÉ)
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
      hint: 'Il ne peut pas protéger la même personne deux nuits consécutives.',
      roleDef: ROLES.guard,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '🛡️ Protection',
      condition: players.some(p => p.role === 'guard' && p.isAlive),
    },
    {
      id: 'seer',
      roleName: 'Voyante',
      title: '3. Voyante — Sonde d\'Âme',
      script: '« La Voyante se réveille, et me montre la personne dont elle veut sonder la véritable nature... »',
      hint: 'Montrez-lui silencieusement la carte du rôle désigné.',
      roleDef: ROLES.seer,
      soundAction: () => sounds.playMagicChime(),
      soundLabel: '🔮 Oeil Astral',
      condition: players.some(p => p.role === 'seer' && p.isAlive),
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

  // Jouer le son approprié lors du passage à une étape
  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = nightStepsSequence[index];
    if (step && step.soundAction) {
      step.soundAction();
    }
  };

  // Passer à la phase de Jour avec son de cloche uniquement (le glas de mort sera joué sur clic de carte)
  const handleWakeUpVillage = () => {
    sounds.stopNightLoop();
    sounds.playBell();

    const deaths: { player: Player; roleDef: typeof ROLES.werewolf; reason: string }[] = [];

    // 1. Sauvegarder l'utilisation définitive des potions de la Sorcière dans le store
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

    // 2. Si la victime des loups n'a pas été sauvée ni protégée
    if (targetWolf && targetWolf !== targetGuard && !witchHeals) {
      const wolfVictim = players.find(p => p.id === targetWolf);
      if (wolfVictim) {
        eliminatePlayer(targetWolf, 'Dévoré(e) par les Loups-Garous durant la nuit.');
        deaths.push({
          player: wolfVictim,
          roleDef: ROLES[wolfVictim.role] || ROLES.villager,
          reason: 'Dévoré(e) par les Loups-Garous durant la nuit.'
        });

        // Mort de l'amoureux si lié
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

    // 3. Si une potion de mort a été utilisée par la Sorcière
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

  // Passer à la Nuit Suivante avec hurlement d'appel
  const handleSleepVillage = () => {
    sounds.playWolfHowl();
    setActiveCycleTab('NIGHT');
    goToStep(0);
    setTargetWolf(null);
    setTargetGuard(null);
    setWitchHeals(false);
    setWitchKillsId(null);
    setSeerTargetId(null);
    setIsMorningRevealActive(false);
  };

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header MJ */}
      <div className="bg-[#10141f] border border-purple-500/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 uppercase font-bold tracking-widest">
              Tableau du Conteur
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-500/30">
              Jour {dayNumber || 1} • {activeCycleTab === 'NIGHT' ? '🌙 Phase de Nuit (Ambiance active)' : '☀️ Phase de Jour'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display text-white font-bold">
            {activeCycleTab === 'NIGHT' ? 'Orchestration de la Nuit' : 'Conseil & Débats du Village'}
          </h1>
        </div>

        {/* Boutons sonores & Action révélation */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartSecretReveal}
            className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/50 hover:bg-purple-900 text-purple-200 text-xs font-bold font-mono transition-colors cursor-pointer shadow"
          >
            🃏 Faire Passer les Cartes
          </button>
          <button
            onClick={() => sounds.playWolfHowl()}
            className="px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500/40 hover:bg-red-900 text-red-200 text-xs font-bold transition-colors cursor-pointer shadow"
          >
            🐺 Loup
          </button>
          <button
            onClick={() => sounds.playBell()}
            className="px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500/40 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-colors cursor-pointer shadow"
          >
            🔔 Cloche
          </button>
          <button
            onClick={() => sounds.playGunshot()}
            className="px-3 py-1.5 rounded-xl bg-orange-950/90 border border-orange-500/40 hover:bg-orange-900 text-orange-200 text-xs font-bold transition-colors cursor-pointer shadow"
          >
            💥 Fusil
          </button>
          <button
            onClick={() => sounds.playDeath()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow"
          >
            ⚰️ Glas
          </button>
        </div>
      </div>

      {(!players || players.length === 0) ? (
        <div className="p-8 bg-[#10141f] border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
          <h3 className="text-xl font-bold text-white">Aucune partie active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Lancez une partie avec 8 joueurs prédéfinis pour animer votre soirée ou créez la vôtre.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleQuickDemoGame}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono cursor-pointer shadow-lg shadow-purple-600/30"
            >
              ✦ Lancer Directement (8 Joueurs)
            </button>
            <Link
              href="/setup"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono"
            >
              Configurer la Partie &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SÉLECTEUR DE PHASE : NUIT vs JOUR */}
          <div className="flex items-center justify-between bg-[#10141f] p-2 rounded-2xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveCycleTab('NIGHT');
                  sounds.startNightLoop();
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCycleTab === 'NIGHT' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌙 Phase de Nuit (Ambiance active)</span>
              </button>
              <button
                onClick={handleWakeUpVillage}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCycleTab === 'DAY' 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>☀️ Phase de Jour & Tribunal</span>
              </button>
            </div>

            <span className="text-slate-400 hidden sm:inline px-3">
              {livingPlayers.length} villageois en vie
            </span>
          </div>

          {/* ========================================================================= */}
          {/* VUE 1 : DÉROULEMENT SÉQUENTIEL DE LA NUIT (STEP BY STEP AVEC SONS) */}
          {/* ========================================================================= */}
          {activeCycleTab === 'NIGHT' && activeNightStep && (
            <div className="bg-[#10141f] border-2 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl" style={{ borderColor: activeNightStep.roleDef.color }}>
              {/* Fil d'Ariane des étapes de nuit */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  {nightStepsSequence.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        idx === currentStepIndex 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'bg-black/40 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {idx + 1}. {step.roleName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => activeNightStep.soundAction()}
                  className="px-3 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 rounded-lg text-xs font-mono font-bold text-purple-300 cursor-pointer shadow transition-colors"
                >
                  ▶ Jouer {activeNightStep.soundLabel}
                </button>
              </div>

              {/* Panneau de l'étape active */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 shrink-0 bg-black/60 rounded-2xl border-2 border-white/10 p-2 flex items-center justify-center shadow-xl">
                  <RoleArtwork roleId={activeNightStep.roleDef.id} className="w-full h-full" />
                </div>

                <div className="space-y-3 flex-1 text-left w-full">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: activeNightStep.roleDef.color }}>
                      {activeNightStep.roleDef.subtitle}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display text-white font-bold mt-0.5">
                      {activeNightStep.title}
                    </h2>
                  </div>

                  {/* Phrase à prononcer */}
                  <div className="p-4 bg-purple-950/30 border-l-4 border-purple-500 rounded-r-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block">Phrase à lire à voix haute :</span>
                    <p className="text-sm sm:text-base font-serif italic text-white leading-relaxed">
                      {activeNightStep.script}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    💡 Astuce : {activeNightStep.hint}
                  </p>
                </div>
              </div>

              {/* Sélection interactive des cibles */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-mono uppercase text-slate-300 font-bold block">
                  Désigner ou valider l'action :
                </span>
                
                {/* 1. CUPIDON : Sélection des 2 Amoureux */}
                {activeNightStep.id === 'cupid' && (
                  <div className="space-y-2">
                    <span className="text-xs text-pink-400 font-bold block">
                      Sélectionnez les 2 amoureux ({targetLovers.length} / 2 sélectionnés) :
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
                            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-pink-950 border-pink-500 text-pink-200 shadow-lg shadow-pink-500/30' 
                                : 'bg-black/40 border-slate-800 text-slate-300 hover:border-slate-600'
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
                            sounds.playMagicChime();
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-950 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/30' 
                              : 'bg-black/40 border-slate-800 text-slate-300 hover:border-slate-600'
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
                            sounds.playMagicChime();
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-purple-950 border-purple-500 text-purple-200' 
                              : 'bg-black/40 border-slate-800 text-slate-300 hover:border-slate-600'
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
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-red-950 border-red-500 text-red-200 shadow-lg shadow-red-500/30' 
                              : 'bg-black/40 border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <span className="truncate block">{p.name}</span>
                          {isSelected && <span className="text-red-400 text-[10px] block mt-0.5">🐺 Cible des Loups</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 5. SORCIÈRE : Gestion des Potions à Usage Unique */}
                {activeNightStep.id === 'witch' && (
                  <div className="space-y-4">
                    {/* Statut des potions */}
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className={`px-2.5 py-1 rounded border ${witchPlayer?.hasUsedLifePotion ? 'bg-red-950/40 border-red-800 text-red-400 line-through' : 'bg-emerald-950/50 border-emerald-500 text-emerald-300'}`}>
                        Potion de Vie : {witchPlayer?.hasUsedLifePotion ? 'Épuisée' : 'Disponible (1x)'}
                      </span>
                      <span className={`px-2.5 py-1 rounded border ${witchPlayer?.hasUsedDeathPotion ? 'bg-red-950/40 border-red-800 text-red-400 line-through' : 'bg-purple-950/50 border-purple-500 text-purple-300'}`}>
                        Potion de Mort : {witchPlayer?.hasUsedDeathPotion ? 'Épuisée' : 'Disponible (1x)'}
                      </span>
                    </div>

                    {/* Action 1 : Sauver la victime */}
                    <div className="flex items-center justify-between p-3.5 bg-black/40 border border-slate-800 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-white block">Potion de Guérison</span>
                        <span className="text-[11px] text-slate-400">
                          Victime des loups : <strong className="text-red-400">{players.find(p => p.id === targetWolf)?.name || 'Aucune victime'}</strong>
                        </span>
                      </div>
                      
                      <button
                        disabled={witchPlayer?.hasUsedLifePotion || !targetWolf}
                        onClick={() => {
                          setWitchHeals(!witchHeals);
                          sounds.playPotion();
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          witchPlayer?.hasUsedLifePotion 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : witchHeals 
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {witchPlayer?.hasUsedLifePotion ? 'Déjà Utilisée' : witchHeals ? 'Potion Activée ✓' : 'Sauver la Victime'}
                      </button>
                    </div>

                    {/* Action 2 : Empoisonner un joueur */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-300 block">
                        Potion d'Empoisonnement (Tuer un joueur ciblé) :
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
                                className={`p-2.5 rounded-lg border text-xs font-bold text-left truncate transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md shadow-purple-500/30' 
                                    : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
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

              {/* Bouton de navigation séquentielle */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => goToStep(currentStepIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  &larr; Étape Précédente
                </button>

                {currentStepIndex + 1 < nightStepsSequence.length ? (
                  <button
                    onClick={() => goToStep(currentStepIndex + 1)}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    Rôle Suivant &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleWakeUpVillage}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-orange-600/30"
                  >
                    ☀️ Réveiller le Village (Lever du Jour) &rarr;
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
              <div className="p-6 bg-[#10141f] border border-amber-500/40 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest">
                      Place Publique de Thiercelieux
                    </span>
                    <h2 className="text-2xl font-display text-white font-bold mt-0.5">
                      Conseil & Condamnations du Village
                    </h2>
                  </div>

                  <button
                    onClick={handleSleepVillage}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    🌙 Endormir le Village (Nuit Suivante) &rarr;
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Laissez les villageois débattre et voter. Lorsqu'un joueur est désigné au bûcher ou abattu, cliquez sur son bouton <strong>Éliminer</strong> (joue le glas funèbre) ou son coup de fusil.
                </p>
              </div>

              {/* Grille des joueurs avec statuts */}
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
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                          {p.isCaptain && <span className="text-[10px] text-amber-400 font-bold">👑</span>}
                          {p.isLover && <span className="text-[10px] text-pink-500 font-bold">♥</span>}
                        </div>
                        <span className="text-xs font-bold block" style={{ color: role.color }}>
                          {role.name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0 font-mono text-[11px]">
                        <button
                          onClick={() => {
                            if (confirm(`Éliminer ${p.name} ?`)) {
                              eliminatePlayer(p.id, 'Éliminé par le vote du village.');
                              sounds.playDeath();
                            }
                          }}
                          className="px-2.5 py-1 bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900 rounded font-bold cursor-pointer"
                        >
                          Éliminer
                        </button>
                        {p.role === 'hunter' && (
                          <button
                            onClick={() => sounds.playGunshot()}
                            className="px-2 py-0.5 bg-orange-950/60 border border-orange-500/40 text-orange-300 rounded text-[10px] cursor-pointer"
                          >
                            💥 Tir
                          </button>
                        )}
                        {!p.isCaptain && (
                          <button
                            onClick={() => setCaptain(p.id)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded cursor-pointer"
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
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-red-400 font-bold uppercase block">
                    ☠️ Cimetière ({deadPlayers.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {deadPlayers.map((p) => {
                      const role = ROLES[p.role] || ROLES.villager;
                      return (
                        <div key={p.id} className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-lg text-xs font-mono text-slate-400">
                          <span className="font-bold text-slate-200 block truncate">{p.name}</span>
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
