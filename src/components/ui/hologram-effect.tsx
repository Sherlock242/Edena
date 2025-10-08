'use client';
import React from 'react';

export function HologramEffect() {
  const id = React.useId();
  const pathData = "M 50, 50 m -45, 0 a 45,25 0 1,0 90,0 a 45,25 0 1,0 -90,0";

  return (
    <svg width="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-cyan-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`grad-blue1-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0077ff" stopOpacity="0" />
          <stop offset="50%" stopColor="#0077ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0077ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`grad-blue2-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
           <stop offset="0%" stopColor="#40E0D0" stopOpacity="0" />
           <stop offset="50%" stopColor="#40E0D0" stopOpacity="0.7" />
           <stop offset="100%" stopColor="#40E0D0" stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>

      {/* Base lattice structure */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(0, 119, 255, 0.1)"
        strokeWidth="15"
        transform="rotate(20 50 50) scale(1 0.5)"
      />
       <path
        d={pathData}
        fill="none"
        stroke="rgba(0, 119, 255, 0.15)"
        strokeWidth="0.5"
        strokeDasharray="2 4"
        transform="rotate(20 50 50) scale(1 0.5)"
      />

      {/* Animated paths */}
      <g style={{ filter: `url(#glow-${id})` }}>
        {/* Fast cyan line */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#grad-cyan-${id})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="50 200"
          transform="rotate(20 50 50) scale(1 0.5)"
        >
          <animate attributeName="stroke-dashoffset" from="250" to="-250" dur="4s" repeatCount="indefinite" />
        </path>

        {/* Slower blue trail */}
         <path
          d={pathData}
          fill="none"
          stroke={`url(#grad-blue1-${id})`}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="10 20"
          transform="rotate(20 50 50) scale(1.05 0.55)"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="30" dur="6s" repeatCount="indefinite" />
        </path>

         {/* Light blue accent line */}
         <path
          d={pathData}
          fill="none"
          stroke={`url(#grad-blue2-${id})`}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="1 30"
          transform="rotate(20 50 50) scale(0.95 0.45)"
        >
          <animate attributeName="stroke-dashoffset" from="31" to="-31" dur="8s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}
