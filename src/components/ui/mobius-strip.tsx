'use client';

import React from 'react';

export function MobiusStrip() {
  const id = React.useId();
  return (
    <svg width="100%" viewBox="-10 -10 120 70" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#8A2BE2' }}>
             <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" style={{ stopColor: '#4B0082' }}>
             <animate attributeName="offset" values="0.5;1.5;0.5" dur="4s" repeatCount="indefinite" />
          </stop>
           <stop offset="100%" style={{ stopColor: '#8A2BE2' }}>
             <animate attributeName="offset" values="1;2;1" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <path
        d="M 50,5 C 95,5 95,45 50,45 C 5,45 5,5 50,5"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeDasharray="283"
        transform="skewX(30) translate(0, 0)"
      >
        <animate attributeName="stroke-dashoffset" values="283;-283" dur="8s" repeatCount="indefinite" />
      </path>
       <path
        d="M 50,5 C 5,5 5,45 50,45 C 95,45 95,5 50,5"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        stroke="rgba(138, 43, 226, 0.2)"
        transform="skewX(30) translate(0, 0)"
      />
    </svg>
  );
}