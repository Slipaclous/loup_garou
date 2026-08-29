'use client';

import React from 'react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { ROLES } from '@/lib/roles';
import { RoleArtwork } from '@/components/game/RoleArtwork';

export default function HomePage() {
  const { setGameMode } = useGameStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-16 max-w-6xl mx-auto w-full relative z-10">
      {/* Grande Bannière de Bas-Relief Médiéval avec Gargouilles */}
      <div className="w-full max-w-4xl mb-6 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl relative">
        <img 
          src="/images/textures/banner_inquisition.jpg" 
          alt="Bannière d'Inquisition de Thiercelieux" 
          className="w-full h-36 sm:h-52 object-cover object-center brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030204] via-transparent to-black/60 pointer-events-none" />
      </div>

      <div className="w-full flex flex-col items-center text-center space-y-10">
        {/* Eyebrow avec Sceau de Cire Authentique & Titre Gothique */}
        <div className="space-y-4 max-w-3xl border-b border-stone-800/80 pb-8 w-full flex flex-col items-center relative">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black border border-stone-800 shadow-md">
            <img src="/images/textures/wax_seal.png" alt="Sceau" className="w-5 h-5 object-contain" />
            <span className="text-[11px] font-mono tracking-widest text-stone-300 uppercase font-bold">
              ✦ Chroniques de Thiercelieux • Inquisition Macabre ✦
            </span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-cinzel font-bold text-white tracking-wider leading-tight drop-shadow-xl">
            Les Loups-Garous
            <span className="block text-2xl sm:text-5xl font-medieval text-rose-500 mt-1">de Thiercelieux</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl font-serif italic leading-relaxed pt-2">
            « Quand le soleil s’éteint sur le village maudit, les bêtes s’éveillent dans l’ombre pour réclamer leur tribut de chair fraîche... »
          </p>
        </div>

        {/* 2 Stèles d'Inquisition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl text-left">
          {/* Mode 1: Passe & Joue */}
          <Link
            href="/setup"
            onClick={() => setGameMode('PASS_AND_PLAY')}
            className="altar-panel-blood p-8 rounded-2xl flex flex-col justify-between group space-y-6 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
          >
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-rose-400 uppercase font-bold tracking-widest flex items-center gap-2">
                  <img src="/images/textures/wax_seal.png" alt="Sceau" className="w-4 h-4 object-contain" />
                  Rituel 01
                </span>
                <span className="text-[10px] text-stone-300 font-mono bg-black px-3 py-1 rounded-full border border-stone-800">
                  📱 1 Seul Écran
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-cinzel text-stone-100 font-bold group-hover:text-rose-400 transition-colors">
                Passe & Joue →
              </h3>

              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
                Chaque joueur sonde son rôle avec les cartes de Tarot Occulte, puis passe l’appareil pour vivre la nuit guidée et faire face au tribunal du bûcher.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-900 flex items-center justify-between text-xs font-medieval text-rose-400 font-bold z-10">
              <span>👥 4 à 18 Âmes</span>
              <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider text-stone-300">Entrer dans l'Arène →</span>
            </div>
          </Link>

          {/* Mode 2: Maître du Jeu */}
          <Link
            href="/gm"
            onClick={() => setGameMode('GM_ASSISTANT')}
            className="altar-panel p-8 rounded-2xl flex flex-col justify-between group space-y-6 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
          >
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-400 uppercase font-bold tracking-widest flex items-center gap-2">
                  <img src="/images/textures/wax_seal.png" alt="Sceau" className="w-4 h-4 object-contain" />
                  Rituel 02
                </span>
                <span className="text-[10px] text-stone-300 font-mono bg-black px-3 py-1 rounded-full border border-stone-800">
                  🎭 Autel du Conteur (MJ)
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-cinzel text-stone-100 font-bold group-hover:text-amber-400 transition-colors">
                Maître du Jeu (MJ) →
              </h3>

              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
                L'Autel suprême de l'Inquisiteur : sablier de tribunal animé avec battements de cœur, incantations audio, régie d'ambiance et révélations de cartes de tarot 3D.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-900 flex items-center justify-between text-xs font-medieval text-stone-400 font-bold z-10">
              <span>📜 Console Régie MJ</span>
              <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider text-stone-300">Ouvrir l'Autel →</span>
            </div>
          </Link>
        </div>

        {/* Bestiaire des Cartes de Tarot */}
        <div className="w-full space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <span className="text-xs font-medieval uppercase tracking-widest text-stone-400 font-bold flex items-center gap-2">
              <span>⚜</span> Bestiaire Sacré & Entités Démoniaques
            </span>
            <Link href="/grimoire" className="text-xs font-mono text-stone-300 hover:text-white font-bold transition-colors">
              Consulter le Grimoire ({Object.keys(ROLES).length} Rôles) →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Object.values(ROLES).slice(0, 6).map((role) => (
              <Link 
                key={role.id} 
                href="/grimoire"
                className="p-3 inquisition-box hover:border-stone-600 flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1 shadow-xl"
              >
                <div className="w-full aspect-[2/3] bg-black rounded-lg overflow-hidden mb-2.5 shadow-md">
                  <RoleArtwork roleId={role.id} className="w-full h-full" />
                </div>
                <span className="text-xs font-medieval font-bold text-stone-200 group-hover:text-white transition-colors truncate w-full">
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
