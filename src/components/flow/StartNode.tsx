import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot } from 'lucide-react';

export function StartNode({ data, isConnectable }: any) {
  return (
    <Card className="p-3 min-w-[250px]">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-4 h-4" />
        <span className="font-semibold">Start Message</span>
      </div>
      <div className="space-y-2">
        <div>
          <Label>Initial Greeting</Label>
          <Textarea
            value={data.message || ''}
            onChange={(e) => data.onChange?.({ message: e.target.value })}
            placeholder="Enter the initial AI greeting..."
            className="min-h-[100px]"
          />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </Card>
  );
}
