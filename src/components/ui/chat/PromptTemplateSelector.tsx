"use client";

import { useState, FC } from "react";
import { PromptType, PromptManager } from "@/lib/prompts/promptManager";

interface PromptTemplateSelectorProps {
  onPromptSelect: (promptOptions: {
    type: PromptType;
    template: string;
    variables: Record<string, string>;
  }) => void;
}

const PromptTemplateSelector: FC<PromptTemplateSelectorProps> = ({
  onPromptSelect,
}) => {
  const [selectedType, setSelectedType] = useState<PromptType>("zeroShot");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({});

  const promptTypes: PromptType[] = ["zeroShot", "fewShot", "chainOfThought"];
  const templates = PromptManager.getPromptTemplates(selectedType);

  // Extract variables from template
  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{(\w+)\}/g) || [];
    return matches.map((match) => match.replace(/[{}]/g, ""));
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = PromptManager.getTemplate(selectedType, templateName) || "";
    const variableNames = extractVariables(template);
    const newVariables: Record<string, string> = {};
    variableNames.forEach((name) => {
      newVariables[name] = variables[name] || "";
    });
    setVariables(newVariables);
  };

  const handleSubmit = () => {
    if (selectedTemplate) {
      onPromptSelect({
        type: selectedType,
        template: selectedTemplate,
        variables,
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <label className="text-sm font-medium">Prompt Type:</label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as PromptType);
            setSelectedTemplate("");
            setVariables({});
          }}
          className="w-full p-2 rounded-md border bg-background"
        >
          {promptTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Template:</label>
        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full p-2 rounded-md border bg-background"
        >
          <option value="">Select a template</option>
          {templates.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(variables).length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Variables:</label>
          {Object.keys(variables).map((varName) => (
            <div key={varName} className="flex gap-2 items-center">
              <label className="text-sm">{varName}:</label>
              <input
                type="text"
                value={variables[varName]}
                onChange={(e) =>
                  setVariables((prev) => ({
                    ...prev,
                    [varName]: e.target.value,
                  }))
                }
                className="flex-1 p-2 rounded-md border bg-background"
                placeholder={`Enter ${varName}`}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedTemplate || Object.values(variables).some((v) => !v)}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        Use Template
      </button>
    </div>
  );
};

export default PromptTemplateSelector; 