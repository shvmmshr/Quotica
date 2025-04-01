"use client";
import React, { useState } from "react";

const MessageInput = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div className="absolute bottom-4 right-4 w-[80%] max-w-2xl bg-white p-4 flex border rounded-lg shadow-lg">
      <input
        type="text"
        className="flex-1 p-2 border rounded-lg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        onClick={sendMessage}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
