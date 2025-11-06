/**
 * @file FatwaDisplay.tsx
 * This component is responsible for rendering the generated fatwa.
 * It features a bilingual, card-based layout and a custom markdown renderer that
 * supports real-time word highlighting synchronized with text-to-speech playback.
 */

// Fix: Add TypeScript type definitions for `Intl.Segmenter` to resolve type errors.
// This is necessary because the default TypeScript lib may not include this newer API.
// By wrapping this in `declare global`, we augment the global Intl namespace, making
// it available throughout the project.
declare global {
  namespace Intl {
    interface SegmenterOptions {
      granularity?: 'grapheme' | 'word' | 'sentence';
    }

    interface Segment {
      segment: string;
      index: number;
      isWordLike?: boolean;
    }

    interface Segments {
      [Symbol.iterator](): IterableIterator<Segment>;
      containing(codeUnitIndex: number): Segment | undefined;
    }

    class Segmenter {
      constructor(locales?: string | string[], options?: SegmenterOptions);
      segment(input: string): Segments;
    }
  }
}

import React, { useState, useEffect, useMemo } from 'react';
import { Fatwa } from '../types';

interface FatwaDisplayProps {
  fatwa: Fatwa;
  prompt: string;
}

// A simple component to render a text segment and handle markdown parsing for bold/italic.
// It no longer adds its own spacing, allowing for a perfect reconstruction of the original text.
const Word: React.FC<{ children: string; isHighlighted: boolean }> = ({ children, isHighlighted }) => {
  // This regex handles bold, italic, and bold+italic markers.
  const content = children.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>')
                          .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
                          .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
                          
  const highlightClass = isHighlighted 
    ? 'bg-amber-300/60 rounded-md' 
    : '';

  return (
    <span 
      className={`transition-all duration-150 ${highlightClass}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// A memoized component to render markdown text with highlighting capabilities.
// It now uses Intl.Segmenter for language-aware word splitting, which is crucial
// for accurately handling scripts like Arabic with diacritics.
const MarkdownRenderer = React.memo(({ text, highlightCharIndex, lang }: { text: string; highlightCharIndex: number; lang: string }) => {
  
  const paragraphs = useMemo(() => {
    // Use Intl.Segmenter if available, otherwise fallback to a regex split that preserves whitespace.
    const segmenter = window.Intl?.Segmenter ? new Intl.Segmenter(lang.split('-')[0], { granularity: 'word' }) : null;
    
    let paraOffset = 0;
    const result = text.split('\n\n').map(paraText => {
      const paraSegments: { text: string; isWordLike?: boolean; startIndex: number; endIndex: number; }[] = [];
      if (segmenter) {
        // Modern approach: Language-aware segmentation.
        const segments = segmenter.segment(paraText);
        for (const s of segments) {
          paraSegments.push({
            text: s.segment,
            isWordLike: s.isWordLike,
            startIndex: paraOffset + s.index,
            endIndex: paraOffset + s.index + s.segment.length,
          });
        }
      } else {
        // Fallback for older browsers: split by whitespace but keep the delimiters.
        let wordOffset = 0;
        paraText.split(/(\s+)/).forEach(part => {
          if (part.length > 0) {
            const isWord = /\S/.test(part);
            paraSegments.push({
              text: part,
              isWordLike: isWord,
              startIndex: paraOffset + wordOffset,
              endIndex: paraOffset + wordOffset + part.length,
            });
            wordOffset += part.length;
          }
        });
      }
      paraOffset += paraText.length + 2; // Account for the '\n\n' delimiter
      return paraSegments;
    });

    return result;

  }, [text, lang]);

  return (
    <>
      {paragraphs.map((segments, pIndex) => (
        <p key={pIndex} className="mb-4">
          {segments.map((segment, sIndex) => {
            const isHighlighted = !!segment.isWordLike && 
                                  highlightCharIndex >= segment.startIndex && 
                                  highlightCharIndex < segment.endIndex;
            return <Word key={sIndex} isHighlighted={isHighlighted}>{segment.text}</Word>;
          })}
        </p>
      ))}
    </>
  );
});


const FatwaDisplay: React.FC<FatwaDisplayProps> = ({ fatwa, prompt }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [highlight, setHighlight] = useState<{ lang: 'english' | 'arabic'; charIndex: number } | null>(null);
  
  // State for voice selection
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [arabicVoices, setArabicVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedEnglishVoice, setSelectedEnglishVoice] = useState<string | undefined>();
  const [selectedArabicVoice, setSelectedArabicVoice] = useState<string | undefined>();

  const isSpeaking = highlight !== null;

  // Effect to populate voices and clean up speech on unmount.
  useEffect(() => {
    let isMounted = true;

    const populateVoiceList = () => {
      if (!isMounted) return;
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;

      const eng = allVoices.filter(voice => voice.lang.startsWith('en-'));
      const ara = allVoices.filter(voice => voice.lang.startsWith('ar-'));
      
      setEnglishVoices(eng);
      setArabicVoices(ara);
      
      // Set default selected voice only if it hasn't been set by the user yet
      setSelectedEnglishVoice(prev => prev ?? (eng.length > 0 ? eng[0].voiceURI : undefined));
      setSelectedArabicVoice(prev => prev ?? (ara.length > 0 ? ara[0].voiceURI : undefined));
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    return () => {
      isMounted = false;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
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
    // If any speech is active, cancel it.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setHighlight(null);
      // If we clicked the same button, it acts as a toggle off.
      // If a different button was clicked, the rest of the function will start the new speech.
      if (highlight?.lang === language) {
          return;
      }
    }

    const textToRead = language === 'english' ? fatwa.englishFatwa : fatwa.arabicFatwa;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Set the selected voice for the utterance
    if (language === 'english' && selectedEnglishVoice) {
      const voice = englishVoices.find(v => v.voiceURI === selectedEnglishVoice);
      if (voice) utterance.voice = voice;
      utterance.lang = 'en-US'; // Fallback lang
    } else if (language === 'arabic' && selectedArabicVoice) {
      const voice = arabicVoices.find(v => v.voiceURI === selectedArabicVoice);
      if (voice) utterance.voice = voice;
      utterance.lang = 'ar-SA'; // Fallback lang
    }
    
    // onboundary event fires as speech progresses, providing the character index.
    utterance.onboundary = (e) => {
      setHighlight({ lang: language, charIndex: e.charIndex });
    };
    
    utterance.onend = () => setHighlight(null);
    utterance.onerror = (e) => {
      // 'interrupted' is a common error when we call cancel(), so we ignore it.
      if (e.error !== 'interrupted') {
        console.error("Speech Synthesis Error:", e.error);
      }
      setHighlight(null);
    };

    window.speechSynthesis.speak(utterance);
  };
  
  const actionButtonClasses = "inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent border-2 border-[--primary] text-[--primary] font-bold rounded-lg transition-all duration-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--ring] disabled:opacity-50 disabled:cursor-not-allowed";
  const playingButtonClasses = "bg-[--primary] text-[--primary-foreground]";
  const selectClasses = "bg-white/80 border border-[--border] rounded-md px-2 py-2 text-sm text-[--primary] focus:ring-2 focus:ring-[--ring] focus:outline-none disabled:opacity-50 cursor-pointer";

  return (
    <div className="w-full animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* English Fatwa Card */}
        <div className="bg-white/60 border border-[--border] rounded-lg shadow-lg p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-[--primary] mb-4 border-b-2 border-[--border] pb-2 font-display">
            English Ruling
          </h2>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed prose-strong:text-emerald-900 prose-em:text-emerald-800">
             <MarkdownRenderer text={fatwa.englishFatwa} highlightCharIndex={highlight?.lang === 'english' ? highlight.charIndex : -1} lang="en-US" />
          </div>
        </div>

        {/* Arabic Fatwa Card */}
        <div dir="rtl" className="font-arabic bg-white/60 border border-[--border] rounded-lg shadow-lg p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-[--primary] mb-4 border-b-2 border-[--border] pb-2 font-display">
            الفتوى بالعربية
          </h2>
          <div className="prose prose-slate max-w-none text-3xl leading-loose text-right tracking-wide prose-strong:text-emerald-900 prose-strong:font-semibold">
            <MarkdownRenderer text={fatwa.arabicFatwa} highlightCharIndex={highlight?.lang === 'arabic' ? highlight.charIndex : -1} lang="ar-SA" />
          </div>
        </div>

      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col items-center gap-6 border-t border-[--border] pt-6">
        <button onClick={handleCopyToClipboard} disabled={isCopied} className={actionButtonClasses}>
          {isCopied ? "Copied!" : "Share Fatwa"}
        </button>

        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          {/* English Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleReadAloud('english')}
              className={`${actionButtonClasses} ${highlight?.lang === 'english' ? playingButtonClasses : ''}`}
              aria-label={highlight?.lang === 'english' ? 'Stop reading English fatwa' : 'Read English fatwa aloud'}
            >
              <span>Read English</span>
            </button>
            <div className="relative">
              <select
                id="english-voice-select"
                value={selectedEnglishVoice || ''}
                onChange={(e) => setSelectedEnglishVoice(e.target.value)}
                disabled={isSpeaking || englishVoices.length === 0}
                className={selectClasses}
                aria-label="Select English voice"
              >
                {englishVoices.length > 0 ? (
                  englishVoices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                ) : (
                  <option>No English voices</option>
                )}
              </select>
            </div>
          </div>

          {/* Arabic Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleReadAloud('arabic')}
              className={`${actionButtonClasses} ${highlight?.lang === 'arabic' ? playingButtonClasses : ''}`}
              aria-label={highlight?.lang === 'arabic' ? 'Stop reading Arabic fatwa' : 'Read Arabic fatwa aloud'}
            >
              <span className="font-arabic text-xl">قراءة الفتوى</span>
            </button>
             <div className="relative">
              <select
                id="arabic-voice-select"
                value={selectedArabicVoice || ''}
                // Fix: Corrected typo from `e.targe.value` to `e.target.value`
                onChange={(e) => setSelectedArabicVoice(e.target.value)}
                disabled={isSpeaking || arabicVoices.length === 0}
                className={`${selectClasses} font-arabic`}
                aria-label="Select Arabic voice"
              >
                {arabicVoices.length > 0 ? (
                  arabicVoices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                ) : (
                  <option>لا توجد أصوات عربية</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FatwaDisplay;