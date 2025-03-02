// app/api/messages/stream/route.ts
import { redis } from '@/lib/redis';
import { Message } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { userId } = await auth()
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(': ping\n\n'));
      
      const messages = await redis.lrange<Message>('messages', 0, -1);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'initial', messages: messages.reverse() })}\n\n`)
      );
      
      const interval = setInterval(async () => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 15000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}