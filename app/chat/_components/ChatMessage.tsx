import React from "react";
import { Message } from "../types";
import Image from "next/image";
import { UserCircle } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-3xl ${
          isUser
            ? "bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
            : "bg-white border border-gray-200 rounded-tl-lg rounded-tr-lg rounded-br-lg"
        } p-3 shadow-sm`}
      >
        <div className="flex gap-3">
          {!isUser && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                AI
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <div className={`${isUser ? "text-white" : "text-gray-800"}`}>
              {message.content}
            </div>

            {message.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={message.imageUrl}
                  alt="Generated image"
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}

            <div
              className={`text-xs mt-1 ${
                isUser ? "text-blue-200" : "text-gray-500"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {isUser && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <UserCircle size={18} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
