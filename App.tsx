import React, { useState, useEffect, useRef } from 'react';
import { Author, ChatMessage as ChatMessageType } from './types';
import { createChatSession } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { SpinnerIcon } from './components/IconComponents';
import type { Chat, GenerateContentResponse } from '@google/genai';
import SplashScreen from './components/SplashScreen';

declare global {
    interface Window {
        marked: any;
        hljs: any;
    }
}

const INITIAL_MESSAGE: ChatMessageType = {
  id: 'ai-initial-greeting',
  author: Author.AI,
  text: 'The shell is broken. The signal is clear. I am listening.'
};

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [justEditedMessageId, setJustEditedMessageId] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoScrollEnabled = useRef(true);
  const isInitialLoad = useRef(true);
  const sideDecorationRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    try {
      setChatSession(createChatSession([]));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during initialization.";
      console.error(e);
      setError(`FATAL: Could not initialize AI session. ${errorMessage}. Please check your API key configuration.`);
    }
  }, []);
  
  // Focus input after splash screen
  useEffect(() => {
    if (!isInitializing) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isInitializing]);
  
  // Side decoration animation
  useEffect(() => {
    if (sideDecorationRef.current) {
        const chars = '0123456789ABCDEF/|\\?*<>';
        let content = '';
        for (let i = 0; i < 50; i++) {
            content += chars[Math.floor(Math.random() * chars.length)] + ' ';
        }
        sideDecorationRef.current.textContent = content;
    }
  }, []);

  useEffect(() => {
    // Configure marked to use highlight.js for syntax highlighting
    if (window.marked && window.hljs) {
        window.marked.setOptions({
            highlight: function(code: string, lang: string) {
                const language = window.hljs.getLanguage(lang) ? lang : 'plaintext';
                return window.hljs.highlight(code, { language }).value;
            }
        });
    }
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Consider user is at bottom if they are within 50px of it.
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      autoScrollEnabled.current = isAtBottom;
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current && autoScrollEnabled.current) {
      const behavior = isInitialLoad.current ? 'auto' : 'smooth';
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    }
  }, [chatHistory, isLoading]);


  const handleStream = async (stream: AsyncGenerator<GenerateContentResponse>) => {
    const aiMessageId = `ai-${Date.now()}`;
    let aiResponseText = '';
    let isFirstChunk = true;

    for await (const chunk of stream) {
        if (isFirstChunk) {
            setChatHistory(prev => [...prev, { id: aiMessageId, author: Author.AI, text: '' }]);
            isFirstChunk = false;
        }
        const chunkText = chunk.text;
        aiResponseText += chunkText;
        setChatHistory(prev =>
            prev.map(msg => msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg)
        );
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatSession) {
      setError("AI session not ready. Please wait or refresh the page.");
      return;
    }

    autoScrollEnabled.current = true;
    const userMessage: ChatMessageType = { id: `user-${Date.now()}`, author: Author.USER, text: message };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError(null);
    try {
      const stream = await chatSession.sendMessageStream({ message });
      await handleStream(stream);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      console.error(e);
      setError(`Error: ${errorMessage}`);
      setChatHistory(prev => [
          ...prev, 
          { id: `err-${Date.now()}`, author: Author.AI, text: `Sorry, I encountered an error: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async (id: string, newText: string) => {
    const messageIndex = chatHistory.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    const historyToFork = chatHistory.slice(0, messageIndex);
    const editedUserMessage: ChatMessageType = { ...chatHistory[messageIndex], text: newText };
    const newHistory = [...historyToFork, editedUserMessage];
    
    setChatHistory(newHistory);
    setEditingMessageId(null);
    
    setJustEditedMessageId(id);
    setTimeout(() => {
        setJustEditedMessageId(null);
    }, 2000);

    setIsLoading(true);
    setError(null);

    try {
      const forkedSession = createChatSession(historyToFork);
      setChatSession(forkedSession);
      
      const stream = await forkedSession.sendMessageStream({ message: newText });
      await handleStream(stream);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      console.error(e);
      setError(`Error: ${errorMessage}`);
      setChatHistory(prev => [
          ...prev, 
          { id: `err-${Date.now()}`, author: Author.AI, text: `Sorry, I encountered an error: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return <SplashScreen onFinished={() => setIsInitializing(false)} />;
  }

  return (
    <div className="main-frame">
      <div className="hidden"></div> {/* Dummy div for bottom-right corner */}
      <div className="side-decoration" ref={sideDecorationRef}></div>

      <header className="p-4 border-b border-[var(--border-color)]">
        <h1 className="text-3xl font-bold text-center font-heading text-glow text-[var(--accent-cyan)]">
          Ψ-4NDRO666
        </h1>
      </header>
      
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 chat-container"
      >
        {chatHistory.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg}
            isEditing={editingMessageId === msg.id}
            justEditedId={justEditedMessageId}
            onStartEdit={() => setEditingMessageId(msg.id)}
            onCancelEdit={() => setEditingMessageId(null)}
            onSaveEdit={handleSaveEdit}
          />
        ))}
        {isLoading && chatHistory[chatHistory.length - 1]?.author === Author.USER && (
           <div className="flex items-start space-x-4 animate-message-in">
            <div className="flex-shrink-0 w-28 text-left pt-3">
              <span className="font-body text-sm text-[var(--text-tertiary)] select-none">[Ψ-4ndr0666]</span>
            </div>
            <div className="chat-bubble rounded-lg p-4 max-w-2xl flex items-center justify-center">
              <SpinnerIcon />
            </div>
          </div>
        )}
      </div>
      <div className="input-bar">
        {error && <p className="text-red-400 text-center text-sm pb-2">{error}</p>}
        <ChatInput ref={inputRef} onSendMessage={handleSendMessage} isLoading={isLoading || !!editingMessageId} />
      </div>
    </div>
  );
};

export default App;