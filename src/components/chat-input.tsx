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
    <div className="flex gap-3">
      <Input
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        placeholder="Type your message..."
        className="flex-1 h-12 px-4"
      />
      <Button onClick={onSend} size="lg" className="h-12 px-6">
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
