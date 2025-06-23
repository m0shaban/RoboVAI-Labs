
import React from 'react';

export const PixelArtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-6 h-6" 
    {...props}
  >
    <path d="M3 3h3v3H3z" fill="currentColor" />
    <path d="M9 3h3v3H9z" fill="currentColor" opacity="0.6"/>
    <path d="M15 3h3v3h-3z" fill="currentColor" />
    <path d="M3 9h3v3H3z" fill="currentColor" opacity="0.6"/>
    <path d="M9 9h3v3H9z" /> {/* Center block empty for effect or different color via fill */}
    <path d="M15 9h3v3h-3z" fill="currentColor" opacity="0.6"/>
    <path d="M3 15h3v3H3z" fill="currentColor" />
    <path d="M9 15h3v3H9z" fill="currentColor" opacity="0.6"/>
    <path d="M15 15h3v3h-3z" fill="currentColor" />
    <rect x="1" y="1" width="22" height="22" rx="2" strokeWidth="2" />
  </svg>
);
