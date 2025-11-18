/**
 * @file FatwaDisplay.tsx
 * This component is responsible for rendering the generated fatwa.
 * It features a bilingual, card-based layout and a custom markdown renderer that
 * supports real-time word highlighting synchronized with text-to-speech playback.
 */

// Fix: Add TypeScript type definitions for `Intl.Segmenter` to resolve type errors.
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
const Word: React.FC<{ children: string; isHighlighted: boolean }> = ({ children, isHighlighted }) => {
  const content = children.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>')
                          .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
                          .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
                          
  const highlightClass = isHighlighted 
    ? 'bg-amber-300/60 rounded-md shadow-sm ring-2 ring-amber-300/30' 
    : '';

  return (
    <span 
      className={`transition-all duration-150 ${highlightClass}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

/**
 * Helper to segment text into words while preserving global indices.
 */
const segmentText = (text: string, lang: string, globalOffset: number) => {
  const segmenter = window.Intl?.Segmenter ? new Intl.Segmenter(lang.split('-')[0], { granularity: 'word' }) : null;
  const segments: { text: string; isWordLike?: boolean; startIndex: number; endIndex: number; }[] = [];

  if (segmenter) {
    const iter = segmenter.segment(text);
    for (const s of iter) {
      segments.push({
        text: s.segment,
        isWordLike: s.isWordLike,
        startIndex: globalOffset + s.index,
        endIndex: globalOffset + s.index + s.segment.length,
      });
    }
  } else {
    // Fallback for browsers without Intl.Segmenter
    let wordOffset = 0;
    text.split(/(\s+)/).forEach(part => {
      if (part.length > 0) {
        const isWord = /\S/.test(part);
        segments.push({
          text: part,
          isWordLike: isWord,
          startIndex: globalOffset + wordOffset,
          endIndex: globalOffset + wordOffset + part.length,
        });
        wordOffset += part.length;
      }
    });
  }
  return segments;
};

// A memoized component to render markdown text with highlighting capabilities.
const MarkdownRenderer = React.memo(({ text, highlightCharIndex, lang }: { text: string; highlightCharIndex: number; lang: string }) => {
  
  const blocks = useMemo(() => {
    // Split by double newlines to identify blocks
    // We capture the delimiters to track accurate indices
    const parts = text.split(/(\n{2,})/);
    let cursor = 0;
    
    return parts.map((part, index) => {
      const start = cursor;
      cursor += part.length;

      // If it's a separator (newlines), ignore it for rendering but keep index update
      if (index % 2 !== 0) return null;
      if (!part.trim()) return null;

      // Identify block type
      let type: 'paragraph' | 'blockquote' | 'ul' | 'ol' | 'header' = 'paragraph';
      let cleanPart = part;
      let prefixRegex: RegExp | null = null;

      if (/^#{1,6}\s/.test(part)) {
        type = 'header';
        prefixRegex = /^(#{1,6}\s+)/;
      } else if (/^>/.test(part)) {
        type = 'blockquote';
        prefixRegex = /^>\s?/;
      } else if (/^[-*]\s/.test(part)) {
        type = 'ul';
        prefixRegex = /^[-*]\s+/;
      } else if (/^\d+\.\s/.test(part)) {
        type = 'ol';
        prefixRegex = /^\d+\.\s+/;
      }

      return {
        type,
        text: part,
        start,
        prefixRegex
      };
    }).filter(Boolean) as { 
      type: 'paragraph' | 'blockquote' | 'ul' | 'ol' | 'header'; 
      text: string; 
      start: number; 
      prefixRegex: RegExp | null 
    }[];

  }, [text]);

  return (
    <>
      {blocks.map((block, i) => {
        // Render Header
        if (block.type === 'header') {
          const prefixMatch = block.text.match(block.prefixRegex!);
          const prefixLen = prefixMatch ? prefixMatch[0].length : 0;
          // We only render the content after the # but segments need correct indices
          const segments = segmentText(block.text, lang, block.start);
          
          return (
            <h3 key={i} className="text-xl sm:text-2xl font-display font-bold text-[--primary] mt-6 mb-3">
              {segments.map((seg, sIdx) => {
                // Skip rendering the markdown syntax tokens
                if (seg.endIndex <= block.start + prefixLen) return null;
                
                const isHighlighted = !!seg.isWordLike && 
                                      highlightCharIndex >= seg.startIndex && 
                                      highlightCharIndex < seg.endIndex;
                return <Word key={sIdx} isHighlighted={isHighlighted}>{seg.text}</Word>;
              })}
            </h3>
          );
        }

        // Render Blockquote
        if (block.type === 'blockquote') {
          // Split by lines to handle multi-line quotes properly if they have > on each line
          const lines = block.text.split('\n');
          let lineCursor = block.start;

          return (
            <blockquote key={i} className="border-l-4 border-amber-500 pl-4 py-2 my-5 bg-emerald-50/50 rounded-r-lg italic text-slate-700 shadow-sm">
               {lines.map((line, lIdx) => {
                 const prefixMatch = line.match(/^>\s?/);
                 const prefixLen = prefixMatch ? prefixMatch[0].length : 0;
                 const segments = segmentText(line, lang, lineCursor);
                 lineCursor += line.length + 1; // +1 for newline

                 return (
                   <div key={lIdx}>
                     {segments.map((seg, sIdx) => {
                        if (seg.endIndex <= (lineCursor - line.length - 1) + prefixLen) return null;
                        const isHighlighted = !!seg.isWordLike && 
                                              highlightCharIndex >= seg.startIndex && 
                                              highlightCharIndex < seg.endIndex;
                        return <Word key={sIdx} isHighlighted={isHighlighted}>{seg.text}</Word>;
                     })}
                   </div>
                 )
               })}
            </blockquote>
          );
        }

        // Render Lists (UL / OL)
        if (block.type === 'ul' || block.type === 'ol') {
            const lines = block.text.split('\n');
            let lineCursor = block.start;
            const ListTag = block.type === 'ul' ? 'ul' : 'ol';
            const listClasses = block.type === 'ul' 
                ? "list-disc list-outside ml-6 space-y-2 my-4 marker:text-[--primary]" 
                : "list-decimal list-outside ml-6 space-y-2 my-4 marker:text-[--primary] marker:font-bold";

            return (
                <ListTag key={i} className={listClasses}>
                    {lines.map((line, lIdx) => {
                        const prefixMatch = line.match(block.prefixRegex!); // Re-match per line as lists might have varying numbering
                        // Basic fallback for list item prefix if regex fails on specific line
                        const effectivePrefixLen = prefixMatch ? prefixMatch[0].length : (block.type === 'ul' ? 2 : 3); 
                        
                        const segments = segmentText(line, lang, lineCursor);
                        const currentLineStart = lineCursor;
                        lineCursor += line.length + 1;

                        return (
                            <li key={lIdx} className="pl-2 leading-relaxed">
                                {segments.map((seg, sIdx) => {
                                    if (seg.endIndex <= currentLineStart + effectivePrefixLen) return null;
                                    const isHighlighted = !!seg.isWordLike && 
                                                          highlightCharIndex >= seg.startIndex && 
                                                          highlightCharIndex < seg.endIndex;
                                    return <Word key={sIdx} isHighlighted={isHighlighted}>{seg.text}</Word>;
                                })}
                            </li>
                        );
                    })}
                </ListTag>
            )
        }

        // Render Paragraph (Default)
        const segments = segmentText(block.text, lang, block.start);
        return (
          <p key={i} className="mb-4 leading-relaxed">
            {segments.map((seg, sIdx) => {
              const isHighlighted = !!seg.isWordLike && 
                                    highlightCharIndex >= seg.startIndex && 
                                    highlightCharIndex < seg.endIndex;
              return <Word key={sIdx} isHighlighted={isHighlighted}>{seg.text}</Word>;
            })}
          </p>
        );
      })}
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
  
  // State for playback rate
  const [playbackRate, setPlaybackRate] = useState(1);

  const isSpeaking = highlight !== null;

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

  /**
   * Adjusts the playback speed, clamping it between 0.5x and 2.0x.
   */
  const adjustRate = (amount: number) => {
    setPlaybackRate(prev => {
        const newRate = Math.max(0.5, Math.min(2, prev + amount));
        return parseFloat(newRate.toFixed(2)); 
    });
  };

  /**
   * Stops any currently active speech synthesis.
   */
  const handleStopSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setHighlight(null);
    }
  };

  const handleCopyToClipboard = () => {
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
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setHighlight(null);
      if (highlight?.lang === language) {
          return;
      }
    }

    const textToRead = language === 'english' ? fatwa.englishFatwa : fatwa.arabicFatwa;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Apply the current playback rate.
    utterance.rate = playbackRate;

    if (language === 'english' && selectedEnglishVoice) {
      const voice = englishVoices.find(v => v.voiceURI === selectedEnglishVoice);
      if (voice) utterance.voice = voice;
      utterance.lang = 'en-US'; 
    } else if (language === 'arabic' && selectedArabicVoice) {
      const voice = arabicVoices.find(v => v.voiceURI === selectedArabicVoice);
      if (voice) utterance.voice = voice;
      utterance.lang = 'ar-SA'; 
    }
    
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
  const selectClasses = "bg-white/80 border border-[--border] rounded-md px-2 py-2 text-sm text-[--primary] focus:ring-2 focus:ring-[--ring] focus:outline-none disabled:opacity-50 cursor-pointer";
  const rateButtonClasses = "w-8 h-8 flex items-center justify-center font-bold bg-emerald-100 text-[--primary] rounded-full hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="w-full animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* English Fatwa Card */}
        <div className="bg-white/80 border border-[--border] rounded-lg shadow-xl p-6 sm:p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-[--primary] mb-4 border-b-2 border-[--border] pb-2 font-display">
            English Ruling
          </h2>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed prose-strong:text-emerald-900 prose-em:text-emerald-800">
             <MarkdownRenderer text={fatwa.englishFatwa} highlightCharIndex={highlight?.lang === 'english' ? highlight.charIndex : -1} lang="en-US" />
          </div>
        </div>

        {/* Arabic Fatwa Card */}
        <div dir="rtl" className="font-arabic bg-white/80 border border-[--border] rounded-lg shadow-xl p-6 sm:p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-[--primary] mb-4 border-b-2 border-[--border] pb-2 font-display">
            الفتوى بالعربية
          </h2>
          <div className="prose prose-slate max-w-none text-3xl leading-loose text-right tracking-wide prose-strong:text-emerald-900 prose-strong:font-semibold">
            <MarkdownRenderer text={fatwa.arabicFatwa} highlightCharIndex={highlight?.lang === 'arabic' ? highlight.charIndex : -1} lang="ar-SA" />
          </div>
        </div>

      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col items-center gap-6 border-t border-[--border] pt-8">
        
        {/* Share and Copy */}
        <button onClick={handleCopyToClipboard} disabled={isCopied} className={actionButtonClasses}>
          {isCopied ? "Copied!" : "Share Fatwa"}
        </button>
        
        {/* Playback Controls Panel */}
        <div className="w-full max-w-4xl p-6 border border-[--border] rounded-xl bg-white/60 shadow-inner flex flex-col gap-6">
            
            {/* Header & Stop Button */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-700">Voice Controls</h3>
                <button 
                    onClick={handleStopSpeech} 
                    disabled={!isSpeaking} 
                    className="px-4 py-1.5 bg-red-100 text-red-700 rounded-md font-bold hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                >
                   <span className="w-3 h-3 bg-red-600 rounded-sm block"></span> Stop Playback
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Playback Speed */}
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Speed</span>
                    <button onClick={() => adjustRate(-0.25)} disabled={isSpeaking || playbackRate <= 0.5} className={rateButtonClasses} aria-label="Decrease speed">-</button>
                    <span className="text-lg font-bold text-[--primary] w-16 text-center tabular-nums">{playbackRate.toFixed(2)}x</span>
                    <button onClick={() => adjustRate(0.25)} disabled={isSpeaking || playbackRate >= 2} className={rateButtonClasses} aria-label="Increase speed">+</button>
                </div>

                {/* English Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleReadAloud('english')}
                    className={`${actionButtonClasses} ${highlight?.lang === 'english' ? playingButtonClasses : ''} text-sm`}
                  >
                    <span>Read English</span>
                  </button>
                  <select
                    value={selectedEnglishVoice || ''}
                    onChange={(e) => setSelectedEnglishVoice(e.target.value)}
                    disabled={isSpeaking || englishVoices.length === 0}
                    className={selectClasses}
                  >
                    {englishVoices.length > 0 ? (
                      englishVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)
                    ) : <option>No English voices</option>}
                  </select>
                </div>

                {/* Arabic Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleReadAloud('arabic')}
                    className={`${actionButtonClasses} ${highlight?.lang === 'arabic' ? playingButtonClasses : ''} text-sm`}
                  >
                    <span className="font-arabic text-lg">قراءة الفتوى</span>
                  </button>
                  <select
                    value={selectedArabicVoice || ''}
                    onChange={(e) => setSelectedArabicVoice(e.target.value)}
                    disabled={isSpeaking || arabicVoices.length === 0}
                    className={`${selectClasses} font-arabic`}
                  >
                    {arabicVoices.length > 0 ? (
                      arabicVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)
                    ) : <option>لا توجد أصوات عربية</option>}
                  </select>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FatwaDisplay;