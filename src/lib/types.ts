export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  editedAt?: number; // Timestamp of last edit
  originalContent?: string; // Original content before edits
};

export type FileInfo = {
  name: string;
  content: string;
  type: 'file' | 'url';
  source: string;
  summary?: string; // AI-generated summary of the content
};

export type AITheme = {
  id: string;
  name: string;
  palette?: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    card: string;
    border: string;
  };
  backgroundImageUrl?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  sources: FileInfo[];
  aiTheme?: AITheme;
  createdAt: number;
  updatedAt: number;
  tags?: string[]; // Array of tag names
  isPinned?: boolean; // Whether the conversation is pinned to the top
};

export type TagMetadata = {
  name: string;
  color: string; // Hex color for visual distinction
  count: number; // Number of conversations with this tag
  createdAt: number;
  lastUsed: number;
};
