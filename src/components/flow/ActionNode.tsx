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
import { MessageSquare, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ActionNode({ data, isConnectable }: any) {
  const handleDelete = () => {
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
        {data.actionType === 'close_chat' ? (
          <XCircle className="w-4 h-4 text-destructive" />
        ) : (
          <MessageSquare className="w-4 h-4" />
        )}
        <span className="font-semibold">Action</span>
        {data.actionType === 'close_chat' && (
          <Badge variant="destructive" className="ml-auto text-xs">
            Closes Chat
          </Badge>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Action Type</Label>
          <Select
            value={data.actionType}
            onValueChange={(value) => data.onChange?.({ actionType: value })}
          >
            <SelectTrigger className="w-full">
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
              <Label className="mb-2 block">Message</Label>
              <Textarea
                value={data.message || ''}
                onChange={(e) => data.onChange?.({ message: e.target.value })}
                placeholder="Enter message to send..."
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id={`use-ai-${data.id}`}
                checked={data.useAI}
                onCheckedChange={(checked) => data.onChange?.({ useAI: checked })}
              />
              <Label htmlFor={`use-ai-${data.id}`}>Get AI Response</Label>
            </div>
          </>
        )}
        {data.actionType === 'close_chat' && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            This action will close the chat and show a closed state overlay.
          </div>
        )}
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
