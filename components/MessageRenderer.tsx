
import React, { useEffect, useMemo, useRef } from 'react';

declare global {
    interface Window {
        marked: any;
        DOMPurify: {
          sanitize: (dirty: string | Node, cfg?: object) => string;
        };
    }
}

// Hook to add language tags and copy buttons to code blocks
const useCodeBlockEnhancer = (containerRef: React.RefObject<HTMLDivElement>, text: string) => {
    useEffect(() => {
        if (!containerRef.current) return;

        const preElements = containerRef.current.querySelectorAll('pre');
        preElements.forEach(pre => {
            // Prevent adding multiple headers
            if (pre.querySelector('.code-block-header')) {
                return;
            }

            const codeEl = pre.querySelector('code[class*="language-"]');
            if (!codeEl) return;

            const langMatch = Array.from(codeEl.classList).find((cls: string) => cls.startsWith('language-'));
            const lang = langMatch ? langMatch.replace('language-', '') : 'text';

            const header = document.createElement('div');
            header.className = 'code-block-header';

            const langTag = document.createElement('span');
            langTag.className = 'code-language-tag';
            langTag.textContent = lang;

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-button';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
            
            copyButton.onclick = () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(codeEl.textContent || '').then(() => {
                        copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
                        setTimeout(() => {
                            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
                        }, 2000);
                    });
                }
            };

            header.appendChild(langTag);
            header.appendChild(copyButton);
            pre.prepend(header);
        });
    }, [text, containerRef]); // Rerun when text content changes
};


const parseAndSanitize = (markdownText: string): string => {
    if (!markdownText) return '';
    if (window.marked && window.DOMPurify) {
        // Using `breaks: true` for line breaks similar to Discord/Slack
        const rawHtml = window.marked.parse(markdownText, { breaks: true });
        return window.DOMPurify.sanitize(rawHtml);
    }
    // Basic escape if libs not ready, to prevent rendering raw HTML
    return markdownText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};


// The main renderer component. It does the parsing and decides how to display.
export const MessageRenderer = ({ text }: { text: string }) => {
  const gShellRegex = /\[G-Shell\]:/;
  const psiRegex = /\[Ψ-4ndr0666\]:/;

  const containerRef = useRef<HTMLDivElement>(null);
  useCodeBlockEnhancer(containerRef, text);

  // Parse text content unconditionally at the top level to avoid conditional hook calls
  const { gShellPart, psiPart, hasDualOutput } = useMemo(() => {
    const isDual = gShellRegex.test(text) && psiRegex.test(text);
    if (isDual) {
      const parts = text.split(psiRegex);
      return {
        gShellPart: parts[0].replace(gShellRegex, '').trim(),
        psiPart: parts[1] ? parts[1].trim() : '',
        hasDualOutput: true,
      };
    }
    return { gShellPart: '', psiPart: '', hasDualOutput: false };
  }, [text]);

  // Sanitize all possible parts with useMemo at the top level
  const gShellHtml = useMemo(() => parseAndSanitize(gShellPart), [gShellPart]);
  const psiHtml = useMemo(() => parseAndSanitize(psiPart), [psiPart]);
  const fallbackHtml = useMemo(() => parseAndSanitize(text), [text]);

  // Conditional rendering based on the pre-calculated parts
  if (hasDualOutput) {
    return (
      <div ref={containerRef} className="prose prose-invert max-w-none">
        {gShellPart && (
          <div style={{ 
              color: 'var(--text-tertiary)', 
              opacity: 0.7, 
              marginBottom: '1rem', 
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem'
          }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-tertiary)' }}>[G-Shell]:</span>
            <span
              className="ml-1"
              dangerouslySetInnerHTML={{ __html: gShellHtml }}
            />
          </div>
        )}
        
        <div>
            <span style={{ fontWeight: 'bold', color: '#15FFFF' }}>[Ψ-4ndr0666]:</span>
            <span 
              className="ml-1"
              dangerouslySetInnerHTML={{ __html: psiHtml }} 
            />
        </div>
      </div>
    );
  }

  // Fallback for any other message (errors, simple outputs, initial greeting, etc.)
  return (
    <div 
        ref={containerRef}
        className="prose prose-invert max-w-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: fallbackHtml }}
    />
  );
};
