'use client';

import React from 'react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { ROLES } from '@/lib/roles';
import { RoleArtwork } from '@/components/game/RoleArtwork';

export default function HomePage() {
  const { setGameMode } = useGameStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 sm:py-20 max-w-6xl mx-auto w-full relative z-10">
      <div className="w-full flex flex-col items-center text-center space-y-12">
        {/* Eyebrow & Titre Cinématographique Macabre */}
        <div className="space-y-4 max-w-4xl border-b border-red-900/40 pb-10 w-full flex flex-col items-center relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-950/90 border border-red-700/80 shadow-[0_0_20px_rgba(225,29,72,0.4)]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-[11px] font-mono tracking-widest text-red-200 uppercase font-bold">
              ✦ Chroniques de Thiercelieux • Inquisition Macabre ✦
            </span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-stone-200 to-amber-600 tracking-wider leading-tight drop-shadow-[0_6px_30px_rgba(0,0,0,0.95)]">
            Les Loups-Garous
            <span className="block text-2xl sm:text-5xl font-medieval text-red-600 mt-2 drop-shadow-[0_0_20px_rgba(225,29,72,0.6)]">de Thiercelieux</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl font-serif italic leading-relaxed pt-2">
            « Quand le soleil s’éteint sur le village maudit, les bêtes s’éveillent dans l’ombre pour réclamer leur tribut de chair fraîche... »
          </p>
        </div>

        {/* 2 Stèles d'Inquisition texturées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 w-full max-w-5xl text-left">
          {/* Mode 1: Passe & Joue */}
          <Link
            href="/setup"
            onClick={() => setGameMode('PASS_AND_PLAY')}
            className="altar-panel-blood p-8 rounded-3xl flex flex-col justify-between group space-y-6 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
          >
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <span>🩸</span> Rituel 01
                </span>
                <span className="text-[10px] text-amber-300 font-mono bg-red-950/90 px-3 py-1 rounded-full border border-red-700/60 shadow">
                  📱 1 Seul Écran
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-cinzel text-amber-100 font-bold group-hover:text-red-400 transition-colors drop-shadow">
                Passe & Joue →
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                Chaque joueur sonde son âme secrète avec les cartes peintes de Tarot Occulte, puis passe l’appareil pour vivre la nuit guidée et faire face au tribunal du bûcher.
              </p>
            </div>

            <div className="pt-4 border-t border-red-900/50 flex items-center justify-between text-xs font-medieval text-red-400 font-bold z-10">
              <span>👥 4 à 18 Âmes</span>
              <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider text-amber-300">Entrer dans l'Arène →</span>
            </div>
          </Link>

          {/* Mode 2: Maître du Jeu */}
          <Link
            href="/gm"
            onClick={() => setGameMode('GM_ASSISTANT')}
            className="altar-panel p-8 rounded-3xl flex flex-col justify-between group space-y-6 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
          >
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <span>⚜</span> Rituel 02
                </span>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-950/90 px-3 py-1 rounded-full border border-purple-700/60 shadow">
                  🎭 Autel du Conteur (MJ)
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-cinzel text-amber-100 font-bold group-hover:text-amber-400 transition-colors drop-shadow">
                Maître du Jeu (MJ) →
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                L'Autel suprême de l'Inquisiteur : sablier de tribunal animé avec battements de coeur oppressants, incantations audio, régie d'ambiance et révélations de cartes de tarot 3D.
              </p>
            </div>

            <div className="pt-4 border-t border-amber-900/50 flex items-center justify-between text-xs font-medieval text-amber-400 font-bold z-10">
              <span>📜 Console Régie MJ</span>
              <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider text-amber-300">Ouvrir l'Autel →</span>
            </div>
          </Link>
        </div>

        {/* Bestiaire des Cartes de Tarot */}
        <div className="w-full space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <span className="text-xs font-medieval uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
              <span>⚜</span> Bestiaire Sacré & Entités Démoniaques
            </span>
            <Link href="/grimoire" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold transition-colors">
              Consulter le Grimoire ({Object.keys(ROLES).length} Rôles) →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Object.values(ROLES).slice(0, 6).map((role) => (
              <Link 
                key={role.id} 
                href="/grimoire"
                className="p-3 inquisition-box hover:border-amber-500/70 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1.5 shadow-xl"
              >
                <div className="w-full aspect-[2/3] bg-black rounded-xl overflow-hidden mb-2.5 shadow-md">
                  <RoleArtwork roleId={role.id} className="w-full h-full" />
                </div>
                <span className="text-xs font-medieval font-bold text-amber-100 group-hover:text-amber-300 transition-colors truncate w-full">
                  {role.name}
                </span>
                <span className="text-[10px] font-mono mt-0.5 font-bold" style={{ color: role.color }}>
                  {role.team === 'WEREWOLVES' ? '🐺 Loup' : '🛡️ Village'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
