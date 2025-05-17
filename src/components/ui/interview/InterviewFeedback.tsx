import { FC } from 'react';

interface FeedbackMetrics {
  clarity: number;
  completeness: number;
  tone: number;
  suggestions: string[];
}

interface InterviewFeedbackProps {
  feedback: FeedbackMetrics;
}

const InterviewFeedback: FC<InterviewFeedbackProps> = ({ feedback }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-6 rounded-lg bg-secondary space-y-4">
      <h3 className="text-xl font-semibold">Interview Feedback</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-background">
          <div className="text-sm text-muted-foreground">Clarity</div>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.clarity)}`}>
            {feedback.clarity}/10
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-background">
          <div className="text-sm text-muted-foreground">Completeness</div>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.completeness)}`}>
            {feedback.completeness}/10
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-background">
          <div className="text-sm text-muted-foreground">Tone</div>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.tone)}`}>
            {feedback.tone}/10
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-medium mb-3">Suggestions for Improvement</h4>
        <ul className="space-y-2">
          {feedback.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InterviewFeedback; 