'use client';

import { Handle, Position } from 'reactflow';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

export function CustomNode({ data, isConnectable }) {
  return (
    <Card className="p-4 w-[300px] max-w-[400px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div className="flex flex-col gap-2">
        <Input
          value={data.label}
          onChange={(e) => data.onChange?.({ label: e.target.value })}
          className="font-bold text-sm"
          placeholder="Node Label"
        />
        <Select value={data.type} onValueChange={(value) => data.onChange?.({ type: value })}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Node Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="condition">Condition</SelectItem>
            <SelectItem value="input">User Input</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
            <SelectItem value="action">Action</SelectItem>
          </SelectContent>
        </Select>
        <div className="max-h-[200px] overflow-y-auto">
          <Textarea
            value={data.content}
            onChange={(e) => data.onChange?.({ content: e.target.value })}
            placeholder={data.type === 'question' ? 'Enter your question...' : 'Node Content'}
            className="min-h-[100px] text-sm resize-none"
          />
        </div>
        {data.type === 'message' && (
          <Input
            type="number"
            value={data.timeout}
            onChange={(e) => data.onChange?.({ timeout: parseInt(e.target.value) })}
            placeholder="Timeout (seconds)"
            className="mt-2 text-sm"
          />
        )}
        {data.type === 'condition' && (
          <div className="space-y-2">
            <Input
              value={data.condition}
              onChange={(e) => data.onChange?.({ condition: e.target.value })}
              placeholder="if user_response contains 'yes'"
              className="text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Available variables: user_response, last_message, time_elapsed
            </div>
          </div>
        )}
        {data.type === 'timeout' && (
          <div className="space-y-2">
            <Input
              type="number"
              value={data.timeout}
              onChange={(e) => data.onChange?.({ timeout: parseInt(e.target.value) })}
              placeholder="Timeout in seconds"
              className="text-sm"
            />
            <Select
              value={data.timeoutAction}
              onValueChange={(value) => data.onChange?.({ timeoutAction: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="On timeout..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="close">Close Case</SelectItem>
                <SelectItem value="transfer">Transfer to Agent</SelectItem>
                <SelectItem value="reminder">Send Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {data.type === 'action' && (
          <Select
            value={data.actionType}
            onValueChange={(value) => data.onChange?.({ actionType: value })}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transfer_agent">Transfer to Agent</SelectItem>
              <SelectItem value="create_ticket">Create Support Ticket</SelectItem>
              <SelectItem value="send_email">Send Email</SelectItem>
              <SelectItem value="close_case">Close Case</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </Card>
  );
}
