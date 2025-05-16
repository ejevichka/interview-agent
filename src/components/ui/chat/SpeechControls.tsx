import { FC, useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface SpeechControlsProps {
  onSpeechInput: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  onToggleSpeaking: () => void;
}

const SpeechControls: FC<SpeechControlsProps> = ({
  onSpeechInput,
  isListening,
  onToggleListening,
  isSpeaking,
  onToggleSpeaking,
}) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = false; // Changed to false for better control
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onSpeechInput(finalTranscript);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setTimeout(() => {
            if (isListening) {
              recognition.start();
            }
          }, 1000);
        }
      };

      // Handle end of recognition
      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
            setError('Failed to restart recognition');
          }
        }
      };

      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onSpeechInput, isListening]);

  const handleToggleListening = () => {
    if (!recognition) {
      setError('Speech recognition is not available');
      return;
    }

    try {
      if (isListening) {
        recognition.stop();
      } else {
        setError(null);
        recognition.start();
      }
      onToggleListening();
    } catch (e) {
      console.error('Error toggling recognition:', e);
      setError('Failed to toggle speech recognition');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleToggleListening}
          className={`p-2 rounded-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-secondary hover:bg-secondary/90'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-secondary-foreground" />
          )}
        </button>

        <button
          onClick={onToggleSpeaking}
          className={`p-2 rounded-lg ${
            isSpeaking 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-secondary hover:bg-secondary/90'
          }`}
          title={isSpeaking ? 'Disable speech output' : 'Enable speech output'}
        >
          {isSpeaking ? (
            <Volume2 className="w-5 h-5 text-primary-foreground" />
          ) : (
            <VolumeX className="w-5 h-5 text-secondary-foreground" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {isListening && interimTranscript && (
        <p className="text-sm text-muted-foreground italic">
          {interimTranscript}
        </p>
      )}
    </div>
  );
};

export default SpeechControls; 