'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { soundEnabled, toggleSound, resetGame, phase } = useGameStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050205]/95 backdrop-blur-md border-b border-amber-900/40 px-6 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Gothique */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-700/60 flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition-transform">
            🐺
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel text-lg sm:text-xl tracking-wider text-amber-100 font-bold group-hover:text-red-400 transition-colors drop-shadow">
              Thiercelieux
            </span>
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest -mt-1 hidden sm:block">
              Inquisition & Sceau du Sang
            </span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medieval font-bold">
          <Link
            href="/grimoire"
            className={`px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
              pathname === '/grimoire'
                ? 'bg-amber-950/80 text-amber-200 border-amber-600/70 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                : 'bg-black/40 border-stone-800/80 text-stone-400 hover:text-amber-100 hover:border-stone-600'
            }`}
          >
            📜 Grimoire
          </Link>

          <Link
            href="/gm"
            className={`px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
              pathname === '/gm'
                ? 'bg-red-950/90 text-red-200 border-red-600/70 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                : 'bg-black/40 border-stone-800/80 text-stone-400 hover:text-red-300 hover:border-stone-600'
            }`}
          >
            🎭 Autel du MJ
          </Link>

          {/* Bouton Réinitialiser Toujours Accessible */}
          <button
            onClick={() => {
              if (confirm('Abandonner la traque et réinitialiser la partie du village ?')) {
                resetGame();
                window.location.href = '/setup';
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 text-[11px] font-medieval font-bold transition-all shadow cursor-pointer"
          >
            🔄 Réinitialiser
          </button>

          <button
            onClick={toggleSound}
            className="px-3 py-1.5 rounded-xl bg-black/50 border border-stone-800 text-[11px] font-mono text-stone-400 hover:text-amber-200 hover:border-amber-600/40 transition-colors cursor-pointer"
          >
            {soundEnabled ? '🔊 Son Actif' : '🔇 Muet'}
          </button>
        </div>
      </div>
    </header>
  );
};
