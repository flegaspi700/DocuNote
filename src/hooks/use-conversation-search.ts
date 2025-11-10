import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Conversation } from '@/lib/types';

export type DateRangeFilter = 'all' | 'today' | 'last-7-days' | 'last-30-days' | 'custom';
export type SourceTypeFilter = 'all' | 'files' | 'urls' | 'none';

export interface ConversationFilters {
  dateRange?: DateRangeFilter;
  customDateStart?: Date;
  customDateEnd?: Date;
  sourceType?: SourceTypeFilter;
  minMessages?: number;
  maxMessages?: number;
}

interface UseConversationSearchReturn {
  filteredConversations: Conversation[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  hasResults: boolean;
  hasActiveFilters: boolean;
}

interface UseConversationSearchOptions {
  debounce?: number; // Debounce delay in milliseconds (default: 0 for instant search)
  filters?: ConversationFilters;
}

/**
 * Custom hook for searching and filtering conversations
 * Searches both conversation titles and message content
 * Supports advanced filters: date range, source type, message count
 */
export function useConversationSearch(
  conversations: Conversation[],
  options: UseConversationSearchOptions = {}
): UseConversationSearchReturn {
  const { debounce = 0, filters } = options;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Use filters directly from options, no need for state
  const activeFilters = filters || {};

  // Debounce the search query
  useEffect(() => {
    if (debounce === 0) {
      setDebouncedQuery(searchQuery);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounce);

    return () => clearTimeout(timer);
  }, [searchQuery, debounce]);

  const filteredConversations = useMemo(() => {
    // Apply date range filter
    const filterByDateRange = (conversation: Conversation): boolean => {
      if (!activeFilters.dateRange || activeFilters.dateRange === 'all') {
        return true;
      }

      const now = Date.now();
      const conversationDate = conversation.createdAt;

      switch (activeFilters.dateRange) {
        case 'today': {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          return conversationDate >= startOfToday.getTime();
        }
        case 'last-7-days': {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          return conversationDate >= sevenDaysAgo;
        }
        case 'last-30-days': {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          return conversationDate >= thirtyDaysAgo;
        }
        case 'custom': {
          if (!activeFilters.customDateStart || !activeFilters.customDateEnd) {
            return true; // If custom dates not provided, don't filter
          }
          const startTime = activeFilters.customDateStart.getTime();
          const endTime = activeFilters.customDateEnd.getTime();
          return conversationDate >= Math.min(startTime, endTime) && 
                 conversationDate <= Math.max(startTime, endTime);
        }
        default:
          return true;
      }
    };

    // Apply source type filter
    const filterBySourceType = (conversation: Conversation): boolean => {
      if (!activeFilters.sourceType || activeFilters.sourceType === 'all') {
        return true;
      }

      const hasFiles = conversation.sources.some(source => source.type === 'file');
      const hasUrls = conversation.sources.some(source => source.type === 'url');
      const hasSources = conversation.sources.length > 0;

      switch (activeFilters.sourceType) {
        case 'files':
          return hasFiles;
        case 'urls':
          return hasUrls;
        case 'none':
          return !hasSources;
        default:
          return true;
      }
    };

    // Apply message count filter
    const filterByMessageCount = (conversation: Conversation): boolean => {
      const messageCount = conversation.messages.length;
      const { minMessages, maxMessages } = activeFilters;

      if (minMessages !== undefined && messageCount < minMessages) {
        return false;
      }

      if (maxMessages !== undefined && messageCount > maxMessages) {
        return false;
      }

      return true;
    };

    let result = conversations;

    // Apply filters first
    result = result.filter(conversation => {
      return filterByDateRange(conversation) &&
             filterBySourceType(conversation) &&
             filterByMessageCount(conversation);
    });

    // Then apply search query
    const trimmedQuery = debouncedQuery.trim();
    if (trimmedQuery) {
      const lowerQuery = trimmedQuery.toLowerCase();
      result = result.filter((conversation) => {
        // Search in title
        if (conversation.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in message content (both user and AI messages)
        const hasMessageMatch = conversation.messages.some((message) =>
          message.content.toLowerCase().includes(lowerQuery)
        );

        return hasMessageMatch;
      });
    }

    return result;
  }, [
    conversations, 
    debouncedQuery, 
    activeFilters.dateRange,
    activeFilters.customDateStart,
    activeFilters.customDateEnd,
    activeFilters.sourceType,
    activeFilters.minMessages,
    activeFilters.maxMessages
  ]);

  const hasResults = filteredConversations.length > 0;

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      (activeFilters.dateRange && activeFilters.dateRange !== 'all') ||
      (activeFilters.sourceType && activeFilters.sourceType !== 'all') ||
      activeFilters.minMessages !== undefined ||
      activeFilters.maxMessages !== undefined
    );
  }, [
    activeFilters.dateRange,
    activeFilters.sourceType,
    activeFilters.minMessages,
    activeFilters.maxMessages
  ]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    filteredConversations,
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasResults,
    hasActiveFilters,
  };
}
