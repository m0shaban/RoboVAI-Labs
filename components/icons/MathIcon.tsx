import React from 'react';

export const MathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M19 5L5 19M5.707 5.707a1 1 0 000 1.414L11.586 13 5.707 18.879a1 1 0 101.414 1.414L13 14.414l5.879 5.879a1 1 0 001.414-1.414L14.414 13l5.879-5.879a1 1 0 00-1.414-1.414L13 11.586 7.121 5.707a1 1 0 00-1.414 0z" />
     <circle cx="7" cy="7" r="2" />
     <circle cx="17" cy="17" r="2" />
  </svg>
);
