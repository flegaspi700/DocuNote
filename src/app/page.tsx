'use client';

import { useState, useEffect, useRef } from 'react';
import type { FileInfo, Message, Conversation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useTheme } from 'next-themes';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessages, ChatMessagesSkeleton } from '@/components/chat-messages';
import { ChatInputForm } from '@/components/chat-input-form';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/file-upload';
import { ConversationHistory } from '@/components/conversation-history';
import type { AITheme } from '@/lib/types';
import { 
  loadMessages, 
  loadSources, 
  loadAITheme,
  createConversation,
  saveConversation,
  getCurrentConversationId,
  setCurrentConversationId,
  updateConversationTitle,
  loadConversation,
} from '@/lib/storage';
import { useMessagesPersistence, useSourcesPersistence, useAIThemePersistence } from '@/hooks/use-persistence';
import { useStreamingResponse } from '@/hooks/use-streaming';
import { validateMessageLength } from '@/lib/validation';
import { applyThemeStyles } from '@/components/ai-theme-generator';
import { ErrorBoundary, ChatErrorFallback, SidebarErrorFallback } from '@/components/error-boundary';
import { editMessage, truncateMessagesAfter } from '@/lib/message-editing';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [pending, setPending] = useState(false);
  const [aiTheme, setAiTheme] = useState<AITheme | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationIdState] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('New Conversation');
  const [activeTab, setActiveTab] = useState<string>('conversations');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { streamingText, isStreaming, streamResponse, reset } = useStreamingResponse();

  // Load persisted data on mount
  useEffect(() => {
    const savedMessages = loadMessages();
    const savedSources = loadSources();
    const savedTheme = loadAITheme();
    const savedConversationId = getCurrentConversationId();
    
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    if (savedSources.length > 0) {
      setFiles(savedSources);
    }
    if (savedTheme) {
      setAiTheme(savedTheme);
      
      // Apply the AI theme styles to the DOM
      if (savedTheme.palette) {
        console.log('🎨 Restoring saved AI theme:', savedTheme.name);
        applyThemeStyles(savedTheme.id, savedTheme.palette, undefined);
        
        // Set the theme in next-themes
        setTimeout(() => {
          setTheme(savedTheme.id);
        }, 100);
      }
    }
    
    setIsLoaded(true);
    
    // Load current conversation ID and title
    setCurrentConversationIdState(savedConversationId);
    
    // Load conversation title if we have a saved conversation
    if (savedConversationId) {
      const savedConversation = loadConversation(savedConversationId);
      if (savedConversation) {
        setConversationTitle(savedConversation.title);
      }
    }
    
    // Show welcome back message if there's saved data
    if (savedMessages.length > 0 || savedSources.length > 0) {
      toast({
        title: 'Welcome back!',
        description: `Restored ${savedMessages.length} messages and ${savedSources.length} sources.`,
      });
    }
  }, [toast, setTheme]);

  // Auto-save data when it changes
  useMessagesPersistence(messages);
  useSourcesPersistence(files);
  useAIThemePersistence(aiTheme);

  // Auto-save conversation when messages or sources change
  useEffect(() => {
    if (isLoaded) {
      // Save if we have messages OR if we have a conversation ID (empty conversation with title)
      if (messages.length > 0 || currentConversationId) {
        // If we don't have a current conversation ID, create new one with auto-generated title
        if (!currentConversationId) {
          const conversation = createConversation(messages, files, aiTheme || undefined);
          setCurrentConversationIdState(conversation.id);
          setCurrentConversationId(conversation.id);
          setConversationTitle(conversation.title); // Set auto-generated title
          saveConversation(conversation);
        } else {
          // Update existing conversation with current ID and title
          const conversation = createConversation(messages, files, aiTheme || undefined, conversationTitle);
          conversation.id = currentConversationId;
          saveConversation(conversation);
        }
      }
    }
    // Note: conversationTitle is NOT in dependencies because title updates are handled by handleTitleChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, files, aiTheme, currentConversationId, isLoaded]);

  const handleNewConversation = () => {
    // Save current conversation before creating new one
    if (messages.length > 0) {
      const conversation = createConversation(messages, files, aiTheme || undefined);
      if (currentConversationId) {
        conversation.id = currentConversationId;
        conversation.title = conversationTitle; // Preserve title
      }
      saveConversation(conversation);
    }
    
    // Clear current state
    setMessages([]);
    setFiles([]);
    setAiTheme(null);
    setCurrentConversationIdState(null);
    setCurrentConversationId(null);
    setConversationTitle('New Conversation');
    
    // Switch to sources tab if no sources
    if (files.length === 0) {
      setActiveTab('sources');
    }
    
    toast({
      title: 'New Conversation',
      description: 'Started a new conversation. Add sources or start chatting!',
    });
  };

  const handleLoadConversation = (conversation: Conversation) => {
    // Save current conversation before loading new one
    if (messages.length > 0 && currentConversationId) {
      const currentConversation = createConversation(messages, files, aiTheme || undefined);
      currentConversation.id = currentConversationId;
      currentConversation.title = conversationTitle; // Preserve current title
      saveConversation(currentConversation);
    }
    
    // Load selected conversation
    setMessages(conversation.messages);
    setFiles(conversation.sources);
    setAiTheme(conversation.aiTheme || null);
    setCurrentConversationIdState(conversation.id);
    setCurrentConversationId(conversation.id);
    setConversationTitle(conversation.title);
    
    toast({
      title: 'Conversation Loaded',
      description: `Loaded "${conversation.title}"`,
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setConversationTitle(newTitle);
    
    // If we don't have a conversation ID yet, create one and save the empty conversation
    if (!currentConversationId) {
      const conversation = createConversation(messages, files, aiTheme || undefined, newTitle);
      setCurrentConversationIdState(conversation.id);
      setCurrentConversationId(conversation.id);
      saveConversation(conversation);
      
      toast({
        title: 'Conversation Created',
        description: `Created "${newTitle}"`,
      });
    } else {
      // Update existing conversation title
      updateConversationTitle(currentConversationId, newTitle);
      
      toast({
        title: 'Title Updated',
        description: `Conversation renamed to "${newTitle}"`,
      });
    }
  };

  const handleClearData = () => {
    setMessages([]);
    setFiles([]);
    setAiTheme(null);
  };

  const handleFormSubmit = async (userInput: string) => {
    if (!userInput.trim() || pending || isStreaming) return;

    // Validate message length
    const validation = validateMessageLength(userInput);
    if (!validation.isValid) {
      toast({
        variant: 'destructive',
        title: validation.error || 'Invalid input',
        description: validation.details || 'Please check your message and try again.',
      });
      return;
    }

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userInput };
    const aiMessageId = crypto.randomUUID();
    
    setMessages((prev) => [...prev, userMessage]);
    setPending(true);
    setStreamingMessageId(aiMessageId);
    reset();

    const fileContent = files.map(f => `Source: ${f.name} (${f.type})\n${f.content}`).join('\n\n---\n\n');

    // Stream the AI response
    await streamResponse(userInput, fileContent || undefined, {
      onComplete: (fullText) => {
        // Add the complete message to history
        const aiMessage: Message = { id: aiMessageId, role: 'ai', content: fullText };
        setMessages((prev) => [...prev, aiMessage]);
        setStreamingMessageId(null);
        setPending(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error,
        });
        setMessages(prev => prev.filter(m => m.id !== userMessage.id)); // Remove user message on error
        setStreamingMessageId(null);
        setPending(false);
      },
    });
  };

  const handleEditStart = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleEditSave = async (messageId: string, newContent: string) => {
    if (!newContent.trim() || pending || isStreaming) return;

    // Validate message length
    const validation = validateMessageLength(newContent);
    if (!validation.isValid) {
      toast({
        variant: 'destructive',
        title: validation.error || 'Invalid input',
        description: validation.details || 'Please check your message and try again.',
      });
      return;
    }

    // Update the message
    const updatedMessages = editMessage(messages, messageId, newContent);
    
    // Truncate messages after the edited message
    const truncatedMessages = truncateMessagesAfter(updatedMessages, messageId);
    
    // Update state
    setMessages(truncatedMessages);
    setEditingMessageId(null);
    setEditedContent('');
    
    // Now regenerate from this point
    const aiMessageId = crypto.randomUUID();
    setPending(true);
    setStreamingMessageId(aiMessageId);
    reset();

    const fileContent = files.map(f => `Source: ${f.name} (${f.type})\n${f.content}`).join('\n\n---\n\n');

    // Stream the AI response
    await streamResponse(newContent, fileContent || undefined, {
      onComplete: (fullText) => {
        // Add the complete message to history
        const aiMessage: Message = { id: aiMessageId, role: 'ai', content: fullText };
        setMessages((prev) => [...prev, aiMessage]);
        setStreamingMessageId(null);
        setPending(false);
        
        toast({
          title: 'Message Edited',
          description: 'Successfully regenerated response from edited message.',
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error,
        });
        setStreamingMessageId(null);
        setPending(false);
      },
    });
  };

  const handleEditContentChange = (content: string) => {
    setEditedContent(content);
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onNewConversation: handleNewConversation,
    onSearchFocus: () => {
      setActiveTab('conversations');
      // Focus search input after tab switch
      setTimeout(() => searchInputRef.current?.focus(), 100);
    },
    onExport: () => {
      if (messages.length > 0) {
        setShowExportDialog(true);
      }
    },
    onThemeToggle: () => {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    },
    onEscape: () => {
      setShowExportDialog(false);
    },
    disabled: pending || isStreaming,
  });

  // Don't render until data is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={SidebarErrorFallback}>
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold font-headline">DocuNote</h2>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                <TabsTrigger value="conversations" className="rounded-none">
                  Conversations
                </TabsTrigger>
                <TabsTrigger value="sources" className="rounded-none">
                  Sources
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversations" className="flex-1 m-0 overflow-hidden">
                <ConversationHistory
                  onNewConversation={handleNewConversation}
                  onLoadConversation={handleLoadConversation}
                  currentConversationId={currentConversationId}
                  searchInputRef={searchInputRef}
                  showExportDialog={showExportDialog}
                  onCloseExportDialog={() => setShowExportDialog(false)}
                />
              </TabsContent>
              
              <TabsContent value="sources" className="flex-1 m-0 overflow-auto">
                <FileUpload files={files} setFiles={setFiles} aiTheme={aiTheme} />
              </TabsContent>
            </Tabs>
          </SidebarContent>
        </Sidebar>
      </ErrorBoundary>
      <SidebarInset>
        <main className="flex flex-col h-screen bg-background">
          <ChatHeader 
            setAiTheme={setAiTheme} 
            onClearData={handleClearData}
            conversationTitle={conversationTitle}
            onTitleChange={handleTitleChange}
            isNewConversation={!currentConversationId || messages.length === 0}
          >
             <SidebarTrigger />
          </ChatHeader>
          <ErrorBoundary FallbackComponent={ChatErrorFallback} resetKeys={[messages.length]}>
            <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-4xl mx-auto">
                <ChatMessages 
                  messages={messages} 
                  hasFiles={files.length > 0}
                  editingMessageId={editingMessageId}
                  editedContent={editedContent}
                  isStreaming={isStreaming || pending}
                  onEditStart={handleEditStart}
                  onEditCancel={handleEditCancel}
                  onEditSave={handleEditSave}
                  onEditContentChange={handleEditContentChange}
                />
              {isStreaming && streamingText && (
                <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary">
                    <div className="flex h-full w-full items-center justify-center text-primary-foreground text-sm font-semibold">
                      AI
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="rounded-lg border bg-muted p-3 prose prose-sm dark:prose-invert max-w-none">
                      {streamingText}
                      <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-1" />
                    </div>
                  </div>
                </div>
              )}
              {pending && !isStreaming && <ChatMessagesSkeleton />}
              </div>
            </div>
          </ErrorBoundary>
          <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-8 lg:px-12 xl:px-16 border-t bg-card">
            <div className="max-w-4xl mx-auto">
              <ChatInputForm
                onSubmit={handleFormSubmit}
                isPending={pending}
              />
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
