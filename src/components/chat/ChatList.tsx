// components/chat/ChatList.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';

export function ChatList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    const setupEventSource = () => {
      const eventSource = new EventSource('/api/messages/stream');
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'initial':
              setMessages(data.messages);
              setIsLoading(false);
              break;
            case 'new-message':
              setMessages((prev) => [data.message, ...prev]);
              break;
            case 'edit-message':
              setMessages((prev) => 
                prev.map((msg) => 
                  msg.id === data.message.id ? data.message : msg
                )
              );
              break;
            case 'delete-message':
              setMessages((prev) => 
                prev.filter((msg) => msg.id !== data.id)
              );
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        setTimeout(() => setupEventSource(), 5000);
      };
      
      eventSourceRef.current = eventSource;
    };
    
    setupEventSource();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleEditMessage = async (id: string, content: string) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) throw new Error('Failed to edit message');
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };
  
  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete message');
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ChatMessageSkeleton key={i} />
          ))}
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-1">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-muted-foreground">
            No messages yet. Be the first to send one!
          </p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}