/**
 * @file LoadingSpinner.tsx
 * A component that displays an animated SVG spinner and a dynamic message.
 * It is shown to the user while waiting for a response from the AI model.
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
    <div className="flex flex-col items-center justify-center pt-16 text-center animate-fade-in">
       {/* 
         This SVG is a stylized eight-pointed star, often used in Islamic art. 
         It is animated to spin, providing a thematic and visually engaging loading indicator.
         A linear gradient is used for the stroke color to add visual depth.
       */}
       <svg 
        width="64" 
        height="64" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        className="animate-spin"
        aria-label="Loading"
        role="status"
      >
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#DD6B20', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#38B2AC', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path 
          d="M50 0 L61.2 25.8 L87.8 25.8 L68.3 41.2 L79.5 67 L50 51.6 L20.5 67 L31.7 41.2 L12.2 25.8 L38.8 25.8 Z"
          fill="none" 
          stroke="url(#spinner-gradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path
          d="M50 12.5 L57.4 31.2 L78.1 31.2 L62.8 43.1 L70.2 61.8 L50 50 L29.8 61.8 L37.2 43.1 L21.9 31.2 L42.6 31.2 Z"
          fill="url(#spinner-gradient)"
          opacity="0.2"
        />
      </svg>
      <p className="text-orange-800 text-lg mt-4 transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
