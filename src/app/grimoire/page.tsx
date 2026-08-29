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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
            Encyclopédie & Règles des Rôles
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
            Le Grimoire de Thiercelieux
          </h1>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un rôle (ex: Voyante, Loup...)"
          className="bg-[#10141f] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono w-full sm:w-80"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Liste des cartes à gauche */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filteredRoles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-[#181f30] border-slate-400 text-white' 
                    : 'bg-[#10141f] border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-[#141926]'
                }`}
                style={{ borderLeftWidth: '5px', borderLeftColor: role.color }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 bg-black/60 rounded-xl border border-white/10 p-1 flex items-center justify-center">
                    <RoleArtwork roleId={role.id} className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{role.name}</h3>
                    <span className="text-xs text-slate-400 block">{role.subtitle}</span>
                  </div>
                </div>

                <span 
                  className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: `${role.color}25`, color: role.color }}
                >
                  {role.team === 'WEREWOLVES' ? '🐺 Loup' : role.team === 'SOLO' ? '⚡ Solitaire' : '🛡️ Village'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fiche détaillée à droite */}
        <div 
          className="lg:col-span-7 bg-[#10141f] border-2 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col md:flex-row items-center md:items-start gap-6"
          style={{ borderColor: activeRole.color }}
        >
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-44 h-44 bg-black/80 rounded-2xl border-2 border-white/15 p-4 flex items-center justify-center">
              <RoleArtwork roleId={activeRole.id} className="w-full h-full" />
            </div>
            <span 
              className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border"
              style={{ backgroundColor: `${activeRole.color}20`, borderColor: activeRole.color, color: activeRole.color }}
            >
              {activeRole.team === 'WEREWOLVES' ? 'Meute des Loups' : activeRole.team === 'SOLO' ? 'Victoire Solitaire' : 'Camp des Villageois'}
            </span>
          </div>

          <div className="space-y-4 text-left flex-1 min-w-0">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                {activeRole.subtitle}
              </span>
              <h2 className="text-3xl font-bold text-white mt-1">
                {activeRole.name}
              </h2>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">Description du Pouvoir :</span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/50 p-4 rounded-xl border border-slate-800">
                {activeRole.description}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-amber-400">Citation / Esprit du rôle :</span>
              <p className="text-xs italic text-amber-200/90 font-serif border-l-2 border-amber-500 pl-3 py-1.5 bg-amber-950/20 rounded-r">
                {activeRole.quote}
              </p>
            </div>

            {activeRole.wakeScript && (
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-400">Phrase d'appel du MJ (Nuit) :</span>
                <p className="text-xs text-slate-300 italic bg-purple-950/20 p-3 rounded-xl border border-purple-500/30">
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
