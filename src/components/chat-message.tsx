interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] break-words whitespace-pre-wrap ${
          role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
        style={{ overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'auto' }}
      >
        {content}
      </div>
    </div>
  );
}
