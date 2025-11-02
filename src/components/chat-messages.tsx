'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from './icons';
import { EditMessageButton } from './edit-message-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatMessagesProps {
  messages: Message[];
  hasFiles: boolean;
  editingMessageId: string | null;
  editedContent: string;
  isStreaming: boolean;
  onEditStart: (messageId: string, content: string) => void;
  onEditCancel: () => void;
  onEditSave: (messageId: string, newContent: string) => void;
  onEditContentChange: (content: string) => void;
}

export function ChatMessages({ 
  messages, 
  hasFiles,
  editingMessageId,
  editedContent,
  isStreaming,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditContentChange,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ messageId: string; content: string } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEditClick = (messageId: string, content: string) => {
    // Extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    onEditStart(messageId, textContent);
  };

  const handleSaveClick = (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Check if we should show confirmation
    const messagesToDelete = messages.length - messageIndex - 1;
    if (messagesToDelete > 2) {
      setPendingSave({ messageId, content: newContent });
      setShowConfirmDialog(true);
    } else {
      onEditSave(messageId, newContent);
    }
  };

  const handleConfirmSave = () => {
    if (pendingSave) {
      onEditSave(pendingSave.messageId, pendingSave.content);
      setPendingSave(null);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelConfirm = () => {
    setPendingSave(null);
    setShowConfirmDialog(false);
  };

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Logo className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-headline font-semibold">Welcome to DocuNote</h2>
        <p className="max-w-md text-muted-foreground">
          {hasFiles ? 'Your files are ready. Ask a question to get started.' : 'Upload documents (.txt, .pdf, .docx, .md, .csv) or add website URLs to start asking questions and get insights from your content.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {messages.map((message) => {
        const isEditing = editingMessageId === message.id;
        const isUserMessage = message.role === 'user';

        return (
          <div
            key={message.id}
            className={cn(
              'flex animate-in fade-in items-start gap-3 md:gap-4 group',
              isUserMessage && 'justify-end'
            )}
          >
            {message.role === 'ai' && (
              <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-primary shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Logo className="h-4 w-4 md:h-5 md:w-5" />
                </AvatarFallback>
              </Avatar>
            )}
            
            {isEditing ? (
              <div className="flex-1 max-w-[85%] sm:max-w-2xl md:max-w-3xl space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="min-h-[100px] resize-y"
                  placeholder="Edit your message..."
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveClick(message.id, editedContent)}
                    disabled={!editedContent.trim()}
                  >
                    Save & Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-2xl md:max-w-3xl rounded-lg p-3 md:p-4',
                    isUserMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground border'
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap break-words max-w-none" dangerouslySetInnerHTML={{ __html: message.content }} />
                  {message.editedAt && (
                    <div className="text-xs opacity-70 mt-2">
                      Edited {new Date(message.editedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                {isUserMessage && !isStreaming && (
                  <div className="absolute -left-10 top-2">
                    <EditMessageButton
                      onEdit={() => handleEditClick(message.id, message.content)}
                      disabled={isStreaming}
                    />
                  </div>
                )}
              </div>
            )}
            
            {message.role === 'user' && !isEditing && (
              <Avatar className="h-8 w-8 md:h-9 md:w-9 shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground">U</AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate responses?</AlertDialogTitle>
            <AlertDialogDescription>
              Editing this message will delete all subsequent messages and regenerate the conversation from this point. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
     <div className="flex animate-in fade-in items-start gap-4">
        <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Logo className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
        <div className="max-w-lg rounded-lg p-3 bg-secondary">
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-0"></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-150"></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-300"></span>
          </div>
        </div>
    </div>
  )
}
