'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { soundEnabled, toggleSound, resetGame, phase } = useGameStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0c10]/90 backdrop-blur border-b border-[#232734] px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-display text-lg tracking-tight text-white font-medium">
            Thiercelieux
          </span>
          <span className="text-[11px] font-mono text-[#8b92a5] border-l border-[#232734] pl-3 hidden sm:inline">
            Édition Soirée
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-3 text-xs font-medium">
          <Link
            href="/grimoire"
            className={`px-3 py-1.5 rounded transition-colors ${
              pathname === '/grimoire'
                ? 'bg-[#181b24] text-white border border-[#3b4255]'
                : 'text-[#8b92a5] hover:text-white'
            }`}
          >
            Rôles & Règles
          </Link>

          <Link
            href="/gm"
            className={`px-3 py-1.5 rounded transition-colors ${
              pathname === '/gm'
                ? 'bg-[#181b24] text-white border border-[#3b4255]'
                : 'text-[#8b92a5] hover:text-white'
            }`}
          >
            Mode Conteur (MJ)
          </Link>

          {phase !== 'SETUP' && (
            <button
              onClick={() => {
                if (confirm('Réinitialiser la partie ?')) {
                  resetGame();
                  window.location.href = '/setup';
                }
              }}
              className="px-2.5 py-1 text-[11px] text-[#e53e3e] hover:bg-[#e53e3e]/10 rounded transition-colors font-mono"
            >
              Reset
            </button>
          )}

          <button
            onClick={toggleSound}
            className="px-2 py-1 text-[11px] font-mono text-[#8b92a5] hover:text-white transition-colors"
          >
            Son : {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </header>
  );
};
