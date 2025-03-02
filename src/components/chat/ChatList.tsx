// components/chat/ChatList.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


export function ChatList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Function to establish SSE connection
    const setupEventSource = () => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Create new EventSource connection
      const eventSource = new EventSource('/api/messages/stream');
      
      // Handle incoming messages
      eventSource.onmessage = (event) => {
        if (event.data === ': ping\n\n') return; // Ignore ping messages
        
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'initial':
              setMessages(data.messages);
              setIsLoading(false);
              break;
            case 'new-message':
              setMessages((prev) => [data.message, ...prev]);
              toast(`${data.message.username}: ${data.message.content.substring(0, 30)}${data.message.content.length > 30 ? '...' : ''}`);
              // Refresh the page to ensure we have the latest data
              router.refresh();
              break;
            case 'edit-message':
              setMessages((prev) => 
                prev.map((msg) => 
                  msg.id === data.message.id ? data.message : msg
                )
              );
              // Refresh the page to ensure we have the latest data
              router.refresh();
              break;
            case 'delete-message':
              setMessages((prev) => 
                prev.filter((msg) => msg.id !== data.id)
              );
              // Refresh the page to ensure we have the latest data
              router.refresh();
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };
      
      // Handle errors and reconnection
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect to SSE...');
          setupEventSource();
        }, 5000);
      };
      
      eventSourceRef.current = eventSource;
      
      console.log('SSE connection established');
    };
    
    // Set up SSE connection when component mounts
    setupEventSource();
    
    // Clean up on unmount
    return () => {
      console.log('Closing SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [router]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleEditMessage = async (id: string, content: string) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      // Refresh the page to ensure we have the latest data
      router.refresh();
    } catch (error) {
      console.error('Error editing message:', error);
      toast("Failed to edit message. Please try again.");
    }
  };
  
  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      // Refresh the page to ensure we have the latest data
      router.refresh();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast("Failed to delete message. Please try again.");
    }
  };
  
  // Add a refresh function that can be called manually
  const refreshMessages = () => {
    router.refresh();
  };
  
  // Set up an interval to refresh the page periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [router]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ChatMessageSkeleton key={i} />
          ))}
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-muted-foreground">
            No messages yet. Be the first to send one!
          </p>
        </div>
      )}
    </div>
  );
}