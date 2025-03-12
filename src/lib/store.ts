import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NodeData {
  label: string;
  content?: string;
  type?: 'message' | 'question' | 'condition' | 'input' | 'timeout' | 'action';
  timeout?: number;
  timeoutAction?: 'close' | 'transfer' | 'reminder';
  condition?: string;
  actionType?: 'transfer_agent' | 'create_ticket' | 'send_email' | 'close_case';
  department?: string;
  responses?: string[];
  onChange?: (newData: Partial<NodeData>) => void;
}

export interface Node<NodeData> {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

interface FlowStore {
  nodes: Node<NodeData>[];
  edges: Edge[];
  knowledge: string;
  currentNodeId: string | null;
  messages: Message[];
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setKnowledge: (knowledge: string) => void;
  setCurrentNodeId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  resetChat: () => void;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      knowledge: '',
      currentNodeId: null,
      messages: [],
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setKnowledge: (knowledge) => set({ knowledge }),
      setCurrentNodeId: (currentNodeId) => set({ currentNodeId }),
      setMessages: (messages) => set({ messages }),
      resetChat: () => set({ messages: [], currentNodeId: null }),
    }),
    {
      name: 'flow-storage',
    }
  )
);
