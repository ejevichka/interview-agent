import { FC } from 'react';
import { AVAILABLE_MODELS } from '@/lib/config/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">AI Model:</label>
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full p-2 rounded-md border bg-background"
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector; 