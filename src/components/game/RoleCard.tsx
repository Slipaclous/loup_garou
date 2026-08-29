'use client';

import React from 'react';
import { RoleId, ROLES } from '@/lib/roles';

interface RoleCardProps {
  roleId: RoleId;
  playerName?: string;
  isRevealed?: boolean;
  onToggleReveal?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ROLE_IMAGES: Partial<Record<RoleId, string>> = {
  werewolf: '/images/cards/werewolf.jpg',
  white_wolf: '/images/cards/white_wolf.jpg',
  seer: '/images/cards/seer.jpg',
  witch: '/images/cards/witch.jpg',
  hunter: '/images/cards/hunter.jpg',
  guard: '/images/cards/guard.jpg',
  cupid: '/images/cards/cupid.jpg',
  villager: '/images/cards/villager.jpg',
  elder: '/images/cards/guard.jpg',
  fool: '/images/cards/seer.jpg',
  little_girl: '/images/cards/villager.jpg',
};

export const RoleCard: React.FC<RoleCardProps> = ({
  roleId,
  playerName,
  isRevealed = false,
  onToggleReveal,
  size = 'md',
  className = '',
}) => {
  const role = ROLES[roleId] || ROLES.villager;
  const imageSrc = ROLE_IMAGES[roleId] || '/images/cards/werewolf.jpg';

  const sizeClasses = {
    sm: 'w-52 h-76',
    md: 'w-64 h-96',
    lg: 'w-80 h-120 sm:w-88 sm:h-130',
  }[size];

  return (
    <div
      onClick={onToggleReveal}
      className={`perspective-container ${sizeClasses} cursor-pointer group select-none ${className}`}
    >
      <div className={`flipper ${isRevealed ? 'flipped' : ''}`}>
        {/* ========================================================================= */}
        {/* DOS DE LA CARTE : SCEAU OCCULTE HD & PARCHEMIN GOTHIQUE */}
        {/* ========================================================================= */}
        <div className="front bg-[#090508] border-2 border-amber-800/80 rounded-3xl p-3 flex flex-col items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.95)] candle-glow overflow-hidden relative">
          {/* Illustration du Dos de Carte */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/cards/card_back.jpg"
              alt="Dos du Tarot"
              className="w-full h-full object-cover object-center filter contrast-110 brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/85" />
          </div>

          {/* En-tête joueur sur parchemin sombre */}
          <div className="w-full text-center space-y-1 z-10 pt-4 px-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold drop-shadow">
              ✦ Sceau du Destin ✦
            </span>
            <h3 className="font-medieval text-2xl sm:text-3xl text-white font-bold tracking-wide truncate max-w-full drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {playerName || 'Villageois'}
            </h3>
          </div>

          {/* Pied de carte */}
          <div className="w-full text-center z-10 pb-4 px-3">
            <div className="py-2 px-4 rounded-xl bg-black/80 border border-amber-600/50 backdrop-blur-sm shadow-xl">
              <span className="text-[11px] font-medieval text-amber-300 group-hover:text-amber-100 transition-colors uppercase tracking-wider block font-bold">
                ⚰️ Touchez pour dévoiler l'Âme ⚰️
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FACE DE LA CARTE : ARTWORK HD DARK FANTASY & POUVOIR GOTHIC */}
        {/* ========================================================================= */}
        <div 
          className="back bg-[#080407] border-2 rounded-3xl p-3 flex flex-col items-center justify-between shadow-[0_20px_55px_rgba(0,0,0,0.95)] overflow-hidden relative"
          style={{ borderColor: role.color, boxShadow: `0 0 35px ${role.color}35` }}
        >
          {/* Peinture Dark Fantasy HD en Arrière-plan */}
          <div className="absolute inset-0 z-0">
            <img
              src={imageSrc}
              alt={role.name}
              className="w-full h-full object-cover object-center filter contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          </div>

          {/* En-tête Rôle */}
          <div className="w-full text-center space-y-1.5 z-10 pt-4 px-3">
            <span 
              className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-lg backdrop-blur-md"
              style={{ backgroundColor: `${role.color}30`, borderColor: `${role.color}80`, color: role.color }}
            >
              {role.team === 'WEREWOLVES' ? '🐺 Meute des Loups' : role.team === 'SOLO' ? '⚡ Solitaire' : '🛡️ Villageois'}
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {role.name}
            </h2>
          </div>

          {/* Description du Pouvoir en bas de carte */}
          <div className="w-full text-center space-y-1.5 z-10 pb-3 px-3">
            <div className="p-3 bg-black/85 border border-white/15 rounded-2xl backdrop-blur-md shadow-2xl">
              <p className="text-[11px] sm:text-xs text-stone-200 leading-snug font-serif italic">
                « {role.shortDesc} »
              </p>
            </div>
            <span className="text-[10px] font-medieval text-stone-400 block drop-shadow">
              (Touchez pour dissimuler)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
