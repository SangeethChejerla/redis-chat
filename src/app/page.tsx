// app/page.tsx (updated with better sign-in/sign-up buttons)
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/chat');
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Real-time Chat App</h1>
     
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-4xl font-bold tracking-tight">Connect in real-time</h2>
          <p className="text-xl text-muted-foreground">
            A modern chat application with instant messaging, emoji support, and more
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="gap-2">
              <Link href="/sign-in">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Real-time Messaging</h3>
              <p className="text-sm text-muted-foreground">
                Instantly connect with others without refreshing
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">User Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Intuitive interface with emoji support and message editing
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">
                Modern authentication keeps your conversations private
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Real-time Chat App. All rights reserved.</p>
      </footer>
    </div>
  );
}