'use client';

import React from 'react';

export const AtmosphereBackground: React.FC<{ isNight?: boolean; isBloodMoon?: boolean }> = ({
  isNight = true,
  isBloodMoon = false
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Ciel profond avec dégradé d'orage nocturne */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          isBloodMoon 
            ? 'bg-gradient-to-b from-[#2a0508] via-[#100305] to-[#040102]' 
            : isNight 
              ? 'bg-gradient-to-b from-[#120718] via-[#08030b] to-[#030104]' 
              : 'bg-gradient-to-b from-[#241208] via-[#110703] to-[#050201]'
        }`} 
      />

      {/* Lune de sang ou pleine lune spectrale */}
      <div className="absolute top-8 right-12 sm:right-24 w-40 h-40 sm:w-56 sm:h-56 rounded-full pointer-events-none opacity-40 blur-sm">
        <div 
          className={`w-full h-full rounded-full animate-pulse transition-all duration-1000 ${
            isBloodMoon
              ? 'bg-gradient-to-tr from-red-600 to-rose-900 shadow-[0_0_80px_rgba(220,38,38,0.6)]'
              : isNight
                ? 'bg-gradient-to-tr from-purple-500/40 to-indigo-900/60 shadow-[0_0_80px_rgba(168,85,247,0.4)]'
                : 'bg-gradient-to-tr from-amber-500/40 to-orange-900/50 shadow-[0_0_80px_rgba(245,158,11,0.3)]'
          }`}
        />
      </div>

      {/* Voiles de brume ondulante */}
      <div className="absolute -bottom-10 left-0 right-0 h-96 bg-gradient-to-t from-[#050406] via-[#050406]/80 to-transparent fog-layer pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 -right-10 h-72 bg-gradient-to-t from-red-950/20 via-purple-950/10 to-transparent fog-layer pointer-events-none animate-pulse" />

      {/* Particules spectrales / braises de sang */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
    </div>
  );
};
