
import React from 'react';

export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M6.827 6.175A2.31 2.31 0 015.186 7.5v1.286c0 .414.336.75.75.75h12.168c.414 0 .75-.336.75-.75V7.5a2.31 2.31 0 01-1.641-2.575L19.5 5.25c-.416-.621-1.257-1.04-2.133-1.04H6.633c-.876 0-1.717.419-2.133 1.04l-.841 1.255z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 11.25a3.375 3.375 0 100 6.75 3.375 3.375 0 000-6.75z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M2.25 12.125v4.5c0 1.242 1.008 2.25 2.25 2.25h15a2.25 2.25 0 002.25-2.25v-4.5" 
    />
  </svg>
);
