import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { ChatInput } from '@/components/chat-input';
import { ChatMessages } from '@/components/chat-messages';
import { Message } from '@/types/chat';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  chatClosed: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onResetChat: () => void;
}

export function ChatInterface({
  messages,
  input,
  chatClosed,
  onInputChange,
  onSendMessage,
  onResetChat,
}: ChatInterfaceProps) {
  return (
    <Card className="min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-4 flex justify-end border-b">
        <Button onClick={onResetChat} variant="outline" size="sm">
          Reset Chat
        </Button>
      </div>
      <div className="flex-1 relative">
        {chatClosed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/25 backdrop-blur-[2px] z-10">
            <div className="text-center space-y-4 bg-background/25 p-6 rounded-lg shadow-sm">
              <div className="p-3 bg-muted inline-block rounded-full">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Chat Closed</h3>
                <p className="text-sm text-muted-foreground">This conversation has ended</p>
              </div>
              <Button onClick={onResetChat} variant="outline" size="sm">
                Start New Chat
              </Button>
            </div>
          </div>
        ) : null}
        <div className="absolute inset-0 px-6 overflow-y-auto">
          <ChatMessages messages={messages} />
        </div>
      </div>
      <div className="p-6 pt-4 border-t">
        <ChatInput
          input={input}
          onChange={onInputChange}
          onSend={onSendMessage}
          disabled={chatClosed}
        />
      </div>
    </Card>
  );
}
