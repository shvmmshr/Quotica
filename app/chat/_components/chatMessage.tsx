import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  theme: string | undefined;
}

export default function ChatMessage({ message, theme }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : theme === 'dark'
            ? 'bg-gray-700 text-gray-200'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="block text-xs mt-1 opacity-50">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
