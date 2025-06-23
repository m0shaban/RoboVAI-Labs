
import React from 'react';

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6"
    {...props}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 1.99.79 3.79 2.08 5.08L5 16.17V19h14v-2.83l-2.08-2.09C18.21 12.79 19 10.99 19 9c0-3.87-3.13-7-7-7zm0 12.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5-5.5H7V9c0-2.76 2.24-5 5-5s5 2.24 5 5v1z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12.01 16.51c.82 0 1.5-.67 1.5-1.5s-.68-1.5-1.5-1.5c-.84 0-1.5.67-1.5 1.5s.66 1.5 1.5 1.5zm0-10.01c2.21 0 4 1.79 4 4V12H8V10.5c0-2.21 1.79-4 4-4zm6.91 5.51C17.81 13.19 16 14.08 16 15.51v2h3v-2.83l-1.08-1.17zm-13.82 0L4 14.67V17.5h3v-2c0-1.42-1.81-2.32-2.92-3.5z"/>
  </svg>
);
