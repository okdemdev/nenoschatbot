import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer, X } from 'lucide-react';

export function TimerNode({ data, isConnectable }: any) {
  const handleDelete = () => {
    data.handleDelete?.();
  };

  return (
    <Card className="p-4 min-w-[200px] relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 absolute -top-2 -right-2 rounded-full bg-background border shadow-sm hover:bg-muted"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2.5 mb-4">
        <Timer className="w-4 h-4 text-orange-500" />
        <span className="font-semibold">Timer</span>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Delay (seconds)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={data.seconds || ''}
              onChange={(e) => data.onChange?.({ seconds: parseInt(e.target.value) || 0 })}
              placeholder="Enter delay..."
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-muted-foreground"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-muted-foreground"
      />
    </Card>
  );
}
