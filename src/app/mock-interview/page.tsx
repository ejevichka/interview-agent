"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PersonaSelector from '@/components/ui/chat/PersonaSelector';
import InterviewFeedback from '@/components/ui/interview/InterviewFeedback';
import InterviewQuestion from '@/components/ui/interview/InterviewQuestion';
import { Persona, AVAILABLE_PERSONAS } from '@/lib/config/personas';
import { MicrophoneInput } from '@/components/ui/chat/MicrophoneInput';

interface InterviewType {
  id: string;
  name: string;
  description: string;
}

interface InterviewFeedback {
  score: number;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
}

interface InterviewState {
  currentQuestion: string | null;
  isAnswered: boolean;
  feedback: InterviewFeedback | null;
}

const INTERVIEW_TYPES: InterviewType[] = [
  {
    id: 'behavioral',
    name: 'Behavioral',
    description: ''
  },
  {
    id: 'technical',
    name: 'Technical',
    description: ''
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: ''
  }
];

export default function MockInterview() {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona>(AVAILABLE_PERSONAS[0]);
  const [selectedType, setSelectedType] = useState<InterviewType>(INTERVIEW_TYPES[0]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: null,
    isAnswered: false,
    feedback: null
  });
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const generateQuestion = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch('/api/interview/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          interviewType: selectedType.id,
          previousQuestions
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate question');
      }
      
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: data.question,
        isAnswered: false,
        feedback: null
      }));
      setPreviousQuestions(prev => [...prev, data.question]);
    } catch (error) {
      console.error('Error generating question:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate question');
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateAnswer = async (answer: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: interviewState.currentQuestion,
          answer,
          jobDescription,
          interviewType: selectedType.id
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }
      
      setInterviewState(prev => ({
        ...prev,
        isAnswered: true,
        feedback: data
      }));
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setError(error instanceof Error ? error.message : 'Failed to evaluate answer');
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = async () => {
    setIsInterviewActive(true);
    setPreviousQuestions([]);
    await generateQuestion();
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setInterviewState({
      currentQuestion: null,
      isAnswered: false,
      feedback: null
    });
    setPreviousQuestions([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mock Interview Simulator</h1>
      
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {!isInterviewActive ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Interviewer Persona</label>
            <PersonaSelector
              selectedPersona={selectedPersona}
              onSelect={setSelectedPersona}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Interview Type</label>
            <div className="grid grid-cols-3 gap-4">
              {INTERVIEW_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType.id === type.id ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type)}
                  className="h-auto py-4 flex flex-col items-center"
                >
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {type.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={startInterview}
              disabled={!jobDescription.trim() || isLoading}
              className="w-48"
            >
              Start Interview
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedType.name} Interview
            </h2>
            <Button
              variant="destructive"
              onClick={endInterview}
              disabled={isLoading}
            >
              End Interview
            </Button>
          </div>

          {interviewState.currentQuestion && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Current Question:</h3>
                <p>{interviewState.currentQuestion}</p>
              </div>

              {!interviewState.isAnswered ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <MicrophoneInput
                      onTranscript={setCurrentTranscript}
                      isDisabled={isLoading}
                    />
                    <Button
                      onClick={() => evaluateAnswer(currentTranscript)}
                      disabled={!currentTranscript || isLoading}
                    >
                      Submit Answer
                    </Button>
                  </div>
                  {currentTranscript && (
                    <div className="p-4 rounded-lg bg-muted">
                      <h3 className="font-semibold mb-2">Your Answer:</h3>
                      <p>{currentTranscript}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <h3 className="font-semibold mb-2">Your Answer:</h3>
                    <p>{currentTranscript}</p>
                  </div>
                  {interviewState.feedback && (
                    <div className="p-4 rounded-lg bg-muted">
                      <h3 className="font-semibold mb-2">Feedback:</h3>
                      <div className="space-y-2">
                        <p><strong>Score:</strong> {interviewState.feedback.score}/100</p>
                        <div>
                          <strong>Strengths:</strong>
                          <ul className="list-disc list-inside">
                            {interviewState.feedback.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Areas for Improvement:</strong>
                          <ul className="list-disc list-inside">
                            {interviewState.feedback.areasForImprovement.map((area, index) => (
                              <li key={index}>{area}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Suggestions:</strong>
                          <ul className="list-disc list-inside">
                            {interviewState.feedback.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button onClick={generateQuestion} disabled={isLoading}>
                    Next Question
                  </Button>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center text-muted-foreground">
              Processing...
            </div>
          )}
        </div>
      )}
    </div>
  );
} 