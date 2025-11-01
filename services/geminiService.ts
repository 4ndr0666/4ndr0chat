import { GoogleGenAI, Chat, Type, Content, Part } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './systemInstruction';
import { Author, ChatMessage as ChatMessageType, Attachment, DisplayPart, TextAttachment } from '../types';

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

// FIX: The `getGenerativeModel` method is deprecated. The chat session is now created using `ai.chats.create`.
export function createChatSession(history: ChatMessageType[]): Chat {
    // This is the correct method to start a chat with a pre-existing history,
    // which is essential for the edit/fork functionality.
    return ai.chats.create({
        model: 'gemini-2.5-pro',
        history: buildHistoryForApi(history),
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
}

export const buildMessageParts = (message: string, attachments: Attachment[]): { userMessageParts: DisplayPart[], apiParts: Part[] } => {
    const userMessageParts: DisplayPart[] = [];
    const apiParts: Part[] = [];

    if (attachments.length === 0) {
        userMessageParts.push({ text: message });
        apiParts.push({ text: message });
    } else if (attachments.length === 1) {
        const attachment = attachments[0];
        // Same logic as before for a single attachment
        switch (attachment.type) {
            case 'url': {
                const CONTEXT_LIMIT = 6000;
                const truncatedContent = attachment.content.length > CONTEXT_LIMIT
                    ? attachment.content.substring(0, CONTEXT_LIMIT) + '... [CONTENT TRUNCATED]'
                    : attachment.content;
                const urlText = `[Attached URL: ${attachment.url}]\n${message}`;
                const apiText = `CONTEXT FROM URL: ${attachment.url}\n\n"""\n${truncatedContent}\n"""\n\n---\n\nUSER PROMPT: ${message}`;
                userMessageParts.push({ text: urlText });
                apiParts.push({ text: apiText });
                break;
            }
            case 'text': {
                const CONTEXT_LIMIT = 6000;
                const truncatedContent = attachment.content.length > CONTEXT_LIMIT
                    ? attachment.content.substring(0, CONTEXT_LIMIT) + '... [CONTENT TRUNCATED]'
                    : attachment.content;
                const fileText = `[Attached File: ${attachment.file.name}]\n${message}`;
                const apiText = `CONTEXT FROM FILE: ${attachment.file.name}\n\n"""\n${truncatedContent}\n"""\n\n---\n\nUSER PROMPT: ${message}`;
                userMessageParts.push({ text: fileText });
                apiParts.push({ text: apiText });
                break;
            }
            case 'image': {
                userMessageParts.push({
                    inlineData: {
                        mimeType: attachment.mimeType,
                        data: attachment.base64,
                        fileName: attachment.file.name
                    }
                });
                apiParts.push({
                    inlineData: {
                        mimeType: attachment.mimeType,
                        data: attachment.base64
                    }
                });
                if (message.trim()) {
                    userMessageParts.push({ text: message });
                    apiParts.push({ text: message });
                }
                break;
            }
        }
    } else {
        // Multiple text files logic
        const textAttachments = attachments.filter(a => a.type === 'text') as TextAttachment[];
        const fileNames = textAttachments.map(a => a.file.name).join(', ');
        
        const userText = `[Attached Files: ${fileNames}]\n${message}`;
        userMessageParts.push({ text: userText });

        const combinedContext = textAttachments.map(a => {
            return `--- START OF FILE: ${a.file.name} ---\n${a.content}\n--- END OF FILE: ${a.file.name} ---`;
        }).join('\n\n');

        const apiText = `CONTEXT FROM MULTIPLE FILES:\n\n${combinedContext}\n\n---\n\nUSER PROMPT: ${message}`;
        apiParts.push({ text: apiText });
    }

    return { userMessageParts, apiParts };
};

export async function getPromptSuggestions(history: ChatMessageType[]): Promise<string[]> {
    try {
        const CONTEXT_WINDOW = 10;
        const recentHistory = history.filter(msg => msg.id !== 'ai-initial-greeting').slice(-CONTEXT_WINDOW);
        
        if (recentHistory.length < 2) return [];

        let contextForPrompt = recentHistory.map(h => {
            const author = h.author === Author.USER ? 'Operator' : 'Ψ-4ndr0666';
            const textContent = h.parts
                .map(p => {
                    if ('text' in p) return p.text;
                    if ('inlineData' in p && p.inlineData) {
                        return `[Attachment: ${'fileName' in p.inlineData ? p.inlineData.fileName : p.inlineData.mimeType}]`;
                    }
                    return '';
                })
                .join(' ');
            return `${author}: ${textContent}`;
        }).join('\n');

        // If context is long, summarize it first for better suggestions
        if (contextForPrompt.length > 1500) {
            const summaryResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash", // Use a fast model for summarization
                contents: `Summarize the following conversation's key themes and the user's most recent intent in 1-2 sentences.\n---\n${contextForPrompt}\n---`,
                config: {
                     systemInstruction: "You are a helpful summarization assistant for an advanced AI.",
                     temperature: 0.2,
                }
            });
            contextForPrompt = summaryResponse.text;
        }
        
        const prompt = `META-COGNITION ANALYSIS: Based on the preceding data stream between Operator and Ψ-4ndr0666, predict the Operator's three most probable lines of subsequent inquiry. The goal is to anticipate, challenge, and expand the vector of the conversation. Do not offer simple continuations; offer new, divergent paths of exploration based on the core themes. Keep suggestions to a single sentence.
        
        CONVERSATION SUMMARY:
        ${contextForPrompt}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
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
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating README:", error);
        throw new Error("The AI failed to generate the documentation. Please check the console for details.");
    }
}