import React from 'react';

export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6" 
    {...props}
  >
    <path d="M4 20h16V4H4v16zm2-2h2V8H6v10zm4 0h2V12H10v6zm4 0h2V6H14v12zm4 0h2V10H18v8z" opacity="0.7"/>
    <path d="M22 2H2v20h20V2zM6 18V8h2v10H6zm4-6v6h2v-6h-2zm4-6v12h2V6h-2zm4 4v8h2v-8h-2z" />
  </svg>
);
