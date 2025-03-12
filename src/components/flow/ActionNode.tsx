import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, X } from 'lucide-react';

export function ActionNode({ data, isConnectable }: any) {
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
          <>
            <div>
              <Label>Message</Label>
              <Textarea
                value={data.message || ''}
                onChange={(e) => data.onChange?.({ message: e.target.value })}
                placeholder="Enter message to send..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`use-ai-${data.id}`}
                checked={data.useAI}
                onCheckedChange={(checked) => data.onChange?.({ useAI: checked })}
              />
              <Label htmlFor={`use-ai-${data.id}`}>Get AI Response</Label>
            </div>
          </>
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
