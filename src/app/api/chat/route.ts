import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages, knowledge, currentNodeId } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `
      You are an AI assistant with the following custom knowledge:
      ${knowledge}

      Please respond to the user's message in a helpful and natural way, using the
      custom knowledge when relevant. If the knowledge doesn't contain relevant
      information, you can respond based on your general knowledge.

      Current flow position: ${currentNodeId}
      User's message: ${messages[messages.length - 1].content}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
