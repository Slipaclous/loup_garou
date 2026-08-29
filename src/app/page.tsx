'use client';

import React from 'react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { ROLES } from '@/lib/roles';
import { RoleArtwork } from '@/components/game/RoleArtwork';

export default function HomePage() {
  const { setGameMode } = useGameStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 sm:py-20 max-w-5xl mx-auto w-full relative z-10">
      <div className="w-full flex flex-col items-center text-center space-y-12">
        {/* Eyebrow & Titre Cinématographique Gothique */}
        <div className="space-y-4 max-w-3xl border-b border-red-900/30 pb-10 w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 shadow-[0_0_15px_rgba(185,28,28,0.3)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] font-mono tracking-widest text-red-300 uppercase font-bold">
              Édition Horreur & Nuit de Sang
            </span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-stone-200 to-amber-600/70 tracking-wider leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
            Les Loups-Garous
            <span className="block text-2xl sm:text-4xl font-medieval text-red-500/90 mt-1">de Thiercelieux</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl font-serif italic leading-relaxed pt-2">
            « Quand le soleil s’éteint sur le village maudit, les bêtes s’éveillent dans l’ombre pour réclamer leur tribut de chair fraîche... »
          </p>
        </div>

        {/* 2 Modes de jeu en stèles gothiques sculptées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl text-left">
          {/* Mode 1: Passe & Joue */}
          <Link
            href="/setup"
            onClick={() => setGameMode('PASS_AND_PLAY')}
            className="p-7 bg-gradient-to-b from-[#140b10] to-[#080407] border-2 border-red-800/40 hover:border-red-600 rounded-3xl flex flex-col justify-between group space-y-6 transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_35px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-widest">
                  Rituel 01
                </span>
                <span className="text-[10px] text-amber-300 font-mono bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-700/50">
                  📱 1 Seul Écran
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-cinzel text-amber-100 font-bold group-hover:text-red-400 transition-colors">
                Passe & Joue &rarr;
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                Chaque joueur découvre son rôle secret en 3D, puis passe l’écran pour traverser la nuit guidée et affronter le tribunal du bûcher.
              </p>
            </div>

            <div className="pt-4 border-t border-red-900/30 flex items-center justify-between text-xs font-medieval text-red-400 font-bold z-10">
              <span>👥 4 à 18 Joueurs</span>
              <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider">Entrer dans l'Arène &rarr;</span>
            </div>
          </Link>

          {/* Mode 2: Maître du Jeu */}
          <Link
            href="/gm"
            onClick={() => setGameMode('GM_ASSISTANT')}
            className="p-7 bg-gradient-to-b from-[#110d18] to-[#06040a] border-2 border-purple-800/40 hover:border-purple-500 rounded-3xl flex flex-col justify-between group space-y-6 transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_35px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 uppercase font-bold tracking-widest">
                  Rituel 02
                </span>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-700/50">
                  🎭 Conteur / Régie MJ
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-cinzel text-amber-100 font-bold group-hover:text-purple-400 transition-colors">
                Maître du Jeu (MJ) &rarr;
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                Grimoire complet pour orchestrer la table : scripts narratifs à voix haute, régie d'effets sonores studio et écrans de révélations cinématiques.
              </p>
            </div>

            <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between text-xs font-medieval text-purple-400 font-bold z-10">
              <span>📜 Mode Conteur</span>
              <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider">Ouvrir le Grimoire &rarr;</span>
            </div>
          </Link>
        </div>

        {/* Bestiaire des Rôles en médaillons médiévaux */}
        <div className="w-full space-y-5 pt-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <span className="text-xs font-medieval uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1.5">
              <span>⚜</span> Bestiaire & Entités Démoniaques
            </span>
            <Link href="/grimoire" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold transition-colors">
              Consulter le Grimoire ({Object.keys(ROLES).length} Rôles) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {Object.values(ROLES).slice(0, 6).map((role) => (
              <Link 
                key={role.id} 
                href="/grimoire"
                className="p-3.5 bg-gradient-to-b from-[#100b12] to-[#080509] border border-stone-800 hover:border-amber-700/60 rounded-2xl flex flex-col items-center text-center group transition-all duration-200 hover:-translate-y-1 shadow-lg"
              >
                <div className="w-14 h-14 bg-black/60 rounded-xl border border-white/10 p-1.5 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
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
