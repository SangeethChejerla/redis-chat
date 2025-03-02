
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatList } from '@/components/chat/ChatList';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function ChatPage() {
    const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }
  
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat App</h1>
        <UserButton afterSignOutUrl="/" />
      </header>
      <ChatList />
      <ChatInput />
    </div>
  );
}