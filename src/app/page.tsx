'use client';

import React from 'react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { ROLES } from '@/lib/roles';
import { RoleArtwork } from '@/components/game/RoleArtwork';

export default function HomePage() {
  const { setGameMode } = useGameStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 sm:py-20 max-w-5xl mx-auto w-full">
      <div className="w-full flex flex-col items-start space-y-10">
        {/* Eyebrow & Headline */}
        <div className="space-y-3 text-left border-b border-slate-800 pb-8 w-full">
          <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
            Jeu d'ambiance et de déduction
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white leading-tight">
            Les Loups-Garous de Thiercelieux
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Chaque nuit, les loups-garous dévorent un villageois. Chaque jour, les survivants débattent pour démasquer et exécuter les monstres.
          </p>
        </div>

        {/* 2 Modes de jeu en cartes modernes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Mode 1: Passe & Joue */}
          <Link
            href="/setup"
            onClick={() => setGameMode('PASS_AND_PLAY')}
            className="p-6 bg-[#10141f] border-2 border-red-500/40 hover:border-red-500 rounded-2xl flex flex-col justify-between group space-y-6 transition-all duration-200 hover:scale-[1.01] shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-wider">Mode 01</span>
                <span className="text-xs text-slate-400 font-mono bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">1 Seul Écran</span>
              </div>
              <h3 className="text-2xl font-display text-white font-bold group-hover:text-red-400 transition-colors">
                Passe & Joue &rarr;
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Distribution secrète des cartes avec animation 3D, déroulement automatique de la nuit rôle par rôle et tribunal de vote de jour.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-red-400">
              <span>4 à 18 Joueurs</span>
              <span className="group-hover:translate-x-1 transition-transform">Configurer & Lancer &rarr;</span>
            </div>
          </Link>

          {/* Mode 2: Maître du Jeu */}
          <Link
            href="/gm"
            onClick={() => setGameMode('GM_ASSISTANT')}
            className="p-6 bg-[#10141f] border-2 border-purple-500/40 hover:border-purple-500 rounded-2xl flex flex-col justify-between group space-y-6 transition-all duration-200 hover:scale-[1.01] shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 uppercase font-bold tracking-wider">Mode 02</span>
                <span className="text-xs text-slate-400 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">Assistant Conteur</span>
              </div>
              <h3 className="text-2xl font-display text-white font-bold group-hover:text-purple-400 transition-colors">
                Maître du Jeu (MJ) &rarr;
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tableau de bord pour le meneur de la soirée : scripts narratifs pas-à-pas, état des joueurs en direct et raccourcis d'effets sonores.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-purple-400">
              <span>Mode Conteur</span>
              <span className="group-hover:translate-x-1 transition-transform">Ouvrir le Tableau &rarr;</span>
            </div>
          </Link>
        </div>

        {/* Aperçu Visuel des Rôles */}
        <div className="w-full space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
              Bestiaire & Personnages
            </span>
            <Link href="/grimoire" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold">
              Consulter tout le Grimoire ({Object.keys(ROLES).length} Rôles) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Object.values(ROLES).slice(0, 6).map((role) => (
              <Link 
                key={role.id} 
                href="/grimoire"
                className="p-3 bg-[#10141f] border border-slate-800 hover:border-slate-600 rounded-xl flex flex-col items-center text-center group transition-colors shadow"
              >
                <div className="w-14 h-14 bg-black/50 rounded-lg border border-white/10 p-1 flex items-center justify-center mb-2">
                  <RoleArtwork roleId={role.id} className="w-full h-full" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate w-full">
                  {role.name}
                </span>
                <span className="text-[10px] font-mono mt-0.5" style={{ color: role.color }}>
                  {role.team === 'WEREWOLVES' ? 'Loup' : 'Village'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
