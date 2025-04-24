'use client';
import ChatLayout from './_components/chatLayout';
import { RedirectToSignIn, useAuth } from '@clerk/nextjs';

export default function ChatPage() {
  const { userId } = useAuth();

  // If user is not logged in, redirect to sign-in page
  if (!userId) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="h-full">
      <ChatLayout />
    </div>
  );
}
