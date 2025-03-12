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
            <SelectItem value="response">Response</SelectItem>
            <SelectItem value="condition">Condition</SelectItem>
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
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </Card>
  );
}
