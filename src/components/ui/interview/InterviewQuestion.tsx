import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InterviewQuestionProps {
  question: string;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
}

const InterviewQuestion: FC<InterviewQuestionProps> = ({
  question,
  onAnswer,
  isAnswered,
}) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer);
      setAnswer('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-secondary">
        <h3 className="text-lg font-medium mb-2">Question:</h3>
        <p className="text-foreground">{question}</p>
      </div>

      {!isAnswered && (
        <div className="space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[150px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="w-full"
          >
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestion; 