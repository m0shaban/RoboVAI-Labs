import React from 'react';

export const ScrollIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M8 3H6.5A2.5 2.5 0 0 0 4 5.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.5A2.5 2.5 0 0 0 17.5 3H16" />
    <path d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1Z" />
    <path d="M16 3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1Z" />
    <path d="M12 21v-4M12 7v4M10 9h4M10 15h4" />
  </svg>
);
