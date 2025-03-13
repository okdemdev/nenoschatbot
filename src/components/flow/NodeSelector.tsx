import { Card } from '@/components/ui/card';
import { MessageSquare, Timer, Clock, Play } from 'lucide-react';

export function NodeSelector({ onDragStart }: { onDragStart: any }) {
  const onDragStartHandler = (event: React.DragEvent, nodeType: string, data: any = {}) => {
    onDragStart(event, nodeType, data);
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Add Node</h3>
      <div className="space-y-2">
        <div
          className="flex items-center gap-2 p-3 rounded-md border-2 border-dashed hover:border-solid cursor-move"
          draggable
          onDragStart={(e) => onDragStartHandler(e, 'start')}
        >
          <Play className="w-4 h-4" />
          <span className="text-sm">Start</span>
        </div>
        <div
          className="flex items-center gap-2 p-3 rounded-md border-2 border-dashed hover:border-solid cursor-move"
          draggable
          onDragStart={(e) => onDragStartHandler(e, 'action')}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Action</span>
        </div>
        <div
          className="flex items-center gap-2 p-3 rounded-md border-2 border-dashed hover:border-solid cursor-move"
          draggable
          onDragStart={(e) => onDragStartHandler(e, 'wait')}
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm">Wait</span>
        </div>
        <div
          className="flex items-center gap-2 p-3 rounded-md border-2 border-dashed hover:border-solid cursor-move"
          draggable
          onDragStart={(e) => onDragStartHandler(e, 'timer')}
        >
          <Timer className="w-4 h-4 text-orange-500" />
          <span className="text-sm">Timer</span>
        </div>
      </div>
    </Card>
  );
}
