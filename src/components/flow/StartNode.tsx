import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StartNode({ data, isConnectable }: any) {
  const handleDelete = () => {
    console.log('Delete clicked for node:', data.id); // Debug log
    data.handleDelete?.();
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
        <Bot className="w-4 h-4" />
        <span className="font-semibold">Start Message</span>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Initial Greeting</Label>
          <Textarea
            value={data.message || ''}
            onChange={(e) => data.onChange?.({ message: e.target.value })}
            placeholder="Enter the initial AI greeting..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-muted-foreground"
      />
    </Card>
  );
}
