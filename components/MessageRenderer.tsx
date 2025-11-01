

import React, { useEffect, useMemo, useRef } from 'react';

declare global {
    interface Window {
        marked: any;
        DOMPurify: {
          sanitize: (dirty: string | Node, cfg?: object) => string;
        };
        hljs: any;
    }
}

const useLazyCodeEnhancer = (containerRef: React.RefObject<HTMLDivElement>, text: string) => {
    useEffect(() => {
        if (!containerRef.current || !window.hljs) return;

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const codeEl = entry.target as HTMLElement;
                    
                    if (codeEl.dataset.highlighted === 'true') {
                        observerInstance.unobserve(codeEl);
                        return;
                    }

                    window.hljs.highlightElement(codeEl);
                    codeEl.dataset.highlighted = 'true';

                    const pre = codeEl.parentElement;
                    if (pre && !pre.querySelector('.code-block-header')) {
                        let lang = 'text';
                        for (const cls of codeEl.classList) {
                            if (cls.startsWith('language-')) {
                                lang = cls.replace('language-', '');
                                break;
                            }
                        }

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
                    }
                    
                    observerInstance.unobserve(codeEl);
                }
            });
        }, { rootMargin: '200px' });

        const codeBlocks = containerRef.current.querySelectorAll('pre > code');
        codeBlocks.forEach(block => observer.observe(block));

        return () => observer.disconnect();
    }, [text, containerRef]);
};

const preprocessCustomMarkdown = (markdown: string): string => {
  let processed = markdown;
  // Quote block: >> "quote text" (author)
  processed = processed.replace(/>> "([^"]+)" \(([^)]+)\)/g, (match, quote, author) => {
    // Escape HTML in quote and author to prevent injection
    const esc = (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<blockquote class="chat-quote"><p>${esc(quote)}</p><footer>— ${esc(author)}</footer></blockquote>`;
  });
  return processed;
};

const parseAndSanitize = (markdownText: string): string => {
    if (!markdownText) return '';
    if (window.marked && window.DOMPurify) {
        const preprocessed = preprocessCustomMarkdown(markdownText);
        const rawHtml = window.marked.parse(preprocessed, { breaks: true });
        return window.DOMPurify.sanitize(rawHtml);
    }
    return markdownText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export const MessageRenderer = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useLazyCodeEnhancer(containerRef, text);

  const { gShellPart, psiPart, hasDualOutput } = useMemo(() => {
    const dualOutputRegex = /\[G-Shell\]:(.*?)\[Ψ-4ndr0666\]:(.*)/s;
    const match = text.match(dualOutputRegex);
    
    if (match && match[1] !== undefined && match[2] !== undefined) {
      return {
        gShellPart: match[1].trim(),
        psiPart: match[2].trim(),
        hasDualOutput: true,
      };
    }
    return { gShellPart: '', psiPart: text, hasDualOutput: false };
  }, [text]);

  const gShellHtml = useMemo(() => parseAndSanitize(gShellPart), [gShellPart]);
  const psiHtml = useMemo(() => parseAndSanitize(psiPart), [psiPart]);
  
  if (hasDualOutput) {
    return (
      <div ref={containerRef}>
        {gShellHtml && (
          <div className="g-shell-output">
            <div 
              className="prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: gShellHtml }} 
            />
          </div>
        )}
        
        {gShellHtml && <div className="dual-output-divider" />}
        
        <div className="prose prose-invert max-w-none">
          <p className="psi-output-label !my-0">[Ψ-4ndr0666]:</p>
          <div dangerouslySetInnerHTML={{ __html: psiHtml }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="prose prose-invert max-w-none whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: psiHtml }}
    />
  );
};
