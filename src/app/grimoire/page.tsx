'use client';

import React, { useState } from 'react';
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 relative z-10">
      {/* Header Grimoire Gothique */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-red-900/30 pb-6">
        <div>
          <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <span>⚜</span> Codex & Encyclopédie Occulte
          </span>
          <h1 className="text-3xl sm:text-5xl font-cinzel font-bold text-white mt-1 drop-shadow">
            Le Grimoire de Thiercelieux
          </h1>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un rôle (ex: Voyante, Loup...)"
          className="bg-[#120a10] border border-amber-800/40 rounded-xl px-4 py-2.5 text-xs text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-mono w-full sm:w-80 shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Liste des parchemins à gauche */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredRoles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#1c0f18] to-[#120810] border-amber-600/70 text-white shadow-xl scale-[1.01]' 
                    : 'bg-gradient-to-b from-[#100b12] to-[#070408] border-stone-800/80 text-stone-300 hover:border-amber-800/50 hover:bg-[#140d17]'
                }`}
                style={{ borderLeftWidth: '5px', borderLeftColor: role.color }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 bg-black/70 rounded-xl border border-white/10 p-1.5 flex items-center justify-center shadow">
                    <RoleArtwork roleId={role.id} className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medieval font-bold text-amber-100">{role.name}</h3>
                    <span className="text-xs text-stone-400 block">{role.subtitle}</span>
                  </div>
                </div>

                <span 
                  className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border border-current/30"
                  style={{ backgroundColor: `${role.color}20`, color: role.color }}
                >
                  {role.team === 'WEREWOLVES' ? '🐺 Loup' : role.team === 'SOLO' ? '⚡ Solo' : '🛡️ Village'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fiche d'Inquisition détaillée à droite */}
        <div 
          className="lg:col-span-7 bg-gradient-to-b from-[#130b13] via-[#0b060b] to-[#050305] border-2 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6 candle-glow relative overflow-hidden"
          style={{ borderColor: activeRole.color }}
        >
          <div className="shrink-0 flex flex-col items-center gap-3 z-10">
            <div className="w-48 h-48 bg-gradient-to-b from-stone-900 via-neutral-950 to-black rounded-2xl border-2 border-white/15 p-4 flex items-center justify-center shadow-2xl">
              <RoleArtwork roleId={activeRole.id} className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]" />
            </div>
            <span 
              className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-sm"
              style={{ backgroundColor: `${activeRole.color}25`, borderColor: activeRole.color, color: activeRole.color }}
            >
              {activeRole.team === 'WEREWOLVES' ? 'Meute des Loups' : activeRole.team === 'SOLO' ? 'Victoire Solitaire' : 'Camp des Villageois'}
            </span>
          </div>

          <div className="space-y-4 text-left flex-1 min-w-0 z-10">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500/80">
                {activeRole.subtitle}
              </span>
              <h2 className="text-3xl font-cinzel font-bold text-white mt-0.5">
                {activeRole.name}
              </h2>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medieval font-bold uppercase text-stone-300">Description du Pouvoir :</span>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-black/60 p-4 rounded-xl border border-white/10 font-sans">
                {activeRole.description}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medieval font-bold uppercase text-amber-400">Esprit & Citation :</span>
              <p className="text-xs italic text-amber-200/90 font-serif border-l-2 border-amber-600 pl-3 py-1.5 bg-amber-950/30 rounded-r">
                « {activeRole.quote} »
              </p>
            </div>

            {activeRole.wakeScript && (
              <div className="space-y-1">
                <span className="text-xs font-medieval font-bold uppercase text-purple-400">Incantation du Conteur (Nuit) :</span>
                <p className="text-xs text-purple-200 italic bg-purple-950/30 p-3 rounded-xl border border-purple-800/40 font-serif">
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
