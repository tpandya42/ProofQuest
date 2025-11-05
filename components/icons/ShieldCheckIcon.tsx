
import React from 'react';

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
            d="M9 12.75 11.25 15 15 9.75M12 21.75c5.13-1.354 9-6.043 9-11.25V5.25L12 3 3 5.25v6.5C3 15.707 6.87 20.4 12 21.75z" 
        />
    </svg>
);
