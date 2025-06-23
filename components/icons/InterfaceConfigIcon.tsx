
import React from 'react';

export const InterfaceConfigIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20 7h-9"/>
    <path d="M15 7V3l-3 4h3V3"/>
    <path d="M4 17h9"/>
    <path d="M9 17v4l3-4H9v4"/>
    <circle cx="17" cy="17" r="3" strokeDasharray="3 2"/>
    <circle cx="7" cy="7" r="3" strokeDasharray="3 2"/>
  </svg>
);