// app/sign-out/page.tsx
'use client';

import { useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(true);
  
  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
        setIsSigningOut(false);
      }
    };
    
    performSignOut();
  }, [signOut, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        {isSigningOut ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <h1 className="text-2xl font-semibold">Signing out...</h1>
            <p className="text-muted-foreground">Please wait a moment</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground">Unable to sign you out</p>
            <button 
              onClick={() => {
                setIsSigningOut(true);
                signOut().then(() => router.push('/'));
              }}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}