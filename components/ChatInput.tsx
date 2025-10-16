import React, { forwardRef, useState } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { SendIcon, ScrollUpIcon, ScrollDownIcon, InputGlyphIcon, ClearIcon, LinkIcon } from './IconComponents';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  maxLength: number;
  onOpenUrlModal: () => void;
  hasAttachedUrl: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ input, setInput, onSendMessage, isLoading, maxLength, onOpenUrlModal, hasAttachedUrl }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if ((input.trim() || hasAttachedUrl) && !isLoading) {
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

    const isOverLimit = input.length > maxLength;

    return (
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
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
                  <div className="h-[1.5rem] flex items-center">
                    <InputGlyphIcon className="h-5" />
                  </div>
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

            <div className="decorative-scrollbar flex-shrink-0">
              <ScrollUpIcon />
              <div className="w-1.5 h-1.5 bg-scrollbar-dot rounded-full"></div>
              <ScrollDownIcon />
            </div>
        </div>
      </form>
    );
  }
);

export default ChatInput;