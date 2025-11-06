/**
 * @file App.tsx
 * This is the root component of the Ai-Imam application.
 * It manages the main application state, including the current fatwa, loading status, and errors.
 * It orchestrates the user interface by composing the PromptForm, FatwaDisplay, LoadingSpinner,
 * and ErrorMessage components.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { generateFatwa } from './services/geminiService';
import { Fatwa } from './types';
import PromptForm from './components/PromptForm';
import FatwaDisplay from './components/FatwaDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

/**
 * An array of messages displayed sequentially to the user while the AI is generating a response.
 * This enhances the user experience by providing a sense of progress and thematic immersion.
 */
const LOADING_MESSAGES = [
  "Receiving the query...",
  "Parsing the question with linguistic precision...",
  "Consulting the sacred texts: Qur'an and Sunnah...",
  "The Imam ponders your question...",
  "Reflecting upon the principles of Fiqh (Usul al-Fiqh)...",
  "Cross-referencing with major schools of thought...",
  "Seeking wisdom from the scholars of old...",
  "Checking for consensus among the jurists (Ijma)...",
  "Applying principles of analogical reasoning (Qiyas)...",
  "Weighing the evidence and considering the context...",
  "Formulating the ruling with care and compassion...",
  "Ensuring clarity in both Arabic and English prose...",
  "Structuring the final ruling...",
  "Adding vocalization marks to the Arabic text...",
  "The final fatwa is being prepared for issuance...",
];

const App: React.FC = () => {
  // State to hold the successfully generated fatwa object.
  const [fatwa, setFatwa] = useState<Fatwa | null>(null);
  // State to track if an API call is in progress.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store any error messages from the API call.
  const [error, setError] = useState<string | null>(null);
  // State to store the user's prompt, used to display alongside the fatwa.
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  // State for the currently displayed loading message.
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  /**
   * Effect hook to cycle through the LOADING_MESSAGES array when isLoading is true.
   * This provides a dynamic and engaging loading experience for the user.
   */
  useEffect(() => {
    let messageIndex = 0;
    // Use `ReturnType<typeof setInterval>` for the interval ID type. This is environment-agnostic 
    // and avoids potential namespace conflicts with NodeJS types in a browser context.
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isLoading) {
      // Set an interval to change the loading message every 2.5 seconds.
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 2500);
    }

    // Cleanup function: clear the interval when the component unmounts or `isLoading` becomes false.
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Reset to the first message for the next loading sequence.
      setLoadingMessage(LOADING_MESSAGES[0]);
    };
  }, [isLoading]);


  /**
   * Handles the submission of the user's prompt.
   * It sets the loading state, calls the Gemini service to generate a fatwa,
   * and handles the success or error response.
   * Wrapped in useCallback for performance optimization.
   */
  const handleGenerateFatwa = useCallback(async (prompt: string) => {
    // Basic validation to prevent empty submissions.
    if (!prompt.trim()) {
      setError("Please enter a question.");
      return;
    }
    
    // Reset state for a new request.
    setIsLoading(true);
    setError(null);
    setFatwa(null);
    setCurrentPrompt(prompt);

    try {
      const result = await generateFatwa(prompt);
      setFatwa(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
      {/* Application Header */}
      <header className="text-center my-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-800 tracking-wider font-display">
          Ai-Imam: Fatwas by Imam Ai-Kitab
        </h1>
        <p className="text-lg text-stone-600 mt-2 max-w-2xl mx-auto">
          Seek guidance on matters of jurisprudence. Pose your question to receive a scholarly fatwa in English and Arabic.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto">
        <PromptForm onSubmit={handleGenerateFatwa} isLoading={isLoading} />
        
        {/* Conditional Rendering for Response Area */}
        <div className="mt-8 min-h-[300px]">
          {isLoading && <LoadingSpinner message={loadingMessage} />}
          {error && <ErrorMessage message={error} />}
          {fatwa && !isLoading && <FatwaDisplay fatwa={fatwa} prompt={currentPrompt} />}
          {!isLoading && !error && !fatwa && (
            <div className="text-center text-stone-500 pt-16">
              <p>Your generated fatwa will appear here.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Application Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center py-6 mt-8 text-stone-500 text-sm">
          <p>This tool uses generative AI. Responses should be reviewed for accuracy. Not a substitute for a qualified Islamic scholar.</p>
      </footer>
    </div>
  );
};

export default App;