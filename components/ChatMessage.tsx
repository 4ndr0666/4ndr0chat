import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Author, ChatMessage as ChatMessageType } from '../types';
import { CopyIcon, CheckIcon, EditIcon } from './IconComponents';
import AutoResizeTextarea from './AutoResizeTextarea';

interface ChatMessageProps {
  message: ChatMessageType;
  isEditing: boolean;
  justEditedId: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, newText: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isEditing, justEditedId, onStartEdit, onCancelEdit, onSaveEdit }) => {
  const [editedText, setEditedText] = useState(message.text);
  const isUser = message.author === Author.USER;
  const aiMessageRef = useRef<HTMLDivElement>(null);

  const shouldAnimate = message.id !== 'ai-initial-greeting';
  const animationClass = shouldAnimate ? 'animate-message-in' : '';

  useEffect(() => {
    if (isEditing) {
        setEditedText(message.text);
    }
  }, [isEditing, message.text]);

  const renderedMarkdown = useMemo(() => {
    if (window.marked) {
        try {
            return window.marked.parse(message.text);
        } catch (error) {
            console.error("Markdown parsing error:", error);
            return message.text;
        }
    }
    return message.text;
  }, [message.text]);

  useEffect(() => {
    if (message.author === Author.AI && aiMessageRef.current) {
      const codeBlocks = aiMessageRef.current.querySelectorAll('pre');
  
      codeBlocks.forEach(preEl => {
        if (!preEl.querySelector('.code-language-tag')) {
            const codeEl = preEl.querySelector('code');
            const langClass = Array.from(codeEl?.classList || []).find(cls => typeof cls === 'string' && cls.startsWith('language-'));
            
            if (typeof langClass === 'string') {
                const lang = langClass.replace('language-', '');
                if (lang && lang.toLowerCase() !== 'plaintext') {
                    const langTag = document.createElement('span');
                    langTag.className = 'code-language-tag';
                    langTag.innerText = lang;
                    preEl.appendChild(langTag);
                }
            }
        }

        if (!preEl.querySelector('.copy-code-button')) {
            const button = document.createElement('button');
            button.className = 'copy-code-button';
            button.ariaLabel = 'Copy code to clipboard';
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
            
            button.addEventListener('click', () => {
              const codeEl = preEl.querySelector('code');
              if (codeEl) {
                navigator.clipboard.writeText(codeEl.innerText);
                button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
                setTimeout(() => {
                  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
                }, 2000);
              }
            });
            preEl.appendChild(button);
        }
      });
    }
  }, [renderedMarkdown, message.author]);

  const handleSave = () => {
    if (editedText.trim()) {
        onSaveEdit(message.id, editedText);
    }
  }

  const focusClasses = 'focus:border-[var(--accent-cyan)] focus:shadow-[0_0_8px_var(--accent-cyan)]';
  
  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'justify-end' : ''} ${animationClass}`}>
       {!isUser && (
        <div className="flex-shrink-0 w-28 text-left pt-3">
            <span className="font-body text-sm text-[var(--text-tertiary)] select-none">[Ψ-4ndr0666]</span>
        </div>
      )}
      
      <div className="relative group max-w-2xl w-full">
         <MessageActions 
            isUser={isUser} 
            onStartEdit={onStartEdit} 
            messageText={message.text}
          />
        {isEditing && isUser ? (
            <div className="chat-bubble rounded-lg p-4 w-full space-y-3">
              <AutoResizeTextarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className={`w-full bg-input-edit border border-[var(--accent-cyan-mid)]/70 rounded-lg p-2 text-[var(--text-primary)] focus:outline-none resize-none transition-all duration-200 ${focusClasses}`}
              />
              <div className="flex justify-end space-x-2">
                <button onClick={onCancelEdit} className="action-button text-xs px-3 py-1">Cancel</button>
                <button onClick={handleSave} className="action-button text-xs px-3 py-1">Save</button>
              </div>
            </div>
        ) : (
            <div className={`chat-bubble rounded-lg p-4 ${isUser && message.id === justEditedId ? 'just-edited-glow' : ''}`}>
               <div 
                  ref={aiMessageRef}
                  className="text-[var(--text-primary)] prose prose-invert max-w-none prose-p:my-2 prose-headings:my-4 prose-ul:my-2 prose-ol:my-2" 
                  dangerouslySetInnerHTML={{ __html: renderedMarkdown }} 
               />
            </div>
        )}
      </div>

       {isUser && (
        <div className="flex-shrink-0 w-28 text-right pt-3">
            <span className="font-body text-sm text-[var(--text-tertiary)] select-none">[User]</span>
        </div>
      )}
    </div>
  );
};

interface MessageActionsProps {
  isUser: boolean;
  onStartEdit: () => void;
  messageText: string;
}

const MessageActions: React.FC<MessageActionsProps> = ({ isUser, onStartEdit, messageText }) => {
    const [hasCopied, setHasCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(messageText).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    };

    const positionClass = isUser ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2';

    return (
        <div className={`absolute ${positionClass} top-1/2 -translate-y-1/2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            {isUser && (
                <button 
                  onClick={onStartEdit} 
                  className="action-button"
                  aria-label="Edit message"
                >
                    <EditIcon />
                </button>
            )}
            <button 
              onClick={handleCopy} 
              className="action-button"
              aria-label="Copy message"
            >
                {hasCopied ? <CheckIcon /> : <CopyIcon />}
            </button>
        </div>
    );
}


export default ChatMessage;