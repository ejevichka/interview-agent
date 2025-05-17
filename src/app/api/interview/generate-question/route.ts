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

    const { jobDescription, interviewType, previousQuestions = [] } = await req.json();

    if (!jobDescription || !interviewType) {
      return NextResponse.json(
        { error: 'Job description and interview type are required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a challenging interview question for a ${interviewType} interview for the following job:

Job Description:
${jobDescription}

${previousQuestions.length > 0 ? `Previous questions asked:
${previousQuestions.join('\n')}

Generate a new, different question that hasn't been asked yet.` : ''}

The question should be:
- Specific to the job requirements
- Challenging but fair
- Open-ended to allow for detailed responses
- Relevant to ${interviewType} interview context

Generate only the question, no additional text or formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer who creates challenging but fair interview questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const question = completion.choices[0]?.message?.content?.trim();

    if (!question) {
      throw new Error('Failed to generate question');
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate question' },
      { status: 500 }
    );
  }
} 