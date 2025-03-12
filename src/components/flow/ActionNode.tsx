import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';

export function ActionNode({ data, isConnectable }: any) {
  return (
    <Card className="p-3 min-w-[250px]">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4" />
        <span className="font-semibold">Action</span>
      </div>
      <div className="space-y-2">
        <div>
          <Label>Action Type</Label>
          <Select
            value={data.actionType}
            onValueChange={(value) => data.onChange?.({ actionType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="send_message">Send Message</SelectItem>
              <SelectItem value="close_chat">Close Chat</SelectItem>
              <SelectItem value="reset_chat">Reset Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.actionType === 'send_message' && (
          <div>
            <Label>Message</Label>
            <Textarea
              value={data.message || ''}
              onChange={(e) => data.onChange?.({ message: e.target.value })}
              placeholder="Enter message to send..."
              className="min-h-[100px]"
            />
          </div>
        )}
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
