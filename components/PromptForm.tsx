/**
 * @file PromptForm.tsx
 * A controlled component that provides a textarea for user input and a submission button.
 * It communicates the user's prompt to the parent component via the `onSubmit` callback.
 */

import React from 'react';

/**
 * Props for the PromptForm component.
 */
interface PromptFormProps {
  /** The current value of the textarea. */
  prompt: string;
  /** A callback function to update the prompt's value. */
  onPromptChange: (value: string) => void;
  /** A callback function to be executed when the form is submitted. */
  onSubmit: () => void;
  /** A boolean indicating if the application is in a loading state. */
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ prompt, onPromptChange, onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Enter your question here (e.g., 'What is the ruling on fasting while traveling?')"
        className="w-full h-32 p-4 bg-white/50 border border-[--border] rounded-lg focus:ring-2 focus:ring-[--ring] focus:border-[--primary] focus:outline-none transition-shadow duration-300 text-lg text-slate-800 resize-none shadow-sm"
        // The form is disabled while loading to prevent multiple submissions.
        disabled={isLoading}
        aria-label="Question input form"
        aria-required="true"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[--primary] hover:bg-emerald-800 text-[--primary-foreground] font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--ring]"
      >
        {isLoading ? (
          'Deliberating...'
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Issue Fatwa</span>
          </>
        )}
      </button>
    </form>
  );
};

export default PromptForm;