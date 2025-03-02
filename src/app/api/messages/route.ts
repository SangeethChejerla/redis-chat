// app/api/messages/route.ts
import { redis } from '@/lib/redis';
import { Message } from '@/types';
import { auth, currentUser } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const messages = await redis.lrange<Message>('messages', 0, -1);
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }
    
    const message: Message = {
      id: nanoid(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      userId,
      username: `${user.firstName} ${user.lastName}`.trim() || user.username || 'Anonymous',
      userImageUrl: user.imageUrl || '',
    };
    
    await redis.lpush('messages', message);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'new-message', message })));
        controller.close();
      },
    });
    
    return new NextResponse(stream);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}