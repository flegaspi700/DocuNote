/**
 * Tests for conversation sorting and pinning functionality
 * Following TDD approach - these tests should fail initially
 */

import {
  saveConversation,
  loadConversations,
  togglePinConversation,
} from '@/lib/storage';
import type { Conversation } from '@/lib/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Conversation Sorting and Pinning', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Sorting Stability', () => {
    it('should not change conversation order when loading from history', () => {
      // Create 3 conversations with different timestamps
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'First Conv',
        messages: [{ id: '1', role: 'user', content: 'First' }],
        sources: [],
        createdAt: Date.now() - 3000,
        updatedAt: Date.now() - 3000,
      };

      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Second Conv',
        messages: [{ id: '2', role: 'user', content: 'Second' }],
        sources: [],
        createdAt: Date.now() - 2000,
        updatedAt: Date.now() - 2000,
      };

      const conv3: Conversation = {
        id: 'conv-3',
        title: 'Third Conv',
        messages: [{ id: '3', role: 'user', content: 'Third' }],
        sources: [],
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
      };

      // Save conversations
      saveConversation(conv1);
      saveConversation(conv2);
      saveConversation(conv3);

      // Get initial order (newest first)
      const initialOrder = loadConversations();
      expect(initialOrder[0].id).toBe('conv-3');
      expect(initialOrder[1].id).toBe('conv-2');
      expect(initialOrder[2].id).toBe('conv-1');

      // Load conv-1 from history (simulating user clicking on it)
      // This should NOT update the timestamp or change order
      const loaded = initialOrder[2];
      saveConversation(loaded, false); // false = don't update timestamp

      // Order should remain the same
      const afterLoadOrder = loadConversations();
      expect(afterLoadOrder[0].id).toBe('conv-3');
      expect(afterLoadOrder[1].id).toBe('conv-2');
      expect(afterLoadOrder[2].id).toBe('conv-1');
    });

    it('should update conversation order only when content changes', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'First',
        messages: [{ id: '1', role: 'user', content: 'Hello' }],
        sources: [],
        createdAt: Date.now() - 2000,
        updatedAt: Date.now() - 2000,
      };

      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Second',
        messages: [{ id: '2', role: 'user', content: 'Hi' }],
        sources: [],
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
      };

      saveConversation(conv1);
      saveConversation(conv2);

      // Initial order
      let conversations = loadConversations();
      expect(conversations[0].id).toBe('conv-2');
      expect(conversations[1].id).toBe('conv-1');

      // Add a message to conv-1 (actual content change)
      const updatedConv1 = {
        ...conv1,
        messages: [
          ...conv1.messages,
          { id: '3', role: 'ai', content: 'Response' },
        ],
      };

      saveConversation(updatedConv1, true); // true = update timestamp

      // Now conv-1 should be first (it was updated)
      conversations = loadConversations();
      expect(conversations[0].id).toBe('conv-1');
      expect(conversations[1].id).toBe('conv-2');
    });
  });

  describe('Pin/Unpin Functionality', () => {
    it('should toggle pin status of a conversation', () => {
      const conv: Conversation = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        sources: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveConversation(conv);

      // Pin the conversation
      const pinResult = togglePinConversation('conv-1');
      expect(pinResult).toBe(true);

      const conversations = loadConversations();
      expect(conversations[0].isPinned).toBe(true);

      // Unpin the conversation
      togglePinConversation('conv-1');
      const conversationsAfterUnpin = loadConversations();
      expect(conversationsAfterUnpin[0].isPinned).toBe(false);
    });

    it('should return false when trying to pin non-existent conversation', () => {
      const result = togglePinConversation('non-existent');
      expect(result).toBe(false);
    });

    it('should sort pinned conversations first', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'Old Unpinned',
        messages: [],
        sources: [],
        createdAt: Date.now() - 5000,
        updatedAt: Date.now() - 5000,
      };

      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Recent Unpinned',
        messages: [],
        sources: [],
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
      };

      const conv3: Conversation = {
        id: 'conv-3',
        title: 'Old Pinned',
        messages: [],
        sources: [],
        createdAt: Date.now() - 3000,
        updatedAt: Date.now() - 3000,
        isPinned: true,
      };

      saveConversation(conv1);
      saveConversation(conv2);
      saveConversation(conv3);

      const conversations = loadConversations();

      // Pinned should be first, even though it's older
      expect(conversations[0].id).toBe('conv-3');
      expect(conversations[0].isPinned).toBe(true);

      // Then unpinned, sorted by updatedAt
      expect(conversations[1].id).toBe('conv-2');
      expect(conversations[2].id).toBe('conv-1');
    });

    it('should sort multiple pinned conversations by updatedAt descending', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'Old Pinned',
        messages: [],
        sources: [],
        createdAt: Date.now() - 3000,
        updatedAt: Date.now() - 3000,
        isPinned: true,
      };

      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Recent Pinned',
        messages: [],
        sources: [],
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
        isPinned: true,
      };

      const conv3: Conversation = {
        id: 'conv-3',
        title: 'Middle Pinned',
        messages: [],
        sources: [],
        createdAt: Date.now() - 2000,
        updatedAt: Date.now() - 2000,
        isPinned: true,
      };

      saveConversation(conv1);
      saveConversation(conv2);
      saveConversation(conv3);

      const conversations = loadConversations();

      // All pinned, sorted by updatedAt descending
      expect(conversations[0].id).toBe('conv-2'); // Most recent
      expect(conversations[1].id).toBe('conv-3'); // Middle
      expect(conversations[2].id).toBe('conv-1'); // Oldest
    });

    it('should normalize conversations without isPinned field to false', () => {
      // Simulate old conversation data without isPinned
      const oldConv: Conversation = {
        id: 'conv-old',
        title: 'Old Format',
        messages: [],
        sources: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // No isPinned field
      };

      saveConversation(oldConv);
      const conversations = loadConversations();

      expect(conversations[0].isPinned).toBe(false);
    });
  });

  describe('Combined Sorting: Pinned + Regular', () => {
    it('should properly sort mixed pinned and unpinned conversations', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Old Unpinned',
          messages: [],
          sources: [],
          createdAt: Date.now() - 10000,
          updatedAt: Date.now() - 10000,
          isPinned: false,
        },
        {
          id: 'conv-2',
          title: 'Recent Pinned',
          messages: [],
          sources: [],
          createdAt: Date.now() - 5000,
          updatedAt: Date.now() - 5000,
          isPinned: true,
        },
        {
          id: 'conv-3',
          title: 'Very Recent Unpinned',
          messages: [],
          sources: [],
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
          isPinned: false,
        },
        {
          id: 'conv-4',
          title: 'Old Pinned',
          messages: [],
          sources: [],
          createdAt: Date.now() - 8000,
          updatedAt: Date.now() - 8000,
          isPinned: true,
        },
        {
          id: 'conv-5',
          title: 'Middle Unpinned',
          messages: [],
          sources: [],
          createdAt: Date.now() - 6000,
          updatedAt: Date.now() - 6000,
          isPinned: false,
        },
      ];

      conversations.forEach(conv => saveConversation(conv));
      const sorted = loadConversations();

      // Expected order:
      // 1. conv-2 (pinned, more recent)
      // 2. conv-4 (pinned, older)
      // 3. conv-3 (unpinned, most recent)
      // 4. conv-5 (unpinned, middle)
      // 5. conv-1 (unpinned, oldest)

      expect(sorted[0].id).toBe('conv-2');
      expect(sorted[0].isPinned).toBe(true);

      expect(sorted[1].id).toBe('conv-4');
      expect(sorted[1].isPinned).toBe(true);

      expect(sorted[2].id).toBe('conv-3');
      expect(sorted[2].isPinned).toBe(false);

      expect(sorted[3].id).toBe('conv-5');
      expect(sorted[3].isPinned).toBe(false);

      expect(sorted[4].id).toBe('conv-1');
      expect(sorted[4].isPinned).toBe(false);
    });
  });
});
