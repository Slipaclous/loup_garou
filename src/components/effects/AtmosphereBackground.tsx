'use client';

import React from 'react';

export const AtmosphereBackground: React.FC<{ isNight?: boolean; isBloodMoon?: boolean }> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Texture de fond peinte : Table de rituel et runes d'inquisition */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 brightness-75 contrast-125"
        style={{ backgroundImage: "url('/images/textures/wood_altar.jpg')" }}
      />

      {/* Superposition de parchemin de cuir ancien */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center"
        style={{ backgroundImage: "url('/images/textures/parchment_altar.jpg')" }}
      />

      {/* Dégradé atmosphérique subtil pour la lisibilité centrale */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080509]/80 via-[#040205]/60 to-[#080509]/90" />

      {/* Vignettage cinématographique profond sur les bordures de l'écran */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />
    </div>
  );
};
