import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { PromptManager, PromptOptions } from '@/lib/prompts/promptManager';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, promptOptions } = body;

    if (!messages && !promptOptions) {
      return NextResponse.json(
        { error: 'Either messages or promptOptions are required' },
        { status: 400 }
      );
    }

    let finalMessages;
    if (promptOptions) {
      const generatedPrompt = PromptManager.generatePrompt(promptOptions as PromptOptions);
      finalMessages = generatedPrompt.messages;
    } else {
      finalMessages = messages;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Return the response
    return NextResponse.json(completion.choices[0].message);

  } catch (error) {
    console.error('[CHAT ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 