import { Edge, Node } from 'reactflow';
import { Message } from '@/types/chat';

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
  private waitingNodes: Map<string, { edges: Edge[]; nodes: Node[]; startTime: number }> =
    new Map();

  setContext(context: FlowContext) {
    this.context = context;
    if (context.messages && context.messages.length > 0) {
      const lastMessage = context.messages[context.messages.length - 1];
      if (!lastMessage) return;

      this.lastMessageTime = Date.now();

      // If this is a user message
      if (lastMessage.role === 'user') {
        this.lastUserMessageTime = Date.now();

        // If we have waiting nodes, process them
        if (this.waitingNodes.size > 0) {
          // Process any waiting nodes
          this.waitingNodes.forEach((data, nodeId) => {
            // Only process if the user responded after the wait started
            if (this.lastUserMessageTime > data.startTime) {
              // Clear the timeout for this node
              if (this.timers.has(nodeId)) {
                clearTimeout(this.timers.get(nodeId));
                this.timers.delete(nodeId);
              }

              // Continue to next nodes
              const nextNodeIds = this.getConnectedNodes(nodeId, data.edges);
              for (const nextNodeId of nextNodeIds) {
                const nextNode = data.nodes.find((n) => n.id === nextNodeId);
                if (nextNode) {
                  this.executeNode(nextNode, data.nodes, data.edges);
                }
              }
            }
          });

          // Clear all waiting nodes that have been responded to
          this.waitingNodes.forEach((data, nodeId) => {
            if (this.lastUserMessageTime > data.startTime) {
              this.waitingNodes.delete(nodeId);
            }
          });
        } else if (this.isFlowActive) {
          // If there are no waiting nodes but the flow is active,
          // this means the user is interacting naturally - stop the flow
          console.log('User started natural interaction, stopping flow');
          this.clearAllTimers();
        }
      }
    }
  }

  clearAllTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.waitingNodes.clear();
    this.isFlowActive = false;
  }

  private getConnectedNodes(nodeId: string, edges: Edge[]) {
    const connectedNodes = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);
    console.log(`Getting connected nodes for ${nodeId}:`, connectedNodes);
    return connectedNodes;
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

    console.log('Executing node:', node.type, node.id, node.data);

    switch (node.type) {
      case 'start':
        if (node.data.message) {
          console.log('Start node sending message:', node.data.message);
          this.context.setMessages((prev: Message[]) => [
            ...prev,
            { role: 'assistant', content: node.data.message },
          ]);
          this.lastMessageTime = Date.now();
        }

        // Continue to next nodes after a short delay
        setTimeout(() => {
          if (!this.isFlowActive) return;
          console.log('Start node continuing to next nodes');
          const nextNodeIds = this.getConnectedNodes(node.id, edges);
          console.log('Next node IDs:', nextNodeIds);
          for (const nodeId of nextNodeIds) {
            const nextNode = nodes.find((n) => n.id === nodeId);
            if (nextNode) {
              console.log('Executing next node:', nextNode.type, nextNode.id);
              this.executeNode(nextNode, nodes, edges);
            }
          }
        }, 100);
        break;

      case 'timer':
        if (node.data.seconds) {
          // Clear any existing timer for this node
          if (this.timers.has(node.id)) {
            clearTimeout(this.timers.get(node.id));
            this.timers.delete(node.id);
          }

          // Set the new timer
          const timer = setTimeout(() => {
            if (!this.isFlowActive) return;

            // Continue to next nodes
            const nextNodeIds = this.getConnectedNodes(node.id, edges);
            for (const nodeId of nextNodeIds) {
              const nextNode = nodes.find((n) => n.id === nodeId);
              if (nextNode) {
                this.executeNode(nextNode, nodes, edges);
              }
            }
          }, node.data.seconds * 1000);

          this.timers.set(node.id, timer);
        }
        break;

      case 'wait':
        console.log('Executing wait node with data:', node.data);
        if (node.data.seconds) {
          const startTime = Date.now();
          console.log('Setting wait node start time:', startTime);

          // Store this node as waiting for user response
          this.waitingNodes.set(node.id, { edges, nodes, startTime });
          console.log(
            'Added to waiting nodes. Current waiting nodes:',
            Array.from(this.waitingNodes.keys())
          );

          // Clear any existing timer for this node
          if (this.timers.has(node.id)) {
            clearTimeout(this.timers.get(node.id));
            this.timers.delete(node.id);
          }

          // Set timeout for no response
          const timer = setTimeout(() => {
            console.log('Wait node timer expired for node:', node.id);
            if (!this.isFlowActive) {
              console.log('Flow not active, skipping timeout handling');
              return;
            }

            // Check if this node is still waiting and hasn't received a response
            if (this.waitingNodes.has(node.id)) {
              const data = this.waitingNodes.get(node.id)!;
              const hasUserResponded = this.lastUserMessageTime > data.startTime;
              console.log('Checking user response:', {
                hasUserResponded,
                lastUserMessageTime: this.lastUserMessageTime,
                startTime: data.startTime,
              });

              if (!hasUserResponded) {
                console.log('No user response received, sending timeout message');
                // Send timeout message if provided
                if (node.data.timeoutMessage) {
                  this.context?.setMessages((prev: Message[]) => [
                    ...prev,
                    { role: 'assistant', content: node.data.timeoutMessage },
                  ]);
                }

                // Continue to next nodes
                const nextNodeIds = this.getConnectedNodes(node.id, edges);
                console.log('Continuing to next nodes:', nextNodeIds);
                for (const nodeId of nextNodeIds) {
                  const nextNode = nodes.find((n) => n.id === nodeId);
                  if (nextNode) {
                    this.executeNode(nextNode, nodes, edges);
                  }
                }
              }

              // Remove from waiting nodes
              this.waitingNodes.delete(node.id);
              console.log(
                'Removed from waiting nodes. Remaining:',
                Array.from(this.waitingNodes.keys())
              );
            }
          }, node.data.seconds * 1000);

          this.timers.set(node.id, timer);
          console.log('Set timer for node:', node.id);
        }
        break;

      case 'action':
        switch (node.data.actionType) {
          case 'send_message':
            if (node.data.useAI) {
              const aiResponse = await this.sendAIMessage(node.data.message);
              if (aiResponse) {
                this.context.setMessages((prev: Message[]) => [
                  ...prev,
                  { role: 'assistant', content: aiResponse },
                ]);
                this.lastMessageTime = Date.now();
              }
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
            return; // Don't continue to next nodes after closing chat

          case 'reset_chat':
            this.context.resetChat();
            this.lastMessageTime = Date.now();
            this.lastUserMessageTime = 0;
            break;
        }

        // Continue to next nodes after action completes
        setTimeout(() => {
          if (!this.isFlowActive) return;
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
    console.log('Starting flow execution');
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);

    this.clearAllTimers();
    this.isFlowActive = true;
    this.lastUserMessageTime = 0;

    const startNode = nodes.find((node) => node.type === 'start');
    if (startNode) {
      console.log('Found start node:', startNode.id);
      this.executeNode(startNode, nodes, edges);
    } else {
      console.log('No start node found');
    }
  }
}

export const flowEngine = new FlowEngine();
