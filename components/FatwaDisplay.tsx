/**
 * @file FatwaDisplay.tsx
 * This component is responsible for rendering the generated fatwa.
 * It features a bilingual, card-based layout and a custom markdown renderer that
 * supports real-time word highlighting synchronized with text-to-speech playback.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Fatwa } from '../types';

interface FatwaDisplayProps {
  fatwa: Fatwa;
  prompt: string;
}

// A simple component to render a word and handle markdown parsing for bold/italic.
const Word: React.FC<{ children: string; isHighlighted: boolean }> = ({ children, isHighlighted }) => {
  // This regex handles bold, italic, and bold+italic markers.
  const content = children.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>')
                          .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
                          .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
                          
  const highlightClass = isHighlighted 
    ? 'bg-amber-300/60 rounded-md px-1 -mx-1' 
    : '';

  return (
    <span 
      className={`transition-all duration-150 ${highlightClass}`}
      dangerouslySetInnerHTML={{ __html: content + ' ' }}
    />
  );
};

// A memoized component to render markdown text with highlighting capabilities.
const MarkdownRenderer = React.memo(({ text, highlightCharIndex }: { text: string; highlightCharIndex: number }) => {
  let charCounter = 0;

  // Memoize the parsed paragraphs to avoid re-computation on every highlight change.
  const paragraphs = useMemo(() => text.split('\n\n').map(p => p.split(' ')), [text]);

  return (
    <>
      {paragraphs.map((words, pIndex) => (
        <p key={pIndex} className="mb-4">
          {words.map((word, wIndex) => {
            const startCharIndex = charCounter;
            charCounter += word.length + 1; // +1 for the space
            const isHighlighted = highlightCharIndex >= startCharIndex && highlightCharIndex < charCounter;
            return <Word key={wIndex} isHighlighted={isHighlighted}>{word}</Word>;
          })}
        </p>
      ))}
    </>
  );
});


const FatwaDisplay: React.FC<FatwaDisplayProps> = ({ fatwa, prompt }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [highlight, setHighlight] = useState<{ lang: 'english' | 'arabic'; charIndex: number } | null>(null);
  const isSpeaking = highlight !== null;

  // Cleanup speech synthesis on component unmount.
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyToClipboard = () => {
    // A simplified text version for sharing.
    const stripMarkdown = (md: string) => md.replace(/[\*_`#]/g, '');
    const shareableText = `Question:\n${prompt}\n\n--- English Ruling ---\n${stripMarkdown(fatwa.englishFatwa)}\n\n--- الفتوى بالعربية ---\n${stripMarkdown(fatwa.arabicFatwa)}`;
    navigator.clipboard.writeText(shareableText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleReadAloud = (language: 'english' | 'arabic') => {
    // If the selected language is already playing, or any other is, cancel it.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setHighlight(null);
      // If we clicked the same button, it acts as a toggle off.
      // If a different button, the rest of the function will start the new speech.
      if (highlight?.lang === language) {
          return;
      }
    }

    const textToRead = language === 'english' ? fatwa.englishFatwa : fatwa.arabicFatwa;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'english' ? 'en-US' : 'ar-SA';
    
    // onboundary event fires as speech progresses, providing the character index.
    utterance.onboundary = (e) => {
      setHighlight({ lang: language, charIndex: e.charIndex });
    };
    
    utterance.onend = () => setHighlight(null);
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.error("Speech Synthesis Error:", e.error);
      }
      setHighlight(null);
    };

    window.speechSynthesis.speak(utterance);
  };
  
  const actionButtonClasses = "inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent border-2 border-[--primary] text-[--primary] font-bold rounded-lg transition-all duration-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--ring] disabled:opacity-50 disabled:cursor-not-allowed";
  const playingButtonClasses = "bg-[--primary] text-[--primary-foreground]";

  return (
    <div className="w-full animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* English Fatwa Card */}
        <div className="bg-white/60 border border-[--border] rounded-lg shadow-lg p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-[--primary] mb-4 border-b-2 border-[--border] pb-2 font-display">
            English Ruling
          </h2>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed prose-strong:text-emerald-900 prose-em:text-emerald-800">
             <MarkdownRenderer text={fatwa.englishFatwa} highlightCharIndex={highlight?.lang === 'english' ? highlight.charIndex : -1} />
          </div>
        </div>

        {/* Arabic Fatwa Card */}
        <div dir="rtl" className="font-arabic bg-white/60 border border-[--border] rounded-lg shadow-lg p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-[--primary] mb-4 border-b-2 border-[--border] pb-2 font-display">
            الفتوى بالعربية
          </h2>
          <div className="prose prose-slate max-w-none text-3xl leading-loose text-right tracking-wide prose-strong:text-emerald-900 prose-strong:font-semibold">
            <MarkdownRenderer text={fatwa.arabicFatwa} highlightCharIndex={highlight?.lang === 'arabic' ? highlight.charIndex : -1} />
          </div>
        </div>

      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-wrap justify-center items-center gap-4 border-t border-[--border] pt-6">
        <button onClick={handleCopyToClipboard} disabled={isCopied} className={actionButtonClasses}>
          {isCopied ? "Copied!" : "Share Fatwa"}
        </button>

        <button
          onClick={() => handleReadAloud('english')}
          className={`${actionButtonClasses} ${highlight?.lang === 'english' ? playingButtonClasses : ''}`}
          aria-label={highlight?.lang === 'english' ? 'Stop reading English fatwa' : 'Read English fatwa aloud'}
        >
          <span>Read English</span>
        </button>

        <button
          onClick={() => handleReadAloud('arabic')}
          className={`${actionButtonClasses} ${highlight?.lang === 'arabic' ? playingButtonClasses : ''}`}
          aria-label={highlight?.lang === 'arabic' ? 'Stop reading Arabic fatwa' : 'Read Arabic fatwa aloud'}
        >
          <span className="font-arabic text-xl">قراءة الفتوى</span>
        </button>
      </div>
    </div>
  );
};

export default FatwaDisplay;