'use client';

import React from 'react';
import { RoleId, ROLES } from '@/lib/roles';
import { RoleArtwork } from './RoleArtwork';

interface RoleCardProps {
  roleId: RoleId;
  playerName?: string;
  isRevealed?: boolean;
  onToggleReveal?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  roleId,
  playerName,
  isRevealed = false,
  onToggleReveal,
  size = 'md',
  className = '',
}) => {
  const role = ROLES[roleId] || ROLES.villager;

  const sizeClasses = {
    sm: 'w-48 h-68',
    md: 'w-64 h-92',
    lg: 'w-76 h-108 sm:w-84 sm:h-120',
  }[size];

  return (
    <div
      onClick={onToggleReveal}
      className={`perspective-container ${sizeClasses} cursor-pointer group select-none ${className}`}
    >
      <div className={`flipper ${isRevealed ? 'flipped' : ''}`}>
        {/* ========================================================================= */}
        {/* DOS DE LA CARTE : SCEAU OCCULTE & GRIMOIRE ANCIEN GOTHIC */}
        {/* ========================================================================= */}
        <div className="front bg-gradient-to-b from-[#120a10] via-[#090508] to-[#040204] border-2 border-amber-700/50 rounded-3xl p-6 flex flex-col items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.9)] candle-glow overflow-hidden relative">
          {/* Gravure d'angles anciens */}
          <div className="absolute top-3 left-3 text-amber-600/40 text-xs font-mono">⚜</div>
          <div className="absolute top-3 right-3 text-amber-600/40 text-xs font-mono">⚜</div>
          <div className="absolute bottom-3 left-3 text-amber-600/40 text-xs font-mono">⚜</div>
          <div className="absolute bottom-3 right-3 text-amber-600/40 text-xs font-mono">⚜</div>

          {/* En-tête joueur */}
          <div className="w-full text-center space-y-1 z-10">
            <span className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest block font-bold">
              ✦ Sceau du Destin ✦
            </span>
            <h3 className="font-medieval text-xl sm:text-2xl text-amber-100 font-bold tracking-wide truncate max-w-full">
              {playerName || 'Villageois'}
            </h3>
          </div>

          {/* Sceau occulte central rougeoyant */}
          <div className="relative my-auto z-10 flex items-center justify-center">
            {/* Cercle rituel extérieur */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amber-600/30 flex items-center justify-center p-3 animate-[spin_60s_linear_infinite]">
              <div className="w-full h-full rounded-full border border-red-800/40 border-dashed" />
            </div>

            {/* Oeil des Ombres au centre */}
            <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-red-950 via-neutral-950 to-black border-2 border-amber-600/60 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(185,28,28,0.4)]">
              <span className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">🐺</span>
              <span className="text-[8px] font-mono text-amber-400 font-bold uppercase tracking-widest mt-1">Secret</span>
            </div>
          </div>

          {/* Pied de carte */}
          <div className="w-full text-center z-10">
            <span className="text-[11px] font-medieval text-amber-400/90 group-hover:text-amber-200 transition-colors uppercase tracking-wider block">
              ⚰️ Touchez pour dévoiler l'Âme ⚰️
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FACE DE LA CARTE : ARTWORK HD & POUVOIR DANS UN CADRE PARCHEMIN NOIR */}
        {/* ========================================================================= */}
        <div 
          className="back bg-gradient-to-b from-[#140b12] via-[#0b060a] to-[#040204] border-2 rounded-3xl p-6 flex flex-col items-center justify-between shadow-[0_15px_45px_rgba(0,0,0,0.95)] overflow-hidden relative"
          style={{ borderColor: role.color, boxShadow: `0 0 35px ${role.color}35` }}
        >
          {/* Filigrane d'ambiance */}
          <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none" />

          {/* En-tête Rôle */}
          <div className="w-full text-center space-y-1 z-10">
            <span 
              className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border shadow-sm"
              style={{ backgroundColor: `${role.color}25`, borderColor: `${role.color}60`, color: role.color }}
            >
              {role.team === 'WEREWOLVES' ? '🐺 Meute des Loups' : role.team === 'SOLO' ? '⚡ Solitaire' : '🛡️ Villageois'}
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide mt-1 drop-shadow">
              {role.name}
            </h2>
          </div>

          {/* Artwork HD */}
          <div className="relative my-auto z-10 w-36 h-36 sm:w-44 sm:h-44 bg-black/80 rounded-2xl border border-white/10 p-3 flex items-center justify-center shadow-2xl">
            <RoleArtwork roleId={roleId} className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          </div>

          {/* Description du Pouvoir */}
          <div className="w-full text-center space-y-1 z-10">
            <p className="text-[11px] sm:text-xs text-stone-300 leading-snug font-sans bg-black/60 p-2.5 rounded-xl border border-white/10">
              {role.shortDesc}
            </p>
            <span className="text-[10px] font-mono text-stone-500 block pt-0.5">
              (Touchez à nouveau pour cacher)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
