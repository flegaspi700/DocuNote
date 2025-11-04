/**
 * localStorage utilities for persisting application state
 * Handles messages, sources, AI themes, and conversations with error handling
 */

import type { Message, FileInfo, AITheme, Conversation } from './types';

const STORAGE_KEYS = {
  MESSAGES: 'notechat-messages',
  SOURCES: 'notechat-sources',
  AI_THEME: 'notechat-ai-theme',
  CONVERSATIONS: 'notechat-conversations',
  CURRENT_CONVERSATION_ID: 'notechat-current-conversation-id',
} as const;

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get item from localStorage with JSON parsing
 */
function getItem<T>(key: string): T | null {
  if (!isStorageAvailable()) return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Safely set item to localStorage with JSON stringification
 */
function setItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
function removeItem(key: string): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

// ============================================
// Messages Persistence
// ============================================

export function saveMessages(messages: Message[]): boolean {
  return setItem(STORAGE_KEYS.MESSAGES, messages);
}

export function loadMessages(): Message[] {
  return getItem<Message[]>(STORAGE_KEYS.MESSAGES) || [];
}

export function clearMessages(): boolean {
  return removeItem(STORAGE_KEYS.MESSAGES);
}

// ============================================
// Sources Persistence
// ============================================

export function saveSources(sources: FileInfo[]): boolean {
  return setItem(STORAGE_KEYS.SOURCES, sources);
}

export function loadSources(): FileInfo[] {
  return getItem<FileInfo[]>(STORAGE_KEYS.SOURCES) || [];
}

export function clearSources(): boolean {
  return removeItem(STORAGE_KEYS.SOURCES);
}

// ============================================
// AI Theme Persistence
// ============================================

export function saveAITheme(theme: AITheme): boolean {
  // Strip out backgroundImageUrl to prevent localStorage quota exceeded errors
  // Base64 images are too large (100-200KB) for localStorage (5-10MB total limit)
  const sanitizedTheme = {
    ...theme,
    backgroundImageUrl: undefined,
  };
  return setItem(STORAGE_KEYS.AI_THEME, sanitizedTheme);
}

export function loadAITheme(): AITheme | null {
  return getItem<AITheme>(STORAGE_KEYS.AI_THEME);
}

export function clearAITheme(): boolean {
  return removeItem(STORAGE_KEYS.AI_THEME);
}

// ============================================
// Bulk Operations
// ============================================

/**
 * Clear all NoteChat data from localStorage
 */
export function clearAllData(): boolean {
  return (
    clearMessages() &&
    clearSources() &&
    clearAITheme() &&
    clearConversations()
  );
}

/**
 * Get storage usage information
 */
export function getStorageInfo() {
  if (!isStorageAvailable()) {
    return { available: false, usage: 0, total: 0 };
  }
  
  try {
    const messages = localStorage.getItem(STORAGE_KEYS.MESSAGES) || '';
    const sources = localStorage.getItem(STORAGE_KEYS.SOURCES) || '';
    const theme = localStorage.getItem(STORAGE_KEYS.AI_THEME) || '';
    
    const usage = new Blob([messages, sources, theme]).size;
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    
    return {
      available: true,
      usage,
      total,
      usagePercent: (usage / total) * 100,
      usageFormatted: formatBytes(usage),
      totalFormatted: formatBytes(total),
    };
  } catch {
    return { available: false, usage: 0, total: 0 };
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// Conversation History
// ============================================

/**
 * Generate a title from the first message
 */
function generateConversationTitle(messages: Message[]): string {
  if (messages.length === 0) return 'New Conversation';
  
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Conversation';
  
  // Take first 50 characters of the first user message
  const title = firstUserMessage.content.slice(0, 50);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
}

/**
 * Save a conversation
 * @param conversation - The conversation to save
 * @param updateTimestamp - Whether to update the updatedAt timestamp (default: true)
 *                          Set to false when loading from history to prevent reordering
 */
export function saveConversation(conversation: Conversation, updateTimestamp: boolean = true): boolean {
  const conversations = loadConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);
  
  if (existingIndex >= 0) {
    // Update existing conversation
    conversations[existingIndex] = {
      ...conversation,
      updatedAt: updateTimestamp ? Date.now() : conversation.updatedAt,
    };
  } else {
    // Add new conversation
    conversations.push(conversation);
  }
  
  return setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
}

/**
 * Load all conversations with proper sorting:
 * 1. Pinned conversations first (sorted by updatedAt descending)
 * 2. Unpinned conversations (sorted by updatedAt descending)
 */
export function loadConversations(): Conversation[] {
  const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
  
  // Normalize conversations: ensure all have isPinned field
  const normalized = conversations.map(c => ({
    ...c,
    isPinned: c.isPinned ?? false,
  }));
  
  // Separate pinned and unpinned
  const pinned = normalized.filter(c => c.isPinned).sort((a, b) => b.updatedAt - a.updatedAt);
  const unpinned = normalized.filter(c => !c.isPinned).sort((a, b) => b.updatedAt - a.updatedAt);
  
  // Return pinned first, then unpinned
  return [...pinned, ...unpinned];
}

/**
 * Toggle pin status of a conversation
 * @param id - Conversation ID to toggle
 * @returns true if successful, false if conversation not found
 */
export function togglePinConversation(id: string): boolean {
  const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
  const conversation = conversations.find(c => c.id === id);
  
  if (!conversation) return false;
  
  conversation.isPinned = !conversation.isPinned;
  
  return setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
}

/**
 * Load a specific conversation by ID
 */
export function loadConversation(id: string): Conversation | null {
  const conversations = loadConversations();
  return conversations.find(c => c.id === id) || null;
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  const conversations = loadConversations();
  const filtered = conversations.filter(c => c.id !== id);
  return setItem(STORAGE_KEYS.CONVERSATIONS, filtered);
}

/**
 * Create a new conversation from current state
 */
export function createConversation(
  messages: Message[],
  sources: FileInfo[],
  aiTheme?: AITheme,
  title?: string
): Conversation {
  // Strip out backgroundImageUrl from aiTheme to prevent localStorage quota issues
  // Base64 images can be 100-200KB each and quickly fill up localStorage (5-10MB limit)
  const sanitizedTheme = aiTheme ? {
    ...aiTheme,
    backgroundImageUrl: undefined, // Remove large base64 images
  } : undefined;
  
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: title || generateConversationTitle(messages),
    messages,
    sources,
    aiTheme: sanitizedTheme,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Set the current conversation ID
 */
export function setCurrentConversationId(id: string | null): boolean {
  if (id === null) {
    return removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
  }
  return setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
}

/**
 * Get the current conversation ID
 */
export function getCurrentConversationId(): string | null {
  return getItem<string>(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
}

/**
 * Update conversation title
 */
export function updateConversationTitle(id: string, title: string): boolean {
  const conversations = loadConversations();
  const conversation = conversations.find(c => c.id === id);
  
  if (!conversation) return false;
  
  conversation.title = title;
  conversation.updatedAt = Date.now();
  
  return setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
}

/**
 * Clear all conversations
 */
export function clearConversations(): boolean {
  return removeItem(STORAGE_KEYS.CONVERSATIONS) && removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
}
