
import React from 'react';

export const RocketLaunchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-7.38 5.84m0 0a6 6 0 01-5.84-7.38m5.84 7.38v-4.82" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.38H4.56A9.75 9.75 0 0114.31 2.03V7.24l4.03 2.03-2.03 4.03-2.03-4.03zM15 15.75V18l3-1.5-3-1.5z" />
  </svg>
);
