import React, { forwardRef, useState, useMemo, useRef } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { SendIcon, ClearIcon } from './IconComponents';
import InputToolbar from './InputToolbar';
import { Attachment } from '../types';
import AttachmentPreview from './AttachmentPreview';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  maxLength: number;
  onOpenUrlModal: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateReadme: () => void;
  isReadmeGenerating: boolean;
  attachments: Attachment[];
  onClearAttachments: () => void;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  isSuggestionsEnabled: boolean;
  onToggleSuggestions: () => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (props, ref) => {
    const { 
      input, setInput, onSendMessage, isLoading, maxLength, 
      attachments, onClearAttachments, ...toolbarProps 
    } = props;
    
    const [isFocused, setIsFocused] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const isOverLimit = input.length > maxLength;
    const hasAttachment = attachments.length > 0;

    const handleFocus = () => setIsFocused(true);

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      // If the new focus target is inside the toolbar, do not hide it.
      if (toolbarRef.current?.contains(e.relatedTarget as Node)) {
        return;
      }
      setIsFocused(false);
    };

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
    
    const renderedMarkdownPreview = useMemo(() => {
      if (window.marked && input.trim()) {
          try {
              const rawHtml = window.marked.parse(input, { breaks: true });
              if (window.DOMPurify) {
                  return window.DOMPurify.sanitize(rawHtml);
              }
              return rawHtml;
          } catch (error) {
              console.error("Markdown parsing error:", error);
              return `<p class="text-error">Error parsing Markdown.</p>`;
          }
      }
      return null;
    }, [input]);

    return (
      <div className="max-w-4xl mx-auto relative">
        {renderedMarkdownPreview && (
          <div className="markdown-preview-container chat-bubble">
              <div className="prose prose-invert max-w-none prose-p:my-2" dangerouslySetInnerHTML={{ __html: renderedMarkdownPreview }} />
          </div>
        )}
        <AttachmentPreview attachments={attachments} onClearAttachments={onClearAttachments} />
        <InputToolbar 
          ref={toolbarRef}
          {...toolbarProps}
          isVisible={isFocused}
          isLoading={isLoading}
          attachments={attachments}
          inputLength={input.length}
          maxLength={maxLength}
        />
        <form onSubmit={handleSubmit} className="relative">
          <div className={`flex items-end gap-2 chat-input-container ${isFocused ? 'is-focused' : ''} ${isOverLimit ? '!border-red-500' : ''}`}>
              <div className="chat-input-grid-area">
                 <AutoResizeTextarea
                  ref={ref}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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
          {isOverLimit && (<p className="text-error text-xs text-right absolute -bottom-5 right-0">Character limit exceeded. Transmission blocked.</p>)}
        </form>
      </div>
    );
  }
);

export default ChatInput;