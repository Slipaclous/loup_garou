'use client';

import React from 'react';

export const AtmosphereBackground: React.FC<{ isNight?: boolean; isBloodMoon?: boolean }> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#020103]">
      {/* Texture de cuir d'autel et grain de parchemin en filigrane sombre */}
      <div 
        className="absolute inset-0 opacity-25 mix-blend-multiply bg-center bg-cover"
        style={{ backgroundImage: "url('/images/textures/parchment_altar.jpg')" }}
      />

      {/* Vignettage profond d'obscurité cinéma */}
      <div className="absolute inset-0 bg-radial-vignette opacity-90" />
      <div className="absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.98)]" />
    </div>
  );
};
