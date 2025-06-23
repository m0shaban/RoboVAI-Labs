
import React from 'react';

export const LabFlaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    {/* Flask body */}
    <path d="M9 3L4.5 12.01A5 5 0 009 21.5h6a5 5 0 004.5-9.49L15 3H9z" />
    {/* Liquid inside */}
    <path d="M6 18h12" strokeWidth="1" opacity="0.7" />
    {/* Bubbles */}
    <circle cx="8.5" cy="16" r="0.5" fill="currentColor" stroke="none" opacity="0.6" />
    <circle cx="10.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.6" />
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" stroke="none" opacity="0.6" />
    {/* Neck lines */}
    <line x1="9.5" y1="3" x2="9.5" y2="6" />
    <line x1="14.5" y1="3" x2="14.5" y2="6" />
  </svg>
);