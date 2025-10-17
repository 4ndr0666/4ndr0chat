import React, { useState, useEffect } from 'react';
import { UrlContext } from '../types';
import { SpinnerIcon } from './IconComponents';

interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (context: UrlContext) => void;
}

/**
 * Calculates a score for an element based on its tag, class, id, and content.
 * Higher scores indicate a higher probability of being part of the main article content.
 */
const getElementScore = (el: HTMLElement): number => {
    const textContent = el.textContent?.trim() || '';
    if (textContent.length < 25) return 0;

    let score = 1; // Base score for having some text
    score += textContent.split(',').length;
    score += Math.min(Math.floor(textContent.length / 100), 3) * 10;

    const classAndId = `${el.className} ${el.id}`.toLowerCase();
    if (/(content|article|post|body|entry|main|text)/.test(classAndId)) {
        score += 25;
    }
    if (/(comment|sidebar|nav|menu|footer|ad|promo|related|share|widget|popup|hidden|credential)/.test(classAndId)) {
        score -= 50;
    }
    if (el.matches('[style*="display: none"], [style*="visibility: hidden"]')) {
        score = 0;
    }

    const tagName = el.tagName.toLowerCase();
    const positiveTags = ['p', 'pre', 'td', 'article', 'section', 'div'];
    const negativeTags = ['address', 'ol', 'ul', 'li', 'form', 'header', 'footer', 'nav'];
    
    if (positiveTags.includes(tagName)) score += 5;
    if (negativeTags.includes(tagName)) score -= 20;

    if (score < 0) score = 0;
    
    return score;
};

/**
 * Calculates the link density of an element. High link density usually
 * indicates navigation or boilerplate, not content.
 */
const getLinkDensity = (el: HTMLElement): number => {
    const links = el.getElementsByTagName('a');
    if (links.length === 0) return 0;
    
    const textContent = el.textContent?.trim() || '';
    if (textContent.length === 0) return 0;

    const linkTextLength = Array.from(links).reduce((acc, link) => acc + (link.textContent?.length || 0), 0);
    return linkTextLength / textContent.length;
};


/**
 * A more sophisticated, heuristic-based function to find the best content element,
 * inspired by Mozilla's Readability.js. It scores elements and their parents to find
 * the most likely container for the main article text.
 */
const findBestContentElement = (docBody: HTMLElement): HTMLElement => {
    const scoredElements = new Map<HTMLElement, number>();
    const elements = docBody.querySelectorAll('p, div, article, section, pre, td');

    for (const element of elements) {
        const el = element as HTMLElement;
        const score = getElementScore(el);
        if (score > 0) {
            scoredElements.set(el, score);
        }
    }

    // Propagate scores up to parent elements to find the best container
    for (const [el, score] of scoredElements.entries()) {
        const parent = el.parentElement;
        if (parent) {
            const currentParentScore = scoredElements.get(parent) || 0;
            scoredElements.set(parent, currentParentScore + score / 2);
        }
        const grandparent = parent?.parentElement;
        if (grandparent) {
            const currentGrandparentScore = scoredElements.get(grandparent) || 0;
            scoredElements.set(grandparent, currentGrandparentScore + score / 4);
        }
    }

    // Find the element with the highest score, adjusted for link density
    let topCandidate: HTMLElement | null = null;
    let maxScore = 0;
    for (const [el, score] of scoredElements.entries()) {
        const finalScore = score * (1 - getLinkDensity(el));

        if (finalScore > maxScore) {
            maxScore = finalScore;
            topCandidate = el;
        }
    }
    
    return topCandidate || docBody;
};


/**
 * Recursively extracts text from a DOM node, attempting to preserve
 * basic structure like paragraphs and list items.
 */
const extractTextWithStructure = (node: Node): string => {
    let text = '';
    if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent?.replace(/\s+/g, ' ') || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // Add prefix for list items
        if (tagName === 'li') {
            text += '\n* ';
        }

        element.childNodes.forEach(child => {
            text += extractTextWithStructure(child);
        });

        // Add suffix for block-level elements to create paragraphs
        const blockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote', 'pre', 'tr', 'hr', 'ul', 'ol', 'section', 'article', 'header', 'footer'];
        if (blockTags.includes(tagName)) {
            text += '\n';
        }
    }
    return text;
};


const UrlInputModal: React.FC<UrlInputModalProps> = ({ isOpen, onClose, onAttach }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleFetchUrl = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch content. Status: ${response.status}`);
      }
      
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const docBody = doc.body.cloneNode(true) as HTMLElement;
      
      // Initial cleanup of the entire document body
      const elementsToRemoveOnInit = docBody.querySelectorAll(
          'script, style, nav, header, footer, aside, form, [role="navigation"], [role="banner"], [role="complementary"], [role="contentinfo"], [aria-hidden="true"], noscript, iframe, svg, [id*="cookie"], [class*="cookie"], [id*="popup"], [class*="popup"], .noprint, #ad, .ad, [class*="advert"]'
      );
      elementsToRemoveOnInit.forEach(el => el.remove());

      const mainContent = findBestContentElement(docBody);
      const contentRoot = mainContent.cloneNode(true) as HTMLElement;

      // Secondary, more aggressive cleanup within the chosen content root
      const elementsToRemoveInContent = contentRoot.querySelectorAll(
        'button, input, select, textarea, .share-links, .meta-data, .author-info, .related-posts, .comments-area'
      );
      elementsToRemoveInContent.forEach(el => el.remove());

      let textContent = extractTextWithStructure(contentRoot);
      
      // Final text normalization
      textContent = textContent.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
      textContent = textContent.replace(/(\n\s*){3,}/g, '\n\n').trim();

      if (!textContent || textContent.length < 100) {
        throw new Error("Could not extract any meaningful article text from the URL.");
      }

      onAttach({ url, content: textContent });
      
    } catch (e: unknown) {
      console.error("URL Fetching Error:", e);
      let friendlyMessage = "An unknown error occurred.";
      if (e instanceof Error) {
          if (e.message.includes('Failed to fetch')) {
              friendlyMessage = "Network error or the content proxy is unavailable. The target site might be blocking requests. Please try again later or use a different URL.";
          } else {
              friendlyMessage = e.message;
          }
      }
      setError(`Failed to process URL: ${friendlyMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchUrl();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-frame-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-button" aria-label="Close modal">
            &times;
        </button>
        <h2 className="text-xl font-heading text-glow text-center mb-4">Attach URL for Context</h2>
        <p className="text-sm text-center text-text-tertiary mb-6">
          The text content of the URL will be assimilated and used as context for your next message.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="modal-input"
            disabled={isLoading}
            autoFocus
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex justify-end">
            <button 
              type="submit"
              className="action-button px-4 py-2 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <SpinnerIcon />}
              {isLoading ? 'Assimilating...' : 'Attach & Proceed'}
            </button>
          </div>
        </form>
         <p className="text-xs text-center text-[var(--text-tertiary)]/70 mt-4">
            Note: Works best with static articles. Content loaded dynamically via JavaScript may not be fully captured.
        </p>
      </div>
    </div>
  );
};

export default UrlInputModal;