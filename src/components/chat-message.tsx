interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-2 last:mb-0`}>
      <div
        className={`rounded-2xl px-6 py-3 max-w-[85%] break-words whitespace-pre-wrap shadow-sm ${
          role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border'
        }`}
        style={{ overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'auto' }}
      >
        {content}
      </div>
    </div>
  );
}
