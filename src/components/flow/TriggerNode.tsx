import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

export function TriggerNode({ data, isConnectable }: any) {
  return (
    <Card className="p-3 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">Time Trigger</span>
      </div>
      <div className="space-y-2">
        <div>
          <Label>Delay (seconds)</Label>
          <Input
            type="number"
            value={data.seconds || 10}
            onChange={(e) => data.onChange?.({ seconds: e.target.value })}
            className="w-full"
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
