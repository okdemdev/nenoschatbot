import { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="py-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-lg px-4 py-2 max-w-[85%] ${
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
