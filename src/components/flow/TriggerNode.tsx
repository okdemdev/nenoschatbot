import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TriggerNode({ data, isConnectable }: any) {
  const handleDelete = () => {
    console.log('Delete clicked for node:', data.id); // Debug log
    data.handleDelete?.();
  };

  return (
    <Card className="p-3 min-w-[250px] relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 absolute -top-2 -right-2 rounded-full bg-background border"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">Response Timer</span>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Wait for Response (seconds)</Label>
          <Input
            type="number"
            value={data.seconds || 10}
            onChange={(e) => data.onChange?.({ seconds: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <Label>If No Response, Send:</Label>
          <Textarea
            value={data.timeoutMessage || ''}
            onChange={(e) => data.onChange?.({ timeoutMessage: e.target.value })}
            placeholder="Message to send if user doesn't respond..."
            className="min-h-[80px]"
          />
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </Card>
  );
}
