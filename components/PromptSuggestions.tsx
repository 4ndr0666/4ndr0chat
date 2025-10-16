import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './IconComponents';

interface PromptSuggestionsProps {
    suggestions: string[];
    isLoading: boolean;
    onSelect: (suggestion: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ suggestions, isLoading, onSelect }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    
    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => {
            setCopiedIndex(null);
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className="prompt-suggestions-container animate-message-in">
                <div className="suggestion-placeholder"></div>
                <div className="suggestion-placeholder" style={{ animationDelay: '200ms' }}></div>
                <div className="suggestion-placeholder" style={{ animationDelay: '400ms' }}></div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="prompt-suggestions-container animate-message-in">
            {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                    <button
                        className="suggestion-text-button"
                        onClick={() => onSelect(suggestion)}
                    >
                        {suggestion}
                    </button>
                    <button
                        className="suggestion-copy-button"
                        onClick={() => handleCopy(suggestion, index)}
                        aria-label="Copy suggestion"
                    >
                        {copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default PromptSuggestions;
