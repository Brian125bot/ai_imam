/**
 * @file PromptForm.tsx
 * A controlled component that provides a textarea for user input and a submission button.
 * It communicates the user's prompt to the parent component via the `onSubmit` callback.
 */

import React, { useState } from 'react';

/**
 * Props for the PromptForm component.
 */
interface PromptFormProps {
  /** A callback function to be executed when the form is submitted. */
  onSubmit: (prompt: string) => void;
  /** A boolean indicating if the application is in a loading state. */
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your question here..."
        className="w-full h-32 p-4 bg-stone-50 border-2 border-teal-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors duration-300 text-lg text-stone-800 resize-none shadow-inner"
        // The form is disabled while loading to prevent multiple submissions.
        disabled={isLoading}
        aria-label="Question input form"
        aria-required="true"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-stone-50 font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? 'Deliberating...' : 'Issue Fatwa'}
      </button>
    </form>
  );
};

export default PromptForm;
