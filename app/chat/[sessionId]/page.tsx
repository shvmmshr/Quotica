// app/chat/page.tsx
import { Metadata } from "next";
import ChatLayout from "./../_components/chatLayout";

export const metadata: Metadata = {
  title: "Quotify Chat",
  description: "Chat with the Quotify assistant",
};

export default function ChatPage() {
  return (
    <div className="h-full">
      <ChatLayout />
    </div>
  );
}
