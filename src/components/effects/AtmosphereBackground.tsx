'use client';

import React from 'react';

export const AtmosphereBackground: React.FC<{ isNight?: boolean; isBloodMoon?: boolean }> = ({
  isNight = true,
  isBloodMoon = false
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Fond uni et texture de grain subtile */}
      <div 
        className={`absolute inset-0 transition-colors duration-700 ${
          isBloodMoon 
            ? 'bg-[#0f090a]' 
            : isNight 
              ? 'bg-[#090a0f]' 
              : 'bg-[#0e0c0a]'
        }`} 
      />
      
      {/* Ligne d'horizon épurée */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />
    </div>
  );
};
