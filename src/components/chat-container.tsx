'use client';

import { useState, useCallback, DragEvent, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  MessageSquare,
  Settings,
  Globe2,
  FileText,
  Upload,
  Download,
  PenTool,
  CircleDot,
  Database,
  Link,
  BrainCircuit,
} from 'lucide-react';
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
  const [flowActive, setFlowActive] = useState(false);
  const [chatClosed, setChatClosed] = useState(false);

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
    setChatClosed(false);
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
        setChatClosed: (closed: boolean) => setChatClosed(closed),
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
    setFlowActive(true);
    flowEngine.executeFlow(nodes, edges);
  }, [nodes, edges]);

  const stopFlow = () => {
    setFlowActive(false);
    flowEngine.clearAllTimers();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-1">
        <Tabs defaultValue="chat" className="flex flex-col h-full">
          <TabsList className="w-full mb-6  p-1 rounded-lg flex gap-1 sticky top-0 z-10">
            <TabsTrigger
              value="knowledge"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Bot className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="flow"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Flow Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="flex-1 mt-0">
            <Card className="min-h-[calc(100vh-8rem)] p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Knowledge Base</h2>
                <Button variant="outline" size="sm" className="text-muted-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Custom Knowledge
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <CircleDot className="w-3 h-3 mr-1 text-green-500" />
                      Active
                    </Badge>
                  </div>
                </div>
                <Textarea
                  placeholder="Add custom knowledge for your chatbot..."
                  value={knowledge}
                  onChange={(e) => setKnowledge(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Website URL Import Section */}
                <Card className="p-4 border-2 border-dashed relative">
                  <Badge className="absolute top-3 right-3 bg-primary/10 text-primary hover:bg-primary/20">
                    Coming Next
                  </Badge>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe2 className="w-4 h-4" />
                    Import from Website
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add knowledge by importing content from a website's sitemap
                  </p>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter website URL..."
                      className="w-full bg-muted/5"
                      disabled
                    />
                    <Button className="w-full" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      Import Sitemap
                    </Button>
                  </div>
                </Card>

                {/* File Upload Section (Coming Next) */}
                <Card className="p-4 border-2 border-dashed relative">
                  <Badge className="absolute top-3 right-3 bg-primary/10 text-primary hover:bg-primary/20">
                    Coming Next
                  </Badge>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Upload Documents
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for PDF, DOCX, XLSX, and more file formats
                  </p>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/5">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop files or click to upload
                    </p>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 mt-0">
            <Card className="min-h-[calc(100vh-8rem)] flex flex-col">
              <div className="p-4 flex justify-end border-b">
                <Button onClick={resetChat} variant="outline" size="sm">
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
                      <Button
                        onClick={() => {
                          resetChat();
                          setChatClosed(false);
                        }}
                        variant="outline"
                        size="sm"
                      >
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
                  onChange={setInput}
                  onSend={sendMessage}
                  disabled={chatClosed}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="flex-1 mt-0">
            <div className="min-h-[calc(100vh-8rem)] grid grid-cols-[240px_1fr] gap-6">
              <div className="space-y-6">
                <NodeSelector onDragStart={onDragStart} />
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        flowActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">Flow Status</span>
                  </div>
                  <div className="space-y-0">
                    <Button
                      onClick={executeFlow}
                      className="w-full rounded-b-none"
                      variant="default"
                    >
                      Start Flow
                    </Button>
                    <Button
                      onClick={stopFlow}
                      className="w-full rounded-t-none border-t-0"
                      variant="outline"
                    >
                      Stop Flow
                    </Button>
                  </div>
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
