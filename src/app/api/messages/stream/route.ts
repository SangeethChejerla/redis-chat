
import { redis } from '@/lib/redis';
import { Message } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } =await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial ping to establish connection
      controller.enqueue(encoder.encode(': ping\n\n'));
      
      // Send initial messages
      const messages = await redis.lrange<Message>('messages', 0, -1);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'initial', messages: messages.reverse() })}\n\n`)
      );
      
      // Set up a heartbeat to keep connection alive
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 15000);
      
      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}