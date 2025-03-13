import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow';
import { NodeSelector } from '@/components/flow/NodeSelector';
import { StartNode } from '@/components/flow/StartNode';
import { ActionNode } from '@/components/flow/ActionNode';
import { TriggerNode } from '@/components/flow/TriggerNode';
import { TimerNode } from '@/components/flow/TimerNode';

const nodeTypes = {
  start: StartNode,
  wait: TriggerNode,
  action: ActionNode,
  timer: TimerNode,
};

interface FlowEditorProps {
  nodes: Node[];
  edges: Edge[];
  flowActive: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragStart: (event: React.DragEvent, nodeType: string, data?: any) => void;
  onStartFlow: () => void;
  onStopFlow: () => void;
}

export function FlowEditor({
  nodes,
  edges,
  flowActive,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDragOver,
  onDrop,
  onDragStart,
  onStartFlow,
  onStopFlow,
}: FlowEditorProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] grid grid-cols-[240px_1fr] gap-6">
      <div className="space-y-6">
        <NodeSelector onDragStart={onDragStart} />
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`h-2 w-2 rounded-full ${
                flowActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-muted-foreground">Flow Status</span>
          </div>
          <div className="space-y-0">
            <Button onClick={onStartFlow} className="w-full rounded-b-none" variant="default">
              Start Flow
            </Button>
            <Button
              onClick={onStopFlow}
              className="w-full rounded-t-none border-t-0"
              variant="outline"
            >
              Stop Flow
            </Button>
          </div>
        </Card>
      </div>
      <Card className="h-full overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          className="h-full"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Card>
    </div>
  );
}
