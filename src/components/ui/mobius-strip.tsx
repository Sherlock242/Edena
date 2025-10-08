'use client';

import React from 'react';

export function MobiusStrip() {
  const id = React.useId();
  return (
    <svg width="100%" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'cyan' }}>
             <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" style={{ stopColor: 'orange' }}>
             <animate attributeName="offset" values="0.5;1.5;0.5" dur="4s" repeatCount="indefinite" />
          </stop>
           <stop offset="100%" style={{ stopColor: '#8A2BE2' }}>
             <animate attributeName="offset" values="1;2;1" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <path
        d="M 25,25 C 0,0 50,0 50,25 C 50,50 100,50 75,25 C 50,0 0,50 25,25"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeDasharray="157"
      >
        <animate attributeName="stroke-dashoffset" values="157;-157" dur="8s" repeatCount="indefinite" />
      </path>
       <path
        d="M 25,25 C 0,0 50,0 50,25 C 50,50 100,50 75,25 C 50,0 0,50 25,25"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        stroke="rgba(138, 43, 226, 0.2)"
      />
    </svg>
  );
}
