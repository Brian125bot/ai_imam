/**
 * @file FatwaDisplay.tsx
 * This component is responsible for rendering the generated fatwa in a bilingual,
 * side-by-side layout. It includes functionality for sharing the fatwa via the
 * clipboard and for reading the text aloud using the browser's Speech Synthesis API.
 */

import React, { useState, useEffect } from 'react';
import { Fatwa } from '../types';

interface FatwaDisplayProps {
  /** The fatwa object containing the English and Arabic text. */
  fatwa: Fatwa;
  /** The original user prompt that generated the fatwa. */
  prompt: string;
}

/**
 * Converts a simple subset of markdown to an HTML string for rendering.
 * Supports paragraphs, soft line breaks, bold, italics, and basic lists.
 * This is a lightweight parser tailored for the expected output of the AI.
 * @param md The markdown string to convert.
 * @returns An HTML string.
 */
const markdownToHtml = (md: string): string => {
  // Normalize line endings and trim whitespace
  const sanitizedMd = md.replace(/\r\n/g, '\n').trim();
  if (!sanitizedMd) return '';

  // Process block-level elements (paragraphs and lists) first
  const blocks = sanitizedMd.split('\n\n');
  const htmlBlocks = blocks.map(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';
    
    const lines = trimmedBlock.split('\n');

    // Check if the block is an unordered list
    const isUl = lines.length > 0 && lines.every(line => line.match(/^(\*|-|\+) /));
    // Check if the block is an ordered list
    const isOl = lines.length > 0 && lines.every(line => line.match(/^\d+\. /));

    if (isUl) {
      const items = lines.map(line => `<li>${line.substring(2)}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    
    if (isOl) {
      const items = lines.map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    }

    // Otherwise, treat as a paragraph, converting single newlines to <br />
    return `<p>${trimmedBlock.replace(/\n/g, '<br />')}</p>`;
  });
  
  let html = htmlBlocks.join('');

  // Process inline elements (bold, italic) after blocks
  html = html.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>'); // Bold + Italic
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');     // Bold
  html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');                 // Italic

  return html;
};

/**
 * Strips basic markdown syntax from a string to provide a cleaner version
 * for the text-to-speech engine.
 * @param md The markdown string to clean.
 * @returns A plain text string.
 */
const stripMarkdownForSpeech = (md: string): string => {
  return md.replace(/[\*_`#]/g, '').replace(/(\d+\.\s*|-\s*)/g, '');
};


const FatwaDisplay: React.FC<FatwaDisplayProps> = ({ fatwa, prompt }) => {
  // State to manage the visual feedback for the copy button.
  const [isCopied, setIsCopied] = useState(false);
  // State to track which language, if any, is currently being spoken.
  const [speakingLang, setSpeakingLang] = useState<'english' | 'arabic' | null>(null);

  /**
   * Effect hook to ensure that speech synthesis is cancelled if the component
   * is unmounted while speaking. This prevents audio from continuing to play
   * after the user has navigated away or a new fatwa is generated.
   */
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Copies a formatted version of the question and fatwa to the user's clipboard.
   */
  const handleCopyToClipboard = () => {
    const shareableText = `Question:\n${prompt}\n\n--- English Ruling ---\n${fatwa.englishFatwa}\n\n--- الفتوى بالعربية ---\n${fatwa.arabicFatwa}`;
    navigator.clipboard.writeText(shareableText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000); // Reset feedback after 3 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  /**
   * Toggles text-to-speech for the specified language using the browser's
   * SpeechSynthesis API. It will stop any currently playing audio before starting.
   * @param language The language to read ('english' or 'arabic').
   */
  const handleReadAloud = (language: 'english' | 'arabic') => {
    // If the selected language is already playing, cancel it.
    if (speakingLang === language) {
      window.speechSynthesis.cancel();
      setSpeakingLang(null);
      return;
    }

    // If any audio is playing, stop it before starting the new one.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const textToRead = language === 'english' ? fatwa.englishFatwa : fatwa.arabicFatwa;
    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(textToRead));
    utterance.lang = language === 'english' ? 'en-US' : 'ar-SA';
    
    // Set up event listeners for the utterance.
    utterance.onend = () => setSpeakingLang(null);
    utterance.onerror = (e) => {
      // The browser fires an "interrupted" error when `speechSynthesis.cancel()` is called.
      // This is expected behavior, not a true error, so we can safely ignore it.
      if (e.error !== 'interrupted') {
        console.error("Speech Synthesis Error:", e.error);
      }
      setSpeakingLang(null); // Reset state on any error or interruption.
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingLang(language);
  };
  
  // Convert markdown from the fatwa to HTML for rendering.
  const englishHtml = { __html: markdownToHtml(fatwa.englishFatwa) };
  const arabicHtml = { __html: markdownToHtml(fatwa.arabicFatwa) };

  const actionButtonClasses = "inline-flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-orange-600 text-orange-700 font-bold rounded-lg transition-all duration-300 hover:bg-orange-600 hover:text-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-50 focus:ring-orange-500 disabled:bg-stone-400 disabled:border-stone-400 disabled:text-stone-50";
  const copiedButtonClasses = "disabled:bg-teal-500 disabled:border-teal-500 disabled:text-stone-50 disabled:cursor-default";
  const playingButtonClasses = "bg-orange-700 border-orange-700 text-stone-50";


  return (
    <div className="w-full bg-stone-50/70 border border-teal-600/30 rounded-lg shadow-2xl p-6 sm:p-8 backdrop-blur-sm animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* English Fatwa Section */}
        <div className="border-r-0 lg:border-r lg:border-dashed border-stone-400/60 pr-0 lg:pr-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-700/50 pb-2 font-display">
            English Ruling
          </h2>
          {/* 
            NOTE on dangerouslySetInnerHTML: This is used to render the HTML converted from markdown.
            While generally risky (can expose to XSS attacks), it is considered safe here because:
            1. The content comes from a trusted source (the Gemini API), not from user input.
            2. The markdown-to-HTML function is very simple and does not process complex tags like <script>.
          */}
          <div
            className="prose prose-stone max-w-none text-lg leading-relaxed prose-strong:text-orange-900 prose-li:marker:text-teal-600"
            dangerouslySetInnerHTML={englishHtml}
          />
        </div>

        {/* Arabic Fatwa Section */}
        <div dir="rtl" className="font-arabic">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-700/50 pb-2 font-display">
            الفتوى بالعربية
          </h2>
          <div
            className="prose prose-stone max-w-none text-3xl leading-loose text-right tracking-wide prose-strong:text-orange-900 prose-strong:font-semibold prose-li:marker:text-teal-600"
            dangerouslySetInnerHTML={arabicHtml}
          />
        </div>

      </div>

      {/* Action Buttons Section */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-4 border-t border-stone-400/50 pt-6">
        <button
          onClick={handleCopyToClipboard}
          disabled={isCopied}
          className={`${actionButtonClasses} ${copiedButtonClasses}`}
          aria-live="polite"
        >
          {isCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 4h.01M9 16h.01" />
              </svg>
              Share
            </>
          )}
        </button>

        <button
          onClick={() => handleReadAloud('english')}
          className={`${actionButtonClasses} ${speakingLang === 'english' ? playingButtonClasses : ''}`}
          aria-label={speakingLang === 'english' ? 'Stop reading English fatwa' : 'Read English fatwa aloud'}
        >
          {speakingLang === 'english' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          <span>Read English</span>
        </button>

        <button
          onClick={() => handleReadAloud('arabic')}
          className={`${actionButtonClasses} ${speakingLang === 'arabic' ? playingButtonClasses : ''}`}
          aria-label={speakingLang === 'arabic' ? 'Stop reading Arabic fatwa' : 'Read Arabic fatwa aloud'}
        >
          {speakingLang === 'arabic' ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          <span className="font-arabic text-xl">قراءة</span>
        </button>

      </div>

    </div>
  );
};

export default FatwaDisplay;
