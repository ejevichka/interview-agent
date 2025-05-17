import { FC } from 'react';
import { Persona, AVAILABLE_PERSONAS } from '@/lib/config/personas';

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
}

const PersonaSelector: FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Persona</label>
      <select
        value={selectedPersona.id}
        onChange={(e) => {
          const persona = AVAILABLE_PERSONAS.find(p => p.id === e.target.value);
          if (persona) onSelect(persona);
        }}
        className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary bg-background"
      >
        {AVAILABLE_PERSONAS.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.name}
          </option>
        ))}
      </select>
      <p className="text-sm text-muted-foreground">
        {selectedPersona.description}
      </p>
    </div>
  );
};

export default PersonaSelector; 