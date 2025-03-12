import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    content?: string;
    type?: 'message' | 'question' | 'response';
    responses?: string[];
    timeout?: number;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  knowledge: string;
  currentNodeId: string | null;
  messages: { role: 'user' | 'assistant'; content: string }[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setKnowledge: (knowledge: string) => void;
  setCurrentNodeId: (nodeId: string | null) => void;
  setMessages: (messages: { role: 'user' | 'assistant'; content: string }[]) => void;
  resetChat: () => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
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
