import React from 'react';
import { RoleId } from '@/lib/roles';

interface RoleArtworkProps {
  roleId: RoleId;
  className?: string;
}

export const RoleArtwork: React.FC<RoleArtworkProps> = ({ roleId, className = 'w-full h-48' }) => {
  switch (roleId) {
    case 'werewolf':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e53e3e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e53e3e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="wolfFur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="90" r="75" fill="url(#moonGlow)" />
          <circle cx="100" cy="85" r="50" fill="#fee2e2" opacity="0.95" />
          {/* Tête de loup stylisée géométrique */}
          <polygon points="100,50 60,95 80,105 50,140 100,165 150,140 120,105 140,95" fill="url(#wolfFur)" stroke="#e53e3e" strokeWidth="2" />
          {/* Oreilles */}
          <polygon points="70,55 55,20 85,45" fill="#1a202c" stroke="#e53e3e" strokeWidth="1.5" />
          <polygon points="130,55 145,20 115,45" fill="#1a202c" stroke="#e53e3e" strokeWidth="1.5" />
          {/* Yeux incandescents */}
          <polygon points="82,88 92,92 84,95" fill="#e53e3e" />
          <polygon points="118,88 108,92 116,95" fill="#e53e3e" />
          {/* Museau & Crocs */}
          <polygon points="100,115 90,135 110,135" fill="#0f172a" />
          <polygon points="93,135 96,145 99,135" fill="#ffffff" />
          <polygon points="101,135 104,145 107,135" fill="#ffffff" />
        </svg>
      );

    case 'seer':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="seerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#seerGlow)" />
          {/* Boule de cristal céleste */}
          <circle cx="100" cy="95" r="45" fill="#1e1b4b" stroke="#c084fc" strokeWidth="2" />
          {/* Oeil mystique */}
          <path d="M 70 95 Q 100 65 130 95 Q 100 125 70 95 Z" fill="#2e1065" stroke="#e9d5ff" strokeWidth="2" />
          <circle cx="100" cy="95" r="14" fill="#a855f7" />
          <circle cx="100" cy="95" r="6" fill="#ffffff" />
          <circle cx="98" cy="92" r="2" fill="#ffffff" />
          {/* Rayons célestes */}
          <line x1="100" y1="35" x2="100" y2="20" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="155" x2="100" y2="170" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="95" x2="25" y2="95" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          <line x1="160" y1="95" x2="175" y2="95" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          {/* Socle en or */}
          <path d="M 80 142 L 120 142 L 130 165 L 70 165 Z" fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
        </svg>
      );

    case 'witch':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="potionGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="75" fill="url(#potionGlow)" />
          {/* Chapeau pointu */}
          <polygon points="100,20 60,85 140,85" fill="#134e4a" stroke="#2dd4bf" strokeWidth="2" />
          <ellipse cx="100" cy="85" rx="55" ry="12" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
          {/* Fioles magiques : Vie & Mort */}
          {/* Fiole 1 (Emeraude / Vie) */}
          <path d="M 65 110 L 75 110 L 85 145 C 85 155 55 155 55 145 Z" fill="#065f46" stroke="#34d399" strokeWidth="2" />
          <circle cx="70" cy="138" r="4" fill="#a7f3d0" />
          {/* Fiole 2 (Violet / Mort) */}
          <path d="M 125 110 L 135 110 L 145 145 C 145 155 115 155 115 145 Z" fill="#581c87" stroke="#c084fc" strokeWidth="2" />
          <circle cx="130" cy="138" r="4" fill="#f3e8ff" />
        </svg>
      );

    case 'hunter':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="hunterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="75" fill="url(#hunterGlow)" />
          {/* Cible & Fusil */}
          <circle cx="100" cy="90" r="50" stroke="#f97316" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="100" cy="90" r="28" stroke="#fdba74" strokeWidth="1.5" />
          <circle cx="100" cy="90" r="8" fill="#f97316" />
          {/* Viseur réticule */}
          <line x1="100" y1="30" x2="100" y2="150" stroke="#ea580c" strokeWidth="2" />
          <line x1="40" y1="90" x2="160" y2="90" stroke="#ea580c" strokeWidth="2" />
          {/* Balles de mousquet */}
          <rect x="75" y="155" width="10" height="24" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <rect x="95" y="155" width="10" height="24" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <rect x="115" y="155" width="10" height="24" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        </svg>
      );

    case 'cupid':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="cupidGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="75" fill="url(#cupidGlow)" />
          {/* Double Coeur Lié */}
          <path d="M 75 75 C 60 55 35 65 35 85 C 35 110 75 135 75 135 C 75 135 115 110 115 85 C 115 65 90 55 75 75 Z" fill="#831843" stroke="#f472b6" strokeWidth="2" />
          <path d="M 125 75 C 110 55 85 65 85 85 C 85 110 125 135 125 135 C 125 135 165 110 165 85 C 165 65 140 55 125 75 Z" fill="#be185d" stroke="#fbcfe8" strokeWidth="2" opacity="0.85" />
          {/* Flèche d'or traversante */}
          <line x1="30" y1="140" x2="170" y2="50" stroke="#fbbf24" strokeWidth="3" />
          <polygon points="170,50 155,50 165,65" fill="#fbbf24" />
          {/* Plumes */}
          <polygon points="30,140 45,135 35,125" fill="#fbcfe8" />
        </svg>
      );

    case 'guard':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="guardGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="75" fill="url(#guardGlow)" />
          {/* Grand Bouclier Médiéval */}
          <path d="M 60 50 L 140 50 L 140 105 C 140 145 100 165 100 165 C 100 165 60 145 60 105 Z" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="3" />
          {/* Croix de protection */}
          <line x1="100" y1="65" x2="100" y2="140" stroke="#93c5fd" strokeWidth="4" />
          <line x1="75" y1="95" x2="125" y2="95" stroke="#93c5fd" strokeWidth="4" />
          {/* Étoile centrale */}
          <circle cx="100" cy="95" r="8" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      );

    case 'white_wolf':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="whiteWolfGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="75" fill="url(#whiteWolfGlow)" />
          {/* Loup Blanc Albinos */}
          <polygon points="100,50 60,95 80,105 50,140 100,165 150,140 120,105 140,95" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="70,55 55,20 85,45" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="130,55 145,20 115,45" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Yeux rouge sang intenses */}
          <polygon points="82,88 92,92 84,95" fill="#dc2626" />
          <polygon points="118,88 108,92 116,95" fill="#dc2626" />
        </svg>
      );

    default:
      // Simple Villageois / Autres
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="villagerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="75" fill="url(#villagerGlow)" />
          {/* Maisons du Village de Thiercelieux */}
          <polygon points="70,70 40,100 100,100" fill="#854d0e" stroke="#fbbf24" strokeWidth="2" />
          <rect x="45" y="100" width="50" height="50" fill="#451a03" stroke="#fbbf24" strokeWidth="2" />
          <polygon points="130,55 95,90 165,90" fill="#a16207" stroke="#fde047" strokeWidth="2" />
          <rect x="105" y="90" width="50" height="60" fill="#713f12" stroke="#fde047" strokeWidth="2" />
          {/* Torche du village */}
          <rect x="96" y="130" width="8" height="25" fill="#78350f" />
          <circle cx="100" cy="125" r="7" fill="#ef4444" />
          <circle cx="100" cy="123" r="4" fill="#fbbf24" />
        </svg>
      );
  }
};
