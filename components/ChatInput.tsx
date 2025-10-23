

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { SendIcon, ClearIcon, LinkIcon, PaperclipIcon, AutoScrollOnIcon, AutoScrollOffIcon, SuggestionsOnIcon, SuggestionsOffIcon, PlusIcon, ReadmeIcon, SpinnerIcon } from './IconComponents';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  maxLength: number;
  onOpenUrlModal: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  urlAttached: boolean;
  filesAttached: boolean;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  isSuggestionsEnabled: boolean;
  onToggleSuggestions: () => void;
  onOpenReadmeConfirm: () => void;
  isGeneratingReadme: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ 
    input, setInput, onSendMessage, isLoading, maxLength, onOpenUrlModal, onFileChange, urlAttached, filesAttached,
    isAutoScrollEnabled, onToggleAutoScroll, isSuggestionsEnabled, onToggleSuggestions, onOpenReadmeConfirm, isGeneratingReadme
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isAttachOpen, setIsAttachOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachRef = useRef<HTMLDivElement>(null);

    const isOverLimit = input.length > maxLength;
    const hasAttachment = urlAttached || filesAttached;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachRef.current && !attachRef.current.contains(event.target as Node)) {
                setIsAttachOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if ((input.trim() || hasAttachment) && !isLoading && !isOverLimit) {
        onSendMessage(input);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e as unknown as React.FormEvent);
      }
    }
    
    const handleClearInput = () => {
      setInput('');
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }

    const handleAttachFileClick = () => {
        fileInputRef.current?.click();
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className={`input-panel-content ${isFocused ? 'is-focused' : ''}`}>
            <div className="input-toolbar">
                <div className="relative" ref={attachRef}>
                    <button type="button" onClick={() => setIsAttachOpen(p => !p)} className={`action-button ${isAttachOpen ? 'active' : ''}`} aria-label="Attach context" title="Attach context">
                        <PlusIcon />
                    </button>
                    {isAttachOpen && (
                        <div className="attach-popover">
                            <button type="button" onClick={() => { onOpenUrlModal(); setIsAttachOpen(false); }} className="attach-popover-button" disabled={isLoading || filesAttached}>
                                <LinkIcon /> Attach URL
                            </button>
                            <button type="button" onClick={() => { handleAttachFileClick(); setIsAttachOpen(false); }} className="attach-popover-button" disabled={isLoading || urlAttached}>
                                <PaperclipIcon /> Attach Image
                            </button>
                        </div>
                    )}
                </div>

                <div className="toolbar-divider"></div>
                
                <button type="button" onClick={onToggleAutoScroll} className="action-button" title={isAutoScrollEnabled ? "Auto-Scroll On" : "Auto-Scroll Off"}>
                    {isAutoScrollEnabled ? <AutoScrollOnIcon /> : <AutoScrollOffIcon />}
                </button>
                <button type="button" onClick={onToggleSuggestions} className={`action-button ${isSuggestionsEnabled ? 'active' : ''}`} title={isSuggestionsEnabled ? "Suggestions On" : "Suggestions Off"}>
                    {isSuggestionsEnabled ? <SuggestionsOnIcon /> : <SuggestionsOffIcon />}
                </button>
                <button 
                    type="button" 
                    onClick={onOpenReadmeConfirm} 
                    className="action-button" 
                    title="Generate README.md from history"
                    disabled={isLoading || isGeneratingReadme}
                >
                    {isGeneratingReadme ? <SpinnerIcon /> : <ReadmeIcon />}
                </button>
                
                <div className="toolbar-divider"></div>

                <div className={`char-count-container ${isOverLimit ? 'text-error char-count-over-limit' : ''}`}>{input.length} / {maxLength}</div>
            </div>

            <div className={`chat-input-container ${isOverLimit ? '!border-red-500' : ''}`}>
                <div className="chat-input-grid-area">
                   <AutoResizeTextarea
                    ref={ref}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder=" "
                    className="chat-input-textarea w-full resize-none"
                    rows={1}
                    disabled={isLoading}
                    maxLength={maxLength + 512}
                  />
                  {!input && (<div className="input-glyph-placeholder-container"><span className="input-caret-glyph">█</span></div>)}
                  {input && (<button type="button" onClick={handleClearInput} className="clear-input-button" aria-label="Clear input"><ClearIcon /></button>)}
                </div>
                <button type="submit" disabled={isLoading || (!input.trim() && !hasAttachment) || isOverLimit} className="action-button" aria-label="Send message">
                  <SendIcon />
                </button>
            </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" multiple />
        {isOverLimit && (<p className="text-error text-xs text-right absolute -bottom-5 right-0">Character limit exceeded. Transmission blocked.</p>)}
      </form>
    );
  }
);

export default ChatInput;