import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { PlusIcon, LinkIcon, PaperclipIcon, AutoScrollOnIcon, AutoScrollOffIcon, SuggestionsOnIcon, SuggestionsOffIcon, ReadmeIcon } from './IconComponents';
import { ALLOWED_IMAGE_TYPES, ALLOWED_TEXT_TYPES, Attachment } from '../types';

const acceptedFileTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_TEXT_TYPES].join(',');

interface InputToolbarProps {
  onOpenUrlModal: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateReadme: () => void;
  isLoading: boolean;
  isReadmeGenerating: boolean;
  attachments: Attachment[];
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  isSuggestionsEnabled: boolean;
  onToggleSuggestions: () => void;
  inputLength: number;
  maxLength: number;
  isVisible: boolean;
}

const InputToolbar = forwardRef<HTMLDivElement, InputToolbarProps>(({
  onOpenUrlModal, onFileChange, onGenerateReadme, isLoading, isReadmeGenerating, attachments,
  isAutoScrollEnabled, onToggleAutoScroll, isSuggestionsEnabled, onToggleSuggestions,
  inputLength, maxLength, isVisible
}, ref) => {
    const [isAttachPopoverOpen, setIsAttachPopoverOpen] = useState(false);
    const [isPopoverRendered, setIsPopoverRendered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachButtonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const isOverLimit = inputLength > maxLength;
    const hasNonTextAttachment = attachments.some(a => a.type !== 'text');

    const handleToggleAttachPopover = () => {
        setIsAttachPopoverOpen(prev => !prev);
    };

    useEffect(() => {
        if (isAttachPopoverOpen) {
            setIsPopoverRendered(true);
        } else {
            const timer = setTimeout(() => setIsPopoverRendered(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isAttachPopoverOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
              popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
              attachButtonRef.current && !attachButtonRef.current.contains(event.target as Node)
            ) {
                setIsAttachPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAttachFileClick = () => {
        fileInputRef.current?.click();
        setIsAttachPopoverOpen(false);
    };

    const handleAttachUrlClick = () => {
        onOpenUrlModal();
        setIsAttachPopoverOpen(false);
    }
  
    return (
      <div ref={ref} className={`input-toolbar ${isVisible ? 'is-visible' : ''}`}>
          <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept={acceptedFileTypes} multiple />
          <div className="relative">
              <button ref={attachButtonRef} type="button" onClick={handleToggleAttachPopover} className={`action-button ${isAttachPopoverOpen ? 'active' : ''}`} aria-label="Attach file or URL">
                  <PlusIcon />
              </button>
              {isPopoverRendered && (
                  <div ref={popoverRef} className={`attach-popover ${isAttachPopoverOpen ? 'animate-attach-popover-in' : 'animate-attach-popover-out'}`}>
                      <button onClick={handleAttachUrlClick} className="attach-popover-button" disabled={hasNonTextAttachment}>
                          <LinkIcon className="w-4 h-4" /> Attach URL
                      </button>
                      <button onClick={handleAttachFileClick} className="attach-popover-button" disabled={hasNonTextAttachment}>
                          <PaperclipIcon className="w-4 h-4" /> Attach File
                      </button>
                  </div>
              )}
          </div>
          <button type="button" onClick={onToggleAutoScroll} className={`action-button ${!isAutoScrollEnabled ? 'active' : ''}`} aria-label={isAutoScrollEnabled ? "Disable auto-scroll" : "Enable auto-scroll"}>
              {isAutoScrollEnabled ? <AutoScrollOnIcon /> : <AutoScrollOffIcon />}
          </button>
          <button type="button" onClick={onToggleSuggestions} className={`action-button ${!isSuggestionsEnabled ? 'active' : ''}`} aria-label={isSuggestionsEnabled ? "Disable suggestions" : "Enable suggestions"}>
              {isSuggestionsEnabled ? <SuggestionsOnIcon /> : <SuggestionsOffIcon />}
          </button>
           <button type="button" onClick={onGenerateReadme} className="action-button" aria-label="Generate README" disabled={isLoading || isReadmeGenerating}>
              <ReadmeIcon />
          </button>
          <div className="toolbar-divider"></div>
          <div className={`toolbar-char-count ${isOverLimit ? 'text-error' : ''}`}>{inputLength} / {maxLength}</div>
      </div>
    );
});

export default InputToolbar;