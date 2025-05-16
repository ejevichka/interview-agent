import { GoogleGenerativeAI } from '@google/generative-ai';

export type ModelType = 'openai' | 'gemini';

export interface ModelConfig {
  id: string;
  name: string;
  type: ModelType;
  description: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    type: 'openai',
    description: 'Fast and efficient for most tasks',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    type: 'openai',
    description: 'Most capable model, best for complex tasks',
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini Pro',
    type: 'gemini',
    description: 'Google\'s advanced AI model',
  },
];

// Initialize Gemini client
export const initGemini = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not defined in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
}; 