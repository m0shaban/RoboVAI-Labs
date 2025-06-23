
import React from 'react';

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.036-7.026A7.5 7.5 0 004.5 12H3m18 0h-1.5a7.5 7.5 0 00-2.036-5.026M21 12a7.5 7.5 0 01-15 0m15 0a7.5 7.5 0 00-15 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v1.5m0 3v1.5m0-7.5a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
);
