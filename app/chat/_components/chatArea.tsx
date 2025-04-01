import React, { useState, useEffect } from "react";
import MessageBubble from "./messageBubble";

type ChatAreaProps = {
  userId: string;
  setChats: React.Dispatch<React.SetStateAction<any[]>>; // Pass setChats from Chat
};

const ChatArea: React.FC<ChatAreaProps> = ({ userId, setChats }) => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create or update a session when the component is first loaded
  useEffect(() => {
    const fetchOrCreateSession = async () => {
      try {
        // Fetch the session if it exists or create a new one if it doesn't
        const response = await fetch("/api/chats/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.sessionId);

          // Fetch messages for this session if any
          const messagesResponse = await fetch(`/api/chats/${data.sessionId}`);
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages);
        } else {
          console.error("Failed to create or fetch session");
        }
      } catch (error) {
        console.error("Error creating or fetching session:", error);
      }
    };

    if (userId) {
      fetchOrCreateSession();
    }
  }, [userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    // Add the user message to the conversation
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", text: newMessage },
    ]);
    setNewMessage("");

    // Send the new message to the backend
    try {
      const response = await fetch("/api/createOrUpdateSession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userId,
          message: newMessage,
          title: "Chat Session",
        }),
      });

      const data = await response.json();

      if (data.sessionId) {
        // Update the sessionId if new session is created
        setSessionId(data.sessionId);

        // Add the new session to the sidebar
        setChats((prevChats) => [
          ...prevChats,
          { sessionId: data.sessionId, lastMessage: newMessage },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Simulate a static reply for now
    const reply = "This is a static reply.";

    // Add the simulated reply to the conversation
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "Alice", text: reply },
    ]);
  };

  return (
    <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
      {/* Display messages */}
      {messages.map((msg, index) => (
        <MessageBubble key={index} sender={msg.sender} text={msg.text} />
      ))}

      {/* Message input form */}
      <form className="flex mt-4" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
