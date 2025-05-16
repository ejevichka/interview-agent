import { NextResponse } from 'next/server';

export async function GET() {
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  // Check if API key exists (without exposing it)
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isDevelopment: isDev,
    hasOpenAIKey: hasApiKey,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
} 