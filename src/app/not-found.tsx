'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-red-950/80 border border-red-800 flex items-center justify-center text-4xl shadow-xl">
        ⚰️
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-cinzel font-bold text-white">404 — Égaré dans les Ténèbres</h1>
        <p className="text-xs font-sans text-stone-400">
          Cette ruelle du village de Thiercelieux a été dévorée par les brumes.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 text-white font-medieval font-bold text-xs uppercase tracking-wider shadow-lg"
      >
        Retourner au Village →
      </Link>
    </div>
  );
}
