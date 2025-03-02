// components/chat/ChatInput.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { SendIcon, SmileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPicker } from './EmojiPicker';
import { useUser } from '@clerk/nextjs';
import {toast} from 'sonner'

export function ChatInput() {
  const router = useRouter(); 

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSignedIn } = useUser();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isSignedIn || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Optimistically clear the input
      const messageContent = message.trim();
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      router.refresh();
      // No need to manually update UI here - the SSE will handle it
    } catch (error) {
      console.error('Error sending message:', error);
      toast( "Failed to send message. Please try again.",);
} finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="relative border-t bg-background p-4">
      <div className="relative flex items-center">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-10 max-h-40 pr-12 resize-none"
          disabled={!isSignedIn || isSubmitting}
        />
        <div className="absolute right-2 flex items-center space-x-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!isSignedIn || isSubmitting}
          >
            <SmileIcon className="h-5 w-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!message.trim() || !isSignedIn || isSubmitting}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-10">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </form>
  );
}