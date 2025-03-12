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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const number = parseInt(value);
    if (!isNaN(number) && number >= 0) {
      data.onChange?.({ seconds: number });
    }
  };

  return (
    <Card className="p-4 min-w-[280px] relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 absolute -top-2 -right-2 rounded-full bg-background border shadow-sm hover:bg-muted"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2.5 mb-4">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">Response Timer</span>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Wait for Response (seconds)</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={data.seconds || 10}
            onChange={handleNumberChange}
            className="w-full"
          />
        </div>
        <div>
          <Label className="mb-2 block">If No Response, Send:</Label>
          <Textarea
            value={data.timeoutMessage || ''}
            onChange={(e) => data.onChange?.({ timeoutMessage: e.target.value })}
            placeholder="Message to send if user doesn't respond..."
            className="min-h-[100px] resize-none"
          />
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
