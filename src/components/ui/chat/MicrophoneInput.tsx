import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

// Add type declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface MicrophoneInputProps {
  onTranscript: (text: string) => void;
  isDisabled?: boolean;
}

export function MicrophoneInput({ onTranscript, isDisabled = false }: MicrophoneInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  }, [recognition, isListening]);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={isListening ? "destructive" : "default"}
        size="icon"
        onClick={toggleListening}
        disabled={isDisabled || !recognition}
        className="h-10 w-10"
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      {isListening && (
        <div className="text-sm text-muted-foreground">
          Listening...
        </div>
      )}
    </div>
  );
} 