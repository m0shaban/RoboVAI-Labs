import React from 'react';

export const TelescopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m12.38 5.62-6.08 2.5S2.75 8.88 2.5 11.25c-.25 2.38 2.5 3.75 2.5 3.75l6.08-2.5M12.38 5.62l8.12 3.38M12.38 5.62l1.88-3.12M20.5 9l-1.88 3.12M10.5 12.5l1.88 3.13L12.38 22l1.88-6.37 1.88-3.13M10.5 12.5l-1.88-3.13L10.5 6.25l-1.88-3.13L6.75 0 8.62 3.12 10.5 6.25l-1.88 3.12"/>
    <circle cx="12.38" cy="17.38" r="2.25"/>
  </svg>
);
