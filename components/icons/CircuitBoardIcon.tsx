
import React from 'react';

export const CircuitBoardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <circle cx="9" cy="9" r="1" fill="currentColor"></circle>
    <circle cx="15" cy="9" r="1" fill="currentColor"></circle>
    <circle cx="9" cy="15" r="1" fill="currentColor"></circle>
    <circle cx="15" cy="15" r="1" fill="currentColor"></circle>
    <line x1="7" y1="7" x2="7" y2="7"></line> {/* Small dot */}
    <line x1="17" y1="7" x2="17" y2="7"></line>
    <line x1="7" y1="17" x2="7" y2="17"></line>
    <line x1="17" y1="17" x2="17" y2="17"></line>
  </svg>
);