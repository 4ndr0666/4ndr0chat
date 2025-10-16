import React, { forwardRef, useState } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { SendIcon, ClearIcon, LinkIcon, AutoScrollOnIcon, AutoScrollOffIcon } from './IconComponents';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  maxLength: number;
  onOpenUrlModal: () => void;
  hasAttachedUrl: boolean;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ input, setInput, onSendMessage, isLoading, maxLength, onOpenUrlModal, hasAttachedUrl, isAutoScrollEnabled, onToggleAutoScroll }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const isOverLimit = input.length > maxLength;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if ((input.trim() || hasAttachedUrl) && !isLoading && !isOverLimit) {
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

    return (
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
        <div className={`chat-input-container ${isFocused ? 'is-focused' : ''} ${isOverLimit ? '!border-red-500' : ''}`}>
            <button 
              type="button" 
              onClick={onOpenUrlModal} 
              className={`url-attach-button ${hasAttachedUrl ? 'active' : ''}`}
              aria-label="Attach URL"
            >
              <LinkIcon />
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
                maxLength={maxLength + 512} // Allow some overflow before browser cuts off
              />
              {!input && (
                <div className="input-glyph-placeholder-container">
                  <span className="input-caret-glyph">█</span>
                </div>
              )}
              {input && (
                 <button type="button" onClick={handleClearInput} className="clear-input-button" aria-label="Clear input">
                    <ClearIcon />
                  </button>
              )}
            </div>

            <div className={`char-count-container ${isOverLimit ? 'text-error' : ''}`}>
                {input.length} / {maxLength}
            </div>

            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !hasAttachedUrl) || isOverLimit}
              className="send-button group flex items-center justify-center flex-shrink-0"
              aria-label="Send message"
            >
              <SendIcon />
            </button>

            <button
              type="button"
              onClick={onToggleAutoScroll}
              className={`autoscroll-toggle-button ${!isAutoScrollEnabled ? 'is-locked' : ''}`}
              aria-label={isAutoScrollEnabled ? "Disable auto-scroll" : "Enable auto-scroll"}
              title={isAutoScrollEnabled ? "Auto-scroll is ON" : "Auto-scroll is OFF"}
            >
              {isAutoScrollEnabled ? <AutoScrollOnIcon /> : <AutoScrollOffIcon />}
            </button>
        </div>
        {isOverLimit && (
            <p className="text-error text-xs text-right absolute -bottom-5 right-0">
                Character limit exceeded. Transmission blocked.
            </p>
        )}
      </form>
    );
  }
);

export default ChatInput;