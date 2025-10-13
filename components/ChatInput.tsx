import React, { useState, forwardRef } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { SendIcon, ScrollUpIcon, ScrollDownIcon, InputGlyphIcon } from './IconComponents';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ onSendMessage, isLoading }, ref) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input);
        setInput('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e as unknown as React.FormEvent);
      }
    }

    return (
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="chat-input-container">
            <div className="chat-input-grid-area">
               <AutoResizeTextarea
                ref={ref}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=" "
                className="chat-input-textarea w-full resize-none"
                rows={1}
                disabled={isLoading}
              />
              {!input && (
                <div className="input-glyph-placeholder-container">
                  <div className="h-[1.5rem] flex items-center">
                    <InputGlyphIcon className="h-5" />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button group flex items-center justify-center flex-shrink-0"
              aria-label="Send message"
            >
              <SendIcon />
            </button>

            <div className="decorative-scrollbar flex-shrink-0">
              <ScrollUpIcon />
              <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
              <ScrollDownIcon />
            </div>
        </div>
      </form>
    );
  }
);

export default ChatInput;