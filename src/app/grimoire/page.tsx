'use client';

import React, { useState } from 'react';
import { AtmosphereBackground } from '@/components/effects/AtmosphereBackground';
import { RoleArtwork } from '@/components/game/RoleArtwork';
import { ROLES, RoleId } from '@/lib/roles';

export default function GrimoirePage() {
  const [search, setSearch] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>('werewolf');

  const filteredRoles = Object.values(ROLES).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeRole = ROLES[selectedRoleId] || ROLES.werewolf;

  return (
    <div className="relative flex-1 flex flex-col px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto w-full space-y-8">
      <AtmosphereBackground isNight={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
            Encyclopédie des 11 Rôles
          </span>
          <h1 className="text-3xl sm:text-4xl font-display text-white font-bold mt-1">
            Grimoire de Thiercelieux
          </h1>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher (ex: Voyante, Sorcière...)"
          className="bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 font-mono w-full sm:w-72"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Liste cliquable avec sélection réactive */}
        <div className="lg:col-span-5 space-y-2">
          {filteredRoles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected 
                    ? 'bg-[#1e2538] border-white text-white shadow-xl scale-[1.02]' 
                    : 'bg-[#12141a] border-white/10 text-neutral-300 hover:border-white/30 hover:bg-[#181e2e]'
                }`}
                style={{ borderLeftWidth: '5px', borderLeftColor: role.color }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 bg-black/50 rounded-lg border border-white/10 p-1 flex items-center justify-center">
                    <RoleArtwork roleId={role.id} className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{role.name}</h3>
                    <span className="text-xs text-neutral-400 block">{role.subtitle}</span>
                  </div>
                </div>

                <span 
                  className="text-[10px] font-mono font-bold uppercase px-2 py-1 rounded"
                  style={{ backgroundColor: `${role.color}25`, color: role.color }}
                >
                  {role.team === 'WEREWOLVES' ? '🐺 Loup' : role.team === 'SOLO' ? '⚡ Solitaire' : '🛡️ Village'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Détail du Rôle Sélectionné avec Artwork HD & Pouvoirs */}
        <div 
          className="lg:col-span-7 bg-[#12141a] border-2 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6"
          style={{ borderColor: activeRole.color }}
        >
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-48 h-48 bg-gradient-to-b from-slate-900 via-neutral-950 to-black rounded-2xl border-2 border-white/15 p-4 flex items-center justify-center shadow-2xl">
              <RoleArtwork roleId={activeRole.id} className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
            </div>
            <span 
              className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
              style={{ backgroundColor: `${activeRole.color}20`, borderColor: activeRole.color, color: activeRole.color }}
            >
              {activeRole.team === 'WEREWOLVES' ? 'Meute des Loups' : activeRole.team === 'SOLO' ? 'Victoire Solo' : 'Camp des Villageois'}
            </span>
          </div>

          <div className="space-y-4 text-left flex-1 min-w-0">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
                {activeRole.subtitle}
              </span>
              <h2 className="text-3xl font-display font-bold text-white mt-1">
                {activeRole.name}
              </h2>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-neutral-300">Description du Pouvoir :</span>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-black/50 p-3.5 rounded-xl border border-white/10">
                {activeRole.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-amber-400">Citation / Esprit du rôle :</span>
              <p className="text-xs italic text-amber-200/90 font-serif border-l-2 border-amber-500 pl-3 py-1.5 bg-amber-950/20 rounded-r">
                {activeRole.quote}
              </p>
            </div>

            {activeRole.wakeScript && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase text-purple-400">Phrase d'appel du MJ (Nuit) :</span>
                <p className="text-xs text-neutral-300 italic bg-purple-950/20 p-2.5 rounded-lg border border-purple-500/30">
                  « {activeRole.wakeScript} »
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
