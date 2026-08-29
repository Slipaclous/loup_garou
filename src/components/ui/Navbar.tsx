'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { soundEnabled, toggleSound, resetGame, phase } = useGameStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070509]/90 backdrop-blur border-b border-red-900/30 px-6 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Gothique */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-cinzel text-xl tracking-wider text-amber-100 font-bold group-hover:text-red-400 transition-colors drop-shadow">
            Thiercelieux
          </span>
          <span className="text-[11px] font-medieval text-stone-400 border-l border-red-900/40 pl-3 hidden sm:inline tracking-wider">
            Édition Horreur 🌙
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-medieval font-bold">
          <Link
            href="/grimoire"
            className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
              pathname === '/grimoire'
                ? 'bg-red-950/80 text-amber-200 border border-red-800/60 shadow-[0_0_15px_rgba(185,28,28,0.3)]'
                : 'text-stone-400 hover:text-amber-100 hover:bg-white/5'
            }`}
          >
            📜 Grimoire
          </Link>

          <Link
            href="/gm"
            className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
              pathname === '/gm'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-stone-400 hover:text-purple-200 hover:bg-white/5'
            }`}
          >
            🎭 Conteur (MJ)
          </Link>

          {phase !== 'SETUP' && (
            <button
              onClick={() => {
                if (confirm('Réinitialiser la partie et revenir au village ?')) {
                  resetGame();
                  window.location.href = '/setup';
                }
              }}
              className="px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-950/60 border border-transparent hover:border-red-800/40 rounded-lg transition-colors font-mono cursor-pointer"
            >
              Reset
            </button>
          )}

          <button
            onClick={toggleSound}
            className="px-2.5 py-1 text-[11px] font-mono text-stone-400 hover:text-amber-200 transition-colors cursor-pointer"
          >
            Son : {soundEnabled ? 'ON 🔊' : 'OFF 🔇'}
          </button>
        </div>
      </div>
    </header>
  );
};
