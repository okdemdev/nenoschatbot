import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages, knowledge, currentNodeId, patterns } = await req.json();
    
    const lastUserMessage = messages[messages.length - 1].content;
    const previousBotMessage = messages[messages.length - 2]?.content;

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

      Previous conversation patterns:
      ${JSON.stringify(patterns)}

      Please respond to the user's message in a helpful and natural way.
      Also analyze if this is a question-answer pair that should be added to our patterns.

      Current flow position: ${currentNodeId}
      Previous message: ${previousBotMessage}
      User's message: ${lastUserMessage}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Analyze if this was a Q&A pair
    if (previousBotMessage && previousBotMessage.includes("?")) {
      return NextResponse.json({ 
        response,
        pattern: {
          question: previousBotMessage,
          answer: lastUserMessage
        }
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
