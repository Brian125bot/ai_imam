import React, { useState, useCallback, useEffect } from 'react';
import { generateFatwa } from './services/geminiService';
import { Fatwa } from './types';
import PromptForm from './components/PromptForm';
import FatwaDisplay from './components/FatwaDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const LOADING_MESSAGES = [
  "Receiving the query...",
  "Consulting the sacred texts...",
  "Reflecting upon the principles of Fiqh...",
  "The Imam ponders your question...",
  "Seeking wisdom from the scholars of old...",
  "Weighing the evidence...",
  "Formulating the ruling with care...",
];

const App: React.FC = () => {
  const [fatwa, setFatwa] = useState<Fatwa | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  useEffect(() => {
    let messageIndex = 0;
    // Fix: Use ReturnType<typeof setInterval> for the interval ID type to be environment-agnostic and avoid NodeJS namespace errors in a browser context.
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isLoading) {
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 2500); // Change message every 2.5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Reset to the first message for the next loading sequence
      setLoadingMessage(LOADING_MESSAGES[0]);
    };
  }, [isLoading]);


  const handleGenerateFatwa = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a question.");
      return;
    }
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
      <header className="text-center my-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-800 tracking-wider font-display">
          Ai-Imam: Fatwas by Imam Ai-Kitab
        </h1>
        <p className="text-lg text-stone-600 mt-2 max-w-2xl mx-auto">
          Seek guidance on matters of jurisprudence. Pose your question to receive a scholarly fatwa in English and Arabic.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto">
        <PromptForm onSubmit={handleGenerateFatwa} isLoading={isLoading} />
        
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
      
      <footer className="w-full max-w-4xl mx-auto text-center py-6 mt-8 text-stone-500 text-sm">
          <p>This tool uses generative AI. Responses should be reviewed for accuracy. Not a substitute for a qualified Islamic scholar.</p>
      </footer>
    </div>
  );
};

export default App;