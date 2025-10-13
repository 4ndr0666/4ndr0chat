export enum Author {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  author: Author;
  text: string;
}