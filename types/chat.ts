// types/chat.ts

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ReferencedFileInfo {
  path: string;
  name: string;
  lines: number;
  size: number;
  isDirectory?: boolean;
}

export interface Message {
  role: MessageRole;
  content: string;
  displayContent?: string;
  answerClosing?: string;
  images?: string[];
  referencedFiles?: ReferencedFileInfo[];
  timestamp?: number;
}

export type AttachedFile = {
  id: string;
  name: string;
  kind: 'text' | 'image';
  content: string;
};

export type AgentMode = 'general' | 'coding';

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  conflictingVersions?: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  isCodingSpecialized?: boolean;
  isEmbedding?: boolean;
}

export interface TopicMetadata {
  id: string;
  name: string;
  mode: AgentMode;
  createdAt: number;
  updatedAt: number;
}
