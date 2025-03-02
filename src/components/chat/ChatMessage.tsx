// components/chat/ChatMessage.tsx
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import { Message } from '@/types';
import { MessageActions } from '@/components/chat/MessageAction';
import { useUser } from '@clerk/nextjs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessageProps {
  message: Message;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ChatMessage({ message, onEdit, onDelete }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const isOwner = user?.id === message.userId;
  
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  const wasEdited = message.updatedAt !== null;
  
  const handleEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };
  
  const handleSaveEdit = async () => {
    if (!editedContent.trim() || editedContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onEdit(message.id, editedContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="group relative flex gap-3 py-4 hover:bg-muted/50">
      <Avatar className="h-8 w-8">
        <img 
          src={message.userImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${message.username}`} 
          alt={message.username} 
          className="h-full w-full object-cover"
        />
      </Avatar>
      
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{message.username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {wasEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-10 max-h-40 resize-none"
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editedContent.trim() || editedContent.trim() === message.content || isSubmitting}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}
      </div>
      
      {isOwner && !isEditing && (
        <div className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageActions onEdit={handleEdit} onDelete={() => onDelete(message.id)} />
        </div>
      )}
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full max-w-[80%]" />
        <Skeleton className="h-4 w-full max-w-[60%]" />
      </div>
    </div>
  );
}