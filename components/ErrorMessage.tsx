/**
 * @file ErrorMessage.tsx
 * A simple presentational component used to display error messages to the user
 * in a standardized, noticeable format.
 */

import React from 'react';

/**
 * Props for the ErrorMessage component.
 */
interface ErrorMessageProps {
  /** The error message string to be displayed. */
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start justify-center pt-16 animate-fade-in">
        <div className="w-full max-w-lg bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg shadow-md" role="alert">
            <div className="flex">
                <div className="py-1">
                    <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold">An Error Occurred</p>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ErrorMessage;