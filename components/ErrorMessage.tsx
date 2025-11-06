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
    <div className="flex items-center justify-center pt-16">
        <div className="bg-red-200/50 border border-red-400 text-red-800 px-6 py-4 rounded-lg shadow-lg text-center" role="alert">
            <strong className="font-bold">An Error Occurred:</strong>
            <span className="block sm:inline ml-2">{message}</span>
        </div>
    </div>
  );
};

export default ErrorMessage;
