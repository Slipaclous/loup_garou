'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleArtwork } from '@/components/game/RoleArtwork';
import { useGameStore } from '@/lib/store';
import { ROLES, RoleId, DEFAULT_PLAYER_NAMES, getRecommendedDeck } from '@/lib/roles';

export default function SetupPage() {
  const router = useRouter();
  const { 
    selectedRoles, 
    setSelectedRoles, 
    startGame, 
    players: existingPlayers,
    gameMode
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES.slice(0, 6));
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setMounted(true);
    if (existingPlayers && existingPlayers.length > 0) {
      setPlayerNames(existingPlayers.map(p => p.name));
    }
  }, [existingPlayers]);

  const handleAddPlayer = () => {
    const name = newName.trim() || `Joueur ${playerNames.length + 1}`;
    const nextList = [...playerNames, name];
    setPlayerNames(nextList);
    setNewName('');
    setSelectedRoles(getRecommendedDeck(nextList.length));
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length <= 4) {
      alert('Il faut au minimum 4 joueurs pour jouer aux Loups-Garous.');
      return;
    }
    const nextList = playerNames.filter((_, i) => i !== index);
    setPlayerNames(nextList);
    setSelectedRoles(getRecommendedDeck(nextList.length));
  };

  const handleAddRoleInstance = (roleId: RoleId) => {
    setSelectedRoles([...(selectedRoles || []), roleId]);
  };

  const handleRemoveRoleInstance = (roleId: RoleId) => {
    const next = [...(selectedRoles || [])];
    const idx = next.lastIndexOf(roleId);
    if (idx !== -1) {
      next.splice(idx, 1);
      setSelectedRoles(next);
    }
  };

  const handleAutoBalance = () => {
    setSelectedRoles(getRecommendedDeck(playerNames.length));
  };

  const currentSelectedRoles = selectedRoles || getRecommendedDeck(playerNames.length);
  const isBalanced = currentSelectedRoles.length === playerNames.length;
  const wolfCount = currentSelectedRoles.filter(r => r === 'werewolf' || r === 'white_wolf').length;

  const handleLaunchGame = () => {
    if (!isBalanced) {
      alert(`Attention : ${playerNames.length} joueurs configurés mais ${currentSelectedRoles.length} cartes choisies. Ajustez les cartes pour avoir le même nombre.`);
      return;
    }
    if (wolfCount === 0) {
      alert('Il faut au moins un Loup-Garou dans la partie !');
      return;
    }

    useGameStore.setState({
      selectedRoles: currentSelectedRoles,
      players: playerNames.map((name, i) => ({
        id: `p-${i}-${Date.now()}`,
        name: name.trim() || `Joueur ${i + 1}`,
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

    if (gameMode === 'GM_ASSISTANT') {
      router.push('/gm');
    } else {
      router.push('/play');
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 font-mono text-sm">
        Chargement de la configuration...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-8 sm:py-12 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
            Configuration de la Partie
          </span>
          <h1 className="text-3xl sm:text-4xl font-display text-white font-bold mt-1">
            Les Habitants de Thiercelieux
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoBalance}
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            ✦ Équilibrage Recommandé ({playerNames.length} Joueurs)
          </button>

          <button
            onClick={handleLaunchGame}
            disabled={!isBalanced || wolfCount === 0}
            className={`px-5 py-2.5 text-xs font-bold font-mono rounded-xl transition-all shadow-lg cursor-pointer ${
              isBalanced && wolfCount > 0
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-105'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            Distribuer les Rôles &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Joueurs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono text-slate-300 uppercase font-bold">
              Joueurs ({playerNames.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Min. 4</span>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Prénom d'un ami..."
              className="flex-1 bg-[#10141f] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-mono font-bold text-white transition-colors cursor-pointer"
            >
              + Ajouter
            </button>
          </form>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {playerNames.map((name, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-[#10141f] border border-slate-800 rounded-xl hover:border-slate-700 transition-all shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...playerNames];
                      updated[idx] = e.target.value;
                      setPlayerNames(updated);
                    }}
                    className="bg-transparent text-sm font-medium text-white focus:outline-none focus:border-b border-red-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePlayer(idx)}
                  className="text-xs text-slate-500 hover:text-red-400 font-mono px-2 transition-colors cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Rôles avec Artworks (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono text-slate-300 uppercase font-bold">
              Cartes ({currentSelectedRoles.length} / {playerNames.length})
            </h2>
            <span className="text-xs font-mono">
              Loups : <strong className="text-red-400">{wolfCount}</strong> | Village : <strong className="text-amber-400">{currentSelectedRoles.length - wolfCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {Object.values(ROLES).map((role) => {
              const count = currentSelectedRoles.filter(r => r === role.id).length;
              const isSelected = count > 0;

              return (
                <div
                  key={role.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected 
                      ? 'bg-[#141926] border-slate-600 shadow-md' 
                      : 'bg-[#10141f] border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                  style={{ borderLeftWidth: isSelected ? '4px' : '1px', borderLeftColor: isSelected ? role.color : undefined }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 shrink-0 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center p-1">
                      <RoleArtwork roleId={role.id} className="w-full h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{role.name}</h4>
                        {count > 0 && (
                          <span 
                            className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded"
                            style={{ backgroundColor: role.color }}
                          >
                            x{count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                        {role.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80">
                    <span 
                      className="text-[10px] font-mono font-bold uppercase"
                      style={{ color: role.color }}
                    >
                      {role.team === 'WEREWOLVES' ? '🐺 Loup' : role.team === 'SOLO' ? '⚡ Solitaire' : '🛡️ Village'}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        type="button"
                        onClick={() => handleRemoveRoleInstance(role.id)}
                        disabled={count === 0}
                        className="w-6 h-6 rounded bg-black/50 border border-slate-700 hover:border-slate-500 disabled:opacity-30 text-white text-xs flex items-center justify-center font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddRoleInstance(role.id)}
                        className="w-6 h-6 rounded bg-black/50 border border-slate-700 hover:border-slate-500 text-white text-xs flex items-center justify-center font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
