import { GoogleGenAI, Chat } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './systemInstruction';
import { Author, ChatMessage as ChatMessageType } from '../types';

let ai: GoogleGenAI | null = null;

const getAi = () => {
    if (!ai) {
        // This will throw if the API key is missing, and the error will be
        // caught in the component, allowing the UI to display a helpful message.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

const buildHistoryForApi = (history: ChatMessageType[]) => {
    // The chat history for the API should not include the initial AI greeting,
    // as that is part of the persona established by the system instruction.
    return history.filter(msg => msg.id !== 'ai-initial-greeting').map(msg => ({
        role: msg.author === Author.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
};

export function createChatSession(history: ChatMessageType[]): Chat {
    const gemini = getAi();
    return gemini.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: buildHistoryForApi(history),
    });
}
