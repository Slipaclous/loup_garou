'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = playerName.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setError('Veuillez entrer un code de rituel valide à 4 lettres.');
      return;
    }
    if (!cleanName) {
      setError('Veuillez inscrire votre prénom ou pseudonyme.');
      return;
    }

    // Sauvegarder l'identité locale dans le localStorage
    const playerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('lg_player_id', playerId);
    localStorage.setItem('lg_player_name', cleanName);

    router.push(`/room/${cleanCode}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full relative z-10">
      <div className="w-full altar-panel p-6 sm:p-8 space-y-6 text-center shadow-2xl">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-xl bg-black border border-stone-800 mx-auto flex items-center justify-center shadow-inner">
            <img src="/images/textures/wax_seal.png" alt="Sceau" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
            Rituel Multijoueur • 📱 1 Téléphone par Âme
          </span>
          <h1 className="text-2xl sm:text-3xl font-cinzel text-white font-bold">
            Rejoindre l'Assemblée
          </h1>
          <p className="text-xs text-stone-400 font-sans">
            Entrez le code de la salle affiché sur l'écran du salon et votre nom.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200 font-medieval">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-medieval text-stone-300 font-bold uppercase tracking-wider block">
              Code de la Salle :
            </label>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: LUNE"
              className="w-full bg-black/90 border border-stone-700 rounded-xl px-4 py-3 text-center text-xl font-cinzel font-bold text-white tracking-widest uppercase focus:outline-none focus:border-stone-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medieval text-stone-300 font-bold uppercase tracking-wider block">
              Votre Nom ou Pseudonyme :
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ex: Camille"
              className="w-full bg-black/90 border border-stone-700 rounded-xl px-4 py-2.5 text-sm font-medieval font-bold text-white focus:outline-none focus:border-stone-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-medieval font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer mt-2"
          >
            Lier mon Âme au Rituel →
          </button>
        </form>

        <div className="pt-3 border-t border-stone-800">
          <Link href="/" className="text-xs font-mono text-stone-500 hover:text-stone-300 transition-colors">
            ← Retour aux modes de jeu
          </Link>
        </div>
      </div>
    </div>
  );
}
