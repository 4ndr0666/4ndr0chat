import { Part } from "@google/genai";

export enum Author {
  USER = 'user',
  AI = 'ai',
}

// Re-exporting the Part type from the SDK for consistency, 
// but we'll add our own fileName for UI purposes.
export type DisplayPart = Part | { inlineData: { mimeType: string; data: string; fileName: string; } };

export interface ChatMessage {
  id: string;
  author: Author;
  parts: DisplayPart[];
}

export interface UrlContext {
  url: string;
  content: string;
}

export interface FileContext {
  file: File;
  base64: string;
  mimeType: string;
}