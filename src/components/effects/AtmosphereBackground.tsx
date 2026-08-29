'use client';

import React from 'react';

export const AtmosphereBackground: React.FC<{ isNight?: boolean; isBloodMoon?: boolean }> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030104]">
      {/* Texture de fond peinte : Table de rituel et runes d'inquisition (bien visible et contrastée) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-85 brightness-110 contrast-140 mix-blend-screen"
        style={{ backgroundImage: "url('/images/textures/wood_altar.jpg')" }}
      />

      {/* Superposition de parchemin de cuir ancien */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay bg-cover bg-center"
        style={{ backgroundImage: "url('/images/textures/parchment_altar.jpg')" }}
      />

      {/* Voile central très léger pour garder le texte lisible tout en laissant éclater les sigles */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030104]/50 via-transparent to-[#030104]/70" />

      {/* Vignettage cinématographique subtil */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />
    </div>
  );
};
