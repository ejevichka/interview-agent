import { zeroShotPrompts, fewShotPrompts, chainOfThoughtPrompts, customPromptTemplate } from './templates';

export type PromptType = 'zeroShot' | 'fewShot' | 'chainOfThought';

export interface PromptOptions {
  type: PromptType;
  template: string;
  variables?: Record<string, string>;
  systemMessage?: string;
}

export class PromptManager {
  private static readonly defaultSystemMessage = "You are a helpful AI assistant.";

  static getPromptTemplates(type: PromptType) {
    switch (type) {
      case 'zeroShot':
        return Object.keys(zeroShotPrompts);
      case 'fewShot':
        return Object.keys(fewShotPrompts);
      case 'chainOfThought':
        return Object.keys(chainOfThoughtPrompts);
      default:
        return [];
    }
  }

  static getTemplate(type: PromptType, templateName: string): string | undefined {
    switch (type) {
      case 'zeroShot':
        return zeroShotPrompts[templateName as keyof typeof zeroShotPrompts];
      case 'fewShot':
        return fewShotPrompts[templateName as keyof typeof fewShotPrompts];
      case 'chainOfThought':
        return chainOfThoughtPrompts[templateName as keyof typeof chainOfThoughtPrompts];
      default:
        return undefined;
    }
  }

  static generatePrompt(options: PromptOptions) {
    const { type, template, variables = {}, systemMessage = this.defaultSystemMessage } = options;

    const promptTemplate = this.getTemplate(type, template);
    if (!promptTemplate) {
      throw new Error(`Template '${template}' not found for type '${type}'`);
    }

    const filledPrompt = customPromptTemplate(promptTemplate, variables);

    return {
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: filledPrompt,
        },
      ],
    };
  }

  static addExampleToFewShot(templateName: string, example: { input: string; output: string }) {
    const template = fewShotPrompts[templateName as keyof typeof fewShotPrompts];
    if (!template) {
      throw new Error(`Few-shot template '${templateName}' not found`);
    }

    return `${template}\n\nExample ${Object.keys(fewShotPrompts).length + 1}:
Input: ${example.input}
Output: ${example.output}\n`;
  }
} 