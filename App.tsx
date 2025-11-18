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

/**
 * A list of example prompts to guide the user.
 */
const EXAMPLE_PROMPTS = [
  "What is the ruling on fasting while traveling?",
  "Is music permissible in Islam?",
  "Explain the conditions for Zakat on wealth.",
  "How should one perform the funeral prayer (Salat al-Janazah)?",
];


const App: React.FC = () => {
  // State to hold the successfully generated fatwa object.
  const [fatwa, setFatwa] = useState<Fatwa | null>(null);
  // State to track if an API call is in progress.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store any error messages from the API call.
  const [error, setError] = useState<string | null>(null);
  // State for the controlled input in PromptForm.
  const [prompt, setPrompt] = useState<string>('');
  // State to store the user's prompt that generated the current fatwa.
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
  const handleGenerateFatwa = useCallback(async () => {
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
  }, [prompt]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 relative z-10">
      <div className="w-full max-w-5xl mx-auto">
        {/* Application Header */}
        <header className="text-center my-8 border-b-2 border-[--border] pb-6 bg-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wider font-display bg-gradient-to-r from-emerald-900 via-amber-500 to-emerald-900 text-transparent bg-clip-text pb-2">
            Ai-Imam: Fatwas by Imam Ai-Kitab
          </h1>
          <p className="text-lg text-emerald-900/80 mt-4 max-w-3xl mx-auto font-medium">
            Seek guidance on matters of jurisprudence. Pose your question to receive a scholarly fatwa in English and Arabic.
          </p>
        </header>

        {/* Main Content Area */}
        <main className="w-full">
          <PromptForm 
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleGenerateFatwa} 
            isLoading={isLoading} 
          />
          
          {/* Example Prompts Section */}
          {!isLoading && !fatwa && (
             <div className="text-center mt-6 animate-fade-in">
              <p className="text-slate-600 mb-3 text-sm font-medium">Or try one of these examples:</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-white/70 border border-[--border] text-sm text-[--primary] rounded-full hover:bg-emerald-50 hover:border-emerald-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
         
          
          {/* Conditional Rendering for Response Area */}
          <div className="mt-8 min-h-[300px]">
            {isLoading && <LoadingSpinner message={loadingMessage} />}
            {error && <ErrorMessage message={error} />}
            {fatwa && !isLoading && <FatwaDisplay fatwa={fatwa} prompt={currentPrompt} />}
            {!isLoading && !error && !fatwa && (
              <div className="text-center text-slate-500 pt-16">
                <p className="text-lg">Your generated fatwa will appear here.</p>
              </div>
            )}
          </div>
        </main>
        
        {/* Application Footer */}
        <footer className="w-full text-center py-6 mt-8 text-slate-600 text-sm font-medium bg-white/40 rounded-lg backdrop-blur-sm">
            <p>This tool uses generative AI. Responses should be reviewed for accuracy. Not a substitute for a qualified Islamic scholar.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;