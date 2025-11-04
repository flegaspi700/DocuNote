/**
 * Tests for storage.ts - localStorage utilities
 * Testing all CRUD operations and edge cases
 */

import {
  saveMessages,
  loadMessages,
  clearMessages,
  saveSources,
  loadSources,
  clearSources,
  saveAITheme,
  loadAITheme,
  clearAITheme,
  saveConversation,
  loadConversations,
  loadConversation,
  deleteConversation,
  createConversation,
  setCurrentConversationId,
  getCurrentConversationId,
  updateConversationTitle,
  clearConversations,
  clearAllData,
  getStorageInfo,
  togglePinConversation,
} from '@/lib/storage';
import type { Message, FileInfo, AITheme, Conversation } from '@/lib/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('storage.ts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  // ============================================
  // Messages Tests
  // ============================================
  describe('Messages Persistence', () => {
    const mockMessages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'ai', content: 'Hi there!' },
    ];

    it('should save messages to localStorage', () => {
      const result = saveMessages(mockMessages);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notechat-messages',
        JSON.stringify(mockMessages)
      );
    });

    it('should load messages from localStorage', () => {
      saveMessages(mockMessages);
      const loaded = loadMessages();
      expect(loaded).toEqual(mockMessages);
    });

    it('should return empty array when no messages exist', () => {
      const loaded = loadMessages();
      expect(loaded).toEqual([]);
    });

    it('should clear messages from localStorage', () => {
      saveMessages(mockMessages);
      const result = clearMessages();
      expect(result).toBe(true);
      expect(loadMessages()).toEqual([]);
    });
  });

  // ============================================
  // Sources Tests
  // ============================================
  describe('Sources Persistence', () => {
    const mockSources: FileInfo[] = [
      {
        name: 'test.txt',
        type: 'file',
        source: 'test.txt',
        content: 'Test content',
      },
    ];

    it('should save sources to localStorage', () => {
      const result = saveSources(mockSources);
      expect(result).toBe(true);
    });

    it('should load sources from localStorage', () => {
      saveSources(mockSources);
      const loaded = loadSources();
      expect(loaded).toEqual(mockSources);
    });

    it('should return empty array when no sources exist', () => {
      const loaded = loadSources();
      expect(loaded).toEqual([]);
    });

    it('should clear sources from localStorage', () => {
      saveSources(mockSources);
      const result = clearSources();
      expect(result).toBe(true);
      expect(loadSources()).toEqual([]);
    });
  });

  // ============================================
  // AI Theme Tests
  // ============================================
  describe('AI Theme Persistence', () => {
    const mockTheme: AITheme = {
      id: 'theme-ocean',
      name: 'Ocean',
      palette: {
        primary: '#0066cc',
        primaryForeground: '#ffffff',
        secondary: '#33ccff',
        accent: '#00ff99',
        background: '#001a33',
        foreground: '#ffffff',
        card: '#002244',
        border: '#004488',
      },
      backgroundImageUrl: 'data:image/png;base64,verylongbase64string',
    };

    it('should save AI theme without backgroundImageUrl', () => {
      const result = saveAITheme(mockTheme);
      expect(result).toBe(true);

      const saved = JSON.parse(localStorageMock.getItem('notechat-ai-theme')!);
      expect(saved.backgroundImageUrl).toBeUndefined();
      expect(saved.name).toBe('Ocean');
      expect(saved.palette).toEqual(mockTheme.palette);
    });

    it('should load AI theme from localStorage', () => {
      saveAITheme(mockTheme);
      const loaded = loadAITheme();
      expect(loaded).toBeTruthy();
      expect(loaded!.name).toBe('Ocean');
      expect(loaded!.backgroundImageUrl).toBeUndefined();
    });

    it('should return null when no theme exists', () => {
      const loaded = loadAITheme();
      expect(loaded).toBeNull();
    });

    it('should clear AI theme from localStorage', () => {
      saveAITheme(mockTheme);
      const result = clearAITheme();
      expect(result).toBe(true);
      expect(loadAITheme()).toBeNull();
    });
  });

  // ============================================
  // Conversation Tests
  // ============================================
  describe('Conversation Management', () => {
    const mockMessages: Message[] = [
      { id: '1', role: 'user', content: 'What is TypeScript?' },
      { id: '2', role: 'ai', content: 'TypeScript is a typed superset of JavaScript.' },
    ];

    const mockSources: FileInfo[] = [
      {
        name: 'docs.txt',
        type: 'file',
        source: 'docs.txt',
        content: 'Documentation',
      },
    ];

    const mockTheme: AITheme = {
      id: 'theme-test',
      name: 'Test Theme',
      palette: {
        primary: '#000',
        primaryForeground: '#fff',
        secondary: '#111',
        accent: '#222',
        background: '#333',
        foreground: '#fff',
        card: '#444',
        border: '#555',
      },
    };

    describe('createConversation', () => {
      it('should create a conversation with auto-generated title', () => {
        const conv = createConversation(mockMessages, mockSources);
        
        expect(conv.id).toMatch(/^conv_\d+_[a-z0-9]+$/);
        expect(conv.title).toBe('What is TypeScript?');
        expect(conv.messages).toEqual(mockMessages);
        expect(conv.sources).toEqual(mockSources);
        expect(conv.createdAt).toBeLessThanOrEqual(Date.now());
        expect(conv.updatedAt).toBeLessThanOrEqual(Date.now());
      });

      it('should create conversation with custom title', () => {
        const conv = createConversation(mockMessages, mockSources, undefined, 'My Custom Title');
        expect(conv.title).toBe('My Custom Title');
      });

      it('should create conversation with truncated title for long messages', () => {
        const longMessages: Message[] = [
          {
            id: '1',
            role: 'user',
            content: 'This is a very long message that should be truncated because it exceeds the 50 character limit for conversation titles',
          },
        ];
        
        const conv = createConversation(longMessages, []);
        expect(conv.title).toBe('This is a very long message that should be truncat...');
        expect(conv.title.length).toBe(53); // 50 chars + '...'
      });

      it('should create conversation with "New Conversation" when no messages', () => {
        const conv = createConversation([], []);
        expect(conv.title).toBe('New Conversation');
      });

      it('should create conversation with "New Conversation" when only AI messages', () => {
        const aiOnlyMessages: Message[] = [
          { id: '1', role: 'ai', content: 'Hello!' },
        ];
        
        const conv = createConversation(aiOnlyMessages, []);
        expect(conv.title).toBe('New Conversation');
      });

      it('should strip backgroundImageUrl from aiTheme', () => {
        const themeWithImage: AITheme = {
          ...mockTheme,
          backgroundImageUrl: 'data:image/png;base64,largebase64',
        };
        
        const conv = createConversation(mockMessages, mockSources, themeWithImage);
        expect(conv.aiTheme).toBeDefined();
        expect(conv.aiTheme!.backgroundImageUrl).toBeUndefined();
        expect(conv.aiTheme!.name).toBe('Test Theme');
      });
    });

    describe('saveConversation', () => {
      it('should save a new conversation', () => {
        const conv = createConversation(mockMessages, mockSources);
        const result = saveConversation(conv);
        
        expect(result).toBe(true);
        const loaded = loadConversations();
        expect(loaded).toHaveLength(1);
        expect(loaded[0].id).toBe(conv.id);
      });

      it('should update existing conversation with new timestamp by default', () => {
        const conv = createConversation(mockMessages, mockSources);
        saveConversation(conv);
        
        const originalTimestamp = conv.updatedAt;
        
        // Wait a bit to ensure timestamp changes
        jest.spyOn(Date, 'now').mockReturnValue(originalTimestamp + 1000);
        
        const updatedConv = { ...conv, messages: [...mockMessages, { id: '3', role: 'user' as const, content: 'New message' }] };
        saveConversation(updatedConv);
        
        const loaded = loadConversations();
        expect(loaded[0].updatedAt).toBe(originalTimestamp + 1000);
        
        jest.restoreAllMocks();
      });

      it('should update existing conversation without changing timestamp when updateTimestamp=false', () => {
        const conv = createConversation(mockMessages, mockSources);
        saveConversation(conv);
        
        const originalTimestamp = conv.updatedAt;
        
        const updatedConv = { ...conv, title: 'Updated Title' };
        saveConversation(updatedConv, false); // Don't update timestamp
        
        const loaded = loadConversations();
        expect(loaded[0].updatedAt).toBe(originalTimestamp);
        expect(loaded[0].title).toBe('Updated Title');
      });
    });

    describe('loadConversations', () => {
      it('should load conversations sorted by updatedAt (newest first)', () => {
        const conv1 = createConversation(mockMessages, [], undefined, 'First');
        const conv2 = createConversation(mockMessages, [], undefined, 'Second');
        const conv3 = createConversation(mockMessages, [], undefined, 'Third');
        
        // Save with different timestamps
        conv1.updatedAt = 1000;
        conv2.updatedAt = 3000;
        conv3.updatedAt = 2000;
        
        saveConversation(conv1);
        saveConversation(conv2);
        saveConversation(conv3);
        
        const loaded = loadConversations();
        expect(loaded).toHaveLength(3);
        expect(loaded[0].title).toBe('Second'); // 3000
        expect(loaded[1].title).toBe('Third');  // 2000
        expect(loaded[2].title).toBe('First');  // 1000
      });

      it('should return empty array when no conversations exist', () => {
        const loaded = loadConversations();
        expect(loaded).toEqual([]);
      });

      it('should normalize conversations without isPinned field', () => {
        const conv = createConversation(mockMessages, []);
        delete (conv as Partial<Conversation>).isPinned;
        
        saveConversation(conv);
        const loaded = loadConversations();
        
        expect(loaded[0].isPinned).toBe(false);
      });

      it('should sort pinned conversations before unpinned', () => {
        const conv1 = createConversation(mockMessages, [], undefined, 'Unpinned 1');
        const conv2 = createConversation(mockMessages, [], undefined, 'Pinned 1');
        const conv3 = createConversation(mockMessages, [], undefined, 'Pinned 2');
        const conv4 = createConversation(mockMessages, [], undefined, 'Unpinned 2');
        
        conv1.isPinned = false;
        conv1.updatedAt = 4000;
        
        conv2.isPinned = true;
        conv2.updatedAt = 2000;
        
        conv3.isPinned = true;
        conv3.updatedAt = 3000;
        
        conv4.isPinned = false;
        conv4.updatedAt = 1000;
        
        saveConversation(conv1);
        saveConversation(conv2);
        saveConversation(conv3);
        saveConversation(conv4);
        
        const loaded = loadConversations();
        
        // Should be: Pinned 2 (3000), Pinned 1 (2000), Unpinned 1 (4000), Unpinned 2 (1000)
        expect(loaded[0].title).toBe('Pinned 2');
        expect(loaded[1].title).toBe('Pinned 1');
        expect(loaded[2].title).toBe('Unpinned 1');
        expect(loaded[3].title).toBe('Unpinned 2');
      });
    });

    describe('togglePinConversation', () => {
      it('should toggle pin status from false to true', () => {
        const conv = createConversation(mockMessages, []);
        conv.isPinned = false;
        saveConversation(conv);
        
        const result = togglePinConversation(conv.id);
        expect(result).toBe(true);
        
        const loaded = loadConversations();
        expect(loaded[0].isPinned).toBe(true);
      });

      it('should toggle pin status from true to false', () => {
        const conv = createConversation(mockMessages, []);
        conv.isPinned = true;
        saveConversation(conv);
        
        togglePinConversation(conv.id);
        
        const loaded = loadConversations();
        expect(loaded[0].isPinned).toBe(false);
      });

      it('should return false for non-existent conversation', () => {
        const result = togglePinConversation('non-existent-id');
        expect(result).toBe(false);
      });
    });

    describe('loadConversation', () => {
      it('should load specific conversation by ID', () => {
        const conv = createConversation(mockMessages, mockSources, undefined, 'Test Conv');
        saveConversation(conv);
        
        const loaded = loadConversation(conv.id);
        expect(loaded).toBeTruthy();
        expect(loaded!.id).toBe(conv.id);
        expect(loaded!.title).toBe('Test Conv');
      });

      it('should return null for non-existent conversation', () => {
        const loaded = loadConversation('non-existent-id');
        expect(loaded).toBeNull();
      });
    });

    describe('deleteConversation', () => {
      it('should delete conversation by ID', () => {
        const conv1 = createConversation(mockMessages, [], undefined, 'Conv 1');
        const conv2 = createConversation(mockMessages, [], undefined, 'Conv 2');
        
        saveConversation(conv1);
        saveConversation(conv2);
        
        const result = deleteConversation(conv1.id);
        expect(result).toBe(true);
        
        const loaded = loadConversations();
        expect(loaded).toHaveLength(1);
        expect(loaded[0].id).toBe(conv2.id);
      });

      it('should return true even when conversation does not exist', () => {
        const result = deleteConversation('non-existent-id');
        expect(result).toBe(true);
      });
    });

    describe('updateConversationTitle', () => {
      it('should update conversation title and timestamp', () => {
        const conv = createConversation(mockMessages, [], undefined, 'Old Title');
        saveConversation(conv);
        
        const originalTimestamp = conv.updatedAt;
        jest.spyOn(Date, 'now').mockReturnValue(originalTimestamp + 5000);
        
        const result = updateConversationTitle(conv.id, 'New Title');
        expect(result).toBe(true);
        
        const loaded = loadConversations();
        expect(loaded[0].title).toBe('New Title');
        expect(loaded[0].updatedAt).toBe(originalTimestamp + 5000);
        
        jest.restoreAllMocks();
      });

      it('should return false for non-existent conversation', () => {
        const result = updateConversationTitle('non-existent-id', 'New Title');
        expect(result).toBe(false);
      });
    });

    describe('clearConversations', () => {
      it('should clear all conversations and current conversation ID', () => {
        const conv = createConversation(mockMessages, []);
        saveConversation(conv);
        setCurrentConversationId(conv.id);
        
        const result = clearConversations();
        expect(result).toBe(true);
        
        expect(loadConversations()).toEqual([]);
        expect(getCurrentConversationId()).toBeNull();
      });
    });
  });

  // ============================================
  // Current Conversation ID Tests
  // ============================================
  describe('Current Conversation ID', () => {
    it('should set current conversation ID', () => {
      const result = setCurrentConversationId('conv_123');
      expect(result).toBe(true);
      expect(getCurrentConversationId()).toBe('conv_123');
    });

    it('should clear current conversation ID when set to null', () => {
      setCurrentConversationId('conv_123');
      const result = setCurrentConversationId(null);
      
      expect(result).toBe(true);
      expect(getCurrentConversationId()).toBeNull();
    });

    it('should return null when no current conversation ID exists', () => {
      const id = getCurrentConversationId();
      expect(id).toBeNull();
    });
  });

  // ============================================
  // Bulk Operations Tests
  // ============================================
  describe('Bulk Operations', () => {
    beforeEach(() => {
      // Set up some data
      saveMessages([{ id: '1', role: 'user', content: 'Test' }]);
      saveSources([{ name: 'test.txt', type: 'file', source: 'test.txt', content: 'Test' }]);
      saveAITheme({ 
        id: 'theme-test',
        name: 'Test', 
        palette: { 
          primary: '#000', 
          primaryForeground: '#fff',
          secondary: '#111', 
          accent: '#222', 
          background: '#333', 
          foreground: '#fff',
          card: '#444',
          border: '#555',
        } 
      });
      saveConversation(createConversation([], []));
    });

    describe('clearAllData', () => {
      it('should clear all data from localStorage', () => {
        const result = clearAllData();
        expect(result).toBe(true);
        
        expect(loadMessages()).toEqual([]);
        expect(loadSources()).toEqual([]);
        expect(loadAITheme()).toBeNull();
        expect(loadConversations()).toEqual([]);
      });
    });

    describe('getStorageInfo', () => {
      it('should return storage usage information', () => {
        const info = getStorageInfo();
        
        expect(info.available).toBe(true);
        expect(info.usage).toBeGreaterThan(0);
        expect(info.total).toBe(5 * 1024 * 1024); // 5MB
        expect(info.usagePercent).toBeGreaterThan(0);
        expect(info.usageFormatted).toMatch(/\d+(\.\d+)? (Bytes|KB|MB)/);
        expect(info.totalFormatted).toBe('5 MB');
      });

      it('should format bytes correctly', () => {
        // Save some data
        const largeMessages = Array(100).fill(null).map((_, i) => ({
          id: `${i}`,
          role: 'user' as const,
          content: 'A'.repeat(1000), // 1KB per message
        }));
        
        saveMessages(largeMessages);
        
        const info = getStorageInfo();
        expect(info.usageFormatted).toMatch(/KB/);
      });
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully on setItem', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force localStorage to throw
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      
      const result = saveMessages([{ id: '1', role: 'user', content: 'Test' }]);
      
      expect(result).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully on getItem', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force localStorage to throw
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      
      const result = loadMessages();
      
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid JSON in localStorage', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Set invalid JSON
      localStorageMock.setItem('notechat-messages', 'invalid json{');
      
      const result = loadMessages();
      
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully on removeItem', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force localStorage to throw
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      
      const result = clearMessages();
      
      expect(result).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });
  });
});
