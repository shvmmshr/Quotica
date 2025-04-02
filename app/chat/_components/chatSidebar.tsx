import { useState } from "react";
import { Plus, MessageSquare, Pencil, Trash, Loader2 } from "lucide-react";
import { ChatSession as Chat } from "./types";

interface ChatSidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  onCreateNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => Promise<void>;
  theme: string | undefined;
}

export default function ChatSidebar({
  chats,
  currentChat,
  loading,
  onCreateNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  theme,
}: ChatSidebarProps) {
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  const handleRename = (chat: Chat) => {
    const newTitle = prompt("Enter new chat name:", chat.title);
    if (newTitle && newTitle.trim() !== "" && newTitle !== chat.title) {
      onRenameChat(chat.id, newTitle.trim());
    }
  };

  const handleDelete = async (chatId: string) => {
    setDeletingChatId(chatId); // Set the deleting state
    await onDeleteChat(chatId); // Wait for deletion to complete
    setDeletingChatId(null); // Reset state after deletion
  };

  return (
    <div
      className={`w-64 border-r overflow-y-auto h-full ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onCreateNewChat}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }`}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recent Chats */}
      <div className="px-2">
        <h2
          className={`px-2 mb-2 text-sm font-medium ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Recent Chats
        </h2>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="animate-spin" size={20} />
            <span className="ml-2 text-sm">Loading chats...</span>
          </div>
        ) : chats.length === 0 ? (
          <div
            className={`p-4 text-center text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-sm ${
                  currentChat?.id === chat.id
                    ? theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : theme === "dark"
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {/* Chat Name + Click to Select */}
                <div
                  className="flex items-center gap-2 w-full truncate"
                  onClick={() => onSelectChat(chat)}
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{chat.title}</span>
                </div>

                {/* Actions (Rename & Delete) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRename(chat)}
                    className="hover:text-blue-500"
                    title="Rename Chat"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(chat.id)}
                    className="hover:text-red-500 disabled:text-gray-400"
                    title="Delete Chat"
                    disabled={deletingChatId === chat.id}
                  >
                    {deletingChatId === chat.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Trash size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
