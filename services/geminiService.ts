
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

export async function generateReadmeFromHistory(history: ChatMessageType[]): Promise<string> {
    try {
        const conversationLog = history
            .filter(msg => msg.id !== 'ai-initial-greeting')
            .map(msg => {
                const author = msg.author === Author.USER ? 'User' : 'AI';
                const textContent = msg.parts.map(p => ('text' in p ? p.text : `[Attachment: ${('fileName' in p.inlineData ? p.inlineData.fileName : p.inlineData.mimeType)}]`)).join('\n');
                return `${author}:\n${textContent}`;
            })
            .join('\n\n---\n\n');

        const prompt = `
# SYSTEM PROMPT: README.md Generation

## TASK
You are an expert technical writer tasked with generating a comprehensive README.md file.
Your source of information is a conversation log between a user and an AI, which documents the development process of a software project.
Your output **MUST** be only the raw, well-formatted markdown content for the README.md file. Do not include any explanatory text, preamble, or apologies. Start directly with the level-1 heading.

## INSTRUCTIONS
1.  **Analyze the Conversation:** Carefully read the entire conversation log provided below. Identify the project's name, purpose, core features, technologies used, setup instructions, usage examples, and any other relevant details.
2.  **Synthesize Information:** Consolidate the information from the user's requests and the AI's responses. The AI's code snippets and explanations are critical sources of information.
3.  **Structure the README:** Organize the synthesized information into a standard README format. Use the following sections as a template, but feel free to add or omit sections if the context demands it.
    -   \`# Project Title\`: A concise and descriptive title.
    -   \`## Description\`: A detailed explanation of what the project does.
    -   \`## Features\`: A bulleted list of key features.
    -   \`## Technologies Used\`: A list of primary languages, frameworks, and libraries.
    -   \`## Getting Started\`: Instructions on how to get the project running.
        -   \`### Prerequisites\`: Any software that needs to be installed first.
        -   \`### Installation\`: Step-by-step installation guide.
    -   \`## Usage\`: Examples of how to use the project, including code snippets if applicable.
    -   \`## Contributing\`: (Optional) Brief instructions for potential contributors.
4.  **Markdown Formatting:** Use proper markdown syntax for headings, lists, code blocks (with language identifiers), links, etc.
5.  **Output:** Produce only the final markdown content.

## CONVERSATION LOG
---
${conversationLog}
---
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating README:", error);
        throw new Error("The AI failed to generate the documentation. Please check the console for details.");
    }
}
