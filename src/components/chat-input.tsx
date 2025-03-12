import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, onChange, onSend }: ChatInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button onClick={onSend}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
