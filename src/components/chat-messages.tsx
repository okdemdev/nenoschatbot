import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 pb-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} content={message.content} />
        ))}
      </div>
    </ScrollArea>
  );
}
