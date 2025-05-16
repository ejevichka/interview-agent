import { FC } from 'react';
import { AVAILABLE_PERSONAS } from '@/lib/config/personas';

interface PersonaSelectorProps {
  selectedPersona: string;
  onPersonaChange: (personaId: string) => void;
}

const PersonaSelector: FC<PersonaSelectorProps> = ({
  selectedPersona,
  onPersonaChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Persona</label>
      <select
        value={selectedPersona}
        onChange={(e) => onPersonaChange(e.target.value)}
        className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary bg-background"
      >
        {AVAILABLE_PERSONAS.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.name}
          </option>
        ))}
      </select>
      <p className="text-sm text-muted-foreground">
        {AVAILABLE_PERSONAS.find((p) => p.id === selectedPersona)?.description}
      </p>
    </div>
  );
};

export default PersonaSelector; 