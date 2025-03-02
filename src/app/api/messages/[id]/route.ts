// app/api/messages/[id]/route.ts
import { redis } from '@/lib/redis';
import { Message } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { content } = await request.json();
    const messageId = params.id;
    
    const messages = await redis.lrange<Message>('messages', 0, -1);
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    const message = messages[messageIndex];
    
    if (message.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const updatedMessage: Message = {
      ...message,
      content,
      updatedAt: new Date().toISOString(),
    };
    
    messages[messageIndex] = updatedMessage;
    await redis.del('messages');
    
    for (const msg of messages.reverse()) {
      await redis.lpush('messages', msg);
    }
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'edit-message', message: updatedMessage })));
        controller.close();
      },
    });
    
    return new NextResponse(stream);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const messageId = params.id;
    const messages = await redis.lrange<Message>('messages', 0, -1);
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    const message = messages[messageIndex];
    
    if (message.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    messages.splice(messageIndex, 1);
    await redis.del('messages');
    
    for (const msg of messages.reverse()) {
      await redis.lpush('messages', msg);
    }
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'delete-message', id: messageId })));
        controller.close();
      },
    });
    
    return new NextResponse(stream);
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}