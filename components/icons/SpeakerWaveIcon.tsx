
import React from 'react';

export const SpeakerWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.658v8.1a.75.75 0 01-1.085.658L8.25 16.5M13.5 12h1.5M16.5 12h.75M6 12a6 6 0 1012 0 6 6 0 00-12 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8.25c.256-.882 1.133-1.5 2.125-1.5s1.869.618 2.125 1.5M10.5 15.75c.256.882 1.133 1.5 2.125 1.5s1.869-.618 2.125-1.5" />
  </svg>
);
