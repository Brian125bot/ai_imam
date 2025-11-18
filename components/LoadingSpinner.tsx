/**
 * @file LoadingSpinner.tsx
 * A component that displays an animated SVG spinner and a dynamic message.
 * It features a complex, geometric Islamic pattern (Rub el Hizb style) with multi-layered rotations
 * to create a mesmerizing, culturally relevant loading state.
 */

import React from 'react';

/**
 * Props for the LoadingSpinner component.
 */
interface LoadingSpinnerProps {
  /** The message to display beneath the spinner. */
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-8 text-center animate-fade-in w-full min-h-[300px]">
      <div className="relative w-40 h-40 mb-10">
         {/* 
           Islamic Geometric Spinner 
           Concept: Two interlaced squares (Rub el Hizb foundation) rotating in opposition,
           surrounded by a decorative ring.
         */}
         <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-xl overflow-visible"
          aria-label="Loading animation"
          role="status"
        >
            <defs>
              {/* Gradient for the primary square (Emerald) */}
              <linearGradient id="grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065F46" stopOpacity="1" />
                <stop offset="100%" stopColor="#065F46" stopOpacity="0.2" />
              </linearGradient>
              
              {/* Gradient for the secondary square (Gold/Accent) */}
              <linearGradient id="grad-accent" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            <style>
                {`
                    .spinner-origin { transform-origin: 50px 50px; }
                    
                    @keyframes spinner-cw { 
                        from { transform: rotate(0deg); } 
                        to { transform: rotate(360deg); } 
                    }
                    @keyframes spinner-ccw { 
                        from { transform: rotate(0deg); } 
                        to { transform: rotate(-360deg); } 
                    }
                    @keyframes spinner-pulse {
                        0%, 100% { opacity: 0.5; transform: scale(0.9); }
                        50% { opacity: 1; transform: scale(1.05); }
                    }
                    
                    .animate-spinner-cw { animation: spinner-cw 16s linear infinite; }
                    .animate-spinner-ccw { animation: spinner-ccw 16s linear infinite; }
                    .animate-spinner-pulse { animation: spinner-pulse 3s ease-in-out infinite; }
                    .animate-spinner-center { animation: spinner-cw 4s linear infinite; }
                `}
            </style>

            {/* Outer Decorative Pattern Ring */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="#065F46" strokeWidth="0.5" strokeOpacity="0.2" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#065F46" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4 4" className="spinner-origin animate-spinner-cw" style={{ animationDuration: '30s' }} />
            
            {/* Middle Ring Pulse */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="0.5" className="spinner-origin animate-spinner-pulse" />

            {/* Square 1: Primary Emerald Color, Rotating Clockwise */}
            <rect x="20" y="20" width="60" height="60" rx="1" fill="none" stroke="url(#grad-primary)" strokeWidth="2.5" className="spinner-origin animate-spinner-cw" />

            {/* Square 2: Accent Gold Color, Rotating Counter-Clockwise. 
                This counter-rotation against the first square creates the dynamic Rub el Hizb effect.
            */}
            <g className="spinner-origin animate-spinner-ccw">
                 <rect x="20" y="20" width="60" height="60" rx="1" fill="none" stroke="url(#grad-accent)" strokeWidth="2.5" transform="rotate(45 50 50)" />
            </g>

            {/* Inner connecting lines for complexity */}
            <g className="spinner-origin animate-spinner-cw" style={{ animationDuration: '8s' }}>
                 <rect x="35" y="35" width="30" height="30" stroke="#065F46" strokeWidth="0.5" fill="none" transform="rotate(22.5 50 50)" opacity="0.5" />
            </g>

            {/* Center Motif: Small solid 8-pointed star */}
            <g className="spinner-origin animate-spinner-pulse">
                 <rect x="47" y="47" width="6" height="6" fill="#F59E0B" />
                 <rect x="47" y="47" width="6" height="6" fill="#065F46" transform="rotate(45 50 50)" />
            </g>
            
            {/* Center Dot */}
             <circle cx="50" cy="50" r="1.5" fill="#FDFBF5" />

        </svg>
      </div>
      
      {/* Loading Message */}
      <p className="text-emerald-800 font-display text-xl tracking-wide animate-pulse px-4 transition-all duration-500 font-medium">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;