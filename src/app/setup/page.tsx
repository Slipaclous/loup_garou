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
    gameMode,
    settings,
    updateSettings
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
    const name = newName.trim() || `Âme ${playerNames.length + 1}`;
    const nextList = [...playerNames, name];
    setPlayerNames(nextList);
    setNewName('');
    setSelectedRoles(getRecommendedDeck(nextList.length));
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length <= 4) {
      alert('Il faut au minimum 4 âmes pour invoquer le rituel de Thiercelieux.');
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

  const handleLaunchGame = () => {
    useGameStore.setState({
      players: playerNames.map((name, i) => ({
        id: `player-${Date.now()}-${i}`,
        name,
        role: (selectedRoles || [])[i] || 'villager',
        isAlive: true,
        isLover: false,
        isProtected: false,
        elderLives: (selectedRoles || [])[i] === 'elder' ? 2 : 1,
        isFoolRevealed: false,
        hasUsedLifePotion: false,
        hasUsedDeathPotion: false,
        hasUsedSeerPower: false,
        hasUsedGuardPower: false,
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
      <div className="flex-1 flex items-center justify-center p-12 text-stone-500 font-mono text-xs">
        Invocation de l'Assemblée...
      </div>
    );
  }

  const currentSelectedRoles = selectedRoles || [];
  const isBalanced = currentSelectedRoles.length === playerNames.length;
  const wolfCount = currentSelectedRoles.filter(r => r === 'werewolf' || r === 'white_wolf').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 relative z-10">
      {/* Header Gothique */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-red-900/40 pb-6">
        <div>
          <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <span>⚜</span> Assemblée du Village • Configuration
          </span>
          <h1 className="text-3xl sm:text-5xl font-cinzel text-white font-bold mt-1 drop-shadow">
            Les Âmes de Thiercelieux
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoBalance}
            className="px-4 py-2.5 text-xs font-medieval font-bold rounded-xl btn-inquisition-gold shadow-lg cursor-pointer"
          >
            ✦ Équilibrage Sacré ({playerNames.length} Âmes)
          </button>

          <button
            onClick={handleLaunchGame}
            disabled={!isBalanced || wolfCount === 0}
            className={`px-6 py-2.5 text-xs font-bold font-medieval uppercase tracking-wider rounded-xl transition-all shadow-xl cursor-pointer ${
              isBalanced && wolfCount > 0
                ? 'btn-inquisition-primary'
                : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            Sceller les Destins →
          </button>
        </div>
      </div>

      {/* OPTIONS DE JEU / RÈGLES PERSONNALISÉES */}
      <div className="altar-panel p-6 sm:p-7 space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <span className="text-xs font-medieval text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>⚙️</span> Décrets de l'Inquisition (Fréquence des Pouvoirs)
          </span>
          <span className="text-[11px] font-mono text-stone-400">Variantes Sacrées</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option Voyante */}
          <div className="p-4 inquisition-box flex items-center justify-between gap-3 border border-purple-800/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medieval font-bold text-white">🔮 Voyante</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/40 font-bold">
                  {settings.seerSingleUse ? 'Action Unique (1x)' : 'Toutes les Nuits (Standard)'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 font-serif italic">
                {settings.seerSingleUse 
                  ? 'La voyante ne peut sonder une carte qu\'une seule fois dans la partie.' 
                  : 'La voyante sonde une carte secrète chaque nuit.'}
              </p>
            </div>

            <button
              onClick={() => updateSettings({ seerSingleUse: !settings.seerSingleUse })}
              className={`px-3.5 py-2 rounded-xl text-xs font-medieval font-bold transition-all cursor-pointer ${
                settings.seerSingleUse 
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/50' 
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {settings.seerSingleUse ? '1 Seule Fois ✓' : 'Chaque Nuit'}
            </button>
          </div>

          {/* Option Salvateur */}
          <div className="p-4 inquisition-box flex items-center justify-between gap-3 border border-blue-800/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medieval font-bold text-white">🛡️ Salvateur</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-500/40 font-bold">
                  {settings.guardSingleUse ? 'Action Unique (1x)' : 'Toutes les Nuits (Standard)'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 font-serif italic">
                {settings.guardSingleUse 
                  ? 'Le salvateur ne peut protéger une personne qu\'une seule fois dans la partie.' 
                  : 'Le salvateur protège un joueur chaque nuit (jamais le même 2 nuits d\'affilée).'}
              </p>
            </div>

            <button
              onClick={() => updateSettings({ guardSingleUse: !settings.guardSingleUse })}
              className={`px-3.5 py-2 rounded-xl text-xs font-medieval font-bold transition-all cursor-pointer ${
                settings.guardSingleUse 
                  ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {settings.guardSingleUse ? '1 Seule Fois ✓' : 'Chaque Nuit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne Joueurs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h2 className="text-sm font-medieval text-amber-300 uppercase font-bold tracking-wider">
              Âmes Invoquées ({playerNames.length})
            </h2>
            <span className="text-xs text-stone-400 font-mono">Min. 4</span>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du joueur..."
              className="flex-1 bg-black/70 border border-stone-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-medieval shadow-inner"
            />
            <button
              type="submit"
              className="px-5 py-2.5 btn-inquisition-gold rounded-xl text-xs font-medieval font-bold text-white transition-all cursor-pointer"
            >
              + Invoquer
            </button>
          </form>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {playerNames.map((name, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3.5 inquisition-box hover:border-amber-700/60 transition-all shadow"
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
                    className="bg-transparent text-sm font-medieval font-bold text-white focus:outline-none focus:border-b border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePlayer(idx)}
                  className="text-xs text-stone-500 hover:text-red-400 font-mono px-2 transition-colors cursor-pointer"
                >
                  Bannir ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Rôles avec Artworks (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h2 className="text-sm font-medieval text-amber-300 uppercase font-bold tracking-wider">
              Cartes du Tarot ({currentSelectedRoles.length} / {playerNames.length})
            </h2>
            <span className="text-xs font-medieval">
              Loups : <strong className="text-red-400 font-bold">{wolfCount}</strong> | Village : <strong className="text-amber-400 font-bold">{currentSelectedRoles.length - wolfCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {Object.values(ROLES).map((role) => {
              const count = currentSelectedRoles.filter(r => r === role.id).length;
              const isSelected = count > 0;

              return (
                <div
                  key={role.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#1c0e18] to-[#10060e] border-amber-500 shadow-lg' 
                      : 'inquisition-box opacity-60 hover:opacity-100'
                  }`}
                  style={{ borderLeftWidth: isSelected ? '4px' : '1px', borderLeftColor: isSelected ? role.color : undefined }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-14 shrink-0 bg-black rounded-lg overflow-hidden border border-white/10 shadow">
                      <RoleArtwork roleId={role.id} className="w-full h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medieval font-bold text-white truncate">{role.name}</h4>
                        {count > 0 && (
                          <span 
                            className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded shadow"
                            style={{ backgroundColor: role.color }}
                          >
                            x{count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 font-serif italic">{role.shortDesc}</p>
                    </div>
                  </div>

                  {/* Contrôles d'ajout / retrait */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-800/80">
                    <span 
                      className="text-[10px] font-mono uppercase font-bold"
                      style={{ color: role.color }}
                    >
                      {role.team === 'WEREWOLVES' ? '🐺 Loup' : role.team === 'SOLO' ? '⚡ Solo' : '🛡️ Village'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={count === 0}
                        onClick={() => handleRemoveRoleInstance(role.id)}
                        className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white font-bold flex items-center justify-center text-xs transition-colors cursor-pointer border border-stone-700"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddRoleInstance(role.id)}
                        className="w-7 h-7 rounded-lg bg-red-900 hover:bg-red-800 border border-red-600 text-white font-bold flex items-center justify-center text-xs transition-colors cursor-pointer shadow"
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
