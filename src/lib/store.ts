import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node as ReactFlowNode } from 'reactflow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface NodeData {
  label: string;
  content?: string;
  type?: 'message' | 'condition' | 'timeout';
  timeout?: number;
  timeoutAction?: 'close' | 'transfer' | 'reminder';
  condition?: string;
  conditionType?: string;
  onChange?: (newData: Partial<NodeData>) => void;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

interface FlowStore {
  nodes: ReactFlowNode<NodeData>[];
  edges: Edge[];
  knowledge: string;
  currentNodeId: string | null;
  messages: Message[];
  setNodes: (nodes: ReactFlowNode<NodeData>[]) => void;
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
