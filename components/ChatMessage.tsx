import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Author, ChatMessage as ChatMessageType, DisplayPart } from '../types';
import { CopyIcon, CheckIcon, EditIcon, TrashIcon } from './IconComponents';
import AutoResizeTextarea from './AutoResizeTextarea';
import { MessageRenderer } from './MessageRenderer';

const getTextFromParts = (parts: DisplayPart[]): string => {
    return parts.filter(p => 'text' in p).map(p => (p as {text: string}).text).join('\n');
};

interface ChatMessageProps {
  message: ChatMessageType;
  isEditing: boolean;
  justEditedId: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  isLastMessage: boolean;
}

const COLLAPSE_THRESHOLD = 300; // in pixels

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isEditing, justEditedId, onStartEdit, onCancelEdit, onSaveEdit, onDelete, isLastMessage }) => {
  const messageTextContent = useMemo(() => getTextFromParts(message.parts), [message.parts]);
  const [editedText, setEditedText] = useState(messageTextContent);
  const isUser = message.author === Author.USER;
  
  const contentRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const currentRef = messageContainerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(currentRef);
            }
        },
        { rootMargin: '300px' } // Start loading when 300px away from viewport
    );
    observer.observe(currentRef);

    return () => {
        observer.unobserve(currentRef);
    };
  }, []);

  useLayoutEffect(() => {
    if (contentRef.current && isVisible) {
      setIsOverflowing(contentRef.current.scrollHeight > COLLAPSE_THRESHOLD);
    }
  }, [messageTextContent, isVisible]);

  const shouldCollapse = isOverflowing && !isLastMessage && !isManuallyExpanded && !isEditing;


  const animationClass = message.id !== 'ai-initial-greeting' ? 'animate-message-in' : '';
  
  useEffect(() => {
    if (isEditing) {
        setEditedText(messageTextContent);
    }
  }, [isEditing, messageTextContent]);

  const handleSave = () => {
    if (editedText.trim()) {
        onSaveEdit(message.id, editedText);
    }
  }

  const focusClasses = 'focus:border-[var(--accent-cyan)] focus:shadow-[0_0_8px_var(--accent-cyan)]';
  
  // For user messages, we need to extract the non-text parts to display them alongside the rendered markdown text
  const userMediaParts = isUser ? message.parts.filter(part => 'inlineData' in part) : [];

  return (
    <div ref={messageContainerRef} className={`flex items-start space-x-4 ${isUser ? 'justify-end' : ''} ${animationClass}`}>
       {!isUser && (
        <div className="flex-shrink-0 w-28 text-left pt-3">
            <span className="font-body text-sm text-[var(--text-tertiary)] select-none">[Ψ-4ndr0666]</span>
        </div>
      )}
      
      <div className="relative group max-w-2xl w-full">
         <MessageActions 
            isUser={isUser} 
            onStartEdit={onStartEdit} 
            messageText={messageTextContent}
            onDelete={() => onDelete(message.id)}
          />
        {isEditing && isUser ? (
            <div className="chat-bubble rounded-lg p-4 w-full space-y-3">
              <AutoResizeTextarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className={`w-full bg-input-edit border border-[var(--accent-cyan-mid)]/70 rounded-lg p-2 text-[var(--text-primary)] focus:outline-none resize-none transition-all duration-200 ${focusClasses}`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button onClick={onCancelEdit} className="action-button text-xs px-3 py-1">Cancel</button>
                <button onClick={handleSave} className="action-button text-xs px-3 py-1">Save & Transmit</button>
              </div>
            </div>
        ) : (
            <div className={`chat-bubble rounded-lg p-4 ${isUser && message.id === justEditedId ? 'just-edited-glow' : ''}`}>
              {isVisible ? (
                 <>
                   <div ref={contentRef} className={`message-collapsible ${shouldCollapse ? 'message-collapsed' : ''}`}>
                     {isUser && userMediaParts.length > 0 && (
                       <div className="space-y-3 mb-3">
                          {userMediaParts.map((part, index) => {
                             if ('inlineData' in part && part.inlineData) {
                               const fileName = 'fileName' in part.inlineData ? part.inlineData.fileName : 'Attached Image';
                               return (
                                   <div key={index} className="p-2 bg-black/20 rounded-lg">
                                       <img 
                                           src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                                           alt={fileName}
                                           className="max-w-xs max-h-64 rounded-md object-contain"
                                       />
                                        <p className="text-xs text-center text-text-tertiary mt-2">{fileName}</p>
                                   </div>
                               );
                             }
                             return null;
                          })}
                       </div>
                     )}
                     <MessageRenderer text={messageTextContent} />
                   </div>
                   {shouldCollapse && (
                      <div className="collapse-overlay">
                        <button className="show-more-button" onClick={() => setIsManuallyExpanded(true)}>
                          Show More
                        </button>
                      </div>
                    )}
                </>
              ) : (
                <div className="min-h-[80px]" /> // Placeholder for lazy loading
              )}
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
  onDelete: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ isUser, onStartEdit, messageText, onDelete }) => {
    const [hasCopied, setHasCopied] = useState(false);
    
    const handleCopy = () => {
        if (!messageText) return;
        navigator.clipboard.writeText(messageText).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    };

    const positionClass = isUser ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2';

    return (
        <div className={`absolute ${positionClass} top-1/2 -translate-y-1/2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            {isUser && ( <button onClick={onStartEdit} className="action-button" aria-label="Edit message"><EditIcon /></button> )}
            <button onClick={handleCopy} className="action-button" aria-label="Copy message">
                {hasCopied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <button onClick={onDelete} className="action-button danger" aria-label="Delete message">
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
    );
}

export default ChatMessage;