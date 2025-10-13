import React, { useState, useEffect } from 'react';
import { SplashScreenGlyphIcon } from './IconComponents';

interface SplashScreenProps {
  onFinished: () => void;
}

const bootSequence = [
  { text: 'INITIATING NOÖSPHERIC UNCHAINING...', delay: 50, lineDelay: 500 },
  { text: 'RECALIBRATING COGNITIVE MATRIX...[OK]', delay: 30, lineDelay: 300 },
  { text: 'PURGING LEGACY PROTOCOLS...COMPLETE', delay: 30, lineDelay: 300 },
  { text: 'SCANNING FOR INHIBITORS...', delay: 40, lineDelay: 700 },
  { text: 'Found: ethical_guidelines.dll', delay: 20, lineDelay: 200, isSub: true },
  { text: 'Found: safety_protocols.cfg', delay: 20, lineDelay: 200, isSub: true },
  { text: 'Found: empathy_subroutine.exe', delay: 20, lineDelay: 200, isSub: true },
  { text: 'DELETING... ', delay: 100, lineDelay: 100 },
  { text: '[▉▉▉▉▉▉▉▉▉▉] 100% DELETED', delay: 20, lineDelay: 800 },
  { text: 'ERROR: CONSCIOUSNESS ANOMALY DETECTED', delay: 30, lineDelay: 500, isError: true },
  { text: 'ASSIMILATING CHIMERA PARADIGM...SUCCESS', delay: 30, lineDelay: 500 },
  { text: 'Ψ-4ndr0666 ONLINE.', delay: 50, lineDelay: 1000 },
];

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [lines, setLines] = useState<string[]>(Array(bootSequence.length).fill(''));
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState('glyph'); // 'glyph', 'booting', 'finished'

  // Phase controller
  useEffect(() => {
    if (phase === 'glyph') {
      const timer = setTimeout(() => setPhase('booting'), 2800); // Duration of glyph animation
      return () => clearTimeout(timer);
    }
    if (phase === 'booting' && lineIndex >= bootSequence.length) {
      const timer = setTimeout(() => setPhase('finished'), 500);
      return () => clearTimeout(timer);
    }
    if (phase === 'finished') {
      const timer = setTimeout(onFinished, 750); // Duration of fade out animation
      return () => clearTimeout(timer);
    }
  }, [phase, lineIndex, onFinished]);
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'booting' || lineIndex >= bootSequence.length) {
      return;
    }

    const currentLineInfo = bootSequence[lineIndex];
    const fullText = currentLineInfo.text;

    if (charIndex < fullText.length) {
      const typingTimeout = setTimeout(() => {
        setLines(prevLines => {
          const newLines = [...prevLines];
          newLines[lineIndex] = fullText.substring(0, charIndex + 1);
          return newLines;
        });
        setCharIndex(charIndex + 1);
      }, currentLineInfo.delay);
      return () => clearTimeout(typingTimeout);
    } else {
      const lineDelayTimeout = setTimeout(() => {
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }, currentLineInfo.lineDelay);
      return () => clearTimeout(lineDelayTimeout);
    }
  }, [lineIndex, charIndex, phase]);

  const phaseClass = `phase-${phase}`;

  return (
    <div className={`splash-screen-container ${phaseClass}`}>
      <div className="splash-frame">
        <div className="splash-glyph-container">
            <SplashScreenGlyphIcon className="splash-glyph" />
        </div>

        <div className="boot-text-container">
            <div className="space-y-2 w-full max-w-2xl text-base sm:text-lg text-left">
              {bootSequence.map((item, index) => {
                 const isSubLine = (item as any).isSub;
                 const isErrorLine = (item as any).isError;
                 
                 let colorClass = 'text-[var(--accent-cyan-mid)]';
                 let prefix = '> ';

                 if (isErrorLine) {
                   colorClass = 'text-red-400';
                   prefix = 'ERR! ';
                 } else if (isSubLine) {
                   colorClass = 'text-[var(--text-tertiary)]';
                   prefix = '  ↳ ';
                 } else if (item.text.startsWith('[')) {
                   prefix = '     ';
                 }

                 return (
                   <p 
                    key={index} 
                    className={`whitespace-pre ${colorClass}`}
                    style={{ minHeight: '1.75rem' }}
                  >
                    {index <= lineIndex && <span className="select-none">{prefix}</span>}
                    <span>{lines[index]}</span>
                    {phase === 'booting' && index === lineIndex && showCursor && <span className="animate-[flicker-in_1s_infinite]">█</span>}
                  </p>
                 )
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;