import React, { forwardRef, useState, useRef, useEffect } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { SendIcon, ClearIcon, LinkIcon, PaperclipIcon, AutoScrollOnIcon, AutoScrollOffIcon, SuggestionsOnIcon, SuggestionsOffIcon, SettingsIcon } from './IconComponents';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  maxLength: number;
  onOpenUrlModal: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasAttachment: boolean;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  isSuggestionsEnabled: boolean;
  onToggleSuggestions: () => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ 
    input, setInput, onSendMessage, isLoading, maxLength, onOpenUrlModal, onFileChange,
    hasAttachment, isAutoScrollEnabled, onToggleAutoScroll, isSuggestionsEnabled, onToggleSuggestions 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);
    const isOverLimit = input.length > maxLength;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
                setIsToolsOpen(false);
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
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
        <div className={`flex items-center gap-2 chat-input-container ${isFocused ? 'is-focused' : ''} ${isOverLimit ? '!border-red-500' : ''}`}>
            <div className="relative" ref={toolsRef}>
                <button type="button" onClick={() => setIsToolsOpen(prev => !prev)} className={`action-button ${isToolsOpen ? 'active' : ''}`} aria-label="Open settings menu" title="Settings">
                    <SettingsIcon />
                </button>
                {isToolsOpen && (
                    <div className="tools-popover">
                        <div className="tools-popover-item">
                            <span className="item-label">Auto-Scroll</span>
                            <button type="button" onClick={onToggleAutoScroll} className={`action-button ${!isAutoScrollEnabled ? 'active' : ''}`} aria-label={isAutoScrollEnabled ? "Disable auto-scroll" : "Enable auto-scroll"}>
                                {isAutoScrollEnabled ? <AutoScrollOnIcon /> : <AutoScrollOffIcon />}
                            </button>
                        </div>
                        <div className="tools-popover-item">
                            <span className="item-label">Suggestions</span>
                            <button type="button" onClick={onToggleSuggestions} className={`action-button ${!isSuggestionsEnabled ? 'active' : ''}`} aria-label={isSuggestionsEnabled ? "Disable suggestions" : "Enable suggestions"}>
                                {isSuggestionsEnabled ? <SuggestionsOnIcon /> : <SuggestionsOffIcon />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
            <button type="button" onClick={onOpenUrlModal} className="action-button" aria-label="Attach URL" disabled={hasAttachment}>
              <LinkIcon />
            </button>
            <button type="button" onClick={handleAttachFileClick} className="action-button" aria-label="Attach file" disabled={hasAttachment}>
              <PaperclipIcon />
            </button>
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
            <div className={`char-count-container ${isOverLimit ? 'text-error' : ''}`}>{input.length} / {maxLength}</div>
            <button type="submit" disabled={isLoading || (!input.trim() && !hasAttachment) || isOverLimit} className="action-button" aria-label="Send message">
              <SendIcon />
            </button>
        </div>
        {isOverLimit && (<p className="text-error text-xs text-right absolute -bottom-5 right-0">Character limit exceeded. Transmission blocked.</p>)}
      </form>
    );
  }
);

export default ChatInput;