import React from 'react';

export const DnaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4 4S8 8 4 12s4 4 4 4M20 4s-4 4-4 8 4 4 4 4M8 8s4-4 8 0-4 8-4 8" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="6" y1="6" x2="4" y2="4" />
    <line x1="18" y1="6" x2="20" y2="4" />
    <line x1="6" y1="18" x2="4" y2="20" />
    <line x1="18" y1="18" x2="20" y2="20" />
  </svg>
);
