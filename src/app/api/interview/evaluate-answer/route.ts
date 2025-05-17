import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { question, answer, jobDescription, interviewType } = await req.json();

    if (!question || !answer || !jobDescription || !interviewType) {
      return NextResponse.json(
        { error: 'Question, answer, job description, and interview type are required' },
        { status: 400 }
      );
    }

    const prompt = `Evaluate the following interview answer for a ${interviewType} interview:

Question: ${question}

Answer: ${answer}

Job Description:
${jobDescription}

Provide a detailed evaluation in the following JSON format:
{
  "score": number (0-100),
  "strengths": string[],
  "areasForImprovement": string[],
  "suggestions": string[]
}

The evaluation should consider:
- Relevance to the question
- Specificity of examples
- Clarity of communication
- Alignment with job requirements
- Technical accuracy (if applicable)
- Leadership potential (if applicable)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer who provides detailed, constructive feedback on interview answers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(completion.choices[0]?.message?.content || '{}');

    if (!evaluation.score || !evaluation.strengths || !evaluation.areasForImprovement || !evaluation.suggestions) {
      throw new Error('Invalid evaluation format received');
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
} 