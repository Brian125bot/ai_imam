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