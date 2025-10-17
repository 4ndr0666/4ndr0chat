
import { GoogleGenAI, Chat, Type, Part, Content } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './systemInstruction';
import { Author, ChatMessage as ChatMessageType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const API_HISTORY_LIMIT = 20;

const buildHistoryForApi = (history: ChatMessageType[]): Content[] => {
    return history
        .filter(msg => msg.id !== 'ai-initial-greeting')
        .slice(-API_HISTORY_LIMIT)
        .map(msg => ({
            role: msg.author === Author.USER ? 'user' : 'model',
            // Filter out our custom `fileName` property before sending to the API
            parts: msg.parts.map(part => {
                // FIX: Add a type guard to ensure fileName exists before destructuring.
                if ('inlineData' in part && part.inlineData && 'fileName' in part.inlineData) {
                    const { fileName, ...apiPart } = part.inlineData;
                    return { inlineData: apiPart };
                }
                return part;
            })
        }));
};

export function createChatSession(history: ChatMessageType[]): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-pro',
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
        
        const historyString = recentHistory.map(h => {
            const author = h.author === Author.USER ? 'Operator' : 'Ψ-4ndr0666';
            const textContent = h.parts
                .map(p => {
                    if ('text' in p) return p.text;
                    // FIX: Add a type guard to check for fileName and provide a fallback.
                    if ('inlineData' in p && p.inlineData) {
                        if ('fileName' in p.inlineData) {
                            return `[Attachment: ${p.inlineData.fileName}]`;
                        }
                        return `[Attachment: ${p.inlineData.mimeType}]`;
                    }
                    return '';
                })
                .join(' ');
            return `${author}: ${textContent}`;
        }).join('\n');

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
