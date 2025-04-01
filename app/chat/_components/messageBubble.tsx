import React from "react";

const MessageBubble = ({ sender, text }: { sender: string; text: string }) => {
  const isUser = sender === "You";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`p-3 rounded-lg max-w-xs ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
