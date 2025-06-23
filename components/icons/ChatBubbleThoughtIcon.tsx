import React from 'react';

export const ChatBubbleThoughtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6" 
    {...props}
  >
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm-4-3H6V9h8v2zm2-3H6V6h10v2z"/>
    <circle cx="6" cy="18" r="1" opacity="0.6" />
    <circle cx="8.5" cy="19.5" r="1.5" opacity="0.8" />
  </svg>
);
