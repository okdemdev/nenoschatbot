'use client';

import { useState, useCallback, DragEvent, useEffect, useReducer } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Settings, Bot } from 'lucide-react';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { flowEngine } from '@/services/flowEngine';
import { KnowledgeBase } from '@/components/knowledge-base';
import { ChatInterface } from '@/components/chat-interface';
import { FlowEditor } from '@/components/flow-editor';
import { ChatState, ChatAction } from '@/types/chat';
import { sendChatMessage } from '@/actions/chat-actions';

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.messages };
    case 'SET_INPUT':
      return { ...state, input: action.input };
    case 'SET_KNOWLEDGE':
      return { ...state, knowledge: action.knowledge };
    case 'SET_FLOW_ACTIVE':
      return { ...state, flowActive: action.flowActive };
    case 'SET_CHAT_CLOSED':
      return { ...state, chatClosed: action.chatClosed };
    case 'RESET_CHAT':
      return { ...state, messages: [], input: '', chatClosed: false };
    default:
      return state;
  }
}

const initialState: ChatState = {
  messages: [],
  input: '',
  knowledge: '',
  flowActive: false,
  chatClosed: false,
};

export function ChatContainer() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
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
          id: nodeId,
          useAI: false,
          onChange: (newData: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
              )
            );
          },
          handleDelete: () => handleDeleteNode(nodeId),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [handleDeleteNode]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDragStart = (event: DragEvent, nodeType: string, data: any = {}) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  const sendMessage = async () => {
    if (!state.input.trim()) return;

    const newMessages = [...state.messages, { role: 'user' as const, content: state.input }];
    dispatch({ type: 'SET_MESSAGES', messages: newMessages });
    dispatch({ type: 'SET_INPUT', input: '' });

    const response = await sendChatMessage(newMessages, state.knowledge);
    dispatch({
      type: 'SET_MESSAGES',
      messages: [...newMessages, { role: 'assistant', content: response }],
    });
  };

  const resetChat = () => {
    dispatch({ type: 'RESET_CHAT' });
    if (state.flowActive) {
      flowEngine.clearAllTimers();
      setTimeout(() => {
        flowEngine.executeFlow(nodes, edges);
      }, 100);
    }
  };

  const executeFlow = useCallback(() => {
    dispatch({ type: 'SET_FLOW_ACTIVE', flowActive: true });
    flowEngine.executeFlow(nodes, edges);
  }, [nodes, edges]);

  const stopFlow = () => {
    dispatch({ type: 'SET_FLOW_ACTIVE', flowActive: false });
    flowEngine.clearAllTimers();
  };

  useEffect(() => {
    const updateContext = () => {
      flowEngine.setContext({
        setMessages: (newMessages) => {
          if (typeof newMessages === 'function') {
            dispatch({
              type: 'SET_MESSAGES',
              messages: newMessages(state.messages),
            });
          } else {
            dispatch({ type: 'SET_MESSAGES', messages: newMessages });
          }
        },
        resetChat,
        messages: state.messages,
        knowledge: state.knowledge,
        setChatClosed: (closed: boolean) =>
          dispatch({ type: 'SET_CHAT_CLOSED', chatClosed: closed }),
      });
    };
    updateContext();
  }, [state.knowledge, state.messages, resetChat]);

  useEffect(() => {
    return () => {
      flowEngine.clearAllTimers();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-1">
        <Tabs defaultValue="chat" className="flex flex-col h-full">
          <TabsList className="w-full mb-6 p-1 rounded-lg flex gap-1 sticky top-0 z-10">
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
            <KnowledgeBase
              knowledge={state.knowledge}
              onKnowledgeChange={(value) => dispatch({ type: 'SET_KNOWLEDGE', knowledge: value })}
            />
          </TabsContent>

          <TabsContent value="chat" className="flex-1 mt-0">
            <ChatInterface
              messages={state.messages}
              input={state.input}
              chatClosed={state.chatClosed}
              onInputChange={(value) => dispatch({ type: 'SET_INPUT', input: value })}
              onSendMessage={sendMessage}
              onResetChat={resetChat}
            />
          </TabsContent>

          <TabsContent value="flow" className="flex-1 mt-0">
            <FlowEditor
              nodes={nodes}
              edges={edges}
              flowActive={state.flowActive}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragStart={onDragStart}
              onStartFlow={executeFlow}
              onStopFlow={stopFlow}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
