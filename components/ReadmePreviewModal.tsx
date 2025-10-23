
import React, { useState, useMemo, useEffect } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon } from './IconComponents';

interface ReadmePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
}

const ReadmePreviewModal: React.FC<ReadmePreviewModalProps> = ({ isOpen, onClose, markdownContent }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const renderedHtml = useMemo(() => {
        if (isOpen && window.marked) {
            const raw = window.marked.parse(markdownContent, { breaks: true });
            if(window.DOMPurify) return window.DOMPurify.sanitize(raw);
            return raw;
        }
        return '';
    }, [isOpen, markdownContent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdownContent).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'README.md');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
      // Reset copy state when modal opens
      if (isOpen) {
        setHasCopied(false);
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-frame-in !max-w-3xl !w-[95%]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="modal-close-button" aria-label="Close modal">&times;</button>
                <h2 className="text-xl font-heading text-glow text-center mb-4">Generated README.md</h2>
                
                <div className="h-[60vh] overflow-y-auto chat-container p-4 mb-6 rounded-md border border-[var(--border-color)]">
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                </div>

                <div className="flex justify-end items-center gap-4">
                    <button onClick={handleCopy} className="action-button px-4 py-2 flex items-center gap-2">
                        {hasCopied ? <CheckIcon /> : <CopyIcon />} Copy Markdown
                    </button>
                    <button onClick={handleDownload} className="action-button px-4 py-2 flex items-center gap-2">
                        <DownloadIcon /> Download .md File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReadmePreviewModal;
