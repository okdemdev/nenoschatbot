import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PatternAnalysis {
  type: string;
  question: string;
  answer: string;
  reasoning: string;
}

export async function POST(req: Request) {
  try {
    const { messages, knowledge, currentNodeId } = await req.json();

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

      Please respond to the user's message in a helpful and natural way.
      
      After your response, if this interaction seems like a valuable Q&A pair, 
      provide a pattern analysis in the following JSON format:
      {
        "type": "Question-Answer",
        "question": "the question asked",
        "answer": "the best answer",
        "reasoning": "why this Q&A pair is valuable"
      }
      
      Separate your response and the pattern analysis with three dashes: ---

      Current flow position: ${currentNodeId}
      Previous message: ${previousBotMessage}
      User's message: ${lastUserMessage}
    `;

    const result = await model.generateContent(prompt);
    const fullResponse = await result.response.text();

    // Split the response into the actual response and pattern analysis
    const [response, patternAnalysis] = fullResponse.split('---').map((str) => str.trim());

    let pattern = null;
    if (patternAnalysis) {
      try {
        pattern = JSON.parse(patternAnalysis) as PatternAnalysis;
      } catch (e) {
        console.error('Failed to parse pattern analysis:', e);
      }
    }

    return NextResponse.json({
      response,
      pattern,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
