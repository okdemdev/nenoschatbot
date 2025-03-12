'use client';

import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useKeyPress,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Bot, BrainCircuit, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomNode } from '@/components/CustomNode';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const nodeTypes = {
  custom: CustomNode,
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Define the NodeData interface
interface NodeData {
  label: string;
  content?: string;
  type?: 'message' | 'question' | 'response';
  timeout?: number;
  responses?: string[];
  onChange?: (newData: Partial<NodeData>) => void;
}

const flowTemplates = {
  inactivityFlow: {
    name: 'Inactivity Handler Flow',
    nodes: [
      {
        id: 'welcome',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: 'Welcome Message',
          content: 'Hello! Welcome to our support chat. How can I assist you today?',
          type: 'message',
          timeout: 10, // 10 seconds timeout
        },
      },
      {
        id: 'reminder',
        type: 'custom',
        position: { x: 100, y: 250 },
        data: {
          label: 'Reminder Message',
          content: 'Hello! Are you still there?',
          type: 'question',
        },
      },
      {
        id: 'check-response',
        type: 'custom',
        position: { x: 100, y: 400 },
        data: {
          label: 'Check Response',
          type: 'condition',
          condition: 'user_response contains "yes" or user_response contains "here"',
        },
      },
      {
        id: 'continue-chat',
        type: 'custom',
        position: { x: -100, y: 550 },
        data: {
          label: 'Continue Chat',
          content: 'PERFECT! What can I help you with?',
          type: 'message',
          timeout: 15, // 15 seconds timeout
        },
      },
      {
        id: 'close-chat',
        type: 'custom',
        position: { x: 300, y: 550 },
        data: {
          label: 'Close Chat',
          type: 'action',
          actionType: 'close_case',
        },
      },
    ],
    edges: [
      {
        id: 'welcome-to-reminder',
        source: 'welcome',
        target: 'reminder',
      },
      {
        id: 'reminder-to-check',
        source: 'reminder',
        target: 'check-response',
      },
      {
        id: 'check-to-continue',
        source: 'check-response',
        target: 'continue-chat',
      },
      {
        id: 'continue-to-close',
        source: 'continue-chat',
        target: 'close-chat',
      },
      {
        id: 'check-to-close',
        source: 'check-response',
        target: 'close-chat',
      },
    ],
  },
};

export default function Home() {
  const {
    nodes,
    edges,
    knowledge,
    currentNodeId,
    messages,
    setNodes,
    setEdges,
    setKnowledge,
    setCurrentNodeId,
    setMessages,
    resetChat,
  } = useFlowStore();
  const [input, setInput] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [userResponseTimeout, setUserResponseTimeout] = useState<NodeJS.Timeout | null>(null);
  const deletePressed = useKeyPress('Delete');
  const backspacePressed = useKeyPress('Backspace');

  const processNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Clear any existing timeout
      if (userResponseTimeout) {
        clearTimeout(userResponseTimeout);
      }

      // Handle different node types
      switch (node.data.type) {
        case 'message':
          setMessages([...messages, { role: 'assistant', content: node.data.content }]);
          // Set timeout for next node if specified
          if (node.data.timeout) {
            const nextEdge = edges.find((edge) => edge.source === nodeId);
            if (nextEdge) {
              const timeout = setTimeout(() => {
                setCurrentNodeId(nextEdge.target);
              }, node.data.timeout * 1000);
              setUserResponseTimeout(timeout);
            }
          }
          break;

        case 'question':
          setMessages([...messages, { role: 'assistant', content: node.data.content }]);
          break;

        case 'condition':
          // Get the last user message
          const lastUserMessage =
            messages
              .filter((m) => m.role === 'user')
              .slice(-1)[0]
              ?.content.toLowerCase() || '';

          // Check if response contains "yes" or "here"
          const condition = node.data.condition || '';
          const meetsCondition =
            (condition.includes('yes') && lastUserMessage.includes('yes')) ||
            (condition.includes('here') && lastUserMessage.includes('here'));

          // Find the appropriate edge based on condition
          const nextEdge = edges.find(
            (edge) =>
              edge.source === nodeId &&
              (meetsCondition ? edge.target === 'continue-chat' : edge.target === 'close-chat')
          );

          if (nextEdge) {
            setCurrentNodeId(nextEdge.target);
          }
          break;

        case 'action':
          if (node.data.actionType === 'close_case') {
            setMessages([
              ...messages,
              {
                role: 'assistant',
                content:
                  'Chat has been closed due to inactivity. Please refresh to start a new chat.',
              },
            ]);
            resetChat();
          }
          break;
      }
    },
    [nodes, edges, messages, userResponseTimeout, setMessages, setCurrentNodeId, resetChat]
  );

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (userResponseTimeout) {
      clearTimeout(userResponseTimeout);
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // If we're in a flow (currentNodeId exists), let the flow handle the response
    if (currentNodeId) {
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (currentNode?.data.type === 'condition') {
        // For condition nodes, process the node immediately
        processNode(currentNodeId);
      }
      return;
    }

    // If we're not in a flow, use the AI response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          knowledge,
          currentNodeId,
        }),
      });

      const data = await response.json();

      setMessages([...newMessages, { role: 'assistant', content: data.response }]);

      if (data.pattern) {
        console.log('Pattern Analysis:', data.pattern);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (currentNodeId) {
      processNode(currentNodeId);
    }
  }, [currentNodeId]);

  useEffect(() => {
    if (nodes.length > 0 && !currentNodeId) {
      const startNode = nodes[0];
      setCurrentNodeId(startNode.id);
    }
  }, [nodes, currentNodeId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(addEdge(params, edges));
    },
    [edges, setEdges]
  );

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes?.map((node) => node.id) || []);
  }, []);

  useEffect(() => {
    if ((deletePressed || backspacePressed) && selectedNodes.length > 0) {
      setNodes(nodes.filter((node) => !selectedNodes.includes(node.id)));
      setEdges(
        edges.filter(
          (edge) => !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
        )
      );
    }
  }, [deletePressed, backspacePressed, selectedNodes]);

  const addNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: 'New Node',
        content: '',
        type: 'message',
        timeout: 15,
        onChange: (newData) => {
          setNodes(
            nodes.map((node) =>
              node.id === newNode.id ? { ...node, data: { ...node.data, ...newData } } : node
            )
          );
        },
      },
    };
    setNodes([...nodes, newNode]);
  };

  const deleteSelectedNodes = () => {
    if (selectedNodes.length > 0) {
      setNodes(nodes.filter((node) => !selectedNodes.includes(node.id)));
      setEdges(
        edges.filter(
          (edge) => !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
        )
      );
      setSelectedNodes([]);
    }
  };

  const updateNodeData = (nodeId: string, newData: Partial<NodeData>) => {
    setNodes(
      nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  const resetChatAndFlow = useCallback(() => {
    if (userResponseTimeout) {
      clearTimeout(userResponseTimeout);
      setUserResponseTimeout(null);
    }

    resetChat();
    setCurrentNodeId(null);

    setTimeout(() => {
      if (nodes.length > 0) {
        const startNode = nodes[0];
        setCurrentNodeId(startNode.id);
      }
    }, 100);
  }, [nodes, resetChat, setCurrentNodeId, userResponseTimeout]);

  const loadTemplate = (templateName: string) => {
    const template = flowTemplates[templateName as keyof typeof flowTemplates];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      // Reset the chat when loading a new template
      resetChat();
      setCurrentNodeId(null);

      // Start from the first node after a short delay
      setTimeout(() => {
        if (template.nodes.length > 0) {
          setCurrentNodeId(template.nodes[0].id);
        }
      }, 100);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="flow" className="h-[calc(100vh-2rem)]">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              Flow Builder
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flow" className="h-[calc(100vh-8rem)] border rounded-lg">
            <div className="h-full relative">
              <ReactFlow
                nodes={nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    onChange: (newData) => updateNodeData(node.id, newData),
                  },
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                deleteKeyCode={['Delete', 'Backspace']}
                multiSelectionKeyCode="Control"
                selectionMode={SelectionMode.Partial}
                fitView
              >
                <Background />
                <Controls />
                <Panel position="top-right" className="flex gap-2">
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Load template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(flowTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addNode} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Node
                  </Button>
                  <Button
                    onClick={deleteSelectedNodes}
                    size="sm"
                    variant="destructive"
                    disabled={selectedNodes.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </Panel>
              </ReactFlow>
            </div>
          </TabsContent>

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
            <Card className="h-full p-4 flex flex-col">
              <div className="flex justify-end mb-4">
                <Button onClick={resetChatAndFlow} variant="outline" size="sm">
                  Reset Chat
                </Button>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
