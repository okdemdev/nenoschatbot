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
  Node as ReactFlowNode,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore, NodeData } from '@/lib/store';
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
} as const;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const flowTemplates = {
  inactivityFlow: {
    name: 'Inactivity Handler Flow',
    nodes: [
      {
        id: 'welcome',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: {
          label: 'Welcome Message',
          content: 'Salut, cu ce te pot ajuta?',
          type: 'message',
          timeout: 8,
        },
      },
      {
        id: 'checking',
        type: 'custom',
        position: { x: 400, y: 200 },
        data: {
          label: 'Checking Message',
          content: 'Mai esti acolo?',
          type: 'message',
          timeout: 5,
        },
      },
      {
        id: 'daca-raspunde',
        type: 'custom',
        position: { x: 200, y: 350 },
        data: {
          label: 'Daca Raspunde',
          type: 'condition',
          conditionType: 'user_says_yes',
          condition:
            'user_response contains "yes" or user_response contains "da" or user_response contains "ok"',
        },
      },
      {
        id: 'continue',
        type: 'custom',
        position: { x: 200, y: 500 },
        data: {
          label: 'Continue',
          content: 'Super, spune cu ce te pot ajuta',
          type: 'message',
        },
      },
      {
        id: 'inchide-daca-nu-raspunde',
        type: 'custom',
        position: { x: 600, y: 350 },
        data: {
          label: 'Inchide daca nu raspunde',
          type: 'timeout',
          timeout: 5,
          timeoutAction: 'close',
        },
      },
    ] as ReactFlowNode<NodeData>[],
    edges: [
      {
        id: 'welcome-to-checking',
        source: 'welcome',
        target: 'checking',
      },
      {
        id: 'checking-to-condition',
        source: 'checking',
        target: 'daca-raspunde',
      },
      {
        id: 'checking-to-timeout',
        source: 'checking',
        target: 'inchide-daca-nu-raspunde',
      },
      {
        id: 'condition-to-continue',
        source: 'daca-raspunde',
        target: 'continue',
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
    flowState,
    setNodes,
    setEdges,
    setKnowledge,
    setCurrentNodeId,
    setMessages,
    setFlowState,
    resetChat,
  } = useFlowStore();
  const [input, setInput] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [userResponseTimeout, setUserResponseTimeout] = useState<NodeJS.Timeout | null>(null);
  const deletePressed = useKeyPress('Delete');
  const backspacePressed = useKeyPress('Backspace');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isFlowMode, setIsFlowMode] = useState(false);

  const processNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      console.log('Processing node:', { nodeId, type: node.data.type, data: node.data });

      // Clear any existing timeout
      if (userResponseTimeout) {
        clearTimeout(userResponseTimeout);
        setUserResponseTimeout(null);
      }

      // Update flow state
      setFlowState({
        isActive: true,
        lastProcessedNode: nodeId,
        awaitingResponse: false,
      });

      switch (node.data.type) {
        case 'message':
          if (node.data.content) {
            const currentMessages = Array.isArray(messages) ? messages : [];
            setMessages([
              ...currentMessages,
              { role: 'assistant' as const, content: node.data.content },
            ]);

            if (node.data.timeout) {
              const nextEdge = edges.find((edge) => edge.source === nodeId);
              if (nextEdge) {
                console.log('Setting timeout for next node:', nextEdge.target);
                setFlowState({ awaitingResponse: true });
                const timeout = setTimeout(() => {
                  setCurrentNodeId(nextEdge.target);
                  processNode(nextEdge.target);
                }, node.data.timeout * 1000);
                setUserResponseTimeout(timeout);
              }
            }
          }
          break;

        case 'condition':
          const currentMessages = Array.isArray(messages) ? messages : [];
          const lastUserMessage = currentMessages
            .filter((m) => m.role === 'user')
            .slice(-1)[0]
            ?.content.toLowerCase();

          console.log('Checking condition:', { lastUserMessage, condition: node.data.condition });

          if (!lastUserMessage) {
            console.log('No user message found');
            setFlowState({ awaitingResponse: true });
            return;
          }

          const hasYes =
            lastUserMessage.includes('da') ||
            lastUserMessage.includes('yes') ||
            lastUserMessage.includes('ok');

          console.log('Condition result:', hasYes);

          const nextEdge = edges.find(
            (edge) =>
              edge.source === nodeId &&
              (hasYes ? edge.target === 'continue' : edge.target === 'inchide-daca-nu-raspunde')
          );

          console.log('Selected edge:', nextEdge);

          if (nextEdge) {
            setCurrentNodeId(nextEdge.target);
            processNode(nextEdge.target);
          }
          break;

        case 'timeout':
          if (node.data.timeoutAction === 'close') {
            const currentMessages = Array.isArray(messages) ? messages : [];
            setMessages([
              ...currentMessages,
              {
                role: 'assistant' as const,
                content:
                  'Chat has been closed due to inactivity. Please refresh to start a new chat.',
              },
            ]);
            setFlowState({
              isActive: false,
              awaitingResponse: false,
              lastProcessedNode: null,
            });
            setIsFlowMode(false);
            resetChat();
          }
          break;
      }
    },
    [
      nodes,
      edges,
      messages,
      userResponseTimeout,
      setMessages,
      setCurrentNodeId,
      resetChat,
      setFlowState,
      setIsFlowMode,
    ]
  );

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (userResponseTimeout) {
      clearTimeout(userResponseTimeout);
      setUserResponseTimeout(null);
    }

    const currentMessages = Array.isArray(messages) ? messages : [];
    const newMessages: Message[] = [...currentMessages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');

    // If we're in a flow
    if (isFlowMode && currentNodeId) {
      console.log('Current node ID:', currentNodeId);
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      console.log('Current node:', currentNode);

      // Process condition nodes immediately
      if (currentNode?.data.type === 'condition') {
        setFlowState({ awaitingResponse: false });
        processNode(currentNodeId);
        return;
      }

      // For the continue node, allow AI responses
      if (currentNode?.id === 'continue') {
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
          setMessages([...newMessages, { role: 'assistant' as const, content: data.response }]);
        } catch (error) {
          console.error('Error:', error);
        }
      }
      return;
    }

    // If not in flow, use AI response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          knowledge,
          currentNodeId: null,
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant' as const, content: data.response }]);
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
      setNodes(applyNodeChanges(changes, nodes) as ReactFlowNode<NodeData>[]);
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

  const onSelectionChange = useCallback(({ nodes }: { nodes: ReactFlowNode<NodeData>[] }) => {
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
    const newNode: ReactFlowNode<NodeData> = {
      id: `node-${nodes.length + 1}`,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: 'New Node',
        content: '',
        type: 'message',
        timeout: 15,
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
    // Clear any existing timeout
    if (userResponseTimeout) {
      clearTimeout(userResponseTimeout);
      setUserResponseTimeout(null);
    }

    // Reset everything
    resetChat();
    setInput('');

    // If we're in flow mode and have nodes, restart the flow
    if (isFlowMode && nodes.length > 0) {
      setTimeout(() => {
        const startNode = nodes[0];
        setCurrentNodeId(startNode.id);
        setFlowState({
          isActive: true,
          awaitingResponse: false,
          lastProcessedNode: null,
        });
        processNode(startNode.id);
      }, 100);
    }
  }, [nodes, resetChat, setCurrentNodeId, userResponseTimeout, processNode, isFlowMode]);

  const loadTemplate = (templateName: string) => {
    const template = flowTemplates[templateName as keyof typeof flowTemplates];
    if (template) {
      // First clear everything
      if (userResponseTimeout) {
        clearTimeout(userResponseTimeout);
        setUserResponseTimeout(null);
      }

      // Reset everything
      setMessages([]);
      setCurrentNodeId(null);
      setInput('');
      setIsFlowMode(true);
      setFlowState({
        isActive: true,
        awaitingResponse: false,
        lastProcessedNode: null,
      });

      // Then set the new template with a slight delay
      setTimeout(() => {
        setNodes(template.nodes);
        setEdges(template.edges);

        // Wait another tick before starting the flow
        setTimeout(() => {
          if (template.nodes.length > 0) {
            const startNode = template.nodes[0];
            setCurrentNodeId(startNode.id);
            processNode(startNode.id);
            reactFlowInstance?.fitView({ padding: 0.2 });
          }
        }, 50);
      }, 50);
    }
  };

  useEffect(() => {
    return () => {
      if (userResponseTimeout) {
        clearTimeout(userResponseTimeout);
      }
    };
  }, [userResponseTimeout]);

  // Add effect to handle flow state changes
  useEffect(() => {
    if (flowState.isActive && !flowState.awaitingResponse && currentNodeId) {
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (currentNode && currentNode.data.type === 'condition') {
        processNode(currentNodeId);
      }
    }
  }, [flowState.isActive, flowState.awaitingResponse, currentNodeId, nodes]);

  // Add effect to handle timeouts
  useEffect(() => {
    if (flowState.awaitingResponse && currentNodeId) {
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (currentNode?.data.timeout) {
        const timeout = setTimeout(() => {
          const nextEdge = edges.find((edge) => edge.source === currentNodeId);
          if (nextEdge) {
            setCurrentNodeId(nextEdge.target);
          }
        }, currentNode.data.timeout * 1000);
        setUserResponseTimeout(timeout);
        return () => clearTimeout(timeout);
      }
    }
  }, [flowState.awaitingResponse, currentNodeId, nodes, edges]);

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
                nodes={
                  nodes.map((node) => ({
                    ...node,
                    data: {
                      ...node.data,
                      onChange: (newData: Partial<NodeData>) => updateNodeData(node.id, newData),
                    },
                  })) as ReactFlowNode<NodeData>[]
                }
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
                onInit={setReactFlowInstance}
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
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isFlowMode ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isFlowMode ? 'Flow Mode' : 'AI Chat Mode'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {isFlowMode && (
                    <Button
                      onClick={() => {
                        setIsFlowMode(false);
                        resetChat();
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Exit Flow
                    </Button>
                  )}
                  <Button onClick={resetChatAndFlow} variant="outline" size="sm">
                    Reset Chat
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {Array.isArray(messages) &&
                    messages.map((message, index) => (
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
                  value={input || ''}
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
