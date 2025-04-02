interface ChatHeaderProps {
  title: string;
  theme: string | undefined;
}

export default function ChatHeader({ title, theme }: ChatHeaderProps) {
  return (
    <div
      className={`p-4 border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      } sticky top-0 z-10 bg-inherit`}
    >
      <h2 className="font-medium">{title}</h2>
    </div>
  );
}
