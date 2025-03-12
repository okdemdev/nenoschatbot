'use client';

import { useState, useCallback, DragEvent, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Bot, MessageSquare, Settings } from 'lucide-react';
import { ChatInput } from '@/components/chat-input';
import { ChatMessages } from '@/components/chat-messages';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerNode } from '@/components/flow/TriggerNode';
import { ActionNode } from '@/components/flow/ActionNode';
import { NodeSelector } from '@/components/flow/NodeSelector';
import { flowEngine } from '@/services/flowEngine';
import { StartNode } from '@/components/flow/StartNode';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const nodeTypes = {
  start: StartNode,
  wait: TriggerNode,
  action: ActionNode,
};

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [knowledge, setKnowledge] = useState('');

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // Add a more direct delete handler
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      console.log('Deleting node:', nodeId); // Debug log
      setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
      setEdges((edges) => edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      const data = JSON.parse(event.dataTransfer.getData('application/reactflow-data'));

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const nodeId = `${type}-${Date.now()}`;
      const newNode = {
        id: nodeId,
        type,
        position,
        data: {
          ...data,
          id: nodeId, // Explicitly pass the id
          useAI: false,
          onChange: (newData: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
              )
            );
          },
          handleDelete: () => handleDeleteNode(nodeId), // Use the new handler name
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [handleDeleteNode]
  );

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

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDragStart = (event: DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Set up flow engine context with knowledge
  useEffect(() => {
    const updateContext = () => {
      flowEngine.setContext({
        setMessages: (newMessages) => setMessages(newMessages),
        resetChat,
        messages,
        knowledge,
      });
    };
    updateContext();
  }, [knowledge, messages, resetChat]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      flowEngine.clearAllTimers();
    };
  }, []);

  const executeFlow = useCallback(() => {
    flowEngine.executeFlow(nodes, edges);
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="container mx-auto p-4 h-full">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="knowledge" className="flex items-center gap-2.5 px-4 py-2.5">
              <Bot className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2.5 px-4 py-2.5">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2.5 px-4 py-2.5">
              <Settings className="w-4 h-4" />
              Flow Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="flex-1 h-[calc(100%-3rem)]">
            <Card className="h-full p-8">
              <h2 className="text-2xl font-bold mb-6">Knowledge Base</h2>
              <p className="text-muted-foreground mb-6">
                Add custom knowledge that your chatbot can use when responding to questions. This
                information will be used to provide more accurate and contextual responses.
              </p>
              <Textarea
                placeholder="Add custom knowledge for your chatbot..."
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                className="min-h-[calc(100%-10rem)] resize-none"
              />
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 h-[calc(100%-3rem)]">
            <Card className="h-full flex flex-col">
              <div className="p-4 flex justify-end border-b">
                <Button onClick={resetChat} variant="outline" size="sm">
                  Reset Chat
                </Button>
              </div>
              <div className="flex-1 min-h-0 px-6">
                <ChatMessages messages={messages} />
              </div>
              <div className="p-6 pt-4 border-t">
                <ChatInput input={input} onChange={setInput} onSend={sendMessage} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="flex-1 h-[calc(100%-3rem)]">
            <div className="h-full grid grid-cols-[240px_1fr] gap-6">
              <div className="space-y-6">
                <NodeSelector onDragStart={onDragStart} />
                <Card className="p-4">
                  <Button onClick={executeFlow} className="w-full mb-3" variant="default">
                    Start Flow
                  </Button>
                  <Button
                    onClick={() => flowEngine.clearAllTimers()}
                    className="w-full"
                    variant="outline"
                  >
                    Stop Flow
                  </Button>
                </Card>
              </div>
              <Card className="h-full overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  nodeTypes={nodeTypes}
                  fitView
                  className="h-full"
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
