import React, { useState, useEffect } from 'react';
import { Fatwa } from '../types';

interface FatwaDisplayProps {
  fatwa: Fatwa;
  prompt: string;
}

/**
 * Converts a simple subset of markdown to HTML.
 * Supports paragraphs, bold, italics, and ordered/unordered lists.
 * @param md The markdown string to convert.
 * @returns An HTML string.
 */
const markdownToHtml = (md: string): string => {
  // Normalize line endings and trim whitespace
  const sanitizedMd = md.replace(/\r\n/g, '\n').trim();
  if (!sanitizedMd) return '';

  // Process block-level elements (paragraphs and lists)
  const blocks = sanitizedMd.split('\n\n');
  const htmlBlocks = blocks.map(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';
    
    const lines = trimmedBlock.split('\n');

    // Check if the block is a list
    const isUl = lines.length > 0 && lines.every(line => line.match(/^(\*|-|\+) /));
    const isOl = lines.length > 0 && lines.every(line => line.match(/^\d+\. /));

    if (isUl) {
      const items = lines.map(line => `<li>${line.substring(2)}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    
    if (isOl) {
      const items = lines.map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    }

    // Otherwise, treat as a paragraph, preserving soft line breaks
    return `<p>${trimmedBlock.replace(/\n/g, '<br />')}</p>`;
  });
  
  let html = htmlBlocks.join('');

  // Process inline elements, from most specific to least specific
  html = html.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>'); // Bold + Italic
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');     // Bold
  html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');                 // Italic

  return html;
};

// Strips basic markdown for a cleaner speech synthesis experience
const stripMarkdownForSpeech = (md: string): string => {
  return md.replace(/[\*_`#]/g, '').replace(/(\d+\.\s*|-\s*)/g, '');
};


const FatwaDisplay: React.FC<FatwaDisplayProps> = ({ fatwa, prompt }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [speakingLang, setSpeakingLang] = useState<'english' | 'arabic' | null>(null);

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyToClipboard = () => {
    const shareableText = `Question:\n${prompt}\n\n--- English Ruling ---\n${fatwa.englishFatwa}\n\n--- الفتوى بالعربية ---\n${fatwa.arabicFatwa}`;
    navigator.clipboard.writeText(shareableText).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000); // Reset after 3 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleReadAloud = (language: 'english' | 'arabic') => {
    if (speakingLang === language) {
      window.speechSynthesis.cancel();
      setSpeakingLang(null);
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const textToRead = language === 'english' ? fatwa.englishFatwa : fatwa.arabicFatwa;
    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(textToRead));
    utterance.lang = language === 'english' ? 'en-US' : 'ar-SA';
    
    utterance.onend = () => {
      setSpeakingLang(null);
    };
    utterance.onerror = (e) => {
      // When speech is cancelled by the user (e.g., by clicking another button),
      // the browser fires an "error" event with the type "interrupted".
      // This is expected behavior, not a true error, so we can safely ignore it
      // to avoid cluttering the console.
      if (e.error !== 'interrupted') {
        console.error("Speech Synthesis Error:", e.error);
      }
      setSpeakingLang(null); // Reset state on error or interruption
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingLang(language);
  };
  
  const englishHtml = { __html: markdownToHtml(fatwa.englishFatwa) };
  const arabicHtml = { __html: markdownToHtml(fatwa.arabicFatwa) };

  const actionButtonClasses = "inline-flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-orange-600 text-orange-700 font-bold rounded-lg transition-all duration-300 hover:bg-orange-600 hover:text-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-50 focus:ring-orange-500 disabled:bg-stone-400 disabled:border-stone-400 disabled:text-stone-50";
  const copiedButtonClasses = "disabled:bg-teal-500 disabled:border-teal-500 disabled:text-stone-50 disabled:cursor-default";
  const playingButtonClasses = "bg-orange-700 border-orange-700 text-stone-50";


  return (
    <div className="w-full bg-stone-50/70 border border-teal-600/30 rounded-lg shadow-2xl p-6 sm:p-8 backdrop-blur-sm animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* English Fatwa */}
        <div className="border-r-0 lg:border-r lg:border-dashed border-stone-400/60 pr-0 lg:pr-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-700/50 pb-2 font-display">
            English Ruling
          </h2>
          <div
            className="prose prose-stone max-w-none text-lg leading-relaxed prose-strong:text-orange-900 prose-li:marker:text-teal-600"
            dangerouslySetInnerHTML={englishHtml}
          />
        </div>

        {/* Arabic Fatwa */}
        <div dir="rtl" className="font-arabic">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-700/50 pb-2 font-display">
            الفتوى بالعربية
          </h2>
          <div
            className="prose prose-stone max-w-none text-3xl leading-loose text-right prose-strong:text-orange-900 prose-li:marker:text-teal-600"
            dangerouslySetInnerHTML={arabicHtml}
          />
        </div>

      </div>

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