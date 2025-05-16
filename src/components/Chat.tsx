"use client";

import { Message } from "ai";
import { FC, FormEvent, useRef, useState, useEffect } from "react";
import MessageBubble from "./ui/chat/MessageBubble";
import PromptTemplateSelector from "./ui/chat/PromptTemplateSelector";
import ModelSelector from "./ui/chat/ModelSelector";
import PersonaSelector from "./ui/chat/PersonaSelector";
import SpeechControls from "./ui/chat/SpeechControls";
import { PromptType } from "@/lib/prompts/promptManager";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import { AVAILABLE_PERSONAS } from "@/lib/config/personas";

const Chat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: AVAILABLE_PERSONAS[0].systemPrompt,
      id: "system-1",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [selectedPersona, setSelectedPersona] = useState(AVAILABLE_PERSONAS[0].id);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSpeechInput = (text: string) => {
    setInput(text);
  };

  const speakText = (text: string) => {
    if (!speechSynthesis.current || !isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Get the current persona's voice settings
    const persona = AVAILABLE_PERSONAS.find(p => p.id === selectedPersona);
    if (persona) {
      // Adjust voice settings based on persona
      if (persona.id === 'snoop-dogg') {
        utterance.rate = 0.9; // Slightly slower
        utterance.pitch = 0.9; // Slightly lower pitch
      } else if (persona.id === 'paris-hilton') {
        utterance.rate = 1.1; // Slightly faster
        utterance.pitch = 1.1; // Slightly higher pitch
      }
    }

    speechSynthesis.current.speak(utterance);
  };

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersona(personaId);
    const newPersona = AVAILABLE_PERSONAS.find(p => p.id === personaId);
    if (newPersona) {
      setMessages(prev => [
        {
          role: "system",
          content: newPersona.systemPrompt,
          id: `system-${Date.now()}`,
        },
        ...prev.filter(msg => msg.role !== "system")
      ]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      id: `user-${Date.now()}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${window.location.origin}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          modelId: selectedModel,
          personaId: selectedPersona,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.content) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage: Message = {
        ...data,
        id: `assistant-${Date.now()}`,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the assistant's response if speech is enabled
      if (isSpeaking) {
        speakText(data.content);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}${error.message.includes('quota') ? '\n\nPlease check your API billing details or try again later.' : ''}`
        : "Sorry, there was an error processing your request.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: errorMessage,
          id: `error-${Date.now()}`,
        },
      ]);

      if (isSpeaking) {
        speakText(errorMessage);
      }
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handlePromptSelect = async (promptOptions: {
    type: PromptType;
    template: string;
    variables: Record<string, string>;
  }) => {
    setIsLoading(true);
    setShowTemplates(false);

    try {
      const response = await fetch(`${window.location.origin}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          promptOptions,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        ...data,
        id: `assistant-${Date.now()}`,
      };

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Using template: ${promptOptions.template}\nWith variables: ${JSON.stringify(
            promptOptions.variables,
            null,
            2
          )}`,
          id: `template-${Date.now()}`,
        },
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Sorry, there was an error processing your request.",
          id: `error-${Date.now()}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <PersonaSelector
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
          />
        </div>

        {showTemplates && (
          <div className="mb-4">
            <PromptTemplateSelector onPromptSelect={handlePromptSelect} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <SpeechControls
              onSpeechInput={handleSpeechInput}
              isListening={isListening}
              onToggleListening={() => setIsListening(!isListening)}
              isSpeaking={isSpeaking}
              onToggleSpeaking={() => setIsSpeaking(!isSpeaking)}
            />
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
            >
              {showTemplates ? "Hide Templates" : "Show Templates"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 