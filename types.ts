

import { Part } from "@google/genai";

export enum Author {
  USER = 'user',
  AI = 'ai',
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_TEXT_TYPES = ['text/plain', 'text/markdown', 'text/html', 'text/css', 'text/javascript', 'application/json', 'application/xml'];

export type DisplayPart = Part | { inlineData: { mimeType: string; data: string; fileName: string; } };

export interface ChatMessage {
  id: string;
  author: Author;
  parts: DisplayPart[];
}

export type ImageAttachment = {
  type: 'image';
  file: File;
  mimeType: string;
  base64: string;
};

export type TextAttachment = {
  type: 'text';
  file: File;
  mimeType: string;
  content: string;
};

export type UrlAttachment = {
  type: 'url';
  url: string;
  content: string;
};

export type Attachment = ImageAttachment | TextAttachment | UrlAttachment;