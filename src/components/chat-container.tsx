'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Bot, MessageSquare } from 'lucide-react';
import { ChatInput } from '@/components/chat-input';
import { ChatMessages } from '@/components/chat-messages';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [knowledge, setKnowledge] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          knowledge,
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant' as const, content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="chat" className="h-[calc(100vh-2rem)]">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="h-[calc(100vh-8rem)]">
            <Card className="h-full p-6">
              <h2 className="text-2xl font-bold mb-4">Knowledge Base</h2>
              <p className="text-muted-foreground mb-4">
                Add custom knowledge that your chatbot can use when responding to questions. This
                information will be used to provide more accurate and contextual responses.
              </p>
              <Textarea
                placeholder="Add custom knowledge for your chatbot..."
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                className="min-h-[calc(100vh-16rem)]"
              />
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="h-[calc(100vh-8rem)]">
            <Card className="h-full flex flex-col">
              <div className="p-4 flex justify-end">
                <Button onClick={resetChat} variant="outline" size="sm">
                  Reset Chat
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatMessages messages={messages} />
              </div>
              <div className="p-4 pt-2">
                <ChatInput input={input} onChange={setInput} onSend={sendMessage} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
