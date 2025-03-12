import { Card } from '@/components/ui/card';
import { Bot, Clock, MessageSquare } from 'lucide-react';

const nodeTypes = [
  {
    type: 'start',
    label: 'Start Message',
    icon: Bot,
    data: { message: 'Hello! How can I help you today?' },
  },
  {
    type: 'wait',
    label: 'Wait for Response',
    icon: Clock,
    data: { seconds: 10, timeoutMessage: 'Are you still there?' },
  },
  {
    type: 'action',
    label: 'Action',
    icon: MessageSquare,
    data: { actionType: 'send_message', message: '' },
  },
];

export function NodeSelector({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}) {
  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">Add Node</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center gap-2 p-2 rounded-md border cursor-grab hover:bg-accent"
            draggable
            onDragStart={(e) => onDragStart(e, node.type, node.data)}
          >
            <node.icon className="w-4 h-4" />
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
