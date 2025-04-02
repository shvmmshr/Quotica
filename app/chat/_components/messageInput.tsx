"use client";
import React, { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  theme: string | undefined;
  onSendMessage: (text: string) => void;
}

export default function MessageInput({
  theme,
  onSendMessage,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`p-4 border-t ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      } sticky bottom-0 z-10 bg-inherit`}
    >
      <div className="flex items-end rounded-lg gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Quotify..."
            rows={1}
            className={`w-full p-3 rounded-lg resize-none ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                : "bg-white border border-gray-300 focus:border-blue-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className={`p-3 rounded-lg ${
            !message.trim()
              ? theme === "dark"
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              : theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
