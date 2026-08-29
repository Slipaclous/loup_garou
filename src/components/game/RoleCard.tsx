'use client';

import React, { useState } from 'react';
import { ROLES, RoleId } from '@/lib/roles';
import { RoleArtwork } from './RoleArtwork';

interface RoleCardProps {
  roleId: RoleId;
  playerName?: string;
  isRevealed?: boolean;
  onToggleReveal?: () => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleCard: React.FC<RoleCardProps> = ({
  roleId,
  playerName,
  isRevealed: controlledRevealed,
  onToggleReveal,
  interactive = true,
  size = 'md'
}) => {
  const [internalRevealed, setInternalRevealed] = useState(false);
  const isRevealed = controlledRevealed !== undefined ? controlledRevealed : internalRevealed;
  
  const role = ROLES[roleId] || ROLES.villager;

  const handleClick = () => {
    if (!interactive) return;
    if (onToggleReveal) {
      onToggleReveal();
    } else {
      setInternalRevealed(!internalRevealed);
    }
  };

  const sizeClasses = {
    sm: 'w-48 h-72',
    md: 'w-64 h-96',
    lg: 'w-80 h-[480px]'
  }[size];

  return (
    <div 
      onClick={handleClick}
      className={`perspective-container ${sizeClasses} relative select-none cursor-pointer`}
    >
      <div 
        className={`w-full h-full flipper ${isRevealed ? 'flipped' : ''}`}
      >
        {/* RECTO : Dos de carte mystique (Secret) */}
        <div className="front p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/30 flex flex-col justify-between shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 font-bold uppercase">
              Thiercelieux
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              N° {role.nightOrder > 0 ? `0${role.nightOrder}` : '00'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-800/90 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <svg viewBox="0 0 100 100" className="w-14 h-14" fill="none">
                <circle cx="50" cy="50" r="35" fill="#fef08a" opacity="0.95" />
                <path d="M 50 15 A 35 35 0 0 0 50 85 A 30 30 0 1 1 50 15 Z" fill="#0f172a" />
              </svg>
            </div>
            {playerName && (
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Identité secrète de</span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{playerName}</h3>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-3 text-center">
            <span className="text-xs font-mono text-amber-300 font-bold animate-pulse">
              👉 Touchez pour révéler la carte
            </span>
          </div>
        </div>

        {/* VERSO : Rôle Révélé avec Artwork couleur */}
        <div 
          className="back p-6 bg-gradient-to-b from-slate-900 via-neutral-950 to-black border-2 flex flex-col justify-between text-left shadow-2xl overflow-hidden"
          style={{ borderColor: role.color }}
        >
          {/* Header */}
          <div className="border-b border-white/10 pb-3 flex items-start justify-between">
            <div>
              <span 
                className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: `${role.color}30`, color: role.color }}
              >
                {role.team === 'WEREWOLVES' ? '🐺 Meute de Loups' : role.team === 'SOLO' ? '⚡ Solitaire' : '🛡️ Village'}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1.5">
                {role.name}
              </h2>
            </div>
          </div>

          {/* Artwork SVG */}
          <div className="my-auto py-2 flex items-center justify-center">
            <RoleArtwork roleId={role.id} className="w-40 h-40 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
          </div>

          {/* Pouvoir & Citation */}
          <div className="space-y-2">
            <p className="text-xs italic text-slate-300 leading-snug pl-2.5 border-l-2 font-serif" style={{ borderColor: role.color }}>
              {role.quote}
            </p>
            <div className="bg-black/70 p-2.5 rounded-lg border border-white/10">
              <p className="text-xs text-neutral-200 leading-snug">
                {role.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
