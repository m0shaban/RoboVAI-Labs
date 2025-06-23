import React from 'react';

export const FlaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9 3l-4.5 9.01A5 5 0 0 0 9 21.5h6a5 5 0 0 0 4.5-9.49L15 3H9z" />
    <path d="M6 18h12" />
    <path d="M10 3v2m4-2v2" />
  </svg>
);
