import { Edge, Node } from 'reactflow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface FlowContext {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  resetChat: () => void;
  knowledge: string;
  setChatClosed: (closed: boolean) => void;
}

class FlowEngine {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private context: FlowContext | null = null;
  private isFlowActive: boolean = false;
  private lastMessageTime: number = 0;
  private lastUserMessageTime: number = 0;

  setContext(context: FlowContext) {
    this.context = context;
    // Update last message time when new messages come in
    if (context.messages.length > 0) {
      const lastMessage = context.messages[context.messages.length - 1];
      this.lastMessageTime = Date.now();
      if (lastMessage.role === 'user') {
        this.lastUserMessageTime = Date.now();
      }
    }
  }

  clearAllTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.isFlowActive = false;
  }

  private getConnectedNodes(nodeId: string, edges: Edge[]) {
    return edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
  }

  private async sendAIMessage(message: string) {
    if (!this.context) return;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...this.context.messages, { role: 'assistant' as const, content: message }],
          knowledge: this.context.knowledge,
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I encountered an error.';
    }
  }

  private async executeNode(node: Node, nodes: Node[], edges: Edge[]) {
    if (!this.context || !this.isFlowActive) return;

    switch (node.type) {
      case 'start':
        if (node.data.message) {
          this.context.setMessages((prev: Message[]) => [
            ...prev,
            { role: 'assistant', content: node.data.message },
          ]);
          this.lastMessageTime = Date.now();

          // Continue to next nodes after a short delay
          setTimeout(() => {
            const nextNodeIds = this.getConnectedNodes(node.id, edges);
            for (const nodeId of nextNodeIds) {
              const nextNode = nodes.find((n) => n.id === nodeId);
              if (nextNode) {
                this.executeNode(nextNode, nodes, edges);
              }
            }
          }, 100); // Small delay to ensure message is sent first
        }
        break;

      case 'wait':
        if (node.data.seconds) {
          // Clear existing timer for this node if it exists
          if (this.timers.has(node.id)) {
            clearTimeout(this.timers.get(node.id));
          }

          const startTime = Date.now();
          const timer = setTimeout(async () => {
            if (!this.isFlowActive) return;

            // Check if user has responded since timer started
            const hasUserResponded = this.lastUserMessageTime > startTime;

            if (!hasUserResponded) {
              // No response within timeout period
              if (node.data.timeoutMessage) {
                this.context?.setMessages((prev: Message[]) => [
                  ...prev,
                  { role: 'assistant', content: node.data.timeoutMessage },
                ]);
                this.lastMessageTime = Date.now();

                // Continue to next nodes after sending timeout message
                const nextNodeIds = this.getConnectedNodes(node.id, edges);
                for (const nodeId of nextNodeIds) {
                  const nextNode = nodes.find((n) => n.id === nodeId);
                  if (nextNode) {
                    await this.executeNode(nextNode, nodes, edges);
                  }
                }
              }
            }
          }, node.data.seconds * 1000);

          this.timers.set(node.id, timer);
        }
        break;

      case 'action':
        switch (node.data.actionType) {
          case 'send_message':
            if (node.data.useAI) {
              // Handle AI response
              // ... existing AI handling code ...
            } else if (node.data.message) {
              this.context.setMessages((prev: Message[]) => [
                ...prev,
                { role: 'assistant', content: node.data.message },
              ]);
              this.lastMessageTime = Date.now();
            }
            break;
          case 'close_chat':
            this.clearAllTimers();
            this.context.setMessages((prev: Message[]) => [
              ...prev,
              { role: 'assistant', content: 'Chat has been closed.' },
            ]);
            this.context.setChatClosed(true);
            break;
          case 'reset_chat':
            this.context.resetChat();
            this.lastMessageTime = Date.now();
            this.lastUserMessageTime = 0;
            break;
        }

        // Continue to next nodes after a short delay
        setTimeout(() => {
          const nextNodeIds = this.getConnectedNodes(node.id, edges);
          for (const nodeId of nextNodeIds) {
            const nextNode = nodes.find((n) => n.id === nodeId);
            if (nextNode) {
              this.executeNode(nextNode, nodes, edges);
            }
          }
        }, 100);
        break;
    }
  }

  executeFlow(nodes: Node[], edges: Edge[]) {
    // Clear any existing timers
    this.clearAllTimers();
    this.isFlowActive = true;
    this.lastUserMessageTime = 0;

    // Find and execute start node
    const startNode = nodes.find((node) => node.type === 'start');
    if (startNode) {
      this.executeNode(startNode, nodes, edges);
    }
  }
}

export const flowEngine = new FlowEngine();
