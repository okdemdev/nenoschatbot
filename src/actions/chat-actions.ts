import { Message } from '@/types/chat';

export async function sendChatMessage(messages: Message[], knowledge: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        knowledge,
      }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, I encountered an error.';
  }
}
