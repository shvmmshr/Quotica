"use client";

import React, { useEffect, useState } from "react";

type SidebarProps = {
  userId: string;
  chats: any[]; // Receive the list of chats from parent
  setChats: React.Dispatch<React.SetStateAction<any[]>>; // Function to update the chats list
};

const Sidebar: React.FC<SidebarProps> = ({ userId, chats, setChats }) => {
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  // Fetch chats when the component mounts or userId changes
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true); // Start loading state
      try {
        const response = await fetch(`/api/chats?userId=${userId}`);
        const data = await response.json();
        setChats(data); // Update chats when fetched from the backend
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false); // End loading state
      }
    };

    if (userId) {
      fetchChats();
    }
  }, [userId, setChats]);

  return (
    <div className="w-1/4 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-lg font-bold mb-4">Chats</h2>
      {loading ? (
        <div>Loading...</div> // Display loading while fetching data
      ) : (
        <ul>
          {chats.length === 0 ? (
            <li>No chats available</li> // Handle the case when no chats are available
          ) : (
            chats.map((chat: any) => (
              <li
                key={chat.id}
                className="p-2 hover:bg-gray-700 rounded cursor-pointer"
              >
                {chat.title || "Untitled Chat"} // Display chat title
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
