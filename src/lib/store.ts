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
  isFlowMode: boolean;
  flowState: {
    isActive: boolean;
    awaitingResponse: boolean;
    lastProcessedNode: string | null;
  };
  setNodes: (nodes: ReactFlowNode<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setKnowledge: (knowledge: string) => void;
  setCurrentNodeId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setFlowState: (state: Partial<FlowStore['flowState']>) => void;
  setIsFlowMode: (isFlowMode: boolean) => void;
  resetChat: () => void;
  resetFlow: () => void;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      knowledge: '',
      currentNodeId: null,
      messages: [],
      isFlowMode: false,
      flowState: {
        isActive: false,
        awaitingResponse: false,
        lastProcessedNode: null,
      },
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setKnowledge: (knowledge) => set({ knowledge }),
      setCurrentNodeId: (currentNodeId) => set({ currentNodeId }),
      setMessages: (messages) => set({ messages: Array.isArray(messages) ? messages : [] }),
      setFlowState: (state) =>
        set((prev) => ({
          flowState: { ...prev.flowState, ...state },
        })),
      setIsFlowMode: (isFlowMode) => set({ isFlowMode }),
      resetChat: () =>
        set({
          messages: [],
          currentNodeId: null,
          isFlowMode: false,
          flowState: {
            isActive: false,
            awaitingResponse: false,
            lastProcessedNode: null,
          },
        }),
      resetFlow: () =>
        set({
          messages: [],
          currentNodeId: null,
          nodes: [],
          edges: [],
          isFlowMode: false,
          flowState: {
            isActive: false,
            awaitingResponse: false,
            lastProcessedNode: null,
          },
        }),
    }),
    {
      name: 'flow-storage',
    }
  )
);
