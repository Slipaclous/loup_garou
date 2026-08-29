import React from 'react';
import { RoleId } from '@/lib/roles';

interface RoleArtworkProps {
  roleId: RoleId;
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

export const RoleArtwork: React.FC<RoleArtworkProps> = ({ roleId, className = 'w-full h-48' }) => {
  const imageSrc = ROLE_IMAGES[roleId] || '/images/cards/werewolf.jpg';

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl group ${className}`}>
      <img
        src={imageSrc}
        alt={roleId}
        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/20 rounded-2xl pointer-events-none" />
    </div>
  );
};
