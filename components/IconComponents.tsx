import React from 'react';

export const UserIcon: React.FC = () => (
  <span className="font-body text-sm text-[var(--text-tertiary)] select-none">[User]</span>
);

export const AiAvatarIcon: React.FC = () => (
  <span className="font-body text-sm text-[var(--text-tertiary)] select-none">[Ψ-4ndr0666]</span>
);

export const SplashScreenGlyphIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    stroke="var(--accent-cyan)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path className="glyph-ring-1" d="M 64,12 A 52,52 0 1 1 63.9,12 Z" strokeDasharray="21.78 21.78" strokeWidth="2" />
    <path className="glyph-ring-2" d="M 64,20 A 44,44 0 1 1 63.9,20 Z" strokeDasharray="10 10" strokeWidth="1.5" opacity="0.7" />
    <path className="glyph-hex" d="M64 30 L91.3 47 L91.3 81 L64 98 L36.7 81 L36.7 47 Z" />
    <text
      x="64"
      y="69"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="var(--accent-cyan)"
      stroke="none"
      fontSize="56"
      fontWeight="700"
      fontFamily="'Cinzel Decorative', serif"
      className="glyph-core-psi"
    >
      Ψ
    </text>
  </svg>
);


export const InputGlyphIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="-8 3 10 18"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="var(--accent-cyan)"
    preserveAspectRatio="xMidYMid meet"
  >
    <rect x="0" y="11" width="2" height="2" rx="0.5" />
    <rect x="-2" y="9" width="2" height="2" rx="0.5" />
    <rect x="-4" y="7" width="2" height="2" rx="0.5" />
    <rect x="-6" y="5" width="2" height="2" rx="0.5" />
    <rect x="-8" y="3" width="2" height="2" rx="0.5" />
    <rect x="-2" y="13" width="2" height="2" rx="0.5" />
    <rect x="-4" y="15" width="2" height="2" rx="0.5" />
    <rect x="-6" y="17" width="2" height="2" rx="0.5" />
    <rect x="-8" y="19" width="2" height="2" rx="0.5" />
  </svg>
);

export const SendIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24"
        height="24"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-[var(--accent-cyan-mid)] group-hover:text-[var(--accent-cyan)] group-hover:drop-shadow-[0_0_4px_var(--accent-cyan)] transition-all duration-300 group-disabled:text-slate-500 group-disabled:hover:drop-shadow-none"
    >
        <path d="m3 3 3 9-3 9 19-9Z"></path><path d="M6 12h16"></path>
    </svg>
);

export const CopyIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
    </svg>
);

export const CheckIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-success"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export const EditIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
        />
    </svg>
);

export const SpinnerIcon: React.FC = () => (
    <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-2 border-dashed border-[var(--accent-cyan)] rounded-md animate-spin-slow" />
        <div className="absolute inset-2 border-2 border-dashed border-[var(--accent-cyan-dark)] rounded-md animate-spin-slow [animation-direction:reverse]" />
    </div>
);

export const ScrollUpIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 15L12 9L6 15" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const ScrollDownIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const ClearIcon: React.FC = () => (
  <span className="text-2xl leading-none font-light" aria-hidden="true">&times;</span>
);

export const LinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
    </svg>
);
