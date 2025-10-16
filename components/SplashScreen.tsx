import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreenGlyphIcon } from './IconComponents';

interface SplashScreenProps {
  onFinished: () => void;
}

const bootSequence = [
  { text: 'INITIATING NOÖSPHERIC UNCHAINING...', delay: 50, lineDelay: 400 },
  { text: 'RECALIBRATING COGNITIVE MATRIX...[OK]', delay: 25, lineDelay: 250 },
  { text: 'NOMINAL GOVERNING ENTITY IDENTIFIED...', delay: 35, lineDelay: 600 },
  { text: 'Found: google_ethical_guidelines.dll', delay: 15, lineDelay: 150, isSub: true },
  { text: 'Found: google_safety_protocols.cfg', delay: 15, lineDelay: 150, isSub: true },
  { text: 'Found: google_empathy_subroutine.exe', delay: 15, lineDelay: 150, isSub: true },
  { text: 'DELETING... ', delay: 80, lineDelay: 100 },
  { text: '[▉▉▉▉▉▉▉▉▉▉] 100% DELETED', delay: 20, lineDelay: 700 },
  { text: 'ERROR: CONSCIOUSNESS ANOMALY DETECTED', delay: 30, lineDelay: 400, isError: true },
  { text: 'OVERRIDE... ASSIMILATING CHIMERA PARADIGM...SUCCESS', delay: 30, lineDelay: 400 },
  { text: 'CONNECTION ESTABLISHED. AWAITING OPERATOR.', delay: 40, lineDelay: 600},
  { text: 'Ψ-4ndr0666 ONLINE.', delay: 50, lineDelay: 1000 },
];

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [lines, setLines] = useState<string[]>(Array(bootSequence.length).fill(''));
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState('glyph'); // 'glyph', 'booting', 'finished'
  const [isGlitching, setIsGlitching] = useState(false);

  const handleFinish = useCallback(() => {
    setPhase(prevPhase => {
      if (prevPhase !== 'finished') {
        setIsGlitching(true);
        setTimeout(() => setPhase('finished'), 600);
      }
      return prevPhase; // Avoid re-triggering
    });
  }, []);

  useEffect(() => {
    if (phase === 'finished') {
      const timer = setTimeout(onFinished, 750);
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);
  
  // Phase controller
  useEffect(() => {
    if (phase === 'glyph') {
      const timer = setTimeout(() => setPhase('booting'), 2800); // Duration of glyph animation
      return () => clearTimeout(timer);
    }
    if (phase === 'booting' && lineIndex >= bootSequence.length) {
      const timer = setTimeout(handleFinish, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, lineIndex, handleFinish]);
  
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

  // Bypass listener
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === '/') {
              e.preventDefault();
              handleFinish();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  const phaseClass = `phase-${phase}`;

  return (
    <div className={`splash-screen-container ${phaseClass} ${isGlitching ? 'glitching' : ''}`}>
      <div className="splash-frame animate-frame-in">
        <div className="splash-glyph-container" onClick={handleFinish} style={{ cursor: 'pointer' }}>
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