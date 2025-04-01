"use client";
import React, { useState } from "react";
import Sidebar from "./_components/sidebar";
import ChatArea from "./_components/chatArea";
import MessageInput from "./_components/mesageInput";
import { useUser } from "@clerk/nextjs";

const Chat = () => {
  const user = useUser();
  const userId = user.user?.id;
  const email = user.user?.primaryEmailAddress?.emailAddress;
  const fullName = user.user?.fullName || "";

  // Manage chat sessions in the parent component
  const [chats, setChats] = useState<any[]>([]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar userId={userId || ""} chats={chats} setChats={setChats} />{" "}
      {/* Pass chats and setChats to Sidebar */}
      <div className="flex flex-col flex-1 relative bg-gray-100">
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          <ChatArea
            userId={userId || ""}
            setChats={setChats} // Pass setChats to ChatArea for updating the chats list
          />
        </div>
        <MessageInput />
      </div>
    </div>
  );
};

export default Chat;
