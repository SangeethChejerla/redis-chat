'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export function AuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <SignInButton mode="modal">
        <Button size="lg">Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="lg" variant="outline">Sign Up</Button>
      </SignUpButton>
    </div>
  );
}