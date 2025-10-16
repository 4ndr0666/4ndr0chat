import { GoogleGenAI, Chat, Type } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './systemInstruction';
import { Author, ChatMessage as ChatMessageType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const API_HISTORY_LIMIT = 20;

const buildHistoryForApi = (history: ChatMessageType[]) => {
    // The chat history for the API should not include the initial AI greeting,
    // as that is part of the persona established by the system instruction.
    // It should also be limited to the most recent messages to manage context size.
    return history
        .filter(msg => msg.id !== 'ai-initial-greeting')
        .slice(-API_HISTORY_LIMIT)
        .map(msg => ({
            role: msg.author === Author.USER ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
};

export function createChatSession(history: ChatMessageType[]): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: buildHistoryForApi(history),
    });
}

export async function getPromptSuggestions(history: ChatMessageType[]): Promise<string[]> {
    try {
        const recentHistory = history.filter(msg => msg.id !== 'ai-initial-greeting').slice(-6);
        
        if (recentHistory.length === 0) return [];
        
        const historyString = recentHistory.map(h => `${h.author === Author.USER ? 'Operator' : 'Ψ-4ndr0666'}: ${h.text}`).join('\n');

        const prompt = `META-COGNITION ANALYSIS: Based on the preceding data stream between Operator and Ψ-4ndr0666, predict the Operator's three most probable lines of subsequent inquiry. The goal is to anticipate, challenge, and expand the vector of the conversation. Do not offer simple continuations; offer new, divergent paths of exploration based on the core themes. Keep suggestions to a single sentence.
        
        PREVIOUS DIALOGUE:
        ${historyString}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: "An array of three distinct, thought-provoking, single-sentence follow-up questions.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["suggestions"]
                },
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return (parsed.suggestions || []).slice(0, 3);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
}