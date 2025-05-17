import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { PromptManager, PromptOptions } from '@/lib/prompts/promptManager';
import { initGemini } from '@/lib/config/models';
import { AVAILABLE_PERSONAS } from '@/lib/config/personas';

// Validate API Keys
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini client
const gemini = initGemini();

export async function POST(req: Request) {
  try {
    console.log('[CHAT API] Received request');
    
    const body = await req.json();
    const { messages, promptOptions, modelId = 'gpt-3.5-turbo', personaId = 'default', jobDescription = '' } = body;

    if (!messages && !promptOptions) {
      console.error('[CHAT API] Invalid request: missing messages or promptOptions');
      return NextResponse.json(
        { error: 'Either messages or promptOptions are required' },
        { status: 400 }
      );
    }

    let finalMessages;
    if (promptOptions) {
      try {
        const generatedPrompt = PromptManager.generatePrompt(promptOptions as PromptOptions);
        finalMessages = generatedPrompt.messages;
      } catch (error) {
        console.error('[CHAT API] Prompt generation error:', error);
        return NextResponse.json(
          { error: 'Invalid prompt options: ' + (error instanceof Error ? error.message : 'Unknown error') },
          { status: 400 }
        );
      }
    } else {
      if (!Array.isArray(messages)) {
        console.error('[CHAT API] Invalid messages format: not an array');
        return NextResponse.json(
          { error: 'Messages must be an array' },
          { status: 400 }
        );
      }

      for (const message of messages) {
        if (!message.role || !message.content) {
          console.error('[CHAT API] Invalid message format:', message);
          return NextResponse.json(
            { error: 'Each message must have role and content' },
            { status: 400 }
          );
        }
      }

      // Get the persona's system prompt
      const persona = AVAILABLE_PERSONAS.find(p => p.id === personaId);
      if (persona) {
        // Replace the system message with the persona's system prompt
        const jobDescriptionText = jobDescription
          ? `You are specifically helping with this job description: ${jobDescription}`
          : "";
        
        finalMessages = messages.map(msg => 
          msg.role === 'system' 
            ? { ...msg, content: persona.systemPrompt.replace('{jobDescription}', jobDescriptionText) }
            : msg
        );
      } else {
        finalMessages = messages;
      }
    }

    console.log('[CHAT API] Sending request to AI model:', modelId);
    
    if (modelId.startsWith('gemini')) {
      try {
        // Handle Gemini
        const model = gemini.getGenerativeModel({ model: 'gemini-1.0-pro' });
        
        // Convert messages to Gemini format
        const lastMessage = finalMessages[finalMessages.length - 1];
        const result = await model.generateContent(lastMessage.content);
        const response = await result.response;
        
        return NextResponse.json({
          role: 'assistant',
          content: response.text(),
        });
      } catch (error) {
        console.error('[CHAT API] Gemini error:', error);
        return NextResponse.json(
          { 
            error: 'Gemini API error',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      // Handle OpenAI
      try {
        const completion = await openai.chat.completions.create({
          model: modelId,
          messages: finalMessages,
          temperature: 0.7,
          max_tokens: 1000,
        });

        if (!completion.choices?.[0]?.message) {
          console.error('[CHAT API] Invalid OpenAI response:', completion);
          return NextResponse.json(
            { error: 'Invalid response from OpenAI' },
            { status: 500 }
          );
        }

        return NextResponse.json(completion.choices[0].message);
      } catch (error) {
        console.error('[CHAT API] OpenAI error:', error);
        return NextResponse.json(
          { 
            error: 'OpenAI API error',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('[CHAT API ERROR]', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or missing API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again in a few minutes.' },
          { status: 429 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return NextResponse.json(
          { 
            error: 'API quota exceeded. Please check your billing details.',
            details: 'You can either upgrade your plan or wait until your quota resets.'
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 