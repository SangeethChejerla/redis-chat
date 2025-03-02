"use client"
import { UserButton } from "@clerk/nextjs";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Real-time Chat App</h1>
        <div className="flex items-center gap-2">
       
        </div>
      </header>
      {children}
    </div>
  );
}