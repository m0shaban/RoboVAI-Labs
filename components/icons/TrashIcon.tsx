
import React from 'react';

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className="w-5 h-5" 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      d="M8.75 1A2.75 2.75 0 006 3.75H4.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5H14A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.531.617 1.719 1.406H8.28A1.75 1.75 0 0110 4zM3.102 7.102a.75.75 0 01.89-.093L5.11 7.65l.617 7.921a3.25 3.25 0 003.243 3.179h2.06a3.25 3.25 0 003.243-3.18l.617-7.92.11-.64a.75.75 0 01.89.094l.286.214A.75.75 0 0018 7.183V16.25A2.75 2.75 0 0115.25 19H4.75A2.75 2.75 0 012 16.25V7.183a.75.75 0 00.817-.867l.285-.214z" 
      clipRule="evenodd" 
    />
  </svg>
);
