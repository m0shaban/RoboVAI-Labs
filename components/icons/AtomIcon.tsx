import React from 'react';

export const AtomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M12 2a10 10 0 0 0-2.69 19.37" />
    <path d="M12 2a10 10 0 0 1 2.69 19.37" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-45 12 12)" />
  </svg>
);
