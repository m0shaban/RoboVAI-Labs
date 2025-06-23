
import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-6 h-6"
    {...props}
  >
    <path fillRule="evenodd" d="M12 2.25c-3.866 0-7 2.683-7 6.002 0 2.434 1.334 4.614 3.5 5.636V16.5a.75.75 0 00.75.75h5.5a.75.75 0 00.75-.75v-2.612c2.166-1.022 3.5-3.202 3.5-5.636 0-3.319-3.134-6.002-7-6.002zM8.25 18.75a.75.75 0 00.75.75h6a.75.75 0 00.75-.75v-.75h-7.5v.75zm3-13.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" clipRule="evenodd" />
  </svg>
);
