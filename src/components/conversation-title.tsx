'use client';

import { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConversationTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  isNewConversation: boolean;
}

export function ConversationTitle({ title, onTitleChange, isNewConversation }: ConversationTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when prop changes
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== title) {
      onTitleChange(trimmedTitle);
    } else {
      setEditedTitle(title); // Reset to original if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayTitle = isNewConversation ? 'New Conversation' : title;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 text-sm font-medium bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={100}
        />
        <button
          type="button"
          onClick={handleSave}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Save title"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Cancel editing"
        >
          <X className="h-4 w-4 text-destructive" />
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-1 min-w-0 group">
        <h2 className="text-sm font-medium truncate" title={displayTitle}>
          {displayTitle}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground transition-opacity"
              aria-label="Edit conversation title"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Edit conversation title</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
