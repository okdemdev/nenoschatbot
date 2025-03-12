'use client';

import { Handle, Position } from 'reactflow';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

// Predefined conditions
const CONDITIONS = {
  user_says_yes: {
    label: 'User says yes',
    condition:
      'user_response contains "yes" or user_response contains "da" or user_response contains "ok"',
  },
  user_says_no: {
    label: 'User says no',
    condition: 'user_response contains "no" or user_response contains "nu"',
  },
  user_is_angry: {
    label: 'User is angry',
    condition:
      'user_response contains "!" or user_response contains "angry" or user_response contains "upset"',
  },
  user_wants_help: {
    label: 'User needs help',
    condition: 'user_response contains "help" or user_response contains "ajutor"',
  },
  user_wants_agent: {
    label: 'User wants human agent',
    condition:
      'user_response contains "human" or user_response contains "agent" or user_response contains "operator"',
  },
};

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
            <SelectItem value="condition">Condition</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
          </SelectContent>
        </Select>

        {data.type === 'message' && (
          <div className="max-h-[200px] overflow-y-auto">
            <Textarea
              value={data.content}
              onChange={(e) => data.onChange?.({ content: e.target.value })}
              placeholder="Node Content"
              className="min-h-[100px] text-sm resize-none"
            />
            <Input
              type="number"
              value={data.timeout}
              onChange={(e) => data.onChange?.({ timeout: parseInt(e.target.value) })}
              placeholder="Timeout (seconds)"
              className="mt-2 text-sm"
            />
          </div>
        )}

        {data.type === 'condition' && (
          <div className="space-y-2">
            <Select
              value={data.conditionType}
              onValueChange={(value) => {
                const selectedCondition = CONDITIONS[value];
                data.onChange?.({
                  conditionType: value,
                  condition: selectedCondition.condition,
                  label: data.label || selectedCondition.label,
                });
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select condition..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONDITIONS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show the actual condition for reference */}
            {data.condition && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-secondary rounded">
                Current condition: {data.condition}
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-2">
              Available variables:
              <ul className="mt-1 ml-4 list-disc">
                <li>user_response - The last message from the user</li>
                <li>last_message - The last message in the chat</li>
                <li>time_elapsed - Time since last interaction</li>
              </ul>
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
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </Card>
  );
}
