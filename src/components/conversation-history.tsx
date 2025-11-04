'use client';

import { useState, useEffect, RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  MessageSquarePlus, 
  Trash2, 
  Clock,
  ChevronRight,
  Search,
  X,
  Download,
  Filter,
  Calendar,
  FileText,
  MessageSquare,
  Tags,
  Star,
} from 'lucide-react';
import type { Conversation } from '@/lib/types';
import {
  loadConversations,
  deleteConversation,
  saveConversation,
  togglePinConversation,
} from '@/lib/storage';
import { 
  addTagToConversation, 
  removeTagFromConversation,
  getAllTags,
  filterConversationsByTags,
} from '@/lib/conversation-tags';
import { ConversationTags } from '@/components/conversation-tags';
import { TagFilter } from '@/components/tag-filter';
import { useConversationSearch, type ConversationFilters, type DateRangeFilter, type SourceTypeFilter } from '@/hooks/use-conversation-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { exportAsTxt, exportAsPdf } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ConversationHistoryProps {
  onNewConversation: () => void;
  onLoadConversation: (conversation: Conversation) => void;
  currentConversationId: string | null;
  searchInputRef?: RefObject<HTMLInputElement>;
  showExportDialog?: boolean;
  onCloseExportDialog?: () => void;
}

export function ConversationHistory({
  onNewConversation,
  onLoadConversation,
  currentConversationId,
  searchInputRef,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  // Get all tags with metadata
  const allTags = getAllTags(conversations);

  // Apply tag filtering to conversations
  const tagFilteredConversations = selectedTags.length > 0
    ? filterConversationsByTags(conversations, selectedTags)
    : conversations;

  // Use search hook with filters and 300ms debounce for better performance
  const { 
    filteredConversations, 
    searchQuery, 
    setSearchQuery, 
    clearSearch, 
    hasResults,
    hasActiveFilters,
  } = useConversationSearch(tagFilteredConversations, { debounce: 300, filters });

  // Load conversations on mount
  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  // Refresh conversations when currentConversationId changes
  useEffect(() => {
    setConversations(loadConversations());
  }, [currentConversationId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
      setConversations(loadConversations());
      
      // If deleting current conversation, start a new one
      if (id === currentConversationId) {
        onNewConversation();
      }
    }
  };

  const handleLoadConversation = (conversation: Conversation) => {
    onLoadConversation(conversation);
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const success = togglePinConversation(id);
    if (success) {
      setConversations(loadConversations());
      const conversation = conversations.find(c => c.id === id);
      toast({
        title: conversation?.isPinned ? 'Conversation Unpinned' : 'Conversation Pinned',
        description: conversation?.isPinned 
          ? `"${conversation?.title}" removed from top` 
          : `"${conversation?.title}" pinned to top`,
      });
    }
  };

  const handleExport = async (e: React.MouseEvent, conversation: Conversation, format: 'txt' | 'pdf') => {
    e.stopPropagation();
    try {
      if (format === 'txt') {
        exportAsTxt(conversation);
        toast({
          title: 'Exported as TXT',
          description: `${conversation.title} has been downloaded.`,
        });
      } else {
        await exportAsPdf(conversation);
        toast({
          title: 'Exported as PDF',
          description: `${conversation.title} has been downloaded.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export conversation',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleDateRangeFilter = (range: DateRangeFilter) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: prev.dateRange === range ? undefined : range,
      customDateStart: undefined,
      customDateEnd: undefined,
    }));
  };

  const handleSourceTypeFilter = (sourceType: SourceTypeFilter) => {
    setFilters((prev) => ({
      ...prev,
      sourceType: prev.sourceType === sourceType ? undefined : sourceType,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleToggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearTagFilters = () => {
    setSelectedTags([]);
  };

  const handleAddTag = (conversationId: string, tag: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const updated = addTagToConversation(conversation, tag);
    saveConversation(updated);
    setConversations(loadConversations());
    
    toast({
      title: 'Tag added',
      description: `Added "${tag}" to conversation`,
    });
  };

  const handleRemoveTag = (conversationId: string, tag: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const updated = removeTagFromConversation(conversation, tag);
    saveConversation(updated);
    setConversations(loadConversations());
    
    toast({
      title: 'Tag removed',
      description: `Removed "${tag}" from conversation`,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    if (filters.sourceType && filters.sourceType !== 'all') count++;
    if (filters.minMessages || filters.maxMessages) count++;
    if (selectedTags.length > 0) count++;
    return count;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* New Conversation Button */}
        <div className="p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewConversation}
                className="w-full min-h-[44px] touch-manipulation"
                variant="outline"
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Start a new conversation (Ctrl+N)</p>
            </TooltipContent>
          </Tooltip>
        </div>

      <Separator />

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Clear search (Esc)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="px-3 pb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="mr-2 h-3 w-3" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Filter conversations by date, source, or length</p>
              </TooltipContent>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDateRangeFilter('today')}>
                {filters.dateRange === 'today' && '✓ '}Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangeFilter('last-7-days')}>
                {filters.dateRange === 'last-7-days' && '✓ '}Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangeFilter('last-30-days')}>
                {filters.dateRange === 'last-30-days' && '✓ '}Last 30 days
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Source Type
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleSourceTypeFilter('files')}>
                {filters.sourceType === 'files' && '✓ '}Files only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSourceTypeFilter('urls')}>
                {filters.sourceType === 'urls' && '✓ '}URLs only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSourceTypeFilter('none')}>
                {filters.sourceType === 'none' && '✓ '}No sources
              </DropdownMenuItem>
              
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClearFilters} className="text-destructive">
                    Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </Tooltip>
          
          {/* Tag Filter */}
          <TagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTagFilter}
            onClearFilters={handleClearTagFilters}
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {filters.dateRange && filters.dateRange !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="mr-1 h-3 w-3" />
                {filters.dateRange === 'today' && 'Today'}
                {filters.dateRange === 'last-7-days' && 'Last 7 days'}
                {filters.dateRange === 'last-30-days' && 'Last 30 days'}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, dateRange: undefined }))}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.sourceType && filters.sourceType !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                {filters.sourceType === 'files' && 'Files'}
                {filters.sourceType === 'urls' && 'URLs'}
                {filters.sourceType === 'none' && 'No sources'}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, sourceType: undefined }))}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {conversations.length === 0 ? (
                <>
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Start chatting to create your first conversation</p>
                </>
              ) : (
                <>
                  <p>No conversations found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = conversation.id === currentConversationId;
              const isHovered = hoveredId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    w-full p-3 rounded-lg transition-all
                    group relative min-h-[44px] cursor-pointer
                    ${conversation.isPinned ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}
                    ${isActive 
                      ? 'bg-primary/10 border border-primary/20' 
                      : conversation.isPinned 
                        ? 'border hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30'
                        : 'hover:bg-accent border border-transparent'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
                  )}

                  {/* Conversation Info - Clickable area */}
                  <div 
                    className="flex items-start gap-2 pl-2"
                    onClick={() => handleLoadConversation(conversation)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleLoadConversation(conversation);
                      }
                    }}
                  >
                    <ChevronRight 
                      className={`h-4 w-4 mt-0.5 shrink-0 transition-transform ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-2 mb-1">
                        {conversation.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(conversation.updatedAt)}</span>
                        <span>·</span>
                        <span>{conversation.messages.length} messages</span>
                      </div>
                      {conversation.tags && conversation.tags.length > 0 && (
                        <ConversationTags
                          tags={conversation.tags}
                          onRemoveTag={(tag) => handleRemoveTag(conversation.id, tag)}
                          onTagClick={handleToggleTagFilter}
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex gap-1 shrink-0 transition-opacity ${
                      isHovered || isActive ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {/* Pin Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={`h-8 w-8 inline-flex items-center justify-center rounded-md touch-manipulation ${
                              conversation.isPinned 
                                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                            onClick={(e) => handleTogglePin(e, conversation.id)}
                            aria-label={conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                          >
                            <Star className={`h-4 w-4 ${conversation.isPinned ? 'fill-current' : ''}`} />
                            <span className="sr-only">
                              {conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{conversation.isPinned ? 'Unpin from top' : 'Pin to top'}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Export Dropdown */}
                      <Tooltip>
                        <DropdownMenu>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground touch-manipulation"
                                aria-label="Export conversation"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Export conversation</span>
                              </button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Export conversation (Ctrl+E)</p>
                          </TooltipContent>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleExport(e, conversation, 'txt')}>
                              Export as TXT
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleExport(e, conversation, 'pdf')}>
                              Export as PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive touch-manipulation"
                            onClick={(e) => handleDelete(e, conversation.id)}
                            aria-label="Delete conversation"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete conversation</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Delete conversation</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
    </TooltipProvider>
  );
}
