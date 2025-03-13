export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: Message[];
  input: string;
  knowledge: string;
  flowActive: boolean;
  chatClosed: boolean;
}

export type ChatAction =
  | { type: 'SET_MESSAGES'; messages: Message[] }
  | { type: 'SET_INPUT'; input: string }
  | { type: 'SET_KNOWLEDGE'; knowledge: string }
  | { type: 'SET_FLOW_ACTIVE'; flowActive: boolean }
  | { type: 'SET_CHAT_CLOSED'; chatClosed: boolean }
  | { type: 'RESET_CHAT' };
